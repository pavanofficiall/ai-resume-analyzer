"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, FileText, History } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { logOut } from "@/lib/firebase"
import { ProfileDropdown } from "@/components/ui/profile-dropdown"
import { AuthModal } from "@/components/auth-modal"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authModal, setAuthModal] = useState<"signin" | "signup" | null>(null)
  const { user, role } = useAuth()

  const handleAuth = async () => {
    try {
      if (user) {
        await logOut()
      } else {
        setAuthModal("signin")
      }
    } catch (error) {
      console.error("Authentication error:", error)
    }
  }

  const closeAuthModal = () => {
    setAuthModal(null)
  }

  const authContent = user ? (
    <ProfileDropdown user={user} />
  ) : (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        onClick={() => setAuthModal("signin")}
        className="text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400"
      >
        Sign In
      </Button>
      <Button
        onClick={() => setAuthModal("signup")}
        className="bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors"
      >
        Sign Up
      </Button>
    </div>
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
              {role === "hr" ? (
                <Link
                  href="/hrdashboard"
                  className="text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  HR Dashboard
                </Link>
              ) : role === "student" ? (
                <>
                  <Link
                    href="/analyzer"
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
                </>
              ) : null}
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
              {role === "hr" ? (
                <Link
                  href="/hrdashboard"
                  className="block text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  HR Dashboard
                </Link>
              ) : role === "student" ? (
                <>
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
                </>
              ) : null}
              <div className="pt-4 border-t border-border flex flex-col space-y-4">
                {user && <span className="text-muted-foreground">{user.email}</span>}
                {user ? (
                  <ProfileDropdown user={user} />
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAuthModal("signin")
                        setIsMenuOpen(false)
                      }}
                      className="justify-start text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        setAuthModal("signup")
                        setIsMenuOpen(false)
                      }}
                      className="justify-start bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-500 dark:hover:bg-brand-600"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModal !== null}
        onClose={closeAuthModal}
        mode={authModal || "signin"}
      />
    </>
  )
}
