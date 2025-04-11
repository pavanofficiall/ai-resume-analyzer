"use client"

import { useState, useRef } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UploadSection from "@/app/ai-analyzer/components/upload-section"
import AnalysisDashboard from "@/app/ai-analyzer/components/analysis-dashboard"
import JobMatching from "@/app/ai-analyzer/components/job-matching"
import AiEnhancement from "@/app/ai-analyzer/components/ai-enhancement"
import CoverLetterGenerator from "@/app/ai-analyzer/components/cover-letter-generator"
import ResumePreview from "@/app/ai-analyzer/components/resume-preview"

import { pdfjs } from 'react-pdf';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs';
}

// Analysis result type
type AnalysisResult = {
  atsScore: number;
  format: { score: number; feedback: string[]; improvements: string[] };
  content: { score: number; strengths: string[]; weaknesses: string[]; suggestions: string[] };
  keywords: { score: number; missing: string[]; present: string[]; recommended: string[] };
  improvements: { critical: string[]; important: string[]; optional: string[] };
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const genAI = useRef(new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!));

  // Handle file upload and read content
  const handleFileUpload = async (uploadedFile: File | null, content?: string) => {
    if (!uploadedFile || !content) {
      setFile(null);
      setFileContent('');
      return;
    }

    try {
      setFile(uploadedFile);
      setFileContent(content);
      console.log('File content loaded:', content.substring(0, 100) + '...');
    } catch (error) {
      console.error('File processing error:', error);
      setErrorMessage('Failed to process file');
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const items = textContent.items as { str: string; }[];
          
          // Simple text extraction without section parsing
          fullText += items.map(item => item.str).join(' ') + '\n';
        }

        return fullText.trim();
      } catch (error) {
        throw new Error('Failed to extract text from PDF');
      }
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    }
  };

  const handleJobDescriptionChange = (description: string) => {
    setJobDescription(description);
    setErrorMessage('');
  };

  const cleanAndParseJSON = (text: string) => {
    // Remove markdown code block syntax
    let cleaned = text.replace(/```json\s*/, '').replace(/```\s*$/, '');
    
    // Fix common JSON issues
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
                    .replace(/\/\/[^\n]*/g, '') // Remove single-line comments
                    .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
    
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Initial parse failed, attempting to fix JSON:', e);
      // If still fails, try more aggressive cleaning
      cleaned = cleaned.replace(/[\n\r\t]/g, ' ') // Remove newlines and tabs
                      .replace(/\s+/g, ' ') // Normalize spaces
                      .replace(/"\s+}/g, '"}') // Fix spacing issues
                      .replace(/"\s+]/g, '"]'); // Fix array spacing issues
      return JSON.parse(cleaned);
    }
  };

  const handleAnalysis = async () => {
    if (!fileContent || !jobDescription) {
      setErrorMessage('Please provide both resume and job description');
      return;
    }

    setIsAnalyzing(true);
    try {
      const model = genAI.current.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze this resume against the job description. Focus on identifying specific strengths and requirements matching.

      RESUME:
      ${fileContent}

      JOB DESCRIPTION:
      ${jobDescription}

      Analyze and return JSON with focus on requirements matching:
      {
        "atsScore": <0-100>,
        "format": {
          "score": <0-100>,
          "sections": {
            "summary": {"present": boolean, "quality": <0-100>, "feedback": "specific feedback"},
            "experience": {"present": boolean, "quality": <0-100>, "feedback": "specific feedback"},
            "education": {"present": boolean, "quality": <0-100>, "feedback": "specific feedback"},
            "skills": {"present": boolean, "quality": <0-100>, "feedback": "specific feedback"}
          },
          "feedback": ["overall format feedback"],
          "improvements": ["format improvement suggestions"]
        },
        "content": {
          "score": <0-100>,
          "strengths": ["specific strength with section reference"],
          "weaknesses": ["specific weakness with section reference"],
          "suggestions": ["actionable content suggestions"]
        },
        "keywords": {
          "score": <0-100>,
          "missing": ["missing required skills"],
          "present": ["found matching skills"],
          "recommended": ["recommended additions"]
        },
        "improvements": {
          "critical": ["highest priority changes"],
          "important": ["medium priority changes"],
          "optional": ["nice-to-have changes"]
        },
        "requirements": {
          "items": [
            {
              "requirement": "specific requirement from job description",
              "satisfied": boolean,
              "score": number 0-100,
              "feedback": "detailed feedback about match"
            }
          ]
        }
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      try {
        const cleanJson = text.replace(/```json\s*|\s*```/g, '').trim();
        const analysisData = JSON.parse(cleanJson);
        
        // Transform data to include section analysis
        const transformedData = {
          ...analysisData,
          sections: analysisData.format.sections || {},
          format: {
            ...analysisData.format,
            score: analysisData.format.score || 0,
            feedback: Array.isArray(analysisData.format.feedback) ? analysisData.format.feedback : [],
            improvements: Array.isArray(analysisData.format.improvements) ? analysisData.format.improvements : []
          }
        };

        setAnalysisResult(transformedData);
      } catch (error) {
        console.error('Analysis parsing failed:', error);
        setErrorMessage('Failed to analyze resume. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Resume Analyzer</h1>
        <p className="text-muted-foreground">AI-powered resume analysis and enhancement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UploadSection 
            onFileUpload={handleFileUpload}
            onJobDescriptionChange={handleJobDescriptionChange}
            onAnalyze={handleAnalysis}
            isAnalyzing={isAnalyzing}
            errorMessage={errorMessage}
          />
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="job-matching">Job Matching</TabsTrigger>
              <TabsTrigger value="ai-enhancement">AI Enhancement</TabsTrigger>
              <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis">
              <AnalysisDashboard 
                isAnalyzing={isAnalyzing}
                result={analysisResult}
              />
            </TabsContent>
            <TabsContent value="job-matching">
              <JobMatching 
                result={analysisResult}
                jobDescription={jobDescription}
              />
            </TabsContent>
            <TabsContent value="ai-enhancement">
              <AiEnhancement 
                result={analysisResult}
                onEnhance={handleAnalysis}
              />
            </TabsContent>
            <TabsContent value="cover-letter">
              <CoverLetterGenerator 
                resumeData={file}
                jobDescription={jobDescription}
                aiModel={genAI.current}
              />
            </TabsContent>
            <TabsContent value="preview">
              <ResumePreview file={file} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

