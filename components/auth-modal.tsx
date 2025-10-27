"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, Chrome } from "lucide-react"
import { motion } from "framer-motion"
import { emailSignIn, emailSignUp, googleSignIn } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "signin" | "signup"
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"student" | "hr">("student")
  const { user } = useAuth()
  const router = useRouter()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    if (mode === "signup" && password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    if (mode === "signup" && !role) {
      toast.error("Please select a role")
      return
    }

    setIsLoading(true)
    try {
      if (mode === "signin") {
        await emailSignIn(email, password)
        toast.success("Signed in successfully!")
      } else {
        console.log("Signing up with role:", role);
        await emailSignUp(email, password, role)
        toast.success("Account created successfully!")
      }
      
      // Redirect based on role after successful authentication
      if (mode === "signup") {
        // For signup, redirect based on selected role
        const redirectPath = role === "hr" ? "/hrdashboard" : "/ai-analyzer";
        console.log("Signup redirect:", role, "->", redirectPath);
        onClose(); // Close modal first
        setTimeout(() => router.push(redirectPath), 100); // Then redirect
      } else {
        onClose(); // For signin, just close modal
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      await googleSignIn()
      toast.success("Signed in with Google successfully!")
      
      // Redirect to default student page for Google sign-ins
      console.log("Google auth redirect to /ai-analyzer");
      router.push("/ai-analyzer")
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Google authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setRole("student")
    setShowPassword(false)
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
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "signin"
              ? "Sign in to your account to continue"
              : "Create a new account to get started"
            }
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={(value: "student" | "hr") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="hr">HR Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full"
          >
            <Chrome className="mr-2 h-4 w-4" />
            {mode === "signin" ? "Sign in" : "Sign up"} with Google
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}