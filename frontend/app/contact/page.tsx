"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, Clock, ArrowRight, CheckCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, inquiryType: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitted(true)
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormSubmitted(false)
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          inquiryType: "general",
        })
      }, 3000)
    }, 1000)
  }

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
              <span className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-gradient-to-r from-orange-400 to-orange-600 text-white mb-4">
                GET IN TOUCH
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 text-black"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Contact Us
            </motion.h1>

            <motion.p
              className="text-lg text-black/70 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Have questions or feedback? We'd love to hear from you. Reach out to our team using any of the methods
              below.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 bg-neutral-white-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="border border-black/10 bg-white shadow-md p-6 h-full">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="p-3 bg-orange-500/10 rounded-full text-orange-500 mb-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-black">Email Us</h3>
                  <p className="text-black/70 mb-4">Send us an email and we'll get back to you within 24 hours.</p>
                  <a
                    href="mailto:contact@blickers.edu"
                    className="text-orange-500 hover:text-orange-600 transition-colors mt-auto"
                  >
                    contact@blickers.edu
                  </a>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="border border-black/10 bg-white shadow-md p-6 h-full">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="p-3 bg-[#99c805]/10 rounded-full text-[#99c805] mb-4">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-black">Call Us</h3>
                  <p className="text-black/70 mb-4">Have an urgent question? Give us a call during office hours.</p>
                  <a
                    href="tel:+1234567890"
                    className="text-[#99c805] hover:text-[#99c805]/80 transition-colors mt-auto"
                  >
                    (123) 456-7890
                  </a>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="border border-black/10 bg-white shadow-md p-6 h-full">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="p-3 bg-[#9b9bff]/10 rounded-full text-[#6262cf] mb-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-black">Office Hours</h3>
                  <p className="text-black/70 mb-4">Visit us in person during our regular office hours.</p>
                  <div className="text-black/70 mt-auto">
                    <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p>Saturday: 10:00 AM - 2:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border border-black/10 bg-white shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-black">Send Us a Message</h2>

                <Tabs defaultValue="student" className="mb-6">
                  <TabsList className="bg-black/5">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="faculty">Faculty</TabsTrigger>
                    <TabsTrigger value="visitor">Visitor</TabsTrigger>
                  </TabsList>
                </Tabs>

                {formSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-[#99c805] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-black">Message Sent!</h3>
                    <p className="text-black/70">
                      Thank you for reaching out. We'll get back to you as soon as possible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="border-black/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="border-black/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="How can we help you?"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="border-black/10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Inquiry Type</Label>
                        <RadioGroup
                          value={formData.inquiryType}
                          onValueChange={handleRadioChange}
                          className="flex flex-wrap gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="general" id="general" />
                            <Label htmlFor="general" className="cursor-pointer">
                              General
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="events" id="events" />
                            <Label htmlFor="events" className="cursor-pointer">
                              Events
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="support" id="support" />
                            <Label htmlFor="support" className="cursor-pointer">
                              Support
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="feedback" id="feedback" />
                            <Label htmlFor="feedback" className="cursor-pointer">
                              Feedback
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Please provide details about your inquiry..."
                          rows={5}
                          required
                          value={formData.message}
                          onChange={handleChange}
                          className="border-black/10"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#99c805] to-[#e2ff85] text-white hover:opacity-90"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </motion.div>

            {/* Map and Location */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6 text-black">Our Location</h2>

              <Card className="border border-black/10 bg-white shadow-lg overflow-hidden mb-6">
                <div className="aspect-video bg-black/5 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/placeholder.svg?height=400&width=600" alt="Map" className="w-full h-full object-cover" />
                  </div>
                </div>
              </Card>

              <Card className="border border-black/10 bg-white shadow-md p-6">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-orange-500 mt-1" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Student Union Building</h3>
                    <p className="text-black/70">
                      123 University Avenue
                      <br />
                      Campus District, Building 4, Room 101
                      <br />
                      Collegetown, CT 12345
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-black/10">
                  <h3 className="font-bold text-black mb-2">Getting Here</h3>
                  <ul className="space-y-2 text-black/70">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        <strong>By Bus:</strong> Routes 10, 15, and 22 stop directly in front of the Student Union
                        Building.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        <strong>By Car:</strong> Visitor parking is available in Lot C, a 2-minute walk from our
                        building.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        <strong>By Bike:</strong> Bike racks are located at the north and south entrances of the
                        building.
                      </span>
                    </li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-neutral-white-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-minimal-grid opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-black">Frequently Asked Questions</h2>
              <p className="text-black/70">
                Find quick answers to common questions about contacting and working with the Student Union.
              </p>
            </div>

            <div className="space-y-4">
              <FaqItem
                question="How quickly can I expect a response to my inquiry?"
                answer="We aim to respond to all inquiries within 24-48 hours during business days. For urgent matters, we recommend calling our office directly."
              />

              <FaqItem
                question="Can I schedule a meeting with a specific team member?"
                answer="Yes, you can request a meeting with specific team members through our contact form. Please mention the person's name and the purpose of your meeting in your message."
              />

              <FaqItem
                question="How do I submit an event for promotion?"
                answer="Student organizations can submit events for promotion by filling out our Event Submission Form. Select 'Events' as your inquiry type in the contact form, and we'll send you the detailed submission guidelines."
              />

              <FaqItem
                question="I'm having technical issues with the website. Who should I contact?"
                answer="For technical issues with the Blickers platform, please select 'Support' as your inquiry type in the contact form and provide details about the problem you're experiencing."
              />

              <FaqItem
                question="How can I join the Student Union team?"
                answer="We regularly recruit new team members at the beginning of each semester. Visit our About page and click on 'Apply to Join' for current openings and application instructions."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl font-bold mb-4 text-black"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Stay Updated
            </motion.h2>

            <motion.p
              className="text-black/70 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Subscribe to our newsletter to receive the latest updates on events, announcements, and opportunities.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Input placeholder="Your email address" className="border-black/10" type="email" />
              <Button className="bg-gradient-to-r from-[#9b9bff] to-[#6262cf] text-white hover:opacity-90">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>


      <Footer />
    </main>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card className="border border-black/10 bg-white shadow-md p-6">
        <h3 className="text-lg font-bold mb-2 text-black">{question}</h3>
        <p className="text-black/70">{answer}</p>
      </Card>
    </motion.div>
  )
}
