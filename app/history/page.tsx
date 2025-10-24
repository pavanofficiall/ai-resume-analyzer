"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResumeHistory, getHistory, deleteAnalysis } from "@/lib/historyStorage"
import { FileText, Trash2, Clock, BarChart } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<ResumeHistory[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setHistory(getHistory())
    }
  }, [user])

  // Show loading or redirect while checking authentication
  if (loading || !user) {
    return null
  }

  const handleDelete = (id: string) => {
    deleteAnalysis(id)
    setHistory(getHistory())
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analysis History</h1>
          <p className="text-muted-foreground">Your past resume analyses</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.fileName}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm">
                    <FileText className="mr-2 h-4 w-4" />
                    {item.jobTitle}
                  </div>
                  <div className="flex items-center text-sm">
                    <BarChart className="mr-2 h-4 w-4" />
                    ATS Score: {item.atsScore}
                  </div>
                  <Link href={`/history/${item.id}`}>
                    <Button className="w-full mt-4">
                      View Analysis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {history.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No analyses yet</h3>
            <p className="mt-2 text-muted-foreground">
              Your resume analysis history will appear here
            </p>
            <Link href="/ai-analyzer">
              <Button className="mt-4">
                Analyze a Resume
              </Button>
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
