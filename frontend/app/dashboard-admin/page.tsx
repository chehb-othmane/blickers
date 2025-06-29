"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Bell,
  Calendar,
  ChevronDown,
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
  AlertTriangle,
  Edit,
  Eye,
  Plus,
  Trash2,
  BarChart3,
  LineChart,
  Megaphone,
  FileText,
  CheckCircle,
  Search,
  HelpCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { logout } from "@/services/auth"
import { dashboardApi, DashboardStats, announcementApi, Announcement, moderationApi, PendingModerationReport, activityApi, ActivityOverview, notificationApi, Notification } from "@/services/api"
import { eventService, Event } from "@/src/services/eventService"

export default function DashboardAdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [pendingReports, setPendingReports] = useState<PendingModerationReport[]>([])
  const [activityData, setActivityData] = useState<ActivityOverview | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch dashboard stats, upcoming event, announcements, and pending reports
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [statsData, eventsData, announcementsData, reportsData, activityData, notificationsData, profileData] = await Promise.all([
          dashboardApi.getStats(),
          eventService.getEvents(),
          announcementApi.getAnnouncements(),
          moderationApi.getPendingReports(),
          activityApi.getActivityOverview(),
          notificationApi.getNotifications(),
          dashboardApi.getProfile()
        ])

        // Set stats with error handling
        if (statsData) {
          setStats(statsData)
        } else {
          console.warn('No stats data received')
        }

        // Get the first upcoming event with error handling
        if (eventsData && eventsData.length > 0) {
          // Filter for upcoming events and sort by start date
          const upcomingEvents = eventsData
            .filter((event: Event) => {
              const now = new Date();
              const endDate = new Date(event.end_date);
              return event.is_published && endDate > now;
            })
            .sort((a: Event, b: Event) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
          
          if (upcomingEvents.length > 0) {
            setUpcomingEvent(upcomingEvents[0]);
          } else {
            setUpcomingEvent(null);
          }
        } else {
          console.warn('No events found')
          setUpcomingEvent(null);
        }

        // Set announcements with error handling
        if (announcementsData && announcementsData.length > 0) {
          setAnnouncements(announcementsData)
        } else {
          console.warn('No announcements found')
        }

        // Set pending reports with error handling
        if (reportsData && reportsData.length > 0) {
          setPendingReports(reportsData)
        } else {
          console.warn('No pending reports found')
        }

        // Set activity data with error handling
        if (activityData) {
          setActivityData(activityData)
        } else {
          console.warn('No activity data received')
        }

        // Set notifications with error handling
        if (notificationsData && notificationsData.length > 0) {
          setNotifications(notificationsData)
        } else {
          console.warn('No notifications found')
        }
        
        // Process profile data to ensure profile picture URL is absolute
        if (profileData) {
          const processedProfile = {
            ...profileData,
            profile_picture: profileData.profile_picture 
              ? profileData.profile_picture.startsWith('http') 
                ? profileData.profile_picture 
                : `${process.env.NEXT_PUBLIC_API_URL}${profileData.profile_picture}`
              : null
          }
          setProfile(processedProfile)
        } else {
          console.warn('No profile data received')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data. Please try refreshing the page.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would search through data
    console.log("Searching for:", searchQuery)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Handle mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAsRead()
      // Update local state to reflect changes
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-white-100 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-black dark:text-white">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-white-100 dark:bg-black">
        <div className="text-center p-6 bg-white dark:bg-black rounded-lg shadow-lg">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-black dark:text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-black/70 dark:text-white/70 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    )
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
                  alt="Admin User"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg?height=40&width=40";
                  }}
                />
                <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                  {profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'AD'}
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
                      onClick={handleLogout}
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
            <SidebarItem icon={Home} label="Dashboard" active href="/dashboard-admin" />
            <SidebarItem icon={Users} label="Users" href="/dashboard-admin/users" />
            <SidebarItem icon={Calendar} label="Events" href="/dashboard-admin/events" />
            <SidebarItem icon={Megaphone} label="Announcements" href="/dashboard-admin/announcements" />

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
            <SidebarItem icon={HelpCircle} label="Help & Support" href="/dashboard-admin/help" />
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
              <h1 className="text-xl font-bold text-black dark:text-white">Admin Dashboard</h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Help Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="hidden md:flex border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <HelpCircle className="h-5 w-5 text-black/70 dark:text-white/70" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Help & Documentation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

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
                          {notifications.some(n => !n.is_read) && (
                            <motion.span
                              className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-black">
                  <DropdownMenuLabel className="text-black dark:text-white flex justify-between items-center">
                    <span>Notifications</span>
                    {notifications.some(n => !n.is_read) && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                        onClick={handleMarkAllAsRead}
                      >
                        Mark all as read
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent cursor-default">
                        <div className="flex items-start p-3 gap-3 w-full rounded-md cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200">
                          <div
                            className={cn(
                              "mt-1 p-1 rounded-full flex-shrink-0",
                              notification.type === "success"
                                ? "bg-green-500/20"
                                : notification.type === "error"
                                  ? "bg-red-500/20"
                                  : notification.type === "warning"
                                    ? "bg-yellow-500/20"
                                    : "bg-blue-500/20",
                            )}
                          >
                            {notification.icon ? (
                              <img src={notification.icon} alt={notification.type} className="h-4 w-4" />
                            ) : (
                              <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-black dark:text-white">{notification.title}</p>
                            <p className="text-xs mt-1 text-black/70 dark:text-white/70">{notification.message}</p>
                            <p className="text-xs mt-1 text-black/50 dark:text-white/50">{notification.time_ago}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-black/60 dark:text-white/60">
                      No notifications
                    </div>
                  )}
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

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {/* Section 1: Quick Summary */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-orange-500 rounded-full mr-2"></span>
                Quick Summary
              </h2>
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { 
                      title: "Total Users", 
                      value: stats.total_users.value.toString(), 
                      icon: Users, 
                      change: stats.total_users.change, 
                      color: "orange", 
                      delay: 0 
                    },
                    { 
                      title: "Upcoming Events", 
                      value: stats.upcoming_events.value.toString(), 
                      icon: Calendar, 
                      change: stats.upcoming_events.change, 
                      color: "blue", 
                      delay: 0.1 
                    },
                    { 
                      title: "Pending Reports", 
                      value: stats.pending_reports.value.toString(), 
                      icon: Flag, 
                      change: stats.pending_reports.change, 
                      color: "red", 
                      delay: 0.2 
                    },
                    { 
                      title: "New Messages", 
                      value: stats.new_messages.value.toString(), 
                      icon: MessageSquare, 
                      change: stats.new_messages.change, 
                      color: "green", 
                      delay: 0.3 
                    },
                  ].map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: card.delay }}
                    >
                      <SummaryCard
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        change={card.change}
                        color={card.color as "orange" | "blue" | "green" | "red"}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-6 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                  <div className="text-center text-black/60 dark:text-white/60">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-black/40 dark:text-white/40" />
                    <p>No statistics available at the moment</p>
                  </div>
                </Card>
              )}
            </section>

            {/* Section 2: Upcoming Event */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black dark:text-white flex items-center">
                  <span className="inline-block w-1 h-6 bg-blue-500 rounded-full mr-2"></span>
                  Upcoming Event
                </h2>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Event
                </Button>
              </div>
              {upcomingEvent ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="p-6 border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-black">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <div className="aspect-video rounded-lg relative overflow-hidden bg-black/5 dark:bg-white/5 shadow-inner">
                          <img
                            src={upcomingEvent?.image || "/placeholder.svg?height=200&width=300"}
                            alt={upcomingEvent?.title || "Event"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-orange-500 text-white shadow-sm">Featured</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <h3 className="text-lg font-bold mb-2 text-black dark:text-white">
                          {upcomingEvent?.title || "Loading..."}
                        </h3>
                        <div className="flex items-center mb-2 text-black/60 dark:text-white/60">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {upcomingEvent ? `${upcomingEvent.date} • ${upcomingEvent.time}` : "Loading..."}
                          </span>
                        </div>
                        <p className="mb-4 text-black/70 dark:text-white/70">
                          {upcomingEvent?.description || "Loading event description..."}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-black/60 dark:text-white/60">
                              {upcomingEvent ? `${upcomingEvent.registered} students registered` : "Loading..."}
                            </span>
                            <div className="flex -space-x-2 mt-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-gray-800 shadow-sm">
                                  <AvatarFallback className="bg-orange-500/10 text-orange-500 dark:text-orange-400 text-xs">
                                    {i}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs border-2 border-white dark:border-gray-800 bg-black/5 dark:bg-white/5 shadow-sm">
                                +{upcomingEvent ? Math.max(0, upcomingEvent.registered - 5) : 0}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <Card className="p-6 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                  <div className="text-center text-black/60 dark:text-white/60">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-black/40 dark:text-white/40" />
                    <p>No upcoming events scheduled</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-orange-500/30 text-orange-500 dark:text-orange-400 hover:bg-orange-500/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Event
                    </Button>
                  </div>
                </Card>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Section 3: Latest Announcements */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black dark:text-white flex items-center">
                    <span className="inline-block w-1 h-6 bg-green-500 rounded-full mr-2"></span>
                    Latest Announcements
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300"
                  >
                    View All
                  </Button>
                </div>
                <Card className="border border-black/10 dark:border-white/10 shadow-sm overflow-hidden bg-white dark:bg-black">
                  {announcements.length > 0 ? (
                    <div className="divide-y divide-black/10 dark:divide-white/10">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-black dark:text-white">{announcement.title}</h3>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-black/60 dark:text-white/60">
                              By {announcement.author} • {announcement.time_ago}
                            </div>
                            <div className="flex items-center text-black/60 dark:text-white/60">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {announcement.comments_count} comments
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-black/60 dark:text-white/60">
                      <Megaphone className="h-12 w-12 mx-auto mb-4 text-black/40 dark:text-white/40" />
                      <p>No announcements available</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-orange-500/30 text-orange-500 dark:text-orange-400 hover:bg-orange-500/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Announcement
                      </Button>
                    </div>
                  )}
                </Card>
              </section>

              {/* Section 4: Pending Moderation */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black dark:text-white flex items-center">
                    <span className="inline-block w-1 h-6 bg-red-500 rounded-full mr-2"></span>
                    Pending Moderation
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300"
                  >
                    View All
                  </Button>
                </div>
                <Card className="border border-black/10 dark:border-white/10 shadow-sm overflow-hidden bg-white dark:bg-black">
                  {pendingReports.length > 0 ? (
                    <div className="divide-y divide-black/10 dark:divide-white/10">
                      {pendingReports.map((report) => (
                        <div key={report.id} className="p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge
                                className={
                                  report.type === "Forum Post"
                                    ? "bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/30"
                                    : report.type === "Comment"
                                      ? "bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff] border-[#6262cf]/30"
                                      : "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30"
                                }
                              >
                                {report.type}
                              </Badge>
                              <p className="mt-1 text-sm line-clamp-1 text-black/70 dark:text-white/70">{report.content}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-black/60 dark:text-white/60">
                              Reported by {report.reporter} • {report.time}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 border-orange-500/30 text-orange-500 dark:text-orange-400 hover:bg-orange-500/10"
                                title="Warn"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/10"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-black/60 dark:text-white/60">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-black/40 dark:text-white/40" />
                      <p>No pending reports to moderate</p>
                    </div>
                  )}
                </Card>
              </section>
            </div>

            {/* Activity Overview section */}
            <motion.section
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-2"></span>
                Activity Overview
              </h2>

              {activityData ? (
                <>
                  {/* First row: User Activity and Content Engagement side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* User Activity Card */}
                    <Card className="p-4 border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-black">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-black dark:text-white">User Activity</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="h-40 flex items-end justify-between gap-1">
                        {activityData?.user_activity.map((height, index) => (
                          <div key={index} className="relative group flex-1">
                            <div
                              className="rounded-t-sm transition-all duration-300 bg-gradient-to-t from-orange-500 to-orange-400 group-hover:from-orange-600 group-hover:to-orange-500"
                              style={{ height: `${height}%` }}
                            ></div>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black dark:bg-white text-white dark:text-black shadow-md z-10">
                              {height}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-black/50 dark:text-white/50">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                    </Card>

                    {/* Content Engagement Card */}
                    <Card className="p-4 border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-black">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-black dark:text-white">Content Engagement</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col h-full justify-center">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-1 bg-orange-500/10 text-orange-500 dark:text-orange-400">
                              <MessageSquare className="h-5 w-5" />
                            </div>
                            <div className="text-lg font-bold text-black dark:text-white">{activityData?.content_engagement.comments.toLocaleString() || 0}</div>
                            <div className="text-xs text-black/60 dark:text-white/60">Comments</div>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-1 bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff]">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-lg font-bold text-black dark:text-white">{activityData?.content_engagement.posts.toLocaleString() || 0}</div>
                            <div className="text-xs text-black/60 dark:text-white/60">Posts</div>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-1 bg-[#99c805]/10 text-[#99c805] dark:text-[#b8e82a]">
                              <BarChart3 className="h-5 w-5" />
                            </div>
                            <div className="text-lg font-bold text-black dark:text-white">{activityData?.content_engagement.reactions.toLocaleString() || 0}</div>
                            <div className="text-xs text-black/60 dark:text-white/60">Reactions</div>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-1 bg-orange-500/10 text-orange-500 dark:text-orange-400">
                              <LineChart className="h-5 w-5" />
                            </div>
                            <div className="text-lg font-bold text-black dark:text-white">+{activityData?.content_engagement.growth || 0}%</div>
                            <div className="text-xs text-black/60 dark:text-white/60">Growth</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Second row: Event Participation */}
                  <Card className="p-4 border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-black">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-black dark:text-white">Event Participation</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {activityData?.event_participation.map((event, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-black/70 dark:text-white/70">{event.name}</span>
                            <span className="text-black/70 dark:text-white/70">{event.registered}/{event.capacity}</span>
                          </div>
                          <Progress value={event.percentage} className="h-2 bg-black/10 dark:bg-white/10">
                            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" />
                          </Progress>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-6 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                  <div className="text-center text-black/60 dark:text-white/60">
                    <LineChart className="h-12 w-12 mx-auto mb-4 text-black/40 dark:text-white/40" />
                    <p>No activity data available</p>
                  </div>
                </Card>
              )}
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

function SummaryCard({
  title,
  value,
  icon: Icon,
  change,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  change: string
  color: "orange" | "blue" | "green" | "red"
}) {
  const colorClasses = {
    orange: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
    blue: "bg-gradient-to-r from-[#9b9bff] to-[#6262cf] text-white",
    green: "bg-gradient-to-r from-[#99c805] to-[#e2ff85] text-white",
    red: "bg-gradient-to-r from-red-400 to-red-600 text-white",
  }

  const isPositive = change.startsWith("+")

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
      <Card className="p-6 border overflow-hidden relative border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-black">
        <motion.div
          className="absolute -right-10 -top-10 w-20 h-20 rounded-full opacity-10"
          initial={{
            backgroundColor:
              color === "orange" ? "#f97316" : color === "blue" ? "#6262cf" : color === "green" ? "#99c805" : "#ef4444",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm mb-1 text-black/60 dark:text-white/60">{title}</p>
            <p className="text-2xl font-bold text-black dark:text-white">{value}</p>
          </div>
          <div className={cn("p-2 rounded-full shadow-sm", colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span
            className={cn(
              "text-xs font-medium",
              isPositive ? "text-[#99c805] dark:text-[#b8e82a]" : "text-red-500 dark:text-red-400",
            )}
          >
            {change}
          </span>
          <span className="text-xs ml-1 text-black/50 dark:text-white/50">from last month</span>
        </div>
      </Card>
    </motion.div>
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
