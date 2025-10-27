export interface CandidateResult {
  name: string
  fileName: string
  matchPercentage: number
  matchedKeywords: string[]
  strengths?: string[]
  weaknesses?: string[]
  summary?: string
}
