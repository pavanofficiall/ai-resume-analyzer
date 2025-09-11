"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, FileText, History } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { googleSignIn, logOut } from "@/lib/firebase"
import { ProfileDropdown } from "@/components/ui/profile-dropdown"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()

  const handleAuth = async () => {
    try {
      if (user) {
        await logOut()
      } else {
        await googleSignIn()
      }
    } catch (error) {
      console.error("Authentication error:", error)
    }
  }

  const authContent = user ? (
    <ProfileDropdown user={user} />
  ) : (
    <Button
      onClick={handleAuth}
      className="bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors"
    >
      Sign in with Google
    </Button>
  )

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-50 transition-theme">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                  <FileText className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                </motion.div>
                <span className="ml-2 text-xl font-bold text-foreground">ResumeAI</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Home
              </Link>
              
              <Link
                href="/ai-analyzer"
                className="text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Resume Analyzer
              </Link>
              <Link
                href="/builder"
                className="text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Resume Builder
              </Link>
              <Link
                href="/history"
                className="text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                History
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {authContent}
              <ThemeToggle />
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:text-brand-600 dark:hover:text-brand-400 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-b border-border transition-theme">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                href="/"
                className="block text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link
                href="/analyzer"
                className="block text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Resume Analyzer
              </Link>
              <Link
                href="/builder"
                className="block text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Resume Builder
              </Link>
              <Link
                href="/history"
                className="block text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  History
                </div>
              </Link>
              <div className="pt-4 border-t border-border flex flex-col space-y-4">
                {user && <span className="text-muted-foreground">{user.email}</span>}
                {authContent}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
