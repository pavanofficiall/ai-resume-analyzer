"use client"

import type React from "react"
import { GoogleGenerativeAI } from "@google/generative-ai";

import { useState, useEffect ,useRef} from "react"
import { Upload, FileText, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Add these imports at the top of the file
import { motion, AnimatePresence } from "framer-motion"
import GlowingProgressRing from "@/components/animations/glowing-progress-ring"
import TypingEffect from "@/components/animations/typing-effect"
import { useSearchParams } from "next/navigation"
import { pdfjs } from 'react-pdf';
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';

type AnalysisResult = {
  atsScore: number;
  format: {
    score: number;
    feedback: string[];
    improvements: string[];
  };
  content: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  keywords: {
    score: number;
    missing: string[];
    present: string[];
    recommended: string[];
  };
  improvements: {
    critical: string[];
    important: string[];
    optional: string[];
  };
}

const processAIResponse = (response: string): AnalysisResult => {
  try {
    // Clean up the response text to extract just the JSON part
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    // Parse the cleaned JSON string
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and transform the parsed data
    return {
      atsScore: Number(parsed.atsScore) || 0,
      format: {
        score: Number(parsed.format?.score) || 0,
        feedback: Array.isArray(parsed.format?.feedback) ? parsed.format.feedback : [],
        improvements: Array.isArray(parsed.format?.improvements) ? parsed.format.improvements : []
      },
      content: {
        score: Number(parsed.content?.score) || 0,
        strengths: Array.isArray(parsed.content?.strengths) ? parsed.content.strengths : [],
        weaknesses: Array.isArray(parsed.content?.weaknesses) ? parsed.content.weaknesses : [],
        suggestions: Array.isArray(parsed.content?.suggestions) ? parsed.content.suggestions : []
      },
      keywords: {
        score: Number(parsed.keywords?.score) || 0,
        missing: Array.isArray(parsed.keywords?.missing) ? parsed.keywords.missing : [],
        present: Array.isArray(parsed.keywords?.present) ? parsed.keywords.present : [],
        recommended: Array.isArray(parsed.keywords?.recommended) ? parsed.keywords.recommended : []
      },
      improvements: {
        critical: Array.isArray(parsed.improvements?.critical) ? parsed.improvements.critical : [],
        important: Array.isArray(parsed.improvements?.important) ? parsed.improvements.important : [],
        optional: Array.isArray(parsed.improvements?.optional) ? parsed.improvements.optional : []
      }
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Return default structure if parsing fails
    return {
      atsScore: 0,
      format: { score: 0, feedback: [], improvements: [] },
      content: { score: 0, strengths: [], weaknesses: [], suggestions: [] },
      keywords: { score: 0, missing: [], present: [], recommended: [] },
      improvements: { critical: [], important: [], optional: [] }
    };
  }
};

const createAnalysisPrompt = (resumeText: string, jobDescription: string) => {
  return `Analyze this resume against the job description and provide feedback in valid JSON format. 
  Structure the response EXACTLY as shown:
  {
    "atsScore": 75,
    "format": {
      "score": 80,
      "feedback": ["Clear section headers", "Good use of bullet points"],
      "improvements": ["Add more white space", "Use consistent font"]
    },
    "content": {
      "score": 70,
      "strengths": ["Good experience detail", "Clear achievements"],
      "weaknesses": ["Missing metrics", "Vague statements"],
      "suggestions": ["Add specific numbers", "Use stronger action verbs"]
    },
    "keywords": {
      "score": 65,
      "missing": ["specific tech keywords from job"],
      "present": ["matching keywords found"],
      "recommended": ["suggested keywords to add"]
    },
    "improvements": {
      "critical": ["highest priority changes"],
      "important": ["medium priority changes"],
      "optional": ["nice to have changes"]
    }
  }

  Resume Content:
  ${resumeText}

  Job Description:
  ${jobDescription}

  Ensure the response is ONLY the JSON object with no additional text or formatting.`;
};

export default function ResumeAnalyzer() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Show loading or redirect while checking authentication
  if (loading || !user) {
    return null
  }

  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [atsScore, setAtsScore] = useState(0)
  const searchParams = useSearchParams()
const [jobDescription, setJobDescription] = useState<string>("");
const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
const genAI = useRef(new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!));

  // Add these state variables after the existing ones
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([])
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0)
  const [resumeTitle, setResumeTitle] = useState("")

  // Check if we're re-analyzing an existing resume
  useEffect(() => {
    const resumeId = searchParams.get("id")
    if (resumeId) {
      // In a real app, we would fetch the resume data from an API
      // For now, we'll just simulate having a file
      setFile(new File(["dummy content"], "resume.pdf", { type: "application/pdf" }))
      setResumeTitle("Software Engineer Resume")
    }
  }, [searchParams])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setAnalysisComplete(false)
      setResumeTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""))
    }
  }

  const analyzeWithGemini = async (fileContent: string, jobDesc: string) => {
    try {
      const model = genAI.current.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = createAnalysisPrompt(fileContent, jobDesc);
      
      // Update analysis steps
      setCurrentAnalysisStep(0);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentAnalysisStep(1);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setCurrentAnalysisStep(2);
      const parsedResult = processAIResponse(text);
      
      setCurrentAnalysisStep(3);
      setAnalysisResult(parsedResult);
      setAtsScore(parsedResult.atsScore);
      
      setCurrentAnalysisStep(4);
      setAnalysisComplete(true);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      
      const loadingTask = pdfjs.getDocument({ 
        data: typedArray,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/',
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      let fullText = '';
      
      // Show progress during extraction
      const totalPages = pdf.numPages;
      
      for (let i = 1; i <= totalPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .trim();
            
          if (pageText) {
            fullText += pageText + '\n\n';
          }
        } catch (pageError) {
          console.error(`Error extracting text from page ${i}:`, pageError);
        }
      }
      
      const cleanedText = fullText.trim();
      if (!cleanedText) {
        throw new Error('No readable text found in PDF');
      }
      
      return cleanedText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to read PDF content');
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      alert("Please provide both a resume and job description");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisSteps([
      "Extracting resume content...",
      "Processing job requirements...",
      "Analyzing ATS compatibility...",
      "Generating detailed feedback...",
      "Finalizing recommendations..."
    ]);

    try {
      let fileContent = '';
      if (file.type === 'application/pdf') {
        fileContent = await extractTextFromPDF(file);
      } else {
        fileContent = await file.text();
      }
      
      if (!fileContent.trim()) {
        throw new Error('No readable content found in the file');
      }
      
      await analyzeWithGemini(fileContent, jobDescription);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      alert('Could not read the resume file. Please make sure it contains readable text.');
    }
  };

  const renderOverviewTab = () => {
    if (!analysisResult) return null;
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <span>{resumeTitle || "Resume Analysis"}</span>
              </CardTitle>
              <CardDescription>ATS Compatibility Score</CardDescription>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {analysisResult.atsScore}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Progress value={analysisResult.atsScore} className="h-2 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Needs Improvement</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Alert variant={analysisResult.format.score > 70 ? "default" : "destructive"}>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Format Analysis</AlertTitle>
                <AlertDescription>
                  {analysisResult.format.feedback[0]}
                </AlertDescription>
              </Alert>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Alert variant={analysisResult.content.score > 60 ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Content Analysis</AlertTitle>
                <AlertDescription>
                  {analysisResult.content.weaknesses[0]}
                </AlertDescription>
              </Alert>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Alert variant={analysisResult.keywords.score > 50 ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Keyword Analysis</AlertTitle>
                <AlertDescription>
                  {analysisResult.keywords.missing.length > 0
                    ? `Missing ${analysisResult.keywords.missing.length} key industry terms`
                    : "Good keyword coverage"}
                </AlertDescription>
              </Alert>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContentTab = () => {
    if (!analysisResult) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Analysis</CardTitle>
          <CardDescription>Detailed feedback on your resume's content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Strengths</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {analysisResult.content.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Areas for Improvement</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {analysisResult.content.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Suggestions</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {analysisResult.content.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderKeywordsTab = () => {
    if (!analysisResult) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keyword Analysis</CardTitle>
          <CardDescription>How well your resume matches industry keywords</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywords.missing.map((keyword) => (
                  <div
                    key={keyword}
                    className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Present Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywords.present.map((keyword) => (
                  <div
                    key={keyword}
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Recommended Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywords.recommended.map((keyword) => (
                  <div
                    key={keyword}
                    className="bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSuggestionsTab = () => {
    if (!analysisResult) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Improvement Suggestions</CardTitle>
          <CardDescription>Actionable recommendations to enhance your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 rounded-lg">
              <h3 className="text-lg font-medium text-amber-800 dark:text-amber-400 mb-2">
                Critical Changes
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-amber-800 dark:text-amber-300">
                {analysisResult.improvements.critical.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 border border-brand-200 bg-brand-50 dark:bg-brand-950/20 dark:bg-brand-900/20 dark:border-brand-900 rounded-lg">
              <h3 className="text-lg font-medium text-brand-800 dark:text-brand-400 mb-2">
                Important Changes
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-brand-800 dark:text-brand-300">
                {analysisResult.improvements.important.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-400 mb-2">
                Optional Enhancements
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-green-800 dark:text-green-300">
                {analysisResult.improvements.optional.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-10 px-4 bg-background transition-theme">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Resume Analyzer</h1>
          <p className="text-lg text-muted-foreground mb-10">
            Upload your resume and get AI-powered feedback to improve your chances of landing interviews.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Resume</CardTitle>
                  <CardDescription>Supported formats: PDF, DOCX</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-secondary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {file ? file.name : "Drag and drop your resume here or click to browse"}
                      </p>
                      {file && <p className="text-xs text-brand-600 dark:text-brand-400">File selected: {file.name}</p>}
                    </label>
                  </div>
<div className="mb-4">
  <label className="block text-sm font-medium text-foreground mb-2">
    Job Description
  </label>
  <textarea
    className="w-full h-32 p-2 border rounded-md bg-background text-foreground resize-none"
    placeholder="Paste the job description here for better analysis..."
    value={jobDescription}
    onChange={(e) => setJobDescription(e.target.value)}
  />
</div>

                  <Button
                    className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors"
                    onClick={handleAnalyze}
                    disabled={!file || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        {searchParams.get("id") ? "Re-analyze Resume" : "Analyze Resume"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {!file && !analysisComplete ? (
                <div className="h-full flex items-center justify-center bg-card rounded-lg shadow-sm p-10">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-foreground mb-2">No Resume Uploaded</h3>
                    <p className="text-muted-foreground">
                      Upload your resume to get AI-powered feedback and suggestions.
                    </p>
                  </div>
                </div>
              ) : isAnalyzing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Analyzing Your Resume</CardTitle>
                    <CardDescription>Our AI is reviewing your resume. This will take just a moment...</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex flex-col items-center justify-center py-8">
                      <GlowingProgressRing value={atsScore} size={160} className="mb-8" />

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentAnalysisStep}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="text-brand-600 dark:text-brand-400 font-medium mb-8 h-6"
                        >
                          <TypingEffect text={analysisSteps[currentAnalysisStep]} speed={30} />
                        </motion.div>
                      </AnimatePresence>

                      <div className="w-full max-w-md bg-secondary/50 dark:bg-secondary/30 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-2">Analysis Progress</div>
                        <Progress value={atsScore} className="h-2 mb-1" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Scanning</span>
                          <span>Processing</span>
                          <span>Finalizing</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : analysisComplete ? (
                <Tabs defaultValue="overview">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
                  <TabsContent value="content">{renderContentTab()}</TabsContent>
                  <TabsContent value="keywords">{renderKeywordsTab()}</TabsContent>
                  <TabsContent value="suggestions">{renderSuggestionsTab()}</TabsContent>
                </Tabs>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


