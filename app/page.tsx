"use client"

import { ArrowRight, FileText, Award, Zap, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import FeatureCard from "@/components/feature-card"
import TestimonialCard from "@/components/testimonial-card"

// Add these imports at the top of the file
import { motion } from "framer-motion"
import TypingEffect from "@/components/animations/typing-effect"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { user, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && role) {
      // Redirect authenticated users to their respective dashboards
      if (role === "student") {
        router.push("/analyzer")
      } else if (role === "hr") {
        router.push("/hrdashboard")
      }
    }
  }, [user, role, router])

  // Don't render anything for authenticated users while redirecting
  if (user && role) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-brand-50 to-white dark:from-navy-900 dark:to-navy-950 py-20 px-4 transition-theme">
          <div className="container mx-auto ">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Build & Analyze Your Resume with <span className="text-brand-600 dark:text-brand-400">AI</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Leverage the power of AI to improve your resume with personalized feedback, ATS optimization, and
                  professional templates to land your dream job.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/builder">
                    <Button
                      size="lg"
                      className="bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors"
                    >
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/analyzer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-brand-600 text-brand-600 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-navy-800 transition-colors"
                    >
                      Upload Resume
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Replace the hero section image div with this animated version */}
              <div className="md:w-1/2">
                <div className="relative">
                      <div className="">
                        <img
                          src="https://i.postimg.cc/W34GrxtL/Screenshot-2025-04-12-at-8-09-42-AM.png"
                          alt="Resume Builder Preview"
                          className="w-[37rem] h-[32rem] rounded-2xl border-2 border-brand-200 shadow-lg transition-transform transform hover:scale-105"
                        />
                      </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-background transition-theme">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Powerful Features to Boost Your Career
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our AI-powered tools help you create professional resumes that stand out and pass through Applicant
                Tracking Systems.
              </p>
            </div>

            {/* Add animations to the feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <FileText className="h-10 w-10 text-brand-500" />,
                  title: "AI Analysis",
                  description: "Get instant feedback on your resume with our advanced AI analysis.",
                },
                {
                  icon: <Award className="h-10 w-10 text-brand-500" />,
                  title: "ATS Optimization",
                  description:
                    "Ensure your resume passes through Applicant Tracking Systems with our optimization tools.",
                },
                {
                  icon: <Zap className="h-10 w-10 text-brand-500" />,
                  title: "Professional Templates",
                  description: "Choose from dozens of professionally designed templates for any industry.",
                },
                {
                  icon: <CheckCircle className="h-10 w-10 text-brand-500" />,
                  title: "Smart Suggestions",
                  description: "Receive tailored suggestions to improve your resume's content and structure.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-secondary/50 dark:bg-secondary/20 transition-theme">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Three simple steps to create and optimize your professional resume
              </p>
            </div>

            {/* Add animations to the "How It Works" section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-card p-8 rounded-lg shadow-md text-center"
                >
                  <motion.div
                    className="w-16 h-16 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center mx-auto mb-6"
                    whileHover={{ scale: 1.1, backgroundColor: "#bae6fd" }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">{step}</span>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {["Upload or Create", "AI Analysis", "Optimize & Download"][index]}
                  </h3>
                  <p className="text-muted-foreground">
                    {
                      [
                        "Upload your existing resume or create a new one from scratch using our builder.",
                        "Our AI analyzes your resume and provides detailed feedback and suggestions.",
                        "Apply the suggestions, choose a template, and download your optimized resume.",
                      ][index]
                    }
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-background transition-theme">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Success Stories</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                See how our platform has helped job seekers land their dream positions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="The AI feedback helped me identify key skills I was missing. I updated my resume and got three interviews in a week!"
                author="Sarah Johnson"
                role="Marketing Manager"
                image="/placeholder.svg?height=100&width=100"
              />
              <TestimonialCard
                quote="I was struggling to get past ATS systems. This tool showed me exactly what I needed to fix, and I finally got callbacks!"
                author="Michael Chen"
                role="Software Engineer"
                image="/placeholder.svg?height=100&width=100"
              />
              <TestimonialCard
                quote="The templates are professional and modern. I received compliments on my resume design during interviews."
                author="Emily Rodriguez"
                role="UX Designer"
                image="/placeholder.svg?height=100&width=100"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 mt-10 bg-brand-600 dark:bg-brand-700 text-white transition-theme">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Supercharge Your Job Search?</h2>
            <div className="max-w-3xl mx-auto mb-8">
              <TypingEffect
                text="Join thousands of job seekers who have improved their resumes and landed their dream jobs."
                className="text-xl"
                speed={30}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/builder">
                <Button size="lg" className="border border-white bg-transparent  text-white hover:bg-brand-600 transition-colors">
                  Get Started Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-brand-600 bg-white hover:text-white hover:bg-brand-700 transition-colors"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
