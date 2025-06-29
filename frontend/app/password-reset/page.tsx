"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { requestPasswordReset } from "@/services/auth"
import { useRouter } from "next/navigation"

export default function PasswordResetPage() {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (emailError) setEmailError("")
  }

  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateEmail()) {
      setIsLoading(true)
      try {
        await requestPasswordReset(email)
        setIsSubmitted(true)
      } catch (error: any) {
        setEmailError(error.response?.data?.error || "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>

      <div className="container max-w-md px-4 relative z-10 py-8">
        <Link href="/login" className="inline-flex items-center text-black/70 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl border border-black/10 shadow-lg"
        >
          {isSubmitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold mb-4 text-black">Check Your Email</h1>
              <p className="text-black/70 mb-6">
                If an account exists for {email}, we've sent instructions to reset your password. Please check your
                inbox and spam folder.
              </p>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2 text-black">Reset Your Password</h1>
                <p className="text-black/70">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={handleEmailChange}
                    className={cn("border-black/10", emailError && "border-red-500")}
                    disabled={isLoading}
                  />
                  {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </main>
  )
}
