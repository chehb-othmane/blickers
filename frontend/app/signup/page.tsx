"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const studentYears = [
  { value: "1", label: "First Year" },
  { value: "2", label: "Second Year" },
  { value: "3", label: "Third Year" },
  { value: "4", label: "Fourth Year" },
  { value: "5", label: "Fifth Year" },
  { value: "graduate", label: "Graduate Student" },
]

const fields = [
  { value: "computer_science", label: "Computer Science" },
  { value: "engineering", label: "Engineering" },
  { value: "business", label: "Business" },
  { value: "arts", label: "Arts & Humanities" },
  { value: "science", label: "Science" },
  { value: "medicine", label: "Medicine" },
  { value: "law", label: "Law" },
  { value: "education", label: "Education" },
  { value: "social_sciences", label: "Social Sciences" },
  { value: "other", label: "Other" },
]

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    studentYear: "",
    field: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    studentYear: "",
    field: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user selects
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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      valid = false
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      valid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }

    if (!formData.firstName) {
      newErrors.firstName = "First name is required"
      valid = false
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required"
      valid = false
    }

    if (!formData.studentYear) {
      newErrors.studentYear = "Please select your year"
      valid = false
    }

    if (!formData.field) {
      newErrors.field = "Please select your field of study"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const signupUrl = `${API_URL}/api/auth/signup/`
        
        console.log('Sending signup request to:', signupUrl)
        console.log('Request data:', {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          studentYear: formData.studentYear,
          field: formData.field,
        })

        const response = await fetch(signupUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            firstName: formData.firstName,
            lastName: formData.lastName,
            studentYear: formData.studentYear,
            field: formData.field,
          }),
        })

        console.log('Response status:', response.status)
        const responseText = await response.text()
        console.log('Response text:', responseText)

        let data
        try {
          data = JSON.parse(responseText)
        } catch (e) {
          console.error('Failed to parse response as JSON:', e)
          throw new Error('Invalid response from server')
        }

        if (!response.ok) {
          // Handle validation errors from the backend
          if (response.status === 400 && data.details) {
            // Update individual field errors
            const newErrors = { ...errors }
            Object.entries(data.details).forEach(([field, message]) => {
              if (field in newErrors) {
                newErrors[field as keyof typeof newErrors] = message as string
              }
            })
            setErrors(newErrors)
            throw new Error('Please fix the errors in the form')
          }
          throw new Error(data.error || 'Registration failed')
        }

        // Store user data in localStorage or state management
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Show success message
        setIsSubmitted(true)

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          window.location.href = '/dashboard-student'
        }, 3000)
      } catch (error: unknown) {
        console.error('Registration error:', error)
        // Only set the submit error if it's not a validation error
        if (error instanceof Error && !error.message.includes('Please fix the errors in the form')) {
          setErrors(prev => ({
            ...prev,
            submit: error.message
          }))
        }
      }
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-24 pb-16 relative">
        <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-2xl border border-black/10 shadow-lg text-center max-w-md mx-auto"
              >
                <div className="w-16 h-16 bg-[#99c805]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-[#99c805]" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-black">Registration Successful!</h2>
                <p className="text-black/70 mb-6">
                  Your account has been created successfully. You will be redirected to the home page shortly.
                </p>
                <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                    className="h-full bg-[#6262cf]"
                  />
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Form Column */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white p-8 rounded-2xl border border-black/10 shadow-lg"
                >
                  <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold mb-2 text-black">Create an Account</h1>
                    <p className="text-black/70">Join the Blickers community</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={cn("border-black/10", errors.firstName && "border-red-500")}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={cn("border-black/10", errors.lastName && "border-red-500")}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                      </div>
                    </div>

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
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentYear">Year of Study</Label>
                        <Select
                          value={formData.studentYear}
                          onValueChange={(value) => handleSelectChange("studentYear", value)}
                        >
                          <SelectTrigger
                            id="studentYear"
                            className={cn("border-black/10", errors.studentYear && "border-red-500")}
                          >
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {studentYears.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.studentYear && <p className="text-red-500 text-sm">{errors.studentYear}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="field">Field of Study</Label>
                        <Select value={formData.field} onValueChange={(value) => handleSelectChange("field", value)}>
                          <SelectTrigger id="field" className={cn("border-black/10", errors.field && "border-red-500")}>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {fields.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.field && <p className="text-red-500 text-sm">{errors.field}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className={cn("border-black/10 pr-10", errors.password && "border-red-500")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                      <p className="text-xs text-black/50">Password must be at least 8 characters long</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={cn("border-black/10 pr-10", errors.confirmPassword && "border-red-500")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </Button>

                    <div className="text-center mt-6">
                      <p className="text-black/70">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#6262cf] hover:underline font-medium">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </form>
                </motion.div>

                {/* Info Column */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="hidden md:block sticky top-24"
                >
                  <div className="relative">
                    <div className="absolute -top-5 -left-5 w-10 h-10 border-t-2 border-l-2 border-orange-500"></div>
                    <div className="absolute -bottom-5 -right-5 w-10 h-10 border-b-2 border-r-2 border-[#99c805]"></div>

                    <div className="bg-black/5 rounded-2xl p-8 backdrop-blur-sm">
                      <h2 className="text-2xl font-bold mb-4 text-black">Why Join Blickers?</h2>
                      <p className="text-black/70 mb-6">
                        Create your account to unlock all features and become part of our vibrant student community.
                      </p>

                      <div className="space-y-6">
                        {[
                          {
                            title: "Connect with Peers",
                            description: "Network with students from your field and across campus",
                            icon: <Users className="h-5 w-5" />,
                          },
                          {
                            title: "Discover Events",
                            description: "Find and register for campus events that match your interests",
                            icon: <Calendar className="h-5 w-5" />,
                          },
                          {
                            title: "Join Discussions",
                            description: "Participate in academic and social forums",
                            icon: <MessageSquare className="h-5 w-5" />,
                          },
                          {
                            title: "Stay Updated",
                            description: "Get notifications about important campus announcements",
                            icon: <Bell className="h-5 w-5" />,
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                            className="flex gap-4"
                          >
                            <div className="p-2 rounded-full bg-[#6262cf]/10 text-[#6262cf] h-fit">{item.icon}</div>
                            <div>
                              <h3 className="font-medium text-black">{item.title}</h3>
                              <p className="text-sm text-black/70">{item.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-8 p-4 bg-white/80 rounded-lg border border-black/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-1.5 rounded-full bg-[#99c805]/10 text-[#99c805]">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <p className="font-medium text-black">Privacy Guaranteed</p>
                        </div>
                        <p className="text-sm text-black/70">
                          Your information is secure and will only be visible to verified university members.{" "}
                          <Link href="/privacy-policy" className="text-[#6262cf] hover:underline">
                            Learn more
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

import { Calendar, MessageSquare, Bell, Users } from "lucide-react"
