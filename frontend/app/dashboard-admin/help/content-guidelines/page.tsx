"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Bell,
  Calendar,
  Flag,
  Home,
  LogOut,
  MessageSquare,
  PieChart,
  Settings,
  User,
  Users,
  Menu,
  X,
  HelpCircle,
  Search,
  ChevronLeft,
  FileText,
  CheckCircle,
  AlertTriangle,
  ImageIcon,
  LinkIcon,
  Type,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ContentGuidelinesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would search through documentation
    console.log("Searching for:", searchQuery)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform lg:translate-x-0 lg:static border-r",
          "bg-white dark:bg-black border-black/10 dark:border-white/10 shadow-sm",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Admin User Profile */}
          <div className="p-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3 border-2 border-orange-500/20">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin User" />
                <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-black dark:text-white">Admin User</p>
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500/20"
                >
                  Admin
                </Badge>
              </div>
            </div>
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Log out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden ml-1 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search in sidebar */}
          <div className="px-4 py-3 border-b border-black/5 dark:border-white/5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/40 dark:text-white/40" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-9 h-9 bg-black/5 dark:bg-white/5 border-none text-sm"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="mb-2 px-3 text-xs font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
              Main
            </div>
            <SidebarItem icon={Home} label="Dashboard" href="/dashboard-admin" />
            <SidebarItem icon={Users} label="Users" href="/dashboard-admin/users" />
            <SidebarItem icon={Calendar} label="Events" href="/dashboard-admin/events" />
            <SidebarItem icon={MessageSquare} label="Announcements" href="/dashboard-admin/announcements" />

            <div className="mt-6 mb-2 px-3 text-xs font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
              Content
            </div>
            <SidebarItem icon={MessageSquare} label="Forum" href="/dashboard-admin/forum" />
            <SidebarItem icon={Flag} label="Reports" href="/dashboard-admin/reports" />
            <SidebarItem icon={PieChart} label="Statistics" href="/dashboard-admin/statistics" />

            <div className="mt-6 mb-2 px-3 text-xs font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
              System
            </div>
            <SidebarItem icon={Settings} label="Settings" href="/dashboard-admin/settings" />
            <SidebarItem icon={HelpCircle} label="Help & Support" active href="/dashboard-admin/help" />
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-black/60 dark:text-white/60">
                <p>
                  System Status: <span className="text-green-500 font-medium">Online</span>
                </p>
                <p className="mt-1">Last update: 10 minutes ago</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              >
                <RefreshButton />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-white/90 dark:bg-black/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5 text-black dark:text-white" />
              </Button>
              <h1 className="text-xl font-bold text-black dark:text-white">Content Guidelines</h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="relative border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <Bell className="h-5 w-5 text-black/70 dark:text-white/70" />
                          <motion.span
                            className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          ></motion.span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-black">
                  <DropdownMenuLabel className="text-black dark:text-white flex justify-between items-center">
                    <span>Notifications</span>
                    <Badge
                      variant="outline"
                      className="ml-2 bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                    >
                      Mark all as read
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                  <DropdownMenuItem className="justify-center">
                    <Button variant="ghost" size="sm" className="w-full text-black/70 dark:text-white/70">
                      View all notifications
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
                onClick={() => router.push("/dashboard-admin/profile")}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </header>

        {/* Content Guidelines Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
                onClick={() => router.push("/dashboard-admin/help")}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </div>

            {/* Introduction */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card className="p-6 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Content Guidelines</h2>
                    <p className="text-black/70 dark:text-white/70 mb-4">
                      These guidelines help ensure that all content on the platform is high-quality, accessible, and
                      appropriate. Following these guidelines will help create a better experience for all users.
                    </p>
                  </div>
                  <div className="md:w-1/3 flex justify-center">
                    <div className="p-4 rounded-full bg-[#99c805]/10">
                      <FileText className="h-24 w-24 text-[#99c805] dark:text-[#b8e82a]" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Content Types */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-[#99c805] rounded-full mr-2"></span>
                Content Types
              </h2>
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
                <Tabs defaultValue="text" className="w-full">
                  <div className="border-b border-black/10 dark:border-white/10">
                    <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-black/10 dark:border-white/10 p-0">
                      <TabsTrigger
                        value="text"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-[#99c805] data-[state=active]:text-[#99c805] dark:data-[state=active]:text-[#b8e82a] rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        <Type className="h-4 w-4 mr-2" />
                        Text
                      </TabsTrigger>
                      <TabsTrigger
                        value="images"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-[#99c805] data-[state=active]:text-[#99c805] dark:data-[state=active]:text-[#b8e82a] rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Images
                      </TabsTrigger>
                      <TabsTrigger
                        value="links"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-[#99c805] data-[state=active]:text-[#99c805] dark:data-[state=active]:text-[#b8e82a] rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Links
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="text" className="p-6">
                    <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Text Content Guidelines</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#99c805] dark:text-[#b8e82a] mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Be Clear and Concise</h4>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Use simple language and avoid jargon. Break up long paragraphs into smaller, more digestible
                            chunks. Use headings and subheadings to organize content.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#99c805] dark:text-[#b8e82a] mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Check Spelling and Grammar</h4>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Always proofread content before publishing. Use spell check tools and grammar checkers to
                            catch errors. Poor spelling and grammar can reduce credibility.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#99c805] dark:text-[#b8e82a] mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Use Inclusive Language</h4>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Avoid language that could be considered exclusionary or offensive. Use gender-neutral terms
                            when possible. Be mindful of cultural differences.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Avoid</h4>
                          <ul className="list-disc pl-5 text-black/70 dark:text-white/70 mt-1 space-y-1">
                            <li>All caps (appears as shouting)</li>
                            <li>Excessive exclamation points</li>
                            <li>Text-speak abbreviations in formal communications</li>
                            <li>Offensive language or hate speech</li>
                            <li>Plagiarized content</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="p-6">
                    <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Image Guidelines</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#99c805] dark:text-[#b8e82a] mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Image Quality</h4>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Use high-resolution images (minimum 72 dpi). Avoid blurry, pixelated, or stretched images.
                            Crop images appropriately to focus on the subject.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#99c805] dark:text-[#b8e82a] mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">File Size and Format</h4>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Optimize images for web (under 500KB when possible). Use JPEG for photographs, PNG for
                            graphics with transparency, and SVG for logos and icons.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#99c805] dark:text-[#b8e82a] mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Accessibility</h4>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Always include alt text for images. Use descriptive file names. Ensure sufficient color
                            contrast for text overlaid on images. Avoid using images of text when possible.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Avoid</h4>
                          <ul className="list-disc pl-5 text-black/70 dark:text-white/70 mt-1 space-y-1">
                            <li>Copyrighted images without permission</li>
                            <li>Offensive or inappropriate imagery</li>
                            <li>Misleading or deceptive visuals</li>
                            <li>Excessive use of stock photos that look inauthentic</li>
                            <li>Images with watermarks</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="links" className="p-6">
                    <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Link Guidelines</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#99c805] dark:text-[#b8e82a] mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Use Descriptive Link Text</h4>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Make link text descriptive of the destination. Avoid generic phrases like "click here" or
                            "read more." Good link text helps users and improves accessibility.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#99c805] dark:text-[#b8e82a] mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Verify Links</h4>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Ensure all links work correctly before publishing. Check for broken links regularly.
                            Consider using link checkers to automate this process.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#99c805] dark:text-[#b8e82a] mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">External Links</h4>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Consider opening external links in new tabs. Warn users when links lead to downloads or
                            external sites. Be selective about which external sites you link to.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">Avoid</h4>
                          <ul className="list-disc pl-5 text-black/70 dark:text-white/70 mt-1 space-y-1">
                            <li>Links to suspicious or unsafe websites</li>
                            <li>Excessive linking that distracts from content</li>
                            <li>Affiliate links without proper disclosure</li>
                            <li>Linking to competitor platforms without a good reason</li>
                            <li>URL shorteners that obscure the destination</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.section>

            {/* Content Moderation */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-orange-500 rounded-full mr-2"></span>
                Content Moderation
              </h2>
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Moderation Guidelines</h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-black dark:text-white flex items-center">
                        <span className="inline-block w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                        Acceptable Content
                      </h4>
                      <div className="mt-3 p-4 bg-green-500/5 border border-green-500/10 rounded-md">
                        <ul className="list-disc pl-5 text-black/70 dark:text-white/70 space-y-1">
                          <li>Educational and informative content</li>
                          <li>Constructive discussions and debates</li>
                          <li>Supportive and encouraging messages</li>
                          <li>Creative and original contributions</li>
                          <li>Content that follows community guidelines</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-black dark:text-white flex items-center">
                        <span className="inline-block w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                        Content Requiring Review
                      </h4>
                      <div className="mt-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-md">
                        <ul className="list-disc pl-5 text-black/70 dark:text-white/70 space-y-1">
                          <li>Content containing external links</li>
                          <li>Posts with multiple user mentions</li>
                          <li>Content flagged by automated systems</li>
                          <li>Posts containing sensitive topics</li>
                          <li>Content from new or probationary users</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-black dark:text-white flex items-center">
                        <span className="inline-block w-1 h-4 bg-red-500 rounded-full mr-2"></span>
                        Prohibited Content
                      </h4>
                      <div className="mt-3 p-4 bg-red-500/5 border border-red-500/10 rounded-md">
                        <ul className="list-disc pl-5 text-black/70 dark:text-white/70 space-y-1">
                          <li>Hate speech or discriminatory content</li>
                          <li>Harassment or bullying</li>
                          <li>Explicit or adult content</li>
                          <li>Spam or promotional content</li>
                          <li>Misinformation or deliberately misleading content</li>
                          <li>Content that violates intellectual property rights</li>
                          <li>Personal information sharing without consent</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-black/5 dark:bg-white/5 rounded-md">
                    <h4 className="font-medium text-black dark:text-white mb-2">Moderation Actions</h4>
                    <p className="text-black/70 dark:text-white/70 mb-3">
                      When moderating content, follow these steps based on the severity of the violation:
                    </p>
                    <ol className="list-decimal pl-5 text-black/70 dark:text-white/70 space-y-2">
                      <li>
                        <strong>First minor violation:</strong> Issue a warning and explain the guideline that was
                        violated.
                      </li>
                      <li>
                        <strong>Repeated minor violations:</strong> Temporarily restrict posting privileges (24-48
                        hours).
                      </li>
                      <li>
                        <strong>Serious violations:</strong> Remove content immediately and issue a formal warning.
                      </li>
                      <li>
                        <strong>Repeated serious violations:</strong> Temporary suspension (1-2 weeks).
                      </li>
                      <li>
                        <strong>Extreme violations:</strong> Permanent ban from the platform.
                      </li>
                    </ol>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Need More Help */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black dark:text-white">Still have questions?</h3>
                  <Button
                    className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
                    onClick={() => router.push("/dashboard-admin/help/contact-support")}
                  >
                    Contact Support
                  </Button>
                </div>
              </Card>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
  href = "#",
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  href?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200",
        active
          ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-sm"
          : "text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}

function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <motion.div
      animate={{ rotate: isRefreshing ? 360 : 0 }}
      transition={{ duration: 1, ease: "linear" }}
      onClick={handleRefresh}
    >
      <RefreshCw className="h-4 w-4" />
    </motion.div>
  )
}
