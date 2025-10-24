"use client"

import { useAuth } from "@/contexts/auth-context"
import dynamic from "next/dynamic"
import { Suspense, useEffect, useState } from "react"
import { Loading } from "@/components/ui/loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, History, Settings, User } from "lucide-react"
import { setUserDisplayName, getUserDisplayName } from "@/lib/localStorage"
import { useRouter } from "next/navigation"

// Dynamic imports to prevent hydration issues
const Card = dynamic(() => import("@/components/ui/card").then(mod => mod.Card))
const CardContent = dynamic(() => import("@/components/ui/card").then(mod => mod.CardContent))
const CardHeader = dynamic(() => import("@/components/ui/card").then(mod => mod.CardHeader))
const CardTitle = dynamic(() => import("@/components/ui/card").then(mod => mod.CardTitle))
const Tabs = dynamic(() => import("@/components/ui/tabs").then(mod => mod.Tabs))
const TabsContent = dynamic(() => import("@/components/ui/tabs").then(mod => mod.TabsContent))
const TabsList = dynamic(() => import("@/components/ui/tabs").then(mod => mod.TabsList))
const TabsTrigger = dynamic(() => import("@/components/ui/tabs").then(mod => mod.TabsTrigger))

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Show loading or redirect while checking authentication
  if (loading || !user) {
    return null
  }

  useEffect(() => {
    // Initialize display name from local storage or user profile
    const storedName = getUserDisplayName()
    setDisplayName(storedName || user?.displayName || "User")
  }, [user])

  const handleSave = () => {
    setUserDisplayName(displayName)
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold">Please sign in to view your profile</h1>
      </div>
    )
  }

  return (
    <Suspense fallback={<Loading />}>
        <Navbar />
      <div className="container mx-auto py-8 px-4 relative">
        
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="border-brand-200 dark:border-brand-800">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-brand-100 dark:border-brand-800">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback className="bg-brand-50 dark:bg-brand-900 text-xl">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">{displayName}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" /> 5 Resumes Created
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <History className="h-4 w-4" /> Member since {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-background border-b border-border h-auto p-0 w-full justify-start">
              <TabsTrigger value="overview" className="gap-2 px-4 py-2">
                <User className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="resumes" className="gap-2 px-4 py-2">
                <FileText className="h-4 w-4" /> Resumes
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 px-4 py-2">
                <Settings className="h-4 w-4" /> Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Profile Information</CardTitle>
                    <Button variant="ghost" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
                      {isEditing ? "Save" : "Edit"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Display Name</label>
                      {isEditing ? (
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter your display name"
                        />
                      ) : (
                        <p className="text-muted-foreground">{displayName}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
            </TabsContent>

            <TabsContent value="resumes" className="space-y-6">
              {/* Resume content */}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Settings content */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Suspense>
  )
}
