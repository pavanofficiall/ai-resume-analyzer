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

export default function Home() {
  const { user, role } = useAuth()

  // Don't render anything for authenticated users - let auth context handle redirection
  if (user && role) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 py-8 px-4 transition-theme overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>

          <div className="container mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left Content */}
              <motion.div
                className="lg:w-1/2 space-y-8"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Badge */}
                <motion.div
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    ✨ Completely Free • AI-Powered • Industry Leading
                  </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                    Transform Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Hiring & Career
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                    Journey
                  </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                  className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  The world's most advanced AI platform for job seekers and recruiters.
                  Build stunning resumes, analyze candidates, and streamline your hiring process—all completely free.
                </motion.p>

                {/* Key Benefits */}
                <motion.div
                  className="flex flex-wrap gap-6 text-sm font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>ATS-Optimized Resumes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>AI-Powered Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Professional Templates</span>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <Link href="/builder">
                    <Button
                      size="lg"
                      className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
                    >
                      🚀 Start Building Resume
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/ai-analyzer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="group border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                    >
                      📊 Analyze Resume
                    </Button>
                  </Link>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                  className="flex items-center gap-6 pt-8 border-t border-slate-200 dark:border-slate-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">50,000+ Users</div>
                    <div>Joined this month</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Content - Hero Image */}
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="relative">
                  {/* Floating Elements Above Image */}
                  <div className="flex justify-center gap-4 mb-6">
                    <motion.div
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Analysis</span>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg p-4"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        <span className="text-sm font-semibold">Top Rated</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Main Image */}
                  <motion.div
                    className="relative z-10"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                      <img
                        src="https://i.postimg.cc/W34GrxtL/Screenshot-2025-04-12-at-8-09-42-AM.png"
                        alt="Resumind AI Resume Builder & Analyzer - Professional Resume Creation and HR Recruitment Tool"
                        className="w-full h-auto max-w-lg mx-auto object-contain"
                        style={{
                          imageRendering: 'auto',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale'
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Floating Zap Icon */}
                  <motion.div
                    className="absolute top-1/2 -right-8 bg-white dark:bg-slate-800 rounded-full shadow-lg p-3 border border-slate-200 dark:border-slate-700"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <Zap className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                </div>
              </motion.div>
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
