"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useRef } from "react"
import { Search, Briefcase, CheckCircle, AlertCircle, ChevronRight } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AnalysisResult {
  atsScore: number;
  format: { score: number };
  content: {
    score: number;
    strengths: string[];
    weaknesses: string[];
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
  };
  requirements?: {
    items?: Array<{
      requirement: string;
      satisfied: boolean;
      score: number;
      feedback: string;
    }>;
  };
}

interface JobMatchingProps {
  result: AnalysisResult | null;
  jobDescription: string;
  onOptimize?: () => void;
}



export default function JobMatching({ result, jobDescription, onOptimize }: JobMatchingProps) {
  const genAI = useRef(new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!));
  const [jobUrl, setJobUrl] = useState("")
  const [jobDescriptionInput, setJobDescriptionInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(true) // Set to true for demo purposes

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      setIsAnalyzed(true)
    }, 2000)
  }

  // Calculate overall match score from AI analysis
  const getMatchScore = (result: AnalysisResult | null) => {
    if (!result) return 0;
    const scores = [
      result.atsScore,
      result.format.score,
      result.content.score,
      result.keywords.score
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Generate radar chart data from AI analysis
  const getSkillsData = (result: AnalysisResult | null) => {
    if (!result) return [];
    
    return [
      { subject: "ATS Score", A: result.atsScore, fullMark: 100 },
      { subject: "Format", A: result.format.score, fullMark: 100 },
      { subject: "Content", A: result.content.score, fullMark: 100 },
      { subject: "Keywords", A: result.keywords.score, fullMark: 100 }
    ];
  };

  // Replace mock data with real data
  const matchScore = result ? getMatchScore(result) : 0;
  const radarData = getSkillsData(result);

  // Add safe access helper
  const safeArray = (arr: string[] | undefined) => arr || [];

  // Add requirements handler
  
  const getRequirementColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const cleanAndParseJSON = (text: string) => {
    // Remove any markdown code block syntax and clean the text
    const cleaned = text
      .replace(/```json\s*|\s*```/g, '')  // Remove code blocks
      .replace(/[\n\r]+/g, ' ')           // Replace newlines with spaces
      .replace(/\s+/g, ' ')               // Normalize spaces
      .trim();                            // Trim extra whitespace
    
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Failed to parse optimization result');
    }
  };

  

  // Add safe requirements helper
  const getRequirements = () => {
    return result?.requirements?.items || [];
  };

  if (!result?.content) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Complete the analysis to see job matching results
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isAnalyzed ? (
        <Card>
          <CardHeader>
            <CardTitle>Job Matching</CardTitle>
            <CardDescription>Compare your resume against a specific job description</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">Job URL</TabsTrigger>
                <TabsTrigger value="paste">Paste Description</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="job-url" className="text-sm font-medium">
                    Enter job posting URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="job-url"
                      placeholder="https://example.com/job-posting"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                    />
                    <Button onClick={handleAnalyze} disabled={!jobUrl || isAnalyzing}>
                      {isAnalyzing ? (
                        <span className="flex items-center gap-1">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Analyzing
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Search className="h-4 w-4" />
                          Analyze
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="paste" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="job-description" className="text-sm font-medium">
                    Paste job description
                  </label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the full job description here..."
                    className="min-h-[200px]"
                    value={jobDescriptionInput}
                    onChange={(e) => setJobDescriptionInput(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleAnalyze} disabled={!jobDescriptionInput || isAnalyzing}>
                    {isAnalyzing ? (
                      <span className="flex items-center gap-1">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Analyzing
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Search className="h-4 w-4" />
                        Analyze Match
                      </span>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Overall Match Score</CardTitle>
                <CardDescription>How well your resume matches the job requirements</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold">{matchScore}%</div>
                        <div className="text-sm text-muted-foreground mt-1">Match Score</div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Match", value: matchScore },
                            { name: "Gap", value: 100 - matchScore },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill={matchScore >= 70 ? "#22c55e" : matchScore >= 50 ? "#f59e0b" : "#ef4444"} />
                          <Cell fill="#EEEEEE" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 text-center">
                    {matchScore >= 70 ? (
                      <Badge className="bg-green-500">Good Match</Badge>
                    ) : matchScore >= 50 ? (
                      <Badge className="bg-amber-500">Average Match</Badge>
                    ) : (
                      <Badge className="bg-red-500">Poor Match</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Skills Breakdown</CardTitle>
                <CardDescription>Analysis of your skills compared to job requirements</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar 
                        name="Score" 
                        dataKey="A" 
                        stroke={matchScore >= 70 ? "#22c55e" : matchScore >= 50 ? "#f59e0b" : "#ef4444"}
                        fill={matchScore >= 70 ? "#22c55e" : matchScore >= 50 ? "#f59e0b" : "#ef4444"}
                        fillOpacity={0.6} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Requirements Match</CardTitle>
              <CardDescription>How your resume matches specific job requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getRequirements().length > 0 ? (
                  getRequirements().map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">{item.requirement}</h3>
                        </div>
                        {item.satisfied ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className={`h-5 w-5 ${getRequirementColor(item.score)}`} />
                        )}
                      </div>
                      <Progress value={item.score} className="h-2" />
                      <p className="text-sm text-muted-foreground">{item.feedback}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No specific requirements to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills Match</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Matching Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {safeArray(result.content.strengths).map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Skills to Add</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.content.weaknesses.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Improvement Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.improvements.critical.length > 0 && (
                  <div>
                    <h3 className="font-medium text-red-600 mb-2">Critical Changes</h3>
                    <ul className="list-disc pl-4 space-y-1">
                      {result.improvements.critical.map((item: string, i: number) => (
                        <li key={i} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.improvements.important.length > 0 && (
                  <div>
                    <h3 className="font-medium text-yellow-600 mb-2">Important Changes</h3>
                    <ul className="list-disc pl-4 space-y-1">
                      {result.improvements.important.map((item: string, i: number) => (
                        <li key={i} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keyword Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Missing Skills Section with Scrollbar */}
                <div>
                  <h3 className="font-medium mb-2">Missing Keywords</h3>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-3">
                    <div className="flex flex-wrap gap-2">
                      {safeArray(result.keywords?.missing).map((keyword, i) => (
                        <Badge key={i} variant="destructive" className="whitespace-nowrap">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Present Keywords Section */}
                <div>
                  <h3 className="font-medium mb-2">Present Keywords</h3>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-3">
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.present.map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="whitespace-nowrap">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended Keywords Section */}
                <div>
                  <h3 className="font-medium mb-2">Recommended Keywords</h3>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-3">
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.recommended.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="whitespace-nowrap">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline">Try Another Job</Button>
            
          </div>
        </>
      )}
    </div>
  )
}

