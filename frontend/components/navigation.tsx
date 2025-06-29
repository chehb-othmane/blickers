"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserAvatarMenu } from "@/components/user-avatar-menu"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-2 bg-white/80 backdrop-blur-lg shadow-sm" : "py-4 bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold tracking-tight text-black">Blickers</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLinks />
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserAvatarMenu />
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="rounded-full border border-black/10 text-black hover:bg-black/5 transition-all hover:scale-105"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-full bg-black text-white hover:bg-black/90 transition-all hover:scale-105 shadow-sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-black"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-black/5 shadow-sm"
          >
            <div className="flex flex-col space-y-4 p-4">
              <MobileNavLinks setIsOpen={setIsOpen} />
              <div className="flex flex-col space-y-2 pt-4">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between p-2 bg-black/5 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#6262cf] flex items-center justify-center text-white text-sm font-medium mr-2">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-black/60">{user?.role}</p>
                      </div>
                    </div>
                    <Link href={`/dashboard-${user?.role.toLowerCase()}`}>
                      <Button size="sm" className="bg-black text-white hover:bg-black/90">
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full rounded-full border border-black/10 text-black hover:bg-black/5"
                      >
                        Log In
                      </Button>
                    </Link>
                    <Link href="/signup" className="w-full">
                      <Button className="w-full rounded-full bg-black text-white hover:bg-black/90">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function NavLinks() {
  const links = [
    { name: "Events", href: "/events" },
    { name: "Forum", href: "/forum" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className="relative group text-black/80 hover:text-black transition-colors"
        >
          {link.name}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"></span>
        </Link>
      ))}
    </>
  )
}

function MobileNavLinks({ setIsOpen }: { setIsOpen: (value: boolean) => void }) {
  const links = [
    { name: "Events", href: "/events" },
    { name: "Forum", href: "/forum" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <>
      {links.map((link, index) => (
        <motion.div
          key={link.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            href={link.href}
            className="flex items-center justify-between py-2 text-black/80 hover:text-black border-b border-black/5"
            onClick={() => setIsOpen(false)}
          >
            <span>{link.name}</span>
            <ChevronRight className="h-4 w-4 text-black/50" />
          </Link>
        </motion.div>
      ))}
    </>
  )
}
