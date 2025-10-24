"use client"

import { useEffect, useState } from "react"
import { SavedResume, getSavedResumes, deleteResume } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Trash2, Calendar, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function ResumesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [resumes, setResumes] = useState<SavedResume[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setResumes(getSavedResumes())
    }
  }, [user])

  // Show loading or redirect while checking authentication
  if (loading || !user) {
    return null
  }

  const handleDelete = (id: string) => {
    deleteResume(id)
    setResumes(getSavedResumes())
  }

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "Unknown date";
    try {
      return `${formatDistanceToNow(timestamp)} ago`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Resumes</h1>
          <Link href="/builder">
            <Button>Create New Resume</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">{resume.name || 'Untitled Resume'}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(resume.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(resume.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Last modified {formatDate(resume.lastModified)}
                  </div>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {resume.template} template
                  </div>
                </div>
                <Link href={`/builder?resumeId=${resume.id}`}>
                  <Button className="w-full mt-4" variant="outline">
                    Edit Resume
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

          {resumes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No resumes yet</h3>
              <p className="text-muted-foreground mt-2">
                Start by creating your first resume
              </p>
              <Link href="/builder">
                <Button className="mt-4">Create Resume</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
