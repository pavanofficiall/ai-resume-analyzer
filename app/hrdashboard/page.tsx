"use client"

import { Button } from "@/components/ui/button"
import { JobDescriptionForm } from "@/components/job-description-form"
import { ResumeResults } from "@/components/resume-results"
import { analyzeResumes, analyzeSingleResumeFile } from "@/lib/resume-analyzer"
import type { CandidateResult } from "@/types/candidate"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, FileText, AlertCircle } from "lucide-react"

export default function HRDashboard() {
  const { user, loading, role } = useAuth()
  const router = useRouter()
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [candidates, setCandidates] = useState<CandidateResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState("")
  const [completedFiles, setCompletedFiles] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [isCancelled, setIsCancelled] = useState(false)
  const [jobDescriptionCache, setJobDescriptionCache] = useState<string>("")
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
      } else if (role !== 'hr') {
        router.push('/ai-analyzer')
      }
    }
  }, [user, loading, role, router])

  // Show loading or redirect while checking authentication
  if (loading || !user || role !== 'hr') {
    return null
  }

  const handleAnalyze = async (title: string, description: string, files: File[]) => {
    // Create new AbortController for this analysis session
    abortControllerRef.current = new AbortController()

    setIsAnalyzing(true)
    setIsCancelled(false)
    setJobTitle(title)
    setJobDescription(description)
    setCandidates([])
    setAnalysisProgress(0)
    setCompletedFiles(0)
    setTotalFiles(files.length)
    setJobDescriptionCache(description)

    try {
      // Optimized batch processing for large datasets
      const BATCH_SIZE = 5 // Process 5 files at a time for better performance
      const DELAY_BETWEEN_BATCHES = 100 // Small delay to prevent overwhelming the API
      const results: CandidateResult[] = []

      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        // Check if analysis was cancelled
        if (abortControllerRef.current?.signal.aborted) break

        const batch = files.slice(i, i + BATCH_SIZE)
        const batchPromises = batch.map(async (file, batchIndex) => {
          const globalIndex = i + batchIndex
          setCurrentFile(file.name)

          try {
            const result = await analyzeSingleResume(description, file, abortControllerRef.current?.signal)

            // Add result immediately for real-time display
            setCandidates(prev => {
              const newResults = [...prev, result].sort((a, b) => b.matchPercentage - a.matchPercentage)
              return newResults
            })

            return result
          } catch (error) {
            if (error instanceof Error && error.message === 'Analysis cancelled') {
              throw error
            }

            console.error(`Error analyzing ${file.name}:`, error)
            const errorResult = {
              name: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
              fileName: file.name,
              matchPercentage: 0,
              matchedKeywords: [],
              strengths: [],
              weaknesses: ['Failed to analyze resume - please check file format'],
              summary: 'Analysis failed'
            }

            // Add error result immediately
            setCandidates(prev => [...prev, errorResult])
            return errorResult
          }
        })

        // Wait for current batch to complete
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)

        // Update progress
        setCompletedFiles(Math.min(i + BATCH_SIZE, files.length))
        setAnalysisProgress(((i + BATCH_SIZE) / files.length) * 100)

        // Small delay between batches to prevent API rate limiting
        if (i + BATCH_SIZE < files.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
        }
      }

      // Sort by match percentage (highest first) if not cancelled
      if (!abortControllerRef.current?.signal.aborted) {
        const sortedResults = results.sort((a, b) => b.matchPercentage - a.matchPercentage)
        setCandidates(sortedResults)
      }

    } catch (error) {
      if (error instanceof Error && error.message === 'Analysis cancelled') {
        console.log('Analysis was cancelled by user')
      } else {
        console.error('Analysis failed:', error)
        alert('Failed to analyze resumes. Please try again.')
      }
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(abortControllerRef.current?.signal.aborted ? 0 : 100)
      setCurrentFile("")
      abortControllerRef.current = null

      // Show completion message only if not cancelled
      if (!abortControllerRef.current?.signal.aborted && candidates.length > 0) {
        setTimeout(() => {
          toast.success(`Analysis complete! Processed ${candidates.length} resumes successfully.`)
        }, 500)
      }
    }
  }

  // Helper function to analyze single resume
  const analyzeSingleResume = async (jobDescription: string, file: File, signal?: AbortSignal): Promise<CandidateResult> => {
    return await analyzeSingleResumeFile(jobDescription, file, signal)
  }

  const handleReset = () => {
    setJobTitle("")
    setJobDescription("")
    setCandidates([])
    setAnalysisProgress(0)
    setCurrentFile("")
    setCompletedFiles(0)
    setTotalFiles(0)
    setIsCancelled(false)
    setJobDescriptionCache("")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground">HR Resume Screening Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Upload a job description and candidate resumes to find the best matches using AI analysis
            </p>
          </motion.div>

          {/* Job Description Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <JobDescriptionForm
              onAnalyze={handleAnalyze}
              onReset={handleReset}
              isAnalyzing={isAnalyzing}
              hasResults={candidates.length > 0}
            />
          </motion.div>

          {/* Real-time Analysis Progress */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    AI Analysis in Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing resumes...</span>
                      <span>{completedFiles}/{totalFiles} completed</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>

                  {currentFile && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Analyzing: {currentFile}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Our AI is evaluating each resume against your job requirements, analyzing skills, experience, and cultural fit.
                    </div>
                    <Button
                      onClick={() => {
                        abortControllerRef.current?.abort()
                        setIsCancelled(true)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Section - Show results in real-time */}
          {candidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  Candidate Analysis Results
                  {isAnalyzing && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({candidates.length} of {totalFiles} processed)
                    </span>
                  )}
                </h2>
                {!isAnalyzing && (
                  <Button onClick={handleReset} variant="outline">
                    Start New Analysis
                  </Button>
                )}
              </div>
              <ResumeResults jobTitle={jobTitle} candidates={candidates} onReset={handleReset} />
            </motion.div>
          )}

          {/* Empty State */}
          {!isAnalyzing && candidates.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Ready to Screen Candidates</h3>
                  <p className="text-muted-foreground text-sm">
                    Upload a job description and candidate resumes to get AI-powered analysis and ranking.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
