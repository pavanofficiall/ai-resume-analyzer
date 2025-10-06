"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, RefreshCw } from "lucide-react"
import type { CandidateResult } from "@/types/candidate"

interface ResumeResultsProps {
  jobTitle: string
  candidates: CandidateResult[]
  onReset: () => void
}

export function ResumeResults({ jobTitle, candidates, onReset }: ResumeResultsProps) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getMatchBadgeVariant = (percentage: number) => {
    if (percentage >= 70) return "default"
    if (percentage >= 50) return "secondary"
    return "destructive"
  }

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 70) return "Strong Match"
    if (percentage >= 50) return "Moderate Match"
    return "Low Match"
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Screening Results</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} analyzed for{" "}
            <span className="font-medium">{jobTitle}</span>
          </p>
        </div>
        <Button variant="outline" onClick={onReset} className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          New Search
        </Button>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <Card key={index} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Candidate Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.fileName}</p>
                    </div>
                  </div>

                  {/* Match Percentage Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Match Score</span>
                      <Badge variant={getMatchBadgeVariant(candidate.matchPercentage)}>
                        {getMatchLabel(candidate.matchPercentage)}
                      </Badge>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${getMatchColor(candidate.matchPercentage)}`}
                        style={{ width: `${candidate.matchPercentage}%` }}
                      />
                    </div>
                    <p className="text-right text-sm font-semibold text-foreground">{candidate.matchPercentage}%</p>
                  </div>

                  {/* Matched Keywords */}
                  {candidate.matchedKeywords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Matched Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.matchedKeywords.slice(0, 6).map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {candidate.matchedKeywords.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.matchedKeywords.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* View Resume Button */}
                <div className="flex sm:flex-col sm:items-end">
                  <Button
                    variant="outline"
                    onClick={() => alert(`Viewing resume for ${candidate.name}`)}
                    className="w-full sm:w-auto"
                  >
                    View Resume
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
