"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, RefreshCw, CheckCircle, AlertCircle, Info } from "lucide-react"
import type { CandidateResult } from "@/types/candidate"
import { motion } from "framer-motion"

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
          <h2 className="text-2xl font-semibold text-foreground">AI Screening Results</h2>
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
      <div className="space-y-6">
        {candidates.map((candidate, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{candidate.fileName}</p>
                    </div>
                  </div>
                  <Badge variant={getMatchBadgeVariant(candidate.matchPercentage)} className="ml-4">
                    {getMatchLabel(candidate.matchPercentage)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Match Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Match Score</span>
                    <span className="text-lg font-bold text-foreground">{candidate.matchPercentage}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all duration-1000 ${getMatchColor(candidate.matchPercentage)}`}
                      style={{ width: `${candidate.matchPercentage}%` }}
                    />
                  </div>
                </div>

                {/* AI Summary */}
                {candidate.summary && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">AI Assessment</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{candidate.summary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Matched Keywords */}
                {candidate.matchedKeywords && candidate.matchedKeywords.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Matched Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.matchedKeywords.slice(0, 8).map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {keyword}
                        </Badge>
                      ))}
                      {candidate.matchedKeywords.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.matchedKeywords.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {candidate.strengths && candidate.strengths.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Key Strengths:
                    </p>
                    <ul className="space-y-1">
                      {candidate.strengths.slice(0, 3).map((strength, i) => (
                        <li key={i} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {candidate.weaknesses && candidate.weaknesses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      Areas for Improvement:
                    </p>
                    <ul className="space-y-1">
                      {candidate.weaknesses.slice(0, 3).map((weakness, i) => (
                        <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => alert(`Viewing detailed analysis for ${candidate.name}`)}
                  >
                    View Full Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
