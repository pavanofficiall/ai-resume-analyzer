"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"

interface JobDescriptionFormProps {
  onAnalyze: (title: string, description: string, files: File[]) => void
  onReset: () => void
  isAnalyzing: boolean
  hasResults: boolean
}

export function JobDescriptionForm({ onAnalyze, onReset, isAnalyzing, hasResults }: JobDescriptionFormProps) {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      // Limit to 10 files maximum
      if (selectedFiles.length > 10) {
        alert("You can only upload up to 10 resumes at a time. Please select fewer files.")
        // Reset the input
        e.target.value = ""
        return
      }

      setFiles(selectedFiles)
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (jobTitle && jobDescription && files.length > 0) {
      onAnalyze(jobTitle, jobDescription, files)
    }
  }

  const handleClear = () => {
    setJobTitle("")
    setJobDescription("")
    setFiles([])
    onReset()
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Job Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              placeholder="e.g., Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              disabled={isAnalyzing}
            />
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              placeholder="Enter the full job description including requirements, responsibilities, and qualifications..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              disabled={isAnalyzing}
              rows={8}
              className="resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume-upload">Upload Resumes (Max 10 files)</Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="resume-upload"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Choose Files
              </label>
              <input
                id="resume-upload"
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
                disabled={isAnalyzing}
                className="sr-only"
              />
              <span className="text-sm text-muted-foreground">
                {files.length > 0 ? `${files.length}/10 files selected` : "No files selected (max 10)"}
              </span>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm text-foreground">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isAnalyzing}
                      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {files.length === 10 && (
                  <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-800 dark:bg-yellow-950/20">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Maximum limit reached (10 files). Remove files to add more.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!jobTitle || !jobDescription || files.length === 0 || isAnalyzing}
              className="flex-1 mx-64"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Resumes"}
            </Button>
            {(hasResults || files.length > 0 || jobTitle || jobDescription) && (
              <Button type="button" variant="outline" onClick={handleClear} disabled={isAnalyzing}>
                Clear All
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
