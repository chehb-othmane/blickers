"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-neutral-white-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black/20 via-black/10 to-black/20"></div>
      <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-black">Blickers</h3>
            <p className="text-black/70 mb-6">
              Your student union platform for events, forums, and campus life. Connect, engage, and make the most of
              your university experience with our modern digital hub.
            </p>
            <div className="flex space-x-4">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="bg-black/5 hover:bg-black/10 text-black p-2 rounded-full transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 text-black">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/events"
                  className="text-black/70 hover:text-black flex items-center group transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/forum"
                  className="text-black/70 hover:text-black flex items-center group transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
                  Forum
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-black/70 hover:text-black flex items-center group transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-black/70 hover:text-black flex items-center group transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-black/70 hover:text-black flex items-center group transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 text-black">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-black mt-0.5" />
                <span className="text-black/70">123 University Ave, Campus Building, Room 456</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-black" />
                <a href="mailto:contact@blickers.edu" className="text-black/70 hover:text-black transition-colors">
                  contact@blickers.edu
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-black" />
                <a href="tel:+1234567890" className="text-black/70 hover:text-black transition-colors">
                  (123) 456-7890
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 text-black">Newsletter</h3>
            <p className="text-black/70 mb-4">Subscribe to our newsletter for the latest updates and events.</p>
            <div className="flex">
              <Input
                placeholder="Your email"
                className="bg-white border-black/10 text-black placeholder:text-black/30 rounded-l-full focus:border-black focus:ring-black"
              />
              <Button className="rounded-r-full bg-black text-white hover:bg-black/90">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-black/10">
          <p className="text-center text-black/50">
            © {new Date().getFullYear()} Blickers Student Union. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
