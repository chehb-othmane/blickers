"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AlreadyLoggedInModal } from "@/components/already-logged-in-modal"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, login, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'ADMIN':
          router.push('/dashboard-admin')
          break
        case 'BDE':
          router.push('/dashboard-member')
          break
        case 'STUDENT':
          router.push('/dashboard-student')
          break
        default:
          router.push('/')
      }
    }
  }, [isAuthenticated, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    if (!formData.email) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        await login(formData.email, formData.password)
      } catch (error: any) {
        setErrors({
          email: "",
          password: error.response?.data?.error || "Invalid email or password",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isAuthenticated) {
    return null // The useEffect will handle the redirect
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Form Column */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 rounded-2xl border border-black/10 shadow-lg"
              >
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-bold mb-2 text-black">Welcome Back</h1>
                  <p className="text-black/70">Sign in to your Blickers account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@university.edu"
                      value={formData.email}
                      onChange={handleChange}
                      className={cn("border-black/10", errors.email && "border-red-500")}
                      disabled={isLoading}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/password-reset" className="text-sm text-[#6262cf] hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className={cn("border-black/10 pr-10", errors.password && "border-red-500")}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#9b9bff] to-[#6262cf] text-white hover:opacity-90"
                    disabled={isLoading}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="text-center mt-6">
                    <p className="text-black/70">
                      Don't have an account?{" "}
                      <Link href="/signup" className="text-[#6262cf] hover:underline font-medium">
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-black/10 text-center">
                  <p className="text-black/70 mb-4">Quick access for development:</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/dashboard-admin">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
                      >
                        link 1 (admin)
                      </Button>
                    </Link>
                    <Link href="/dashboard-member">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#6262cf]/30 text-[#6262cf] hover:bg-[#6262cf]/10"
                      >
                        link 2 (membre)
                      </Button>
                    </Link>
                    <Link href="/dashboard-student">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#99c805]/30 text-[#99c805] hover:bg-[#99c805]/10"
                      >
                        link 3 (student)
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Info Column */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden md:block"
              >
                <div className="relative">
                  <div className="absolute -top-5 -left-5 w-10 h-10 border-t-2 border-l-2 border-[#99c805]"></div>
                  <div className="absolute -bottom-5 -right-5 w-10 h-10 border-b-2 border-r-2 border-orange-500"></div>

                  <div className="bg-black/5 rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4 text-black">Connect with Your Campus Community</h2>
                    <p className="text-black/70 mb-6">Sign in to access exclusive features including:</p>

                    <ul className="space-y-4">
                      {[
                        "Register for campus events",
                        "Participate in forum discussions",
                        "Connect with fellow students",
                        "Access academic resources",
                        "Stay updated with campus news",
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                          className="flex items-center"
                        >
                          <div className="mr-3 p-1.5 rounded-full bg-[#6262cf]/10 text-[#6262cf]">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <span className="text-black/80">{item}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <div className="mt-8 relative">
                      <div className="aspect-video rounded-lg overflow-hidden bg-black/10 flex items-center justify-center">
                        <img
                          src="/placeholder.svg?height=300&width=500"
                          alt="Campus community"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-lg shadow-md border border-black/10">
                        <p className="text-sm font-medium text-black">Join 2,000+ students on Blickers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
