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
  Shield,
  UserPlus,
  UserMinus,
  UserCog,
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
import { profileApi, type UserProfile } from "@/services/api"

export default function UserManagementHelpPage() {
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
      console.error("Failed to load profile data:", error)
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
              <h1 className="text-xl font-bold text-black dark:text-white">User Management</h1>
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

        {/* User Management Help Content */}
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
                    <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">User Management Guide</h2>
                    <p className="text-black/70 dark:text-white/70 mb-4">
                      This guide covers everything you need to know about managing users on the platform, including user
                      roles, permissions, and best practices for user administration.
                    </p>
                  </div>
                  <div className="md:w-1/3 flex justify-center">
                    <div className="p-4 rounded-full bg-[#9b9bff]/10">
                      <Users className="h-24 w-24 text-[#6262cf] dark:text-[#9b9bff]" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* User Roles and Permissions */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-[#6262cf] rounded-full mr-2"></span>
                User Roles and Permissions
              </h2>
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
                <div className="p-6">
                  <p className="text-black/70 dark:text-white/70 mb-4">
                    The platform supports several user roles, each with different permissions and access levels.
                    Understanding these roles is essential for effective user management.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card className="p-4 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff]">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Administrator</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Full access to all platform features and settings. Can manage all users, content, and system
                            configurations.
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff]">
                          <UserCog className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Moderator</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Can manage content and basic user actions. Cannot access system settings or perform
                            administrative functions.
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff]">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Content Creator</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Can create and manage their own content. Limited access to user management features.
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-md bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff]">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white">Regular User</h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                            Basic access to platform features. Can view content and participate in discussions.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Managing Users */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-orange-500 rounded-full mr-2"></span>
                Managing Users
              </h2>
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Common User Management Tasks</h3>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b border-black/10 dark:border-white/10">
                      <AccordionTrigger className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400 py-4">
                        <div className="flex items-center">
                          <UserPlus className="h-5 w-5 mr-2 text-orange-500 dark:text-orange-400" />
                          Adding New Users
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-black/70 dark:text-white/70 pb-4">
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Navigate to the Users section in the dashboard.</li>
                          <li>Click the "Add User" button in the top right corner.</li>
                          <li>Fill in the required information (name, email, role, etc.).</li>
                          <li>Choose whether to send an invitation email or set a temporary password.</li>
                          <li>Click "Create User" to add the new user to the system.</li>
                        </ol>
                        <div className="mt-4 p-3 bg-black/5 dark:bg-white/5 rounded-md">
                          <p className="text-sm font-medium">Pro Tip:</p>
                          <p className="text-sm">
                            When adding multiple users, consider using the "Bulk Import" feature with a CSV file to save
                            time.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border-b border-black/10 dark:border-white/10">
                      <AccordionTrigger className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400 py-4">
                        <div className="flex items-center">
                          <UserCog className="h-5 w-5 mr-2 text-orange-500 dark:text-orange-400" />
                          Editing User Information
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-black/70 dark:text-white/70 pb-4">
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Find the user in the Users list.</li>
                          <li>Click on the user's name or the "Edit" button.</li>
                          <li>Update the necessary information in the user profile.</li>
                          <li>Click "Save Changes" to apply the updates.</li>
                        </ol>
                        <div className="mt-4 p-3 bg-black/5 dark:bg-white/5 rounded-md">
                          <p className="text-sm font-medium">Note:</p>
                          <p className="text-sm">
                            Changing a user's role will immediately affect their access permissions. Make sure to inform
                            users before changing their roles.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border-b border-black/10 dark:border-white/10">
                      <AccordionTrigger className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400 py-4">
                        <div className="flex items-center">
                          <UserMinus className="h-5 w-5 mr-2 text-orange-500 dark:text-orange-400" />
                          Deactivating or Removing Users
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-black/70 dark:text-white/70 pb-4">
                        <p className="mb-3">
                          There are two options for removing user access: deactivation (temporary) and deletion
                          (permanent).
                        </p>
                        <h4 className="font-medium mb-2">Deactivating a User:</h4>
                        <ol className="list-decimal pl-5 space-y-2 mb-4">
                          <li>Find the user in the Users list.</li>
                          <li>Click the "Actions" menu and select "Deactivate".</li>
                          <li>Confirm the deactivation when prompted.</li>
                        </ol>
                        <h4 className="font-medium mb-2">Deleting a User:</h4>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Find the user in the Users list.</li>
                          <li>Click the "Actions" menu and select "Delete".</li>
                          <li>Read the warning about data deletion carefully.</li>
                          <li>Type the user's email to confirm deletion.</li>
                          <li>Click "Delete User" to permanently remove the account.</li>
                        </ol>
                        <div className="mt-4 p-3 bg-red-500/10 rounded-md border border-red-500/20">
                          <p className="text-sm font-medium text-red-500 dark:text-red-400">Warning:</p>
                          <p className="text-sm text-black/70 dark:text-white/70">
                            User deletion is permanent and cannot be undone. All user data will be removed from the
                            system. Consider deactivation instead if you might need to restore access in the future.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </Card>
            </motion.section>

            {/* Best Practices */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-green-500 rounded-full mr-2"></span>
                Best Practices
              </h2>
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 text-black dark:text-white">Do's</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 mr-2 mt-0.5">
                            ✓
                          </span>
                          <span className="text-black/70 dark:text-white/70">
                            Regularly audit user accounts and permissions
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 mr-2 mt-0.5">
                            ✓
                          </span>
                          <span className="text-black/70 dark:text-white/70">
                            Implement the principle of least privilege
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 mr-2 mt-0.5">
                            ✓
                          </span>
                          <span className="text-black/70 dark:text-white/70">
                            Document role changes and permission updates
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 mr-2 mt-0.5">
                            ✓
                          </span>
                          <span className="text-black/70 dark:text-white/70">
                            Provide clear onboarding instructions for new users
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 mr-2 mt-0.5">
                            ✓
                          </span>
                          <span className="text-black/70 dark:text-white/70">Enforce strong password policies</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-3 text-black dark:text-white">Don'ts</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 mr-2 mt-0.5">
                            ✗
                          </span>
                          <span className="text-black/70 dark:text-white/70">
                            Share admin accounts among multiple staff members
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 mr-2 mt-0.5">
                            ✗
                          </span>
                          <span className="text-black/70 dark:text-white/70">
                            Grant excessive permissions "just in case"
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 mr-2 mt-0.5">
                            ✗
                          </span>
                          <span className="text-black/70 dark:text-white/70">
                            Forget to revoke access for departed staff members
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 mr-2 mt-0.5">
                            ✗
                          </span>
                          <span className="text-black/70 dark:text-white/70">Ignore suspicious login activity</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 mr-2 mt-0.5">
                            ✗
                          </span>
                          <span className="text-black/70 dark:text-white/70">
                            Delete users without proper backup of their data
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Need More Help */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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
