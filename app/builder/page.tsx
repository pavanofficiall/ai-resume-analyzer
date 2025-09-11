"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Save, Download, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Add these imports at the top of the file
import { motion, AnimatePresence } from "framer-motion"
import AnimatedInput from "@/components/animations/animated-input"
import TemplateSwitcher from "@/components/animations/template-switcher"
import AISuggestion from "@/components/animations/ai-suggestion"

import { 
  SavedResume,
  createNewResume,
  getCurrentResume,
  setCurrentResume,
  saveResume,
  getAutoSaveDebounce
} from "@/lib/resumeStorage"
import { toast } from "@/components/ui/use-toast"
import { emptyResumeData } from "@/lib/initialState"

import { templates } from "@/components/templates"
import { TemplateCard } from "@/components/templates/template-card"
import { TemplateRenderer } from "@/components/templates/template-renderer"

import Link from "next/link"
import { useSearchParams } from 'next/navigation'

import { generatePDF } from "@/lib/pdfGenerator";
import { ResumeData } from "@/lib/types";

export default function ResumeBuilder() {
  const searchParams = useSearchParams()
  const resumeId = searchParams.get('resumeId')

  const [activeTemplate, setActiveTemplate] = useState("modern")
  const [previewMode, setPreviewMode] = useState(false)
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData)
  const [aiSuggestions, setAiSuggestions] = useState<
    Array<{
      id: string
      text: string
      field: string
      value: string
    }>
  >([])

  const [currentResume, setCurrentResumeState] = useState<SavedResume>(createNewResume())
  
  // Initialize or load saved resume
  useEffect(() => {
    const currentResume = getCurrentResume();
    if (currentResume && currentResume.data) {
      setCurrentResumeState(currentResume);
      setResumeData(currentResume.data);
      setActiveTemplate(currentResume.templateId);
    } else {
      const newResume = createNewResume();
      setCurrentResumeState(newResume);
      setResumeData(emptyResumeData);
      setActiveTemplate('modern');
      // Save initial state
      saveResume({
        ...newResume,
        data: emptyResumeData
      });
    }
  }, []); // Remove resumeId from dependencies if not needed

  // Auto-save functionality
  const autoSave = getAutoSaveDebounce(() => {
    const updatedResume = {
      ...currentResume,
      lastModified: Date.now(),
      data: resumeData,
      templateId: activeTemplate
    }
    const saved = saveResume(updatedResume);
    setCurrentResumeState(saved);
  });

  // Update auto-save when data changes
  useEffect(() => {
    autoSave()
  }, [resumeData, activeTemplate])

  const handleSaveResume = () => {
    // Validate required fields
    if (!resumeData.personalInfo.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your name before saving",
        variant: "destructive"
      });
      return;
    }

    try {
      const resumeToSave: SavedResume = {
        ...currentResume,
        name: resumeData.personalInfo.name || 'Untitled Resume',
        lastModified: Date.now(),
        data: resumeData,
        templateId: activeTemplate,
        createdAt: currentResume.createdAt || Date.now()
      };
      
      const savedResume = saveResume(resumeToSave);
      setCurrentResumeState(savedResume);
      
      // Show success toast with link
      toast({
        title: "Resume saved successfully!",
        description: (
          <div className="flex flex-col gap-2">
            <p>Your resume has been saved to your collection.</p>
            <Link href="/resumes" className="text-brand-600 hover:underline">
              View all resumes →
            </Link>
          </div>
        ),
        duration: 5000
      });

      // Optional: Show save indicator
      const saveIndicator = document.createElement('div');
      saveIndicator.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg';
      saveIndicator.textContent = 'Saved ✓';
      document.body.appendChild(saveIndicator);
      setTimeout(() => saveIndicator.remove(), 2000);

    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Error saving resume",
        description: "There was a problem saving your resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createNewResumeHandler = () => {
    const newResume = createNewResume();
    setCurrentResumeState(newResume);
    setResumeData(emptyResumeData);
    setActiveTemplate('modern');
    setCurrentResume(newResume); // Set as current resume immediately
    toast({
      title: "New resume created",
      description: "Started a new resume",
      duration: 3000
    });
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('Updating:', name, value); // Add logging to debug
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value,
      },
    }));
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeData({
      ...resumeData,
      summary: e.target.value,
    })
  }

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills: string[] = [...resumeData.skills]
    updatedSkills[index] = value
    setResumeData({
      ...resumeData,
      skills: updatedSkills,
    })
  }

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, ""],
    })
  }

  const removeSkill = (index: number) => {
    const updatedSkills = [...resumeData.skills]
    updatedSkills.splice(index, 1)
    setResumeData({
      ...resumeData,
      skills: updatedSkills,
    })
  }

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExperience],
    })
  }

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((exp) => exp.id !== id),
    })
  }

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      location: "",
      graduationDate: "",
      description: "",
    }
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEducation],
    })
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((edu) => edu.id !== id),
    })
  }

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      title: "",
      description: "",
      technologies: "",
      link: "",
    }
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, newProject],
    })
  }

  const updateProject = (id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    })
  }

  const removeProject = (id: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((proj) => proj.id !== id),
    })
  }

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode)
  }

  const downloadResume = async () => {
    try {
      const fileName = `${resumeData.personalInfo.name || 'resume'}_${new Date().toLocaleDateString()}.pdf`;
      await generatePDF('resume-preview', fileName);
      
      toast({
        title: "Resume Downloaded!",
        description: "Your resume has been downloaded as a PDF.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Add this function to handle applying AI suggestions
  const applyAiSuggestion = (id: string) => {
    const suggestion = aiSuggestions.find((s) => s.id === id)
    if (!suggestion) return

    if (suggestion.field === "experience" && resumeData.experience.length > 0) {
      updateExperience(resumeData.experience[0].id, "description", suggestion.value)
    }

    setAiSuggestions(aiSuggestions.filter((s) => s.id !== id))
  }

  // Add this function to dismiss AI suggestions
  const dismissAiSuggestion = (id: string) => {
    setAiSuggestions(aiSuggestions.filter((s) => s.id !== id))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-10 px-4 bg-gray-50 dark:bg-black">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Resume Builder</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={togglePreviewMode}>
                {previewMode ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="border-brand-600 text-brand-600 hover:bg-brand-50"
                onClick={handleSaveResume}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button 
                variant="outline"
                onClick={createNewResumeHandler}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Resume
              </Button>
              <Button 
                className="bg-brand-600 hover:bg-brand-700" 
                onClick={downloadResume}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Section */}
            {!previewMode && (
              <div className="space-y-6">
                <Card className="border border-white rounded-lg shadow-md">
                  <CardContent className="pt-6">
                    <Tabs defaultValue="personal">
                      <TabsList className="grid grid-cols-6 mb-6">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="experience">Experience</TabsTrigger>
                        <TabsTrigger value="education">Education</TabsTrigger>
                        <TabsTrigger value="skills">Skills</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                        <TabsTrigger value="template">Template</TabsTrigger>
                      </TabsList>

                      {/* Replace the personal info tab content with our animated version */}
                      <TabsContent value="personal" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AnimatedInput
                            id="name"
                            label="Full Name"
                            value={resumeData.personalInfo.name || ''}
                            onChange={(e) => handlePersonalInfoChange(e)}
                            name="name"
                            placeholder="Enter your full name"
                          />
                          <AnimatedInput
                            id="email"
                            label="Email"
                            type="email"
                            value={resumeData.personalInfo.email || ''}
                            onChange={(e) => handlePersonalInfoChange(e)}
                            name="email"
                            placeholder="Enter your email"
                          />
                          <AnimatedInput
                            id="phone"
                            label="Phone"
                            value={resumeData.personalInfo.phone}
                            onChange={handlePersonalInfoChange}
                            name="phone"
                          />
                          <AnimatedInput
                            id="location"
                            label="Location"
                            value={resumeData.personalInfo.location}
                            onChange={handlePersonalInfoChange}
                            name="location"
                          />
                          <AnimatedInput
                            id="linkedin"
                            label="LinkedIn"
                            value={resumeData.personalInfo.linkedin}
                            onChange={handlePersonalInfoChange}
                            name="linkedin"
                          />
                          <AnimatedInput
                            id="website"
                            label="Website"
                            value={resumeData.personalInfo.website}
                            onChange={handlePersonalInfoChange}
                            name="website"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="summary">Professional Summary</Label>
                          <motion.div
                            whileFocus={{
                              scale: 1.01,
                              boxShadow: "0 0 0 2px rgba(80, 200, 190, 0.3), 0 0 10px rgba(80, 200, 190, 0.2)",
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <Textarea id="summary" value={resumeData.summary} onChange={handleSummaryChange} rows={4} />
                          </motion.div>
                        </div>
                      </TabsContent>

                      {/* Add AI suggestions to the experience tab */}
                      <TabsContent value="experience">
                        <div className="space-y-6">
                          {aiSuggestions.map(
                            (suggestion) =>
                              suggestion.field === "experience" && (
                                <AISuggestion
                                  key={suggestion.id}
                                  suggestion={suggestion.text}
                                  onApply={() => applyAiSuggestion(suggestion.id)}
                                  onDismiss={() => dismissAiSuggestion(suggestion.id)}
                                />
                              ),
                          )}

                          {/* Keep the existing experience form */}
                          <AnimatePresence>
                            {resumeData.experience.map((exp) => (
                              <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                                transition={{ duration: 0.3 }}
                                className="p-4 border rounded-lg space-y-4"
                              >
                                <div className="flex justify-between items-center">
                                  <h3 className="text-lg font-medium">{exp.title || "New Position"}</h3>
                                  <motion.button
                                    whileHover={{ scale: 1.1, color: "#ef4444" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeExperience(exp.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </motion.button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <AnimatedInput
                                    id={`exp-title-${exp.id}`}
                                    name={`exp-title-${exp.id}`}
                                    label="Job Title"
                                    value={exp.title}
                                    onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                                  />
                                  <AnimatedInput
                                    id={`exp-company-${exp.id}`}
                                    name={`exp-company-${exp.id}`}
                                    label="Company"
                                    value={exp.company}
                                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                                  />
                                  <AnimatedInput
                                    id={`exp-location-${exp.id}`}
                                    name={`exp-location-${exp.id}`}
                                    label="Location"
                                    value={exp.location}
                                    onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                                  />
                                  <AnimatedInput
                                    id={`exp-start-${exp.id}`}
                                    name={`exp-start-${exp.id}`}
                                    label="Start Date"
                                    type="month"
                                    value={exp.startDate}
                                    onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                                  />
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`exp-current-${exp.id}`}
                                        checked={exp.current}
                                        onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                                        className="rounded border-gray-300"
                                      />
                                      <Label htmlFor={`exp-current-${exp.id}`}>Current Position</Label>
                                    </div>
                                  </div>
                                  {!exp.current && (
                                    <AnimatedInput
                                      id={`exp-end-${exp.id}`}
                                      name={`exp-end-${exp.id}`}
                                      label="End Date"
                                      type="month"
                                      value={exp.endDate}
                                      onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                                    />
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`exp-desc-${exp.id}`}>Description</Label>
                                  <motion.div
                                    whileFocus={{
                                      scale: 1.01,
                                      boxShadow: "0 0 0 2px rgba(80, 200, 190, 0.3), 0 0 10px rgba(80, 200, 190, 0.2)",
                                    }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Textarea
                                      id={`exp-desc-${exp.id}`}
                                      value={exp.description}
                                      onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                                      rows={3}
                                      placeholder="Describe your responsibilities and achievements"
                                    />
                                  </motion.div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "#f0f9f8" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            onClick={addExperience}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Experience
                          </motion.button>
                        </div>
                      </TabsContent>

                      <TabsContent value="education">
                        <div className="space-y-6">
                          {resumeData.education.map((edu) => (
                            <div key={edu.id} className="p-4 border rounded-lg space-y-4">
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">{edu.degree || "New Education"}</h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEducation(edu.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`edu-degree-${edu.id}`}>Degree</Label>
                                  <Input
                                    id={`edu-degree-${edu.id}`}
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`edu-institution-${edu.id}`}>Institution</Label>
                                  <Input
                                    id={`edu-institution-${edu.id}`}
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`edu-location-${edu.id}`}>Location</Label>
                                  <Input
                                    id={`edu-location-${edu.id}`}
                                    value={edu.location}
                                    onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`edu-date-${edu.id}`}>Graduation Date</Label>
                                  <Input
                                    id={`edu-date-${edu.id}`}
                                    type="month"
                                    value={edu.graduationDate}
                                    onChange={(e) => updateEducation(edu.id, "graduationDate", e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`edu-desc-${edu.id}`}>Description</Label>
                                <Textarea
                                  id={`edu-desc-${edu.id}`}
                                  value={edu.description}
                                  onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                                  rows={2}
                                  placeholder="GPA, honors, relevant coursework, etc."
                                />
                              </div>
                            </div>
                          ))}

                          <Button variant="outline" className="w-full" onClick={addEducation}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Education
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="skills">
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-1 bg-[#1E293B] rounded-full px-3 py-1"
                              >
                                <Input
                                  value={skill}
                                  onChange={(e) => handleSkillChange(index, e.target.value)}
                                  className="border-0 bg-transparent p-0 h-auto w-auto focus:ring-0 focus-visible:ring-0"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSkill(index)}
                                  className="h-5 w-5 p-0 text-gray-500 hover:text-red-500 hover:bg-transparent"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          <Button variant="outline" onClick={addSkill}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Skill
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="projects">
                        <div className="space-y-6">
                          {resumeData.projects.map((project) => (
                            <div key={project.id} className="p-4 border rounded-lg space-y-4">
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">{project.title || "New Project"}</h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeProject(project.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`proj-title-${project.id}`}>Project Title</Label>
                                  <Input
                                    id={`proj-title-${project.id}`}
                                    value={project.title}
                                    onChange={(e) => updateProject(project.id, "title", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`proj-link-${project.id}`}>Project Link</Label>
                                  <Input
                                    id={`proj-link-${project.id}`}
                                    value={project.link}
                                    onChange={(e) => updateProject(project.id, "link", e.target.value)}
                                    placeholder="GitHub, website, etc."
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`proj-tech-${project.id}`}>Technologies Used</Label>
                                <Input
                                  id={`proj-tech-${project.id}`}
                                  value={project.technologies}
                                  onChange={(e) => updateProject(project.id, "technologies", e.target.value)}
                                  placeholder="React, Node.js, MongoDB, etc."
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`proj-desc-${project.id}`}>Description</Label>
                                <Textarea
                                  id={`proj-desc-${project.id}`}
                                  value={project.description}
                                  onChange={(e) => updateProject(project.id, "description", e.target.value)}
                                  rows={3}
                                  placeholder="Describe the project, your role, and achievements"
                                />
                              </div>
                            </div>
                          ))}

                          <Button variant="outline" className="w-full" onClick={addProject}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Project
                          </Button>
                        </div>
                      </TabsContent>

                      {/* Replace the template selection tab content with our animated version */}
                      <TabsContent value="template">
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {templates.map((template) => (
                              <TemplateCard
                                key={template.id}
                                {...template}
                                isActive={activeTemplate === template.id}
                                onClick={() => setActiveTemplate(template.id)}
                              />
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Preview Section */}
            <div className={previewMode ? "col-span-2" : ""}>
              <Card className="bg-white shadow-md">
                <CardContent className="p-8">
                  <div id="resume-preview">
                    <TemplateRenderer template={activeTemplate} data={resumeData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      
      </main>

      <Footer />
    </div>
  )
}
