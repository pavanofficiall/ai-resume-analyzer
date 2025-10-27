"use client"

import { useState } from "react"
import { JobDescriptionForm } from "@/components/job-description-form"
import { ResumeResults } from "@/components/resume-results"
import { analyzeResumes } from "@/lib/resume-analyzer"
import type { CandidateResult } from "@/types/candidate"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HRDashboard() {
  const { user, loading, role } = useAuth()
  const router = useRouter()
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [candidates, setCandidates] = useState<CandidateResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
    setIsAnalyzing(true)
    setJobTitle(title)
    setJobDescription(description)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const results = await analyzeResumes(description, files)
    setCandidates(results)
    setIsAnalyzing(false)
  }

  const handleReset = () => {
    setJobTitle("")
    setJobDescription("")
    setCandidates([])
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">HR Resume Screening Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Upload a job description and candidate resumes to find the best matches
            </p>
          </div>

          {/* Job Description Form */}
          <JobDescriptionForm
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            isAnalyzing={isAnalyzing}
            hasResults={candidates.length > 0}
          />

          {/* Results Section */}
          {isAnalyzing && (
            <div className="mt-8 flex items-center justify-center rounded-lg border border-border bg-card p-12">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-sm text-muted-foreground">Analyzing resumes...</p>
              </div>
            </div>
          )}

          {!isAnalyzing && candidates.length > 0 && (
            <ResumeResults jobTitle={jobTitle} candidates={candidates} onReset={handleReset} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
