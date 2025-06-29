"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Shield, Smartphone, Mail, Check, Copy, RefreshCw, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { twoFactorApi } from "@/services/api"
import { profileApi } from "@/services/api"

export default function TwoFactorAuthPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [showQRSetup, setShowQRSetup] = useState(false)
  const [showEmailSetup, setShowEmailSetup] = useState(false)
  const [recoveryCodesCopied, setRecoverCodesCopied] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [verificationError, setVerificationError] = useState(false)
  const [emailVerificationCode, setEmailVerificationCode] = useState("")
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [hasAuthenticator, setHasAuthenticator] = useState(false)
  const [hasEmail, setHasEmail] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  useEffect(() => {
    loadTwoFactorStatus()
  }, [])

  const loadTwoFactorStatus = async () => {
    try {
      const status = await twoFactorApi.getStatus()
      setTwoFactorEnabled(status.is_enabled)
      setHasAuthenticator(status.has_authenticator)
      setHasEmail(status.has_email)
      setEmailVerified(status.email_verified)
    } catch (error) {
      console.error('Error loading 2FA status:', error)
    }
  }

  const handleToggleTwoFactor = async (enabled: boolean) => {
    try {
      if (enabled) {
        // If enabling, show QR setup
        const setup = await twoFactorApi.setupAuthenticator()
        setQrCode(setup.qr_code)
        setSecretKey(setup.secret_key)
        setShowQRSetup(true)
      } else {
        // If disabling, confirm and disable
        await twoFactorApi.disable2FA()
        setTwoFactorEnabled(false)
        setHasAuthenticator(false)
        setHasEmail(false)
        setEmailVerified(false)
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error)
    }
  }

  const handleToggleAuthenticator = async (enabled: boolean) => {
    try {
      if (enabled) {
        const setup = await twoFactorApi.setupAuthenticator()
        setQrCode(setup.qr_code)
        setSecretKey(setup.secret_key)
        setShowQRSetup(true)
      } else {
        await twoFactorApi.disable2FA()
        setHasAuthenticator(false)
        setTwoFactorEnabled(false)
      }
    } catch (error) {
      console.error('Error toggling authenticator:', error)
    }
  }

  const handleToggleEmail = async (enabled: boolean) => {
    try {
      if (enabled) {
        setShowEmailSetup(true)
      } else {
        await twoFactorApi.disable2FA()
        setHasEmail(false)
        setEmailVerified(false)
        setTwoFactorEnabled(false)
      }
    } catch (error) {
      console.error('Error toggling email:', error)
    }
  }

  const handleVerifyCode = async () => {
    try {
      if (verificationCode.length === 6) {
        await twoFactorApi.verifyAuthenticator(verificationCode)
        setVerificationSuccess(true)
        setVerificationError(false)
        setTwoFactorEnabled(true)
        setHasAuthenticator(true)

        // Reset after 3 seconds
        setTimeout(() => {
          setVerificationSuccess(false)
          setVerificationCode("")
          setShowQRSetup(false)
        }, 3000)
      } else {
        setVerificationError(true)
        setVerificationSuccess(false)
      }
    } catch (error) {
      setVerificationError(true)
      setVerificationSuccess(false)
    }
  }

  const handleCopyRecoveryCodes = async () => {
    try {
      if (recoveryCodes.length === 0) {
        const { recovery_codes } = await twoFactorApi.generateRecoveryCodes()
        setRecoveryCodes(recovery_codes)
      }
      navigator.clipboard.writeText(recoveryCodes.join('\n'))
      setRecoverCodesCopied(true)

      // Reset after 3 seconds
      setTimeout(() => {
        setRecoverCodesCopied(false)
      }, 3000)
    } catch (error) {
      console.error('Error copying recovery codes:', error)
    }
  }

  const handleGenerateNewCodes = async () => {
    try {
      const { recovery_codes } = await twoFactorApi.generateRecoveryCodes()
      setRecoveryCodes(recovery_codes)
    } catch (error) {
      console.error('Error generating new recovery codes:', error)
    }
  }

  const handleSendEmailCode = async () => {
    try {
      // Get user's email from profile
      const profile = await profileApi.getProfile();
      await twoFactorApi.setupEmail(profile.email);
      setEmailVerificationSent(true);
    } catch (error) {
      console.error('Error sending email code:', error);
    }
  }

  const handleVerifyEmailCode = async () => {
    try {
      if (emailVerificationCode.length === 6) {
        await twoFactorApi.verifyEmail(emailVerificationCode)
        setVerificationSuccess(true)
        setVerificationError(false)
        setHasEmail(true)
        setEmailVerified(true)

        // Reset after 3 seconds
        setTimeout(() => {
          setVerificationSuccess(false)
          setEmailVerificationCode("")
          setShowEmailSetup(false)
          setEmailVerificationSent(false)
        }, 3000)
      } else {
        setVerificationError(true)
        setVerificationSuccess(false)
      }
    } catch (error) {
      setVerificationError(true)
      setVerificationSuccess(false)
    }
  }

  const handleCloseSetup = () => {
    setShowQRSetup(false)
    setShowEmailSetup(false)
    setVerificationCode("")
    setEmailVerificationCode("")
    setVerificationError(false)
    setVerificationSuccess(false)
    setEmailVerificationSent(false)
  }

  return (
    <div className="min-h-screen bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
      {/* Header */}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <Card className="border border-black/10 dark:border-white/10 bg-white dark:bg-black">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield
                    className={cn(
                      "h-5 w-5 mr-2",
                      twoFactorEnabled ? "text-green-500" : "text-black/50 dark:text-white/50",
                    )}
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-black dark:text-white">Two-Factor Authentication</h2>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggleTwoFactor}
                />
              </div>
            </div>
          </Card>

          {/* QR Setup Section */}
          {showQRSetup && (
            <Card className="border mt-6 border-black/10 dark:border-white/10 bg-white dark:bg-black">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white">Set Up Authenticator App</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseSetup}
                    className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium mb-2 text-black dark:text-white">
                      1. Scan this QR code with your authenticator app
                    </h4>
                    <div className="w-48 h-48 mx-auto flex items-center justify-center border-2 rounded-md border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5">
                      <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-40 h-40" />
                    </div>
                    <p className="text-sm mt-2 text-center text-black/50 dark:text-white/50">
                      Can't scan? Use code: <span className="font-mono">{secretKey}</span>
                    </p>
                  </div>

                  <div>
                    <h4 className="text-md font-medium mb-2 text-black dark:text-white">
                      2. Enter the 6-digit verification code
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        placeholder="000000"
                        className="text-center font-mono text-lg bg-white dark:bg-black/20 border-black/10 dark:border-white/10"
                      />
                      <Button
                        onClick={handleVerifyCode}
                        className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 transition-opacity duration-200"
                      >
                        Verify
                      </Button>
                    </div>

                    {verificationSuccess && (
                      <Alert className="mt-4 bg-green-500/10 text-green-500 border-green-500/30">
                        <Check className="h-4 w-4" />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>Two-factor authentication has been enabled.</AlertDescription>
                      </Alert>
                    )}

                    {verificationError && (
                      <Alert className="mt-4 bg-red-500/10 text-red-500 border-red-500/30">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Invalid code</AlertTitle>
                        <AlertDescription>Please enter a valid 6-digit verification code.</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Email Setup Section */}
          {showEmailSetup && (
            <Card className="border mt-6 border-black/10 dark:border-white/10 bg-white dark:bg-black">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white">Configure Email Authentication</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseSetup}
                    className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium mb-2 text-black dark:text-white">Email Address</h4>
                    <div className="flex items-center space-x-2">
                      <Input
                        defaultValue="admin@blickers.edu"
                        className="bg-white dark:bg-black/20 border-black/10 dark:border-white/10"
                      />
                      <Button
                        onClick={handleSendEmailCode}
                        className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 transition-opacity duration-200"
                      >
                        Send Code
                      </Button>
                    </div>
                  </div>

                  {emailVerificationSent && (
                    <div>
                      <h4 className="text-md font-medium mb-2 text-black dark:text-white">
                        Enter the 6-digit verification code
                      </h4>
                      <p className="text-sm mb-3 text-black/70 dark:text-white/70">
                        We've sent a verification code to your email. Enter it below to verify.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={emailVerificationCode}
                          onChange={(e) => setEmailVerificationCode(e.target.value)}
                          maxLength={6}
                          placeholder="000000"
                          className="text-center font-mono text-lg bg-white dark:bg-black/20 border-black/10 dark:border-white/10"
                        />
                        <Button
                          onClick={handleVerifyEmailCode}
                          className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 transition-opacity duration-200"
                        >
                          Verify
                        </Button>
                      </div>

                      {verificationSuccess && (
                        <Alert className="mt-4 bg-green-500/10 text-green-500 border-green-500/30">
                          <Check className="h-4 w-4" />
                          <AlertTitle>Success!</AlertTitle>
                          <AlertDescription>Email authentication has been configured.</AlertDescription>
                        </Alert>
                      )}

                      {verificationError && (
                        <Alert className="mt-4 bg-red-500/10 text-red-500 border-red-500/30">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Invalid code</AlertTitle>
                          <AlertDescription>Please enter a valid 6-digit verification code.</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Recovery Codes Section - Only show when 2FA is enabled */}
          {twoFactorEnabled && (
            <Card className="border mt-6 border-black/10 dark:border-white/10 bg-white dark:bg-black">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Recovery Codes</h3>

                <p className="text-sm mb-4 text-black/70 dark:text-white/70">
                  Recovery codes can be used to access your account if you lose your device. Keep these codes in a safe
                  place.
                </p>

                <div className="p-4 rounded-md font-mono text-sm mb-4 bg-black/5 dark:bg-white/10 text-black/80 dark:text-white/90">
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.length > 0 ? (
                      recoveryCodes.map((code, index) => (
                        <div key={index}>{code}</div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center text-black/50 dark:text-white/50">
                        Click "Generate New Codes" to create recovery codes
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
                    onClick={handleCopyRecoveryCodes}
                  >
                    {recoveryCodesCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Codes
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
                    onClick={handleGenerateNewCodes}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Codes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Backup Methods Section - Only show when 2FA is enabled */}
          {twoFactorEnabled && (
            <Card className="border mt-6 border-black/10 dark:border-white/10 bg-white dark:bg-black">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Backup Methods</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-3 text-black/70 dark:text-white/70" />
                      <div>
                        <p className="font-medium text-black dark:text-white">Authenticator App</p>
                        <p className="text-sm text-black/50 dark:text-white/50">
                          {hasAuthenticator ? "Primary method" : "Not configured"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={hasAuthenticator}
                      onCheckedChange={handleToggleAuthenticator}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-3 text-black/70 dark:text-white/70" />
                      <div>
                        <p className="font-medium text-black dark:text-white">Email</p>
                        <p className="text-sm text-black/50 dark:text-white/50">
                          {hasEmail ? (emailVerified ? "Verified" : "Not verified") : "Not configured"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={hasEmail}
                      onCheckedChange={handleToggleEmail}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
