"use client"

import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-400/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#9b9bff]/10 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-black text-white mb-4">
                PRIVACY POLICY
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 text-black"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your Privacy Matters
            </motion.h1>

            <motion.p
              className="text-lg text-black/70 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Learn how we collect, use, and protect your personal information on the Blickers platform.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-[32px] font-semibold text-[#1a1a1a] mb-6">Introduction</h2>
                <p className="text-[#4a4a4a] text-lg leading-relaxed">
                  At Blickers, we respect your privacy and are committed to protecting your personal data. This privacy
                  policy will inform you about how we look after your personal data when you visit our website and tell
                  you about your privacy rights and how the law protects you.
                </p>
              </div>

              <div>
                <h2 className="text-[32px] font-semibold text-[#1a1a1a] mb-6">Information We Collect</h2>
                <p className="text-[#4a4a4a] text-lg leading-relaxed mb-6">
                  We may collect, use, store and transfer different kinds of personal data about you which we have grouped
                  together as follows:
                </p>
                <ul className="space-y-6">
                  <li>
                    <div className="flex flex-col">
                      <strong className="text-[#1a1a1a] text-lg mb-2">Identity Data</strong>
                      <p className="text-[#4a4a4a] text-lg">includes first name, last name, username or similar identifier, student
                      ID, and profile picture.</p>
                    </div>
                  </li>
                  <li>
                    <div className="flex flex-col">
                      <strong className="text-[#1a1a1a] text-lg mb-2">Contact Data</strong>
                      <p className="text-[#4a4a4a] text-lg">includes email address and telephone numbers.</p>
                    </div>
                  </li>
                  <li>
                    <div className="flex flex-col">
                      <strong className="text-[#1a1a1a] text-lg mb-2">Technical Data</strong>
                      <p className="text-[#4a4a4a] text-lg">includes internet protocol (IP) address, your login data, browser type
                      and version, time zone setting and location, browser plug-in types and versions, operating system and
                      platform, and other technology on the devices you use to access this website.</p>
                    </div>
                  </li>
                  <li>
                    <div className="flex flex-col">
                      <strong className="text-[#1a1a1a] text-lg mb-2">Usage Data</strong>
                      <p className="text-[#4a4a4a] text-lg">includes information about how you use our website, products, and
                      services.</p>
                    </div>
                  </li>
                  <li>
                    <div className="flex flex-col">
                      <strong className="text-[#1a1a1a] text-lg mb-2">Interaction Data</strong>
                      <p className="text-[#4a4a4a] text-lg">includes your preferences in receiving marketing from us and our
                      third parties and your communication preferences, as well as your interactions with events, forums,
                      and other users.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-[32px] font-semibold text-[#1a1a1a] mb-6">How We Use Your Information</h2>
                <p className="text-[#4a4a4a] text-lg leading-relaxed mb-6">
                  We will only use your personal data when the law allows us to. Most commonly, we will use your personal
                  data in the following circumstances:
                </p>
                <ul className="space-y-4">
                  <li className="text-[#4a4a4a] text-lg">• To register you as a new user</li>
                  <li className="text-[#4a4a4a] text-lg">• To provide and improve our services</li>
                  <li className="text-[#4a4a4a] text-lg">• To personalize your experience</li>
                  <li className="text-[#4a4a4a] text-lg">• To communicate with you about events, forums, and updates</li>
                  <li className="text-[#4a4a4a] text-lg">• To manage our relationship with you</li>
                  <li className="text-[#4a4a4a] text-lg">• To administer and protect our business and this website</li>
                </ul>
              </div>

              <div>
                <h2 className="text-[32px] font-semibold text-[#1a1a1a] mb-6">Data Security</h2>
                <p className="text-[#4a4a4a] text-lg leading-relaxed">
                  We have put in place appropriate security measures to prevent your personal data from being accidentally
                  lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to
                  your personal data to those employees, agents, contractors, and other third parties who have a business
                  need to know.
                </p>
              </div>

              <div>
                <h2 className="text-[32px] font-semibold text-[#1a1a1a] mb-6">Your Legal Rights</h2>
                <p className="text-[#4a4a4a] text-lg leading-relaxed mb-6">
                  Under certain circumstances, you have rights under data protection laws in relation to your personal
                  data, including the right to:
                </p>
                <ul className="space-y-4">
                  <li className="text-[#4a4a4a] text-lg">• Request access to your personal data</li>
                  <li className="text-[#4a4a4a] text-lg">• Request correction of your personal data</li>
                  <li className="text-[#4a4a4a] text-lg">• Request erasure of your personal data</li>
                  <li className="text-[#4a4a4a] text-lg">• Object to processing of your personal data</li>
                  <li className="text-[#4a4a4a] text-lg">• Request restriction of processing your personal data</li>
                  <li className="text-[#4a4a4a] text-lg">• Request transfer of your personal data</li>
                  <li className="text-[#4a4a4a] text-lg">• Right to withdraw consent</li>
                </ul>
              </div>

              <div>
                <h2 className="text-[32px] font-semibold text-[#1a1a1a] mb-6">Changes to This Privacy Policy</h2>
                <p className="text-[#4a4a4a] text-lg leading-relaxed">
                  We may update our privacy policy from time to time. We will notify you of any changes by posting the new
                  privacy policy on this page and updating the "Last Updated" date.
                </p>
              </div>

              <div>
                <h2 className="text-[32px] font-semibold text-[#1a1a1a] mb-6">Contact Us</h2>
                <p className="text-[#4a4a4a] text-lg leading-relaxed mb-4">
                  If you have any questions about this privacy policy or our privacy practices, please contact us at:
                </p>
                <p className="text-[#4a4a4a] text-lg">
                  Email: <a href="mailto:privacy@blickers.edu" className="text-[#1a1a1a] hover:text-[#4a4a4a]">privacy@blickers.edu</a>
                  <br />
                  Address: 123 University Avenue, Campus District, Building 4, Room 101, Collegetown, CT 12345
                </p>
              </div>

              <p className="text-[#4a4a4a] text-sm">Last Updated: April 19, 2025</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
