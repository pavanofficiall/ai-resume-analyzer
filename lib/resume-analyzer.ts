import type { CandidateResult } from "@/types/candidate"

// Common keywords to look for in resumes
const COMMON_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "node",
  "python",
  "java",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "agile",
  "scrum",
  "leadership",
  "management",
  "communication",
  "problem solving",
  "team player",
  "git",
  "api",
  "rest",
  "graphql",
  "mongodb",
  "postgresql",
  "ci/cd",
  "testing",
  "tdd",
  "microservices",
  "cloud",
  "devops",
  "frontend",
  "backend",
  "full stack",
  "mobile",
  "ios",
  "android",
  "machine learning",
  "ai",
  "data analysis",
  "analytics",
  "excel",
  "powerpoint",
  "project management",
]

// Extract keywords from text
function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase()
  return COMMON_KEYWORDS.filter((keyword) => lowerText.includes(keyword.toLowerCase()))
}

// Calculate match percentage based on keyword overlap
function calculateMatchPercentage(jobKeywords: string[], resumeKeywords: string[]): number {
  if (jobKeywords.length === 0) return 0

  const matchedKeywords = resumeKeywords.filter((keyword) => jobKeywords.includes(keyword))

  // Base score on keyword matches
  const keywordScore = (matchedKeywords.length / jobKeywords.length) * 100

  // Add some randomness for demo purposes (±10%)
  const randomFactor = Math.random() * 20 - 10
  const finalScore = Math.max(0, Math.min(100, keywordScore + randomFactor))

  return Math.round(finalScore)
}

// Extract candidate name from filename
function extractCandidateName(fileName: string): string {
  // Remove file extension
  const nameWithoutExt = fileName.replace(/\.(pdf|txt|doc|docx)$/i, "")

  // Replace underscores and hyphens with spaces
  const cleanName = nameWithoutExt.replace(/[_-]/g, " ")

  // Capitalize each word
  return cleanName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

// Mock function to read file content (in real app, would use FileReader API)
async function readFileContent(file: File): Promise<string> {
  // For demo purposes, generate mock resume content based on filename
  const skills = COMMON_KEYWORDS.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 10) + 5)

  return `
    Resume for ${extractCandidateName(file.name)}
    
    Skills: ${skills.join(", ")}
    
    Experience:
    - Software Engineer at Tech Company (2020-2023)
    - Junior Developer at Startup Inc (2018-2020)
    
    Education:
    - Bachelor's in Computer Science
  `
}

// Main analysis function
export async function analyzeResumes(jobDescription: string, files: File[]): Promise<CandidateResult[]> {
  const jobKeywords = extractKeywords(jobDescription)

  const results: CandidateResult[] = []

  for (const file of files) {
    const resumeContent = await readFileContent(file)
    const resumeKeywords = extractKeywords(resumeContent)
    const matchedKeywords = resumeKeywords.filter((keyword) => jobKeywords.includes(keyword))
    const matchPercentage = calculateMatchPercentage(jobKeywords, resumeKeywords)

    results.push({
      name: extractCandidateName(file.name),
      fileName: file.name,
      matchPercentage,
      matchedKeywords,
    })
  }

  // Sort by match percentage (highest first)
  return results.sort((a, b) => b.matchPercentage - a.matchPercentage)
}
