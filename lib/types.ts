export interface ResumeData {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin: string
    website: string
  }
  summary: string
  experience: Array<{
    id: string
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    degree: string
    institution: string
    location: string
    graduationDate: string
    description: string
  }>
  skills: string[]
  projects: Array<{
    id: string
    title: string
    description: string
    technologies: string
    link: string
  }>
}
