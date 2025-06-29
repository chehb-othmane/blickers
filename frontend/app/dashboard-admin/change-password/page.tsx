"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Key, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import api from "@/services/api"

export default function ChangePasswordPage() {
  const [showCurrentPasswordState, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formError, setFormError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const checkPasswordStrength = (password: string) => {
    let strength = 0

    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    setPasswordStrength(strength)
  }

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPassword(value)
    checkPasswordStrength(value)

    if (confirmPassword) {
      setPasswordMatch(value === confirmPassword)
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    setPasswordMatch(value === newPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(false)
    setErrorMessage("")

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError(true)
      setErrorMessage("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMatch(false)
      setErrorMessage("Passwords do not match")
      return
    }

    try {
      const response = await api.post('/api/auth/change-password/', {
        currentPassword,
        newPassword,
        confirmPassword
      })

      if (response.status === 200) {
        setFormSubmitted(true)
        setFormError(false)
        setErrorMessage("")

        // Reset form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setPasswordStrength(0)
      }
    } catch (error: any) {
      setFormError(true)
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error)
      } else if (error.response?.data?.details) {
        setErrorMessage(error.response.data.details.join(", "))
      } else {
        setErrorMessage("An error occurred while changing password")
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
      {/* Header */}
      <header className="border-b bg-white dark:bg-black border-black/10 dark:border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link
              href="/dashboard-admin/profile"
              className="flex items-center mr-4 font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Profile
            </Link>
            <h1 className="text-xl font-bold text-black dark:text-white">Change Password</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border border-black/10 dark:border-white/10 bg-white dark:bg-black">
            <div className="p-6">
              {formSubmitted && !formError && (
                <Alert className="mb-6 bg-green-500/10 text-green-500 border-green-500/30">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>Your password has been successfully updated.</AlertDescription>
                </Alert>
              )}

              {formError && (
                <Alert className="mb-6 bg-red-500/10 text-red-500 border-red-500/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage || "Please fill in all fields correctly."}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 text-black/70 dark:text-white/70"
                      htmlFor="current-password"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPasswordState ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-white dark:bg-black/20 border-black/10 dark:border-white/10"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200"
                        onClick={() => setShowCurrentPassword(!showCurrentPasswordState)}
                      >
                        {showCurrentPasswordState ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2 text-black/70 dark:text-white/70"
                      htmlFor="new-password"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        className="bg-white dark:bg-black/20 border-black/10 dark:border-white/10"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password strength indicator */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center mb-1">
                          <span className="text-xs text-black/50 dark:text-white/50">Password strength:</span>
                          <span
                            className={cn(
                              "ml-1 text-xs font-medium",
                              passwordStrength < 2
                                ? "text-red-500"
                                : passwordStrength < 4
                                  ? "text-yellow-500"
                                  : "text-green-500",
                            )}
                          >
                            {passwordStrength < 2 ? "Weak" : passwordStrength < 4 ? "Medium" : "Strong"}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full",
                              passwordStrength < 2
                                ? "bg-red-500"
                                : passwordStrength < 4
                                  ? "bg-yellow-500"
                                  : "bg-green-500",
                            )}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <ul className="text-xs mt-2 text-black/50 dark:text-white/50">
                      <li>• At least 8 characters</li>
                      <li>• Include uppercase letters</li>
                      <li>• Include lowercase letters</li>
                      <li>• Include numbers</li>
                      <li>• Include special characters</li>
                    </ul>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2 text-black/70 dark:text-white/70"
                      htmlFor="confirm-password"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className={cn(
                          "bg-white dark:bg-black/20 border-black/10 dark:border-white/10",
                          !passwordMatch && confirmPassword ? "border-red-500" : "",
                        )}
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {!passwordMatch && confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 transition-opacity duration-200"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
