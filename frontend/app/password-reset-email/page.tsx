"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PasswordResetEmailPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>

      <div className="container max-w-2xl px-4 relative z-10">

        
          <div className="border border-black/10 rounded-lg overflow-hidden mb-8">
            <div className="bg-black/5 px-4 py-2 border-b border-black/10 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-[#99c805] mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-[#9b9bff]"></div>
              </div>
              <div className="text-sm text-black/50">Email</div>
            </div>
            <div className="p-6 bg-white">
              <div className="mb-4">
                <div className="text-sm text-black/50 mb-1">From: Blickers Support &lt;support@blickers.edu&gt;</div>
                <div className="text-sm text-black/50 mb-1">To: user@example.com</div>
                <div className="text-sm text-black/50 mb-1">Subject: Reset Your Blickers Password</div>
              </div>

              <div className="border-t border-black/10 pt-4">
                <div className="flex items-center mb-4">
                  <div className="font-bold text-xl mr-2">Blickers</div>
                  <div className="text-sm text-black/50">Student Union Platform</div>
                </div>

                <p className="mb-4 text-black/80">Hello,</p>
                <p className="mb-4 text-black/80">
                  We received a request to reset your password for your Blickers account. If you didn't make this
                  request, you can safely ignore this email.
                </p>
                <p className="mb-4 text-black/80">To reset your password, click on the button below:</p>

                <div className="text-center my-6">
                  <Link href="/password-reset-confirm">
                    <Button className="bg-gradient-to-r from-[#9b9bff] to-[#6262cf] text-white hover:opacity-90">
                      Reset Your Password
                    </Button>
                  </Link>
                </div>

                <p className="mb-4 text-black/80">Or copy and paste the following URL into your browser:</p>
                <div className="bg-black/5 p-3 rounded-md text-sm text-black/70 mb-4 break-all">
                  https://blickers.edu/password-reset-confirm?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
                </div>

                <p className="mb-4 text-black/80">
                  This link will expire in 24 hours. After that, you'll need to submit a new password reset request.
                </p>

                <p className="mb-4 text-black/80">
                  If you have any questions, please contact our support team at support@blickers.edu.
                </p>

                <p className="mb-4 text-black/80">
                  Best regards,
                  <br />
                  The Blickers Team
                </p>

                <div className="border-t border-black/10 pt-4 mt-6 text-xs text-black/50 text-center">
                  <p>This is an automated message, please do not reply to this email.</p>
                  <p>© 2025 Blickers Student Union. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}
