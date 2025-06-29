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
  BookOpen,
  FileText,
  Mail,
  ExternalLink,
  ChevronRight,
  Play,
  Download,
  CheckCircle,
  AlertTriangle,
  Info,
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { profileApi, type UserProfile } from "@/services/api"

export default function HelpDocumentationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await profileApi.getProfile()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

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
                <AvatarImage 
                  src={profile?.profile_picture || "/placeholder.svg?height=40&width=40"} 
                  alt={profile?.name || "Admin User"}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg?height=40&width=40";
                  }}
                />
                <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                  {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-black dark:text-white">{profile?.name || 'Admin User'}</p>
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500/20"
                >
                  {profile?.role || 'Admin'}
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
              <h1 className="text-xl font-bold text-black dark:text-white">Help & Documentation</h1>
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

        {/* Help & Documentation Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {/* Quick Links */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-orange-500 rounded-full mr-2"></span>
                Quick Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Getting Started",
                    icon: BookOpen,
                    color: "orange",
                    description: "New to the platform? Start here",
                    link: "/dashboard-admin/help/getting-started",
                  },
                  {
                    title: "User Management",
                    icon: Users,
                    color: "blue",
                    description: "Learn about user roles and permissions",
                    link: "/dashboard-admin/help/user-management",
                  },
                  {
                    title: "Content Guidelines",
                    icon: FileText,
                    color: "green",
                    description: "Best practices for content creation",
                    link: "/dashboard-admin/help/content-guidelines",
                  },
                  {
                    title: "Contact Support",
                    icon: Mail,
                    color: "purple",
                    description: "Get help from our support team",
                    link: "/dashboard-admin/help/contact-support",
                  },
                ].map((card, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Link href={card.link}>
                      <QuickLinkCard
                        title={card.title}
                        icon={card.icon}
                        color={card.color as "orange" | "blue" | "green" | "purple"}
                        description={card.description}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Documentation Tabs */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-blue-500 rounded-full mr-2"></span>
                Documentation
              </h2>
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
                <Tabs defaultValue="guides" className="w-full">
                  <div className="border-b border-black/10 dark:border-white/10">
                    <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-black/10 dark:border-white/10 p-0">
                      <TabsTrigger
                        value="guides"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-400 rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        Guides
                      </TabsTrigger>
                      <TabsTrigger
                        value="tutorials"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-400 rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        Video Tutorials
                      </TabsTrigger>
                      <TabsTrigger
                        value="faq"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-400 rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        FAQ
                      </TabsTrigger>
                      <TabsTrigger
                        value="downloads"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-400 rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        Downloads
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="guides" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          title: "Dashboard Overview",
                          description: "Learn about the main dashboard features and navigation",
                          icon: Home,
                          link: "#dashboard-overview",
                        },
                        {
                          title: "User Management",
                          description: "How to add, edit, and manage user accounts",
                          icon: Users,
                          link: "#user-management",
                        },
                        {
                          title: "Event Creation",
                          description: "Step-by-step guide to creating and managing events",
                          icon: Calendar,
                          link: "#event-creation",
                        },
                        {
                          title: "Content Moderation",
                          description: "Guidelines and tools for moderating user content",
                          icon: Flag,
                          link: "#content-moderation",
                        },
                        {
                          title: "Analytics & Reporting",
                          description: "How to use analytics tools and generate reports",
                          icon: PieChart,
                          link: "#analytics-reporting",
                        },
                        {
                          title: "System Settings",
                          description: "Configure system preferences and security settings",
                          icon: Settings,
                          link: "#system-settings",
                        },
                      ].map((guide, index) => (
                        <Link href={guide.link} key={index} className="block">
                          <Card className="p-4 border border-black/10 dark:border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-colors duration-200">
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                                <guide.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium text-black dark:text-white">{guide.title}</h3>
                                <p className="text-sm text-black/70 dark:text-white/70 mt-1">{guide.description}</p>
                              </div>
                              <ChevronRight className="ml-auto h-5 w-5 text-black/30 dark:text-white/30" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tutorials" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          title: "Getting Started with the Admin Dashboard",
                          duration: "5:24",
                          thumbnail: "/placeholder.svg?height=120&width=200",
                          link: "#video-1",
                        },
                        {
                          title: "How to Manage User Accounts",
                          duration: "8:12",
                          thumbnail: "/placeholder.svg?height=120&width=200",
                          link: "#video-2",
                        },
                        {
                          title: "Creating and Managing Events",
                          duration: "6:45",
                          thumbnail: "/placeholder.svg?height=120&width=200",
                          link: "#video-3",
                        },
                        {
                          title: "Content Moderation Best Practices",
                          duration: "7:30",
                          thumbnail: "/placeholder.svg?height=120&width=200",
                          link: "#video-4",
                        },
                      ].map((video, index) => (
                        <Link href={video.link} key={index} className="block">
                          <Card className="border border-black/10 dark:border-white/10 overflow-hidden hover:border-orange-500/30 transition-colors duration-200">
                            <div className="relative">
                              <img
                                src={video.thumbnail || "/placeholder.svg"}
                                alt={video.title}
                                className="w-full h-40 object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                                <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                                  <Play className="h-5 w-5 text-white ml-1" />
                                </div>
                              </div>
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {video.duration}
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-black dark:text-white">{video.title}</h3>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="faq" className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {[
                        {
                          question: "How do I reset a user's password?",
                          answer:
                            "To reset a user's password, navigate to the Users section, find the user, click on the three dots menu, and select 'Reset Password'. You can either set a temporary password or send a password reset link to the user's email.",
                        },
                        {
                          question: "How can I create a new announcement?",
                          answer:
                            "To create a new announcement, go to the Announcements section and click the 'Create New Announcement' button. Fill in the title, content, target audience, and set the publication date. You can also schedule announcements to be published at a later date.",
                        },
                        {
                          question: "What are the different user roles available?",
                          answer:
                            "The platform supports several user roles including Admin, Moderator, Content Creator, and Regular User. Each role has different permissions and access levels. Admins have full access, Moderators can manage content and users, Content Creators can publish content, and Regular Users have basic access.",
                        },
                        {
                          question: "How do I export user data for reporting?",
                          answer:
                            "To export user data, go to the Statistics section, select the 'Users' tab, and click on the 'Export' button. You can choose between CSV, Excel, or PDF formats. You can also filter the data before exporting based on date range, user role, or activity status.",
                        },
                        {
                          question: "How can I customize the dashboard layout?",
                          answer:
                            "Dashboard layout customization is available in the Settings section under 'Display Preferences'. You can drag and drop widgets, hide or show specific sections, and save your preferred layout. The system will remember your preferences for future sessions.",
                        },
                        {
                          question: "What should I do if I encounter a technical issue?",
                          answer:
                            "If you encounter a technical issue, first check the status indicator in the sidebar footer to ensure the system is online. If the issue persists, use the 'Contact Support' option in the Help & Support section to submit a detailed report. Include screenshots and steps to reproduce the issue for faster resolution.",
                        },
                      ].map((faq, index) => (
                        <AccordionItem
                          key={index}
                          value={`item-${index}`}
                          className="border-b border-black/10 dark:border-white/10"
                        >
                          <AccordionTrigger className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400 py-4">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-black/70 dark:text-white/70 pb-4">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>

                  <TabsContent value="downloads" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          title: "Admin User Guide",
                          format: "PDF",
                          size: "2.4 MB",
                          updated: "Last week",
                          icon: FileText,
                        },
                        {
                          title: "Quick Start Checklist",
                          format: "PDF",
                          size: "1.1 MB",
                          updated: "2 days ago",
                          icon: CheckCircle,
                        },
                        {
                          title: "Content Guidelines",
                          format: "PDF",
                          size: "3.2 MB",
                          updated: "Last month",
                          icon: FileText,
                        },
                        {
                          title: "Troubleshooting Guide",
                          format: "PDF",
                          size: "1.8 MB",
                          updated: "2 weeks ago",
                          icon: AlertTriangle,
                        },
                      ].map((resource, index) => (
                        <Card key={index} className="p-4 border border-black/10 dark:border-white/10">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                              <resource.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-black dark:text-white">{resource.title}</h3>
                              <div className="flex items-center text-xs text-black/60 dark:text-white/60 mt-1">
                                <span>{resource.format}</span>
                                <span className="mx-2">•</span>
                                <span>{resource.size}</span>
                                <span className="mx-2">•</span>
                                <span>Updated {resource.updated}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-black/10 dark:border-white/10">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.section>

            {/* Contact Support */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-green-500 rounded-full mr-2"></span>
                Need More Help?
              </h2>
              <Card className="p-6 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="md:w-2/3">
                    <h3 className="text-lg font-bold mb-2 text-black dark:text-white">Contact Support Team</h3>
                    <p className="text-black/70 dark:text-white/70 mb-4">
                      Our support team is available Monday through Friday, 9am-5pm. We typically respond to all
                      inquiries within 24 hours.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Support
                      </Button>
                      <Button
                        variant="outline"
                        className="border-black/10 dark:border-white/10"
                        onClick={() => router.push("/dashboard-admin/help/contact-support")}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Live Chat
                      </Button>
                      <Button variant="outline" className="border-black/10 dark:border-white/10">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Knowledge Base
                      </Button>
                    </div>
                  </div>
                  <div className="md:w-1/3 flex justify-center">
                    <div className="p-4 rounded-full bg-orange-500/10">
                      <HelpCircle className="h-24 w-24 text-orange-500 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Help Topics */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-2"></span>
                Popular Help Topics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Account Security",
                    topics: [
                      "Two-factor authentication",
                      "Password policies",
                      "Session management",
                      "Security best practices",
                    ],
                  },
                  {
                    title: "Content Management",
                    topics: [
                      "Creating announcements",
                      "Formatting guidelines",
                      "Media uploads",
                      "Content approval workflow",
                    ],
                  },
                  {
                    title: "User Administration",
                    topics: [
                      "User roles and permissions",
                      "Bulk user operations",
                      "User activity logs",
                      "Account verification",
                    ],
                  },
                ].map((category, index) => (
                  <Card
                    key={index}
                    className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black"
                  >
                    <div className="p-4 border-b border-black/10 dark:border-white/10">
                      <h3 className="font-medium text-black dark:text-white">{category.title}</h3>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {category.topics.map((topic, topicIndex) => (
                          <li key={topicIndex}>
                            <Link
                              href={`#${topic.toLowerCase().replace(/\s+/g, "-")}`}
                              className="flex items-center text-black/70 dark:text-white/70 hover:text-orange-500 dark:hover:text-orange-400"
                            >
                              <Info className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                              {topic}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
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

function QuickLinkCard({
  title,
  icon: Icon,
  color,
  description,
}: {
  title: string
  icon: React.ElementType
  color: "orange" | "blue" | "green" | "purple"
  description: string
}) {
  const colorClasses = {
    orange: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
    blue: "bg-gradient-to-r from-[#9b9bff] to-[#6262cf] text-white",
    green: "bg-gradient-to-r from-[#99c805] to-[#e2ff85] text-white",
    purple: "bg-gradient-to-r from-purple-400 to-purple-600 text-white",
  }

  return (
    <Card className="p-6 border overflow-hidden relative border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-black">
      <motion.div
        className="absolute -right-10 -top-10 w-20 h-20 rounded-full opacity-10"
        initial={{
          backgroundColor:
            color === "orange" ? "#f97316" : color === "blue" ? "#6262cf" : color === "green" ? "#99c805" : "#9333ea",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      />
      <div className="flex items-start gap-4">
        <div className={cn("p-2 rounded-full shadow-sm", colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-black dark:text-white">{title}</h3>
          <p className="text-sm text-black/70 dark:text-white/70 mt-1">{description}</p>
        </div>
      </div>
    </Card>
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
