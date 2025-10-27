"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chrome, Users, Briefcase } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "signin" | "signup"
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<"student" | "hr">("student")
  const [step, setStep] = useState<"role" | "signin">("role")
  const { user, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleRoleSelection = () => {
    setStep("signin")
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle(role)

      toast.success("Signed in with Google successfully!")

      // Redirect based on selected role
      const redirectPath = role === "hr" ? "/hrdashboard" : "/ai-analyzer"
      console.log("Google auth redirect:", role, "->", redirectPath)

      onClose()
      setTimeout(() => router.push(redirectPath), 100)
    } catch (error: any) {
      toast.error(error.message || "Google authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setRole("student")
    setStep("role")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {step === "role" ? "Choose Your Role" : "Sign In"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "role"
              ? "Select how you'll be using Resumind"
              : "Continue with Google to access your account"
            }
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {step === "role" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={(value: "student" | "hr") => setRole(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student" className="py-3">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Job Seeker</div>
                          <div className="text-sm text-muted-foreground">Build and optimize your resume</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="hr" className="py-3">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">HR Professional</div>
                          <div className="text-sm text-muted-foreground">Analyze and evaluate candidates</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleRoleSelection} className="w-full">
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {role === "student" ? (
                    <Users className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Briefcase className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-medium">
                    {role === "student" ? "Job Seeker" : "HR Professional"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {role === "student"
                    ? "Access resume building and analysis tools"
                    : "Access candidate evaluation and HR dashboard"
                  }
                </p>
              </div>

              <Button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
              >
                <Chrome className="mr-2 h-5 w-5" />
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("role")}
                className="w-full text-sm"
              >
                ← Change role
              </Button>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}