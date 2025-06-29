"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CheckCircle, ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PasswordResetDonePage() {
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
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-orange-500" />
          </div>

          <h1 className="text-2xl font-bold mb-4 text-black">Password Reset Complete</h1>

          <div className="mb-8">
            <p className="text-black/70 mb-4">
              Your password has been successfully reset. Your account is now secure with your new password.
            </p>
            <div className="p-4 bg-black/5 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-black/70" />
                <p className="text-sm font-medium text-black">Security Tip</p>
              </div>
              <p className="text-sm text-black/70">
                Remember to use a unique password that you don't use for other websites or services.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 mb-2">
                Sign In with New Password
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full border-black/10 text-black hover:bg-black/5">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
