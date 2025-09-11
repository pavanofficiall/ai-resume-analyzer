"use client"

import { ModeToggle } from "./mode-toggle"
import { Button } from "@/components/ui/button"
import { User, LogIn, Menu, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 849)
    }

    // Check immediately on mount
    checkScreenSize()

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", checkScreenSize)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && event.target && !(event.target as HTMLElement).closest('.mobile-menu-container')) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
        }`}
      >
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">R</span>
              <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary-foreground rounded-full flex items-center justify-center">
                <span className="text-[8px] text-primary font-bold">AI</span>
              </div>
            </div>
            <span className="font-bold text-lg">ResumeAI</span>
          </div>

          {/* Desktop Navigation - hidden when isMobileView is true */}
          {!isMobileView && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Support
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-2">
            <ModeToggle />
            {!isMobileView && (
              <>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Button>
                <Button size="sm" className="hidden md:flex">
                  <User className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </>
            )}
            
            {/* Mobile Menu Button - shown when isMobileView is true */}
            {isMobileView && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && isMobileView && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu-container absolute right-0 top-16 w-full max-w-xs bg-background shadow-lg border-l transition-all duration-200">
            <div className="flex flex-col p-4 space-y-4">
              <Link 
                href="#" 
                className="text-sm font-medium hover:text-primary p-2 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#" 
                className="text-sm font-medium hover:text-primary p-2 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="#" 
                className="text-sm font-medium hover:text-primary p-2 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full mb-2">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Button>
                <Button className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}