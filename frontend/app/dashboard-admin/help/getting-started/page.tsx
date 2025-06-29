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
  ChevronRight,
  CheckCircle,
  Info,
  RefreshCw,
  Layers,
  BarChart,
  Shield,
  Zap,
  ArrowRight,
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
import { profileApi, UserProfile } from "@/services/api"

export default function GettingStartedPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const profile = await profileApi.getProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
    fetchUserProfile()
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
                <AvatarImage 
                  src={userProfile?.profile_picture || "/placeholder.svg?height=40&width=40"} 
                  alt={userProfile?.name || "Admin User"} 
                />
                <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                  {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-black dark:text-white">
                  {userProfile?.name || "Admin User"}
                </p>
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500/20"
                >
                  {userProfile?.role || "Admin"}
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
              <h1 className="text-xl font-bold text-black dark:text-white">Getting Started</h1>
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

        {/* Getting Started Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {/* Welcome Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card className="p-6 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden relative">
                <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="md:w-2/3">
                      <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
                        Welcome to the Admin Dashboard
                      </h2>
                      <p className="text-black/70 dark:text-white/70 mb-4">
                        This guide will help you get familiar with the dashboard and its features. Whether you're a new
                        administrator or need a refresher, you'll find everything you need to get started.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
                          Take a Quick Tour
                        </Button>
                        <Button
                          variant="outline"
                          className="border-black/10 dark:border-white/10"
                          onClick={() => router.push("/dashboard-admin/help")}
                        >
                          Back to Help Center
                        </Button>
                      </div>
                    </div>
                    <div className="md:w-1/3 flex justify-center">
                      <div className="p-4 rounded-full bg-orange-500/10">
                        <BookOpen className="h-24 w-24 text-orange-500 dark:text-orange-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Dashboard Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-orange-500 rounded-full mr-2"></span>
                Dashboard Overview
              </h2>
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
                <div className="p-6">
                  <p className="text-black/70 dark:text-white/70 mb-4">
                    The admin dashboard is your control center for managing all aspects of the platform. Here's a quick
                    overview of the main sections:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {[
                      {
                        title: "Main Dashboard",
                        description: "Overview of key metrics and recent activity",
                        icon: Home,
                        link: "/dashboard-admin",
                      },
                      {
                        title: "User Management",
                        description: "Add, edit, and manage user accounts",
                        icon: Users,
                        link: "/dashboard-admin/users",
                      },
                      {
                        title: "Events",
                        description: "Create and manage upcoming events",
                        icon: Calendar,
                        link: "/dashboard-admin/events",
                      },
                      {
                        title: "Announcements",
                        description: "Post important updates to users",
                        icon: MessageSquare,
                        link: "/dashboard-admin/announcements",
                      },
                      {
                        title: "Forum",
                        description: "Moderate discussions and community content",
                        icon: MessageSquare,
                        link: "/dashboard-admin/forum",
                      },
                      {
                        title: "Reports",
                        description: "Review flagged content and user reports",
                        icon: Flag,
                        link: "/dashboard-admin/reports",
                      },
                      {
                        title: "Statistics",
                        description: "Analyze platform usage and performance",
                        icon: PieChart,
                        link: "/dashboard-admin/statistics",
                      },
                      {
                        title: "Settings",
                        description: "Configure system preferences and security",
                        icon: Settings,
                        link: "/dashboard-admin/settings",
                      },
                    ].map((section, index) => (
                      <Link href={section.link} key={index} className="block">
                        <Card className="p-4 border border-black/10 dark:border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-colors duration-200">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                              <section.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium text-black dark:text-white">{section.title}</h3>
                              <p className="text-sm text-black/70 dark:text-white/70 mt-1">{section.description}</p>
                            </div>
                            <ChevronRight className="ml-auto h-5 w-5 text-black/30 dark:text-white/30" />
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* First Steps */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-blue-500 rounded-full mr-2"></span>
                First Steps for New Administrators
              </h2>
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
                <Tabs defaultValue="setup" className="w-full">
                  <div className="border-b border-black/10 dark:border-white/10">
                    <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-black/10 dark:border-white/10 p-0">
                      <TabsTrigger
                        value="setup"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-400 rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        Initial Setup
                      </TabsTrigger>
                      <TabsTrigger
                        value="daily"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-400 rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        Daily Tasks
                      </TabsTrigger>
                      <TabsTrigger
                        value="security"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 dark:data-[state=active]:text-orange-400 rounded-none px-6 py-3 data-[state=active]:shadow-none"
                      >
                        Security
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="setup" className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 dark:text-orange-400 mt-1">
                          1
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-black dark:text-white">Complete Your Profile</h3>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Update your admin profile with your information and profile picture. This helps other team
                            members identify you in the system.
                          </p>
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-2 text-orange-500 dark:text-orange-400"
                            onClick={() => router.push("/dashboard-admin/profile")}
                          >
                            Go to Profile <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 dark:text-orange-400 mt-1">
                          2
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-black dark:text-white">Review User Accounts</h3>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Familiarize yourself with existing user accounts and their roles. You may need to approve
                            new registrations or update permissions.
                          </p>
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-2 text-orange-500 dark:text-orange-400"
                            onClick={() => router.push("/dashboard-admin/users")}
                          >
                            Go to Users <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 dark:text-orange-400 mt-1">
                          3
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-black dark:text-white">Configure Notifications</h3>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Set up your notification preferences to stay informed about important events, user
                            registrations, and content that needs moderation.
                          </p>
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-2 text-orange-500 dark:text-orange-400"
                            onClick={() => router.push("/dashboard-admin/notification-preferences")}
                          >
                            Go to Notification Preferences <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 dark:text-orange-400 mt-1">
                          4
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-black dark:text-white">Review System Settings</h3>
                          <p className="text-black/70 dark:text-white/70 mt-1">
                            Check the current system settings and make any necessary adjustments to align with your
                            organization's policies and requirements.
                          </p>
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-2 text-orange-500 dark:text-orange-400"
                            onClick={() => router.push("/dashboard-admin/settings")}
                          >
                            Go to Settings <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="daily" className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Check Dashboard Metrics</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Start your day by reviewing key metrics on the main dashboard to get a quick overview of
                            platform activity and performance.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Review New User Registrations</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Check for new user registrations that may require approval or verification. Ensure all new
                            accounts comply with your policies.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Moderate Flagged Content</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Review any content that has been flagged by users or the system for potential violations of
                            community guidelines.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Respond to Support Requests</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Address any pending support requests or inquiries from users. Timely responses help maintain
                            user satisfaction.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Update Announcements</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Post new announcements or update existing ones to keep users informed about important news,
                            events, or changes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Enable Two-Factor Authentication</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Secure your admin account with two-factor authentication to add an extra layer of protection
                            against unauthorized access.
                          </p>
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-2 text-orange-500 dark:text-orange-400"
                            onClick={() => router.push("/dashboard-admin/two-factor-auth")}
                          >
                            Set Up Two-Factor Authentication <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Use Strong Passwords</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Create a strong, unique password for your admin account. Avoid using the same password
                            across multiple services.
                          </p>
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-2 text-orange-500 dark:text-orange-400"
                            onClick={() => router.push("/dashboard-admin/change-password")}
                          >
                            Change Password <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Review Login History</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Regularly check your account's login history to detect any suspicious activity or
                            unauthorized access attempts.
                          </p>
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-2 text-orange-500 dark:text-orange-400"
                            onClick={() => router.push("/dashboard-admin/security")}
                          >
                            View Login History <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Manage API Keys</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            If you use API keys for integrations, review and rotate them regularly to minimize security
                            risks.
                          </p>
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-2 text-orange-500 dark:text-orange-400"
                            onClick={() => router.push("/dashboard-admin/settings")}
                          >
                            Manage API Keys <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.section>

            {/* Key Features */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-green-500 rounded-full mr-2"></span>
                Key Features to Explore
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Analytics Dashboard",
                    description: "Get insights into user activity, content engagement, and platform performance.",
                    icon: BarChart,
                  },
                  {
                    title: "Content Management",
                    description: "Create, edit, and organize content across the platform with powerful tools.",
                    icon: Layers,
                  },
                  {
                    title: "Automation Tools",
                    description: "Set up automated workflows to handle routine tasks and notifications.",
                    icon: Zap,
                  },
                ].map((feature, index) => (
                  <Card
                    key={index}
                    className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black hover:border-orange-500/30 hover:bg-orange-500/5 transition-colors duration-200"
                  >
                    <div className="p-6">
                      <div className="p-3 rounded-full bg-orange-500/10 text-orange-500 dark:text-orange-400 w-fit mb-4">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-black dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-black/70 dark:text-white/70">{feature.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.section>

            {/* Help Resources */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-2"></span>
                Additional Help Resources
              </h2>
              <Card className="p-6 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-black dark:text-white mb-3">Documentation</h3>
                    <p className="text-black/70 dark:text-white/70 mb-4">
                      Explore our comprehensive documentation for detailed guides on all dashboard features.
                    </p>
                    <ul className="space-y-2">
                      <li>
                        <Link
                          href="/dashboard-admin/help/user-management"
                          className="flex items-center text-black/70 dark:text-white/70 hover:text-orange-500 dark:hover:text-orange-400"
                        >
                          <Info className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                          User Management Guide
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard-admin/help/content-guidelines"
                          className="flex items-center text-black/70 dark:text-white/70 hover:text-orange-500 dark:hover:text-orange-400"
                        >
                          <Info className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                          Content Guidelines
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#security-best-practices"
                          className="flex items-center text-black/70 dark:text-white/70 hover:text-orange-500 dark:hover:text-orange-400"
                        >
                          <Info className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                          Security Best Practices
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#api-documentation"
                          className="flex items-center text-black/70 dark:text-white/70 hover:text-orange-500 dark:hover:text-orange-400"
                        >
                          <Info className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                          API Documentation
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-black dark:text-white mb-3">Support Options</h3>
                    <p className="text-black/70 dark:text-white/70 mb-4">
                      Need additional help? Our support team is ready to assist you.
                    </p>
                    <ul className="space-y-2">
                      <li>
                        <Link
                          href="/dashboard-admin/help/contact-support"
                          className="flex items-center text-black/70 dark:text-white/70 hover:text-orange-500 dark:hover:text-orange-400"
                        >
                          <Info className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                          Contact Support
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#faq"
                          className="flex items-center text-black/70 dark:text-white/70 hover:text-orange-500 dark:hover:text-orange-400"
                        >
                          <Info className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                          Frequently Asked Questions
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#video-tutorials"
                          className="flex items-center text-black/70 dark:text-white/70 hover:text-orange-500 dark:hover:text-orange-400"
                        >
                          <Info className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                          Video Tutorials
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#community-forum"
                          className="flex items-center text-black/70 dark:text-white/70 hover:text-orange-500 dark:hover:text-orange-400"
                        >
                          <Info className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                          Admin Community Forum
                        </Link>
                      </li>
                    </ul>
                  </div>
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
