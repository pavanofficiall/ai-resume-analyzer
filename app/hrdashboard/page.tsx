"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HRDashboard() {
  const { user, loading, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
      } else if (role !== 'hr') {
        router.push('/analyzer')
      }
    }
  }, [user, loading, role, router])

  // Show loading or redirect while checking authentication
  if (loading || !user || role !== 'hr') {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">HR Dashboard</h1>
          <p className="text-lg text-muted-foreground">Coming soon...</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
