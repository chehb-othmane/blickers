"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Eye, EyeOff, ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { resetPassword } from "@/services/auth"
import { useRouter, useSearchParams } from "next/navigation"

export default function PasswordResetConfirmPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const uid = searchParams.get('uid')

  useEffect(() => {
    if (!token || !uid) {
      router.push('/password-reset')
    }
  }, [token, uid, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

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

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm() && token && uid) {
      setIsLoading(true)
      try {
        await resetPassword(token, uid, formData.password)
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/password-reset-complete')
        }, 2000)
      } catch (error: any) {
        setErrors((prev) => ({
          ...prev,
          password: error.response?.data?.error || "An error occurred",
        }))
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>
        <div className="container max-w-md px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl border border-black/10 shadow-lg text-center"
          >
            <div className="w-16 h-16 bg-[#99c805]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-[#99c805]" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-black">Password Reset Successful</h1>
            <p className="text-black/70 mb-6">
              Your password has been successfully reset. Redirecting you to the login page...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>

      <div className="container max-w-md px-4 relative z-10">
        <Link
          href="/password-reset"
          className="inline-flex items-center text-black/70 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to reset request
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl border border-black/10 shadow-lg"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-black">Create New Password</h1>
            <p className="text-black/70">
              Your password must be at least 8 characters and should include a mix of letters, numbers, and symbols.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
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
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={cn("border-black/10 pr-10", errors.confirmPassword && "border-red-500")}
                  disabled={isLoading}
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

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
