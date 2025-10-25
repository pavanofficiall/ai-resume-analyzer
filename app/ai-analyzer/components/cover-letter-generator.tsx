"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Download, Copy, RefreshCw, Sparkles, CheckCircle } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";

interface CoverLetterGeneratorProps {
  resumeData?: any;
  jobDescription?: string;
}

export default function CoverLetterGenerator({ resumeData, jobDescription }: CoverLetterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    jobDescription: "",
    tone: "professional",
    includePersonal: true,
  })
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const genAI = useRef(new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      includePersonal: checked,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      tone: value,
    })
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const model = genAI.current.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `Create a professional cover letter with the following details:

      Company: ${formData.company}
      Position: ${formData.position}
      Job Description: ${formData.jobDescription}
      Tone: ${formData.tone}
      Include Personal Touch: ${formData.includePersonal}
      
      Resume Data: ${JSON.stringify(resumeData)}

      Requirements:
      1. Use a ${formData.tone} tone
      2. Match skills from resume to job requirements
      3. Include specific achievements from resume
      4. ${formData.includePersonal ? 'Add personal connection to company' : 'Keep strictly professional'}
      5. Keep under 400 words
      6. Use proper business letter format
      
      Return only the cover letter text, no additional formatting.`;

      const result = await model.generateContent(prompt);
      const letter = result.response.text();
      setCoverLetter(letter);
      setIsGenerated(true);
      toast.success("Cover letter generated successfully!");
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error("Failed to generate cover letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy text. Please try again.");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([coverLetter], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cover_Letter_${formData.company.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Cover letter downloaded!");
    } catch (error) {
      toast.error("Download failed. Please try again.");
    }
  };

  const handleSaveToResume = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save to your database
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Cover letter saved to resume!");
    } catch (error) {
      toast.error("Failed to save cover letter.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartOver = () => {
    setIsGenerated(false);
    setCoverLetter("");
    setFormData({
      company: "",
      position: "",
      jobDescription: "",
      tone: "professional",
      includePersonal: true,
    });
  };

  return (
    <div className="space-y-6">
      {!isGenerated ? (
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter Generator</CardTitle>
            <CardDescription>Generate a personalized cover letter for your job application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="e.g., Acme Corporation"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="e.g., Frontend Developer"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description (Key Points)</Label>
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  placeholder="Paste key points from the job description..."
                  className="min-h-[150px]"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={formData.tone} onValueChange={handleSelectChange}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="confident">Confident</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between space-y-0 pt-5">
                  <Label htmlFor="includePersonal">Include Personal Touch</Label>
                  <Switch
                    id="includePersonal"
                    checked={formData.includePersonal}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating || !formData.company || !formData.position}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Cover Letter
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Cover Letter</CardTitle>
                  <CardDescription>
                    Personalized for {formData.position} at {formData.company}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopy}
                    disabled={isCopied}
                  >
                    {isCopied ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {isCopied ? "Copied!" : "Copy"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <Card className="border bg-card">
                    <CardContent className="p-6 whitespace-pre-line font-serif">{coverLetter}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="edit" className="mt-4">
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleStartOver}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
            <Button 
              onClick={handleSaveToResume}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save to Resume"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

