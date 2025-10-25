"use client"

import { useState, useEffect, useRef } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Send, RefreshCw, ThumbsUp, ThumbsDown, Copy, Wand2 } from "lucide-react"

interface AiEnhancementProps {
  result: any;
  onEnhance: () => void;
}

interface EnhanceResponse {
  content?: string;
  success: boolean;
  error?: string;
}

interface FormattedMessage {
  title?: string;
  content: string[];
  type?: 'tip' | 'suggestion' | 'improvement';
}

export default function AiEnhancement({ result, onEnhance }: AiEnhancementProps) {
  const genAI = useRef(new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!));
  const [activeTab, setActiveTab] = useState("experience")
  const [isGenerating, setIsGenerating] = useState(false)
  const [originalText, setOriginalText] = useState({
    experience:
      "Developed web applications using React and managed state with Redux. Worked on UI components and fixed bugs.",
    skills: "React, JavaScript, HTML, CSS, Redux",
    achievements: "Improved website performance. Reduced bug count by fixing issues.",
  })
  const [enhancedText, setEnhancedText] = useState({
    experience: "",
    skills: "",
    achievements: "",
  })
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI resume assistant. I can help you enhance your resume content. What would you like to improve today?",
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const formatEnhancedContent = (content: string, section: string) => {
    // Remove any markdown or special characters
    let formatted = content.replace(/[*#`]/g, '').trim();
    
    switch (section) {
      case 'experience':
        // Split and format bullet points
        formatted = formatted
          .split(/\n|•/)
          .filter(line => line.trim())
          .map(line => `• ${line.trim()}`)
          .join('\n');
        break;
      case 'skills':
        // Format skills as comma-separated list
        formatted = formatted
          .split(/[,\n]/)
          .map(skill => skill.trim())
          .filter(Boolean)
          .join(', ');
        break;
      case 'achievements':
        // Format achievements as bullet points
        formatted = formatted
          .split(/\n|•/)
          .filter(line => line.trim())
          .map(line => `• ${line.trim()}`)
          .join('\n');
        break;
    }
    return formatted;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const model = genAI.current.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `As a professional resume writer, enhance this ${activeTab} section to be more impactful and ATS-friendly.

      Current content:
      ${originalText[activeTab as keyof typeof originalText]}

      Required improvements:
      1. Use powerful action verbs at the start of each point
      2. Include specific metrics and quantifiable achievements
      3. Incorporate these keywords naturally: ${result?.keywords?.recommended.join(', ')}
      4. Address these aspects: ${result?.improvements?.important.join('\n')}

      Format requirements:
      - For experience: Use clear bullet points starting with action verbs
      - For skills: Provide as a comma-separated list
      - For achievements: Use concise bullet points with metrics
      - Do not include any markdown formatting or special characters
      - Keep each bullet point to one line
      - Focus on clarity and impact

      Return only the enhanced content in plain text format.`;

      const response = await model.generateContent(prompt);
      const enhancedContent = response.response.text();
      
      // Format the enhanced content
      const formattedContent = formatEnhancedContent(enhancedContent, activeTab);

      setEnhancedText(prev => ({
        ...prev,
        [activeTab]: formattedContent
      }));

      // Update chat with formatted message
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: 'Content enhanced with professional formatting and ATS optimization. Review the changes above.'
      } as const]);

    } catch (error) {
      console.error('Enhancement failed:', error);
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: '❌ Sorry, I encountered an error. Please try again.'
      } as const]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update the suggestions based on AI analysis
  const getSuggestions = () => {
    if (!result) return [];
    
    return [
      {
        title: "Format Improvements",
        content: result.format.improvements[0] || "No format suggestions available"
      },
      {
        title: "Content Enhancement",
        content: result.content.suggestions[0] || "No content suggestions available"
      },
      {
        title: "Keyword Optimization",
        content: `Add these keywords: ${result.keywords.recommended.join(', ')}`
      },
      {
        title: "Critical Changes",
        content: result.improvements.critical[0] || "No critical changes needed"
      }
    ];
  };

  // Update initial state based on result
  useEffect(() => {
    if (result) {
      setOriginalText(prev => ({
        ...prev,
        skills: result.keywords.present.join(', '),
        experience: result.content.strengths.join('\n'),
        achievements: result.content.weaknesses.join('\n')
      }));
    }
  }, [result]);

  const formatChatMessage = (text: string): FormattedMessage => {
    // Remove any markdown characters
    const cleanText = text.replace(/[*#`]/g, '').trim();
    
    // Split into title and content if contains a title-like pattern
    const titleMatch = cleanText.match(/^(.+?):\s*(.+)$/);
    if (titleMatch) {
      return {
        title: titleMatch[1],
        content: titleMatch[2].split('\n').map(line => line.trim()).filter(Boolean),
        type: 'suggestion'
      };
    }

    // Split bullet points into array
    const lines = cleanText.split(/\n|•/).map(line => line.trim()).filter(Boolean);
    return { content: lines };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: { role: "user"; content: string } = { role: "user", content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    try {
      const model = genAI.current.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `As a professional resume expert, provide structured advice.
      
      Previous conversation:
      ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
      
      User's question: ${newMessage}
      
      Respond with a structured message:
      1. Start with a clear title followed by colon
      2. Use bullet points for detailed advice
      3. Keep each point concise and actionable
      4. Group related suggestions together
      5. Use professional language

      Example format:
      Improving Your Experience Section:
      • Start each bullet with strong action verbs
      • Include specific metrics and achievements
      • Focus on relevant accomplishments

      Return the response in plain text format.`;

      const response = await model.generateContent(prompt);
      const aiResponse = response.response.text();

      setMessages(prev => [
        ...prev,
        { role: "assistant" as const, content: aiResponse } as const
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: "assistant" as const,
        content: "I apologize, but I encountered an error. Please try again."
      } as const]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="md:row-span-2">
        <CardHeader>
          <CardTitle>AI Resume Enhancement</CardTitle>
          <CardDescription>Let AI help you enhance your resume content</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Original Text</label>
                  <Badge variant="outline">Current Version</Badge>
                </div>
                <Textarea
                  value={originalText[activeTab as keyof typeof originalText]}
                  onChange={(e) =>
                    setOriginalText({
                      ...originalText,
                      [activeTab]: e.target.value,
                    })
                  }
                  placeholder="Enter your current resume text..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !originalText[activeTab as keyof typeof originalText]}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Enhance with AI
                    </>
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {enhancedText[activeTab as keyof typeof enhancedText] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Enhanced Text</label>
                      <Badge variant="secondary">AI Enhanced</Badge>
                    </div>
                    <div className="relative ">
                      <Textarea
                        value={enhancedText[activeTab as keyof typeof enhancedText]}
                        onChange={(e) =>
                          setEnhancedText({
                            ...enhancedText,
                            [activeTab]: e.target.value,
                          })
                        }
                        className="min-h-[250px] pr-10"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(enhancedText[activeTab as keyof typeof enhancedText])
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="sr-only">Like</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <ThumbsDown className="h-4 w-4" />
                          <span className="sr-only">Dislike</span>
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleGenerate}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Chat Assistant</CardTitle>
          <CardDescription>Chat with AI for personalized resume advice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => {
                if (message.role === "user") {
                  return (
                    <div key={index} className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                const formatted = formatChatMessage(message.content);
                return (
                  <div key={index} className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4 max-w-[80%] space-y-2">
                      {formatted.title && (
                        <h4 className="font-semibold text-primary">
                          {formatted.title}
                        </h4>
                      )}
                      <div className="space-y-2">
                        {formatted.content.map((line, i) => (
                          <p key={i} className="text-sm leading-relaxed">
                            {line.startsWith('•') ? line : `• ${line}`}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Ask for resume advice..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Suggestions</CardTitle>
          <CardDescription>Smart suggestions to improve your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getSuggestions().map((suggestion, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{suggestion.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

