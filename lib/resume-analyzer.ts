import type { CandidateResult } from "@/types/candidate"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { pdfjs } from 'react-pdf'

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs'

// Multiple API keys for load balancing and redundancy
const API_KEYS = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_1 || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_3,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_4,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_5,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_6,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_7,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_8,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_9,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_10,
].filter(Boolean) // Remove undefined keys

// API key health tracking
interface ApiKeyHealth {
  key: string
  failures: number
  lastUsed: number
  isHealthy: boolean
}

const apiKeyHealth: Map<string, ApiKeyHealth> = new Map()

// Initialize health tracking for all keys
API_KEYS.forEach(key => {
  if (key) { // Ensure key is not undefined
    apiKeyHealth.set(key, {
      key,
      failures: 0,
      lastUsed: 0,
      isHealthy: true
    })
  }
})

// Get next healthy API key with round-robin load balancing
function getNextApiKey(): string {
  const healthyKeys = Array.from(apiKeyHealth.values())
    .filter(health => health.isHealthy)
    .sort((a, b) => a.lastUsed - b.lastUsed) // Use least recently used first

  if (healthyKeys.length === 0) {
    // If no healthy keys, try all keys (circuit breaker recovery)
    const allKeys = Array.from(apiKeyHealth.values())
      .filter(health => Date.now() - health.lastUsed > 60000) // Try again after 1 minute
      .sort((a, b) => a.failures - b.failures) // Use least failed first

    if (allKeys.length > 0) {
      allKeys[0].isHealthy = true // Reset health
      allKeys[0].failures = Math.max(0, allKeys[0].failures - 1) // Reduce failure count
      return allKeys[0].key
    }

    throw new Error('All API keys are currently unhealthy. Please check your API keys and try again later.')
  }

  const selectedKey = healthyKeys[0]
  selectedKey.lastUsed = Date.now()
  return selectedKey.key
}

// Mark API key as failed
function markApiKeyFailed(key: string) {
  const health = apiKeyHealth.get(key)
  if (health) {
    health.failures++
    if (health.failures >= 3) { // Circuit breaker: 3 failures = unhealthy
      health.isHealthy = false
    }
  }
}

// Mark API key as successful
function markApiKeySuccessful(key: string) {
  const health = apiKeyHealth.get(key)
  if (health) {
    health.failures = Math.max(0, health.failures - 1) // Reduce failure count on success
    health.isHealthy = true
  }
}

// Create Gemini model instance with load balancing
function createGeminiModel(modelName: string = "gemini-2.5-flash") {
  const apiKey = getNextApiKey()
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })

  // Store the key used for this model instance
  ;(model as any)._apiKey = apiKey

  return model
}

// Get API key from model instance
function getApiKeyFromModel(model: any): string {
  return model._apiKey || getCurrentApiKey()
}
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const typedArray = new Uint8Array(arrayBuffer)

    const loadingTask = pdfjs.getDocument({
      data: typedArray,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/',
      cMapPacked: true,
      disableFontFace: true, // Speed optimization
      disableRange: true,    // Speed optimization
      disableStream: true,   // Speed optimization
    })

    const pdf = await loadingTask.promise
    let fullText = ''

    // Limit to first 3 pages for speed (most resumes are 1-2 pages)
    const maxPages = Math.min(pdf.numPages, 3)

    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim()

        if (pageText) {
          fullText += pageText + '\n\n'
        }
      } catch (pageError) {
        console.error(`Error extracting text from page ${i}:`, pageError)
      }
    }

    const cleanedText = fullText.trim()
    if (!cleanedText) {
      throw new Error('No readable text found in PDF')
    }

    // Limit text length for faster processing and memory efficiency
    return cleanedText.substring(0, 4000)
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to read PDF content')
  }
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

// Analyze single resume against job description using AI (optimized for speed)
async function analyzeSingleResume(resumeContent: string, jobDescription: string, signal?: AbortSignal): Promise<{
  matchPercentage: number
  matchedKeywords: string[] 
  strengths: string[]
  weaknesses: string[]
  summary: string
}> {
  try {
    // Check if analysis was cancelled
    if (signal?.aborted) {
      throw new Error('Analysis cancelled')
    }

    // Use Gemini 2.5 Flash for optimal balance of quality and speed (10 RPM, 250K TPM)
    const model = createGeminiModel("gemini-2.5-flash")

    const prompt = `Analyze resume vs job. Return ONLY JSON:
{
  "matchPercentage": 85,
  "matchedKeywords": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "summary": "2-sentence summary"
}

Resume: ${resumeContent.substring(0, 2500)}
Job: ${jobDescription}

Focus: skills, experience, culture fit.`

    // Check cancellation before API call
    if (signal?.aborted) {
      throw new Error('Analysis cancelled')
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Mark API key as successful
    markApiKeySuccessful(getApiKeyFromModel(model))

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid AI response format')
    }

    const parsedResult = JSON.parse(jsonMatch[0])

    // Validate the response structure
    if (typeof parsedResult.matchPercentage !== 'number' ||
        !Array.isArray(parsedResult.matchedKeywords) ||
        !Array.isArray(parsedResult.strengths) ||
        !Array.isArray(parsedResult.weaknesses) ||
        typeof parsedResult.summary !== 'string') {
      throw new Error('Invalid response structure')
    }

    return parsedResult
  } catch (error) {
    if (error instanceof Error && error.message === 'Analysis cancelled') {
      throw error
    }

    // Mark current API key as failed for load balancing
    try {
      // We need to get the key that was used - this is a simplified approach
      const lastUsedKey = Array.from(apiKeyHealth.values())
        .filter(health => health.isHealthy)
        .sort((a, b) => b.lastUsed - a.lastUsed)[0]?.key

      if (lastUsedKey) {
        markApiKeyFailed(lastUsedKey)
      }
    } catch (e) {
      // Ignore errors when marking key as failed
    }

    console.error('AI analysis failed:', error)
    // Faster fallback analysis
    const jobKeywords = getJobKeywords(jobDescription)
    const resumeKeywords = extractKeywords(resumeContent)
    const matchedKeywords = resumeKeywords.filter((keyword: string) => jobKeywords.includes(keyword))
    const matchPercentage = jobKeywords.length > 0 ? Math.round((matchedKeywords.length / jobKeywords.length) * 100) : 0

    return {
      matchPercentage,
      matchedKeywords: matchedKeywords.slice(0, 5), // Limit keywords
      strengths: ["Resume processed successfully"],
      weaknesses: ["Limited analysis available"],
      summary: `Candidate matches ${matchPercentage}% of job requirements based on keyword analysis.`
    }
  }
}// Get current API key (for tracking purposes)
function getCurrentApiKey(): string {
  // This is a simplified version - in practice you'd track which key was used for each request
  return API_KEYS[0] || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
}

// Simple cache for job description analysis
const jobCache = new Map<string, string[]>()

// Get cached job keywords or extract new ones
function getJobKeywords(jobDescription: string): string[] {
  const cacheKey = jobDescription.toLowerCase().trim()
  if (jobCache.has(cacheKey)) {
    return jobCache.get(cacheKey)!
  }

  const keywords = extractKeywords(jobDescription)
  jobCache.set(cacheKey, keywords)

  // Limit cache size to prevent memory issues
  if (jobCache.size > 10) {
    const firstKey = jobCache.keys().next().value
    if (firstKey) {
      jobCache.delete(firstKey)
    }
  }

  return keywords
}

// Extract keywords from text (fallback function)
function extractKeywords(text: string): string[] {
  const COMMON_KEYWORDS = [
    "javascript", "typescript", "react", "node", "python", "java", "sql", "aws",
    "docker", "kubernetes", "agile", "scrum", "leadership", "management",
    "communication", "problem solving", "team player", "git", "api", "rest",
    "graphql", "mongodb", "postgresql", "ci/cd", "testing", "tdd",
    "microservices", "cloud", "devops", "frontend", "backend", "full stack",
    "mobile", "ios", "android", "machine learning", "ai", "data analysis",
    "analytics", "excel", "powerpoint", "project management"
  ]

  const lowerText = text.toLowerCase()
  return COMMON_KEYWORDS.filter((keyword) => lowerText.includes(keyword.toLowerCase()))
}

// Main analysis function for HR dashboard
export async function analyzeResumes(jobDescription: string, files: File[]): Promise<CandidateResult[]> {
  const results: CandidateResult[] = []

  // Process files in parallel for better performance
  const analysisPromises = files.map(async (file) => {
    try {
      let resumeContent = ''

      if (file.type === 'application/pdf') {
        resumeContent = await extractTextFromPDF(file)
      } else {
        resumeContent = await file.text()
      }

      if (!resumeContent.trim()) {
        throw new Error('No readable content found in the file')
      }

      const analysis = await analyzeSingleResume(resumeContent, jobDescription)

      return {
        name: extractCandidateName(file.name),
        fileName: file.name,
        matchPercentage: analysis.matchPercentage,
        matchedKeywords: analysis.matchedKeywords,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        summary: analysis.summary
      }
    } catch (error) {
      console.error(`Error analyzing ${file.name}:`, error)
      // Return basic result if analysis fails
      return {
        name: extractCandidateName(file.name),
        fileName: file.name,
        matchPercentage: 0,
        matchedKeywords: [],
        strengths: [],
        weaknesses: ['Failed to analyze resume - please check file format'],
        summary: 'Analysis failed'
      }
    }
  })

  // Wait for all analyses to complete
  const analysisResults = await Promise.all(analysisPromises)

  // Sort by match percentage (highest first)
  return analysisResults.sort((a, b) => b.matchPercentage - a.matchPercentage)
}

// Export single resume analysis for real-time processing
export async function analyzeSingleResumeFile(jobDescription: string, file: File, signal?: AbortSignal): Promise<CandidateResult> {
  try {
    let resumeContent = ''

    if (file.type === 'application/pdf') {
      resumeContent = await extractTextFromPDF(file)
    } else {
      resumeContent = await file.text()
    }

    if (!resumeContent.trim()) {
      throw new Error('No readable content found in the file')
    }

    const analysis = await analyzeSingleResume(resumeContent, jobDescription, signal)

    return {
      name: extractCandidateName(file.name),
      fileName: file.name,
      matchPercentage: analysis.matchPercentage,
      matchedKeywords: analysis.matchedKeywords,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      summary: analysis.summary
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Analysis cancelled') {
      throw error
    }

    console.error(`Error analyzing ${file.name}:`, error)
    return {
      name: extractCandidateName(file.name),
      fileName: file.name,
      matchPercentage: 0,
      matchedKeywords: [],
      strengths: [],
      weaknesses: ['Failed to analyze resume - please check file format'],
      summary: 'Analysis failed'
    }
  }
}
