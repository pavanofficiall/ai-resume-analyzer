import { motion, AnimatePresence } from "framer-motion"
import ModernTemplate from "./modern"
import ProfessionalTemplate from "./professional"
import CreativeTemplate from "./creative"
import MinimalTemplate from "./minimal"
import { useState } from "react"

interface ResumeData {
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

// TruncatedText component for handling long descriptions
const TruncatedText = ({ text, maxLength = 150 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  if (text.length <= maxLength || isExpanded) {
    return (
      <div className="whitespace-pre-line">
        {text}
        {text.length > maxLength && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-blue-500 text-sm ml-2 hover:underline"
          >
            Show less
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="whitespace-pre-line">
      {text.substring(0, maxLength)}...
      <button 
        onClick={() => setIsExpanded(true)}
        className="text-blue-500 text-sm ml-2 hover:underline"
      >
        Show more
      </button>
    </div>
  );
};

// Wrapper component that applies consistent styling to all templates
const TemplateWrapper = ({ children, template }: { children: React.ReactNode, template: string }) => {
  return (
    <div className={`
      resume-template 
      w-full 
      max-w-[210mm] 
      mx-auto 
      p-6 
      bg-white 
      shadow-md
      ${template === 'creative' ? 'creative-template-styles' : ''}
      ${template === 'minimal' ? 'minimal-template-styles' : ''}
    `}>
      <style jsx>{`
        .resume-template {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        .experience-description, .education-description, .project-description {
          white-space: pre-line;
          max-width: 100%;
        }
      `}</style>
      {children}
    </div>
  );
};

export function TemplateRenderer({ template, data }: { template: string; data: ResumeData }) {
  const getTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={data} />
      case "professional":
        return <ProfessionalTemplate data={data} />
      case "creative":
        return <CreativeTemplate data={data} />
      case "minimal":
        return <MinimalTemplate data={data} />
      default:
        return <ModernTemplate data={data} />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={template}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <TemplateWrapper template={template}>
          {getTemplate()}
        </TemplateWrapper>
      </motion.div>
    </AnimatePresence>
  )
}