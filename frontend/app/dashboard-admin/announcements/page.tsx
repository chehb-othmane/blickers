"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
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
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  HelpCircle,
  Download,
  Pin,
  PinOff,
  Heart,
  MoreVertical,
  ImageIcon,
  FileText,
  AlertCircle,
  Info,
  Megaphone,
  Upload,
  CalendarIcon,
  Clock,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, getMediaUrl } from "@/lib/utils"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAnnouncements } from "@/hooks/useAnnouncements"
import { Announcement, Comment, testAPIConnection, testAuthentication, announcementAPI } from "@/lib/api/announcements"

export default function AnnouncementsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<number[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    body: "",
    type: "info" as "info" | "alert" | "event",
    isPinned: false,
    scheduleDate: "",
    scheduleTime: "",
    hasImage: false,
    hasFile: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [viewDetailsAnnouncement, setViewDetailsAnnouncement] = useState<any>(null)
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [pdfLoadError, setPdfLoadError] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [editAnnouncement, setEditAnnouncement] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    type: "info",
    isPinned: false,
    hasImage: false,
    hasFile: false,
    scheduleDate: "",
    scheduleTime: "",
  })

  const router = useRouter()
  const itemsPerPage = 6

  // Use the announcement hook
  const {
    announcements,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    pinAnnouncement,
    bulkDelete,
    refresh,
    goToPage,
    nextPage,
    previousPage,
    clearError,
  } = useAnnouncements({
    itemsPerPage,
    autoRefresh: true,
    refreshInterval: 60000, // Refresh every minute
  })

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Diagnostic function to test API and authentication
  const runDiagnostics = async () => {
    console.log('=== RUNNING DIAGNOSTICS ===')
    
    // Test API connection
    console.log('Testing API connection...')
    const apiResult = await testAPIConnection()
    console.log('API Connection:', apiResult.connected ? 'SUCCESS' : 'FAILED')
    console.log('API Details:', apiResult.details)
    
    // Test authentication
    console.log('Testing authentication...')
    const authResult = await testAuthentication()
    console.log('Authentication result:', authResult)
    
    // Test environment variables
    console.log('Environment variables:')
    console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    // Test localStorage
    console.log('LocalStorage tokens:')
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('authToken')
      const accessToken = localStorage.getItem('access_token')
      console.log('authToken:', authToken ? `${authToken.substring(0, 20)}...` : 'Not found')
      console.log('access_token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'Not found')
    }
    
    // Test current page state
    console.log('Current page state:')
    console.log('Loading:', loading)
    console.log('Error:', error)
    console.log('Total announcements:', totalCount)
    
    console.log('=== DIAGNOSTICS COMPLETE ===')
  }

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      if (documentPreview) {
        URL.revokeObjectURL(documentPreview)
      }
    }
  }, [imagePreview, documentPreview])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    fetchAnnouncements({
      page: 1,
      search: query,
      type: filterType,
      sort: sortBy,
    })
  }

  // Handle type filter change
  const handleTypeFilterChange = (value: string) => {
    setFilterType(value)
    fetchAnnouncements({
      page: 1,
      search: searchQuery,
      type: value,
      sort: sortBy,
    })
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value)
    fetchAnnouncements({
      page: currentPage,
      search: searchQuery,
      type: filterType,
      sort: value,
    })
  }

  // Handle checkbox selection
  const handleSelectAnnouncement = (announcementId: number) => {
    setSelectedAnnouncements((prev) => {
      if (prev.includes(announcementId)) {
        return prev.filter((id) => id !== announcementId)
      } else {
        return [...prev, announcementId]
      }
    })
  }

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAnnouncements([])
    } else {
      setSelectedAnnouncements(announcements.map((announcement) => announcement.id))
    }
    setIsAllSelected(!isAllSelected)
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedAnnouncements.length === 0) return
    
    const success = await bulkDelete(selectedAnnouncements)
    if (success) {
      setSelectedAnnouncements([])
      setIsAllSelected(false)
    }
  }

  const handlePin = async (id: number) => {
    const announcement = announcements.find(a => a.id === id)
    if (announcement) {
      await pinAnnouncement(id, !announcement.is_pinned)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteAnnouncement(id)
  }

  const handleViewDetails = (announcement: any) => {
    setViewDetailsAnnouncement(announcement)
    setImageLoadError(false) // Reset image error state
    setPdfLoadError(false) // Reset PDF error state
    setImageLoading(false) // Reset image loading state
    setIsViewDetailsDialogOpen(true)
  }

  // Helper function to retry image loading
  const retryImageLoad = (imageUrl: string) => {
    setImageLoadError(false)
    setImageLoading(true)
    
    // Get the full media URL
    const fullUrl = getMediaUrl(imageUrl)
    
    // Add timestamp to force refresh
    const timestamp = Date.now()
    const newUrl = fullUrl.includes('?') 
      ? `${fullUrl}&t=${timestamp}` 
      : `${fullUrl}?t=${timestamp}`
    
    // Update the image src if it exists
    setTimeout(() => {
      const img = document.querySelector(`img[alt="Announcement attachment"]`) as HTMLImageElement
      if (img) {
        img.src = newUrl
      }
    }, 100)
  }



  const handleUpdateAnnouncement = async () => {
    if (!editForm.title.trim() || !editForm.body.trim()) {
      return
    }

    if (!editAnnouncement) {
      console.error('No announcement selected for editing')
      return
    }

    try {
      const updateData: any = {
        title: editForm.title,
        content: editForm.body,
        announcement_type: editForm.type,
        is_pinned: editForm.isPinned,
      }

      // Handle scheduling
      if (editForm.scheduleDate && editForm.scheduleTime) {
        const scheduledAt = new Date(`${editForm.scheduleDate}T${editForm.scheduleTime}`)
        updateData.scheduled_at = scheduledAt.toISOString()
      } else if (!editForm.scheduleDate && !editForm.scheduleTime) {
        // Clear scheduling if both fields are empty
        updateData.scheduled_at = null
      }

      // Handle file uploads
      if (imageFile) {
        updateData.image = imageFile
      }
      if (attachmentFile) {
        updateData.file = attachmentFile
      }

      const success = await updateAnnouncement(editAnnouncement.id, updateData)
      
      if (success) {
        // Reset form and close dialog
        setIsEditDialogOpen(false)
        setEditAnnouncement(null)
        setImageFile(null)
        setAttachmentFile(null)
        setEditForm({
          title: "",
          body: "",
          type: "info",
          isPinned: false,
          hasImage: false,
          hasFile: false,
          scheduleDate: "",
          scheduleTime: "",
        })
      }
    } catch (error) {
      console.error('Error updating announcement:', error)
    }
  }

  // Handle edit announcement
  const handleEdit = (announcement: any) => {
    setEditAnnouncement(announcement)
    setEditForm({
      title: announcement.title,
      body: announcement.content,
      type: announcement.announcement_type,
      isPinned: announcement.is_pinned,
      hasImage: announcement.has_image,
      hasFile: announcement.has_file,
      scheduleDate: announcement.scheduled_at ? new Date(announcement.scheduled_at).toISOString().split('T')[0] : "",
      scheduleTime: announcement.scheduled_at ? new Date(announcement.scheduled_at).toISOString().split('T')[1].slice(0, 5) : "",
    })
    setIsEditDialogOpen(true)
  }

  // Handle edit form input changes
  const handleEditFormChange = (field: string, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle form submission
  const handleCreateAnnouncement = async () => {
    console.log('handleCreateAnnouncement: Starting form submission')
    console.log('Form data:', newAnnouncement)
    console.log('Image file:', imageFile)
    console.log('Attachment file:', attachmentFile)
    
    if (!newAnnouncement.title.trim() || !newAnnouncement.body.trim()) {
      console.log('handleCreateAnnouncement: Missing required fields')
      return
    }

    const scheduleDateTime = newAnnouncement.scheduleDate && newAnnouncement.scheduleTime
      ? `${newAnnouncement.scheduleDate}T${newAnnouncement.scheduleTime}:00`
      : null

    const announcementData = {
      title: newAnnouncement.title,
      content: newAnnouncement.body,
      announcement_type: newAnnouncement.type,
      is_pinned: newAnnouncement.isPinned,
      scheduled_at: scheduleDateTime,
      image: imageFile || undefined,
      file: attachmentFile || undefined,
    }

    console.log('handleCreateAnnouncement: Prepared announcement data:', announcementData)

    try {
      const result = await createAnnouncement(announcementData)
      console.log('handleCreateAnnouncement: Create result:', result)
      
      if (result) {
        console.log('handleCreateAnnouncement: Successfully created announcement, cleaning up form')
        setIsCreateDialogOpen(false)
        setNewAnnouncement({
          title: "",
          body: "",
          type: "info",
          isPinned: false,
          scheduleDate: "",
          scheduleTime: "",
          hasImage: false,
          hasFile: false,
        })
        // Clean up preview URLs
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview)
          setImagePreview(null)
        }
        if (documentPreview) {
          URL.revokeObjectURL(documentPreview)
          setDocumentPreview(null)
        }
        setImageFile(null)
        setAttachmentFile(null)
      } else {
        console.log('handleCreateAnnouncement: Create failed, result was null')
      }
    } catch (error) {
      console.error('handleCreateAnnouncement: Unexpected error:', error)
    }
  }

  // Handle form input changes
  const handleFormChange = (field: string, value: any) => {
    setNewAnnouncement((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle dialog close
  const handleCreateDialogClose = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      // Clean up preview URLs when dialog is closed
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
      }
      if (documentPreview) {
        URL.revokeObjectURL(documentPreview)
        setDocumentPreview(null)
      }
      // Reset form
      setNewAnnouncement({
        title: "",
        body: "",
        type: "info",
        isPinned: false,
        scheduleDate: "",
        scheduleTime: "",
        hasImage: false,
        hasFile: false,
      })
      setImageFile(null)
      setAttachmentFile(null)
    }
  }

  // Handle file uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview URL for image
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachmentFile(file)
      // Create preview URL for document (if it's a PDF)
      if (file.type === 'application/pdf') {
        const previewUrl = URL.createObjectURL(file)
        setDocumentPreview(previewUrl)
      } else {
        setDocumentPreview(null)
      }
    }
  }

  // Clean up preview URLs when files are removed
  const removeImageFile = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    setImageFile(null)
  }

  const removeAttachmentFile = () => {
    if (documentPreview) {
      URL.revokeObjectURL(documentPreview)
      setDocumentPreview(null)
    }
    setAttachmentFile(null)
  }

  // Separate pinned and regular announcements (API already handles filtering and sorting)
  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned)
  const regularAnnouncements = announcements.filter((a) => !a.is_pinned)

  // Use announcements directly since pagination is handled by the API
  const paginatedAnnouncements = announcements

  // Calculate announcement statistics
  const totalAnnouncements = totalCount
  const totalViews = announcements.reduce((sum, announcement) => sum + announcement.views_count, 0)
  const totalEngagement = announcements.reduce(
    (sum, announcement) => sum + announcement.likes_count + announcement.comments_count,
    0,
  )
  const activeDiscussions = announcements.filter((announcement) => announcement.comments_count > 0).length

  if (!mounted) {
    return null
  }

  // Show loading state
  if (loading && announcements.length === 0) {
    return (
      <div className="min-h-screen flex bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-lg font-medium">Loading announcements...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && announcements.length === 0) {
    return (
      <div className="min-h-screen flex bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">Failed to load announcements</p>
            <p className="text-sm text-black/60 dark:text-white/60 mb-4">{error}</p>
            <Button
              onClick={refresh}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
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
            <form className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/40 dark:text-white/40" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-9 h-9 bg-black/5 dark:bg-white/5 border-none text-sm"
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
            <SidebarItem icon={MessageSquare} label="Announcements" active href="/dashboard-admin/announcements" />

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
              <h1 className="text-xl font-bold text-black dark:text-white">Announcements Management</h1>
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

        {/* Announcements Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {/* Announcement Statistics */}
            <section className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-orange-500/10 mr-4">
                        <Megaphone className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-black/60 dark:text-white/60">Total Announcements</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{totalAnnouncements}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="p-4 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-500/10 mr-4">
                        <Eye className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-black/60 dark:text-white/60">Total Views</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          {(totalViews / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="p-4 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-green-500/10 mr-4">
                        <Heart className="h-6 w-6 text-green-500 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-black/60 dark:text-white/60">Total Engagement</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          {(totalEngagement / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card className="p-4 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-purple-500/10 mr-4">
                        <MessageSquare className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-black/60 dark:text-white/60">Active Discussions</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{activeDiscussions}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </section>

            {/* Search and Filters */}
            <section className="mb-6">
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/40 dark:text-white/40" />
                        <Input
                          type="search"
                          placeholder="Search announcements by title, content, or author..."
                          className="w-full pl-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                          value={searchQuery}
                          onChange={handleSearchChange}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="w-40">
                        <Select value={filterType} onValueChange={handleTypeFilterChange}>
                          <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="info">Information</SelectItem>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-40">
                        <Select value={sortBy} onValueChange={handleSortChange}>
                          <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="engagement">Most Engaged</SelectItem>
                            <SelectItem value="views">Most Viewed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="border-black/10 dark:border-white/10">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                        onClick={runDiagnostics}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Debug
                      </Button>
                      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogClose}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Announcement
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-black max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-black dark:text-white">Create New Announcement</DialogTitle>
                            <DialogDescription className="text-black/60 dark:text-white/60">
                              Create a new announcement to share with your community. Fill in the details below.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6 py-4">
                            {/* Title */}
                            <div className="space-y-2">
                              <Label htmlFor="title" className="text-black dark:text-white">
                                Title *
                              </Label>
                              <Input
                                id="title"
                                placeholder="Enter announcement title..."
                                value={newAnnouncement.title}
                                onChange={(e) => handleFormChange("title", e.target.value)}
                                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                              />
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                              <Label htmlFor="body" className="text-black dark:text-white">
                                Content *
                              </Label>
                              <Textarea
                                id="body"
                                placeholder="Write your announcement content here..."
                                value={newAnnouncement.body}
                                onChange={(e) => handleFormChange("body", e.target.value)}
                                className="min-h-[120px] bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                              />
                            </div>

                            {/* Type and Pin */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="type" className="text-black dark:text-white">
                                  Type
                                </Label>
                                <Select
                                  value={newAnnouncement.type}
                                  onValueChange={(value) => handleFormChange("type", value)}
                                >
                                  <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="info">
                                      <div className="flex items-center">
                                        <Info className="h-4 w-4 mr-2 text-green-500" />
                                        Information
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="alert">
                                      <div className="flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                        Alert
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="event">
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                        Event
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-black dark:text-white">Pin Announcement</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                  <Switch
                                    checked={newAnnouncement.isPinned}
                                    onCheckedChange={(checked) => handleFormChange("isPinned", checked)}
                                    className="data-[state=checked]:bg-orange-500"
                                  />
                                  <span className="text-sm text-black/60 dark:text-white/60">
                                    Pin to top of announcements
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Attachments */}
                            <div className="space-y-3">
                              <Label className="text-black dark:text-white">Attachments</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={newAnnouncement.hasImage}
                                    onCheckedChange={(checked) => handleFormChange("hasImage", checked)}
                                    className="data-[state=checked]:bg-orange-500"
                                  />
                                  <ImageIcon className="h-4 w-4 text-black/60 dark:text-white/60" />
                                  <span className="text-sm text-black/60 dark:text-white/60">Include image</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={newAnnouncement.hasFile}
                                    onCheckedChange={(checked) => handleFormChange("hasFile", checked)}
                                    className="data-[state=checked]:bg-orange-500"
                                  />
                                  <FileText className="h-4 w-4 text-black/60 dark:text-white/60" />
                                  <span className="text-sm text-black/60 dark:text-white/60">Include document</span>
                                </div>
                              </div>

                              {/* File Upload Areas */}
                              {newAnnouncement.hasImage && (
                                <div className="space-y-2">
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor="image-upload"
                                    className="border-2 border-dashed border-black/20 dark:border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500/50 transition-colors block"
                                  >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-black/40 dark:text-white/40" />
                                    <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                                      {imageFile ? imageFile.name : "Click to upload image or drag and drop"}
                                    </p>
                                    <p className="text-xs text-black/40 dark:text-white/40">PNG, JPG, GIF up to 10MB</p>
                                  </label>
                                  {imagePreview && (
                                    <div className="mt-3">
                                      <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-w-full h-32 object-cover rounded-lg mx-auto"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={removeImageFile}
                                        className="mt-2 mx-auto block"
                                      >
                                        Remove Image
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {newAnnouncement.hasFile && (
                                <div className="space-y-2">
                                  <input
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor="file-upload"
                                    className="border-2 border-dashed border-black/20 dark:border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500/50 transition-colors block"
                                  >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-black/40 dark:text-white/40" />
                                    <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                                      {attachmentFile ? attachmentFile.name : "Click to upload document or drag and drop"}
                                    </p>
                                    <p className="text-xs text-black/40 dark:text-white/40">PDF, DOC, DOCX up to 25MB</p>
                                  </label>
                                  {attachmentFile && (
                                    <div className="mt-3 text-center">
                                      <div className="flex items-center justify-center space-x-2 mb-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm text-black/60 dark:text-white/60">{attachmentFile.name}</span>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={removeAttachmentFile}
                                        className="mx-auto block"
                                      >
                                        Remove Document
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Scheduling */}
                            <div className="space-y-3">
                              <Label className="text-black dark:text-white">Schedule (Optional)</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="scheduleDate" className="text-sm text-black/60 dark:text-white/60">
                                    Date
                                  </Label>
                                  <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/40 dark:text-white/40" />
                                    <Input
                                      id="scheduleDate"
                                      type="date"
                                      value={newAnnouncement.scheduleDate}
                                      onChange={(e) => handleFormChange("scheduleDate", e.target.value)}
                                      className="pl-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="scheduleTime" className="text-sm text-black/60 dark:text-white/60">
                                    Time
                                  </Label>
                                  <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/40 dark:text-white/40" />
                                    <Input
                                      id="scheduleTime"
                                      type="time"
                                      value={newAnnouncement.scheduleTime}
                                      onChange={(e) => handleFormChange("scheduleTime", e.target.value)}
                                      className="pl-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                    />
                                  </div>
                                </div>
                              </div>
                              {(newAnnouncement.scheduleDate || newAnnouncement.scheduleTime) && (
                                <p className="text-xs text-black/50 dark:text-white/50">
                                  Leave empty to publish immediately
                                </p>
                              )}
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => handleCreateDialogClose(false)}
                              className="border-black/10 dark:border-white/10 text-black dark:text-white"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateAnnouncement}
                              disabled={!newAnnouncement.title.trim() || !newAnnouncement.body.trim()}
                              className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 disabled:opacity-50"
                            >
                              Create Announcement
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Error Display */}
            {error && (
              <section className="mb-6">
                <Card className="border border-red-500/20 bg-red-500/5 dark:bg-red-500/10">
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Error
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {error}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          onClick={clearError}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Pinned Announcements */}
            {pinnedAnnouncements.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
                  <Pin className="h-5 w-5 mr-2 text-orange-500" />
                  Pinned Announcements
                </h2>
                <div className="space-y-4">
                  {pinnedAnnouncements.map((announcement, index) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <AnnouncementCard
                        announcement={announcement}
                        onPin={handlePin}
                        onDelete={handleDelete}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        isPinned={true}
                        isSelected={selectedAnnouncements.includes(announcement.id)}
                        onSelect={handleSelectAnnouncement}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Announcements */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black dark:text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  All Announcements ({totalCount})
                </h2>
                {selectedAnnouncements.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-black/70 dark:text-white/70">
                      {selectedAnnouncements.length} selected
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete Selected
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-black">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-black dark:text-white">
                            Delete Selected Announcements
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-black/60 dark:text-white/60">
                            Are you sure you want to delete {selectedAnnouncements.length} selected announcements? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-black/10 dark:border-white/10 text-black dark:text-white">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={handleBulkDelete}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {paginatedAnnouncements.length > 0 ? (
                  paginatedAnnouncements.map((announcement, index) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <AnnouncementCard
                        announcement={announcement}
                        onPin={handlePin}
                        onDelete={handleDelete}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        isPinned={announcement.is_pinned}
                        isSelected={selectedAnnouncements.includes(announcement.id)}
                        onSelect={handleSelectAnnouncement}
                      />
                    </motion.div>
                  ))
                ) : (
                  <Card className="p-12 text-center border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 text-black/30 dark:text-white/30" />
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No announcements found</h3>
                    <p className="text-black/60 dark:text-white/60 mb-4">
                      {searchQuery || filterType !== "all"
                        ? "Try adjusting your search or filters"
                        : "Create your first announcement to get started"}
                    </p>
                    <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogClose}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Announcement
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </Card>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="mr-2 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <span className="text-sm text-black/60 dark:text-white/60">Select all on this page</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-black/60 dark:text-white/60">
                      Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                      {totalCount}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-black/10 dark:border-white/10"
                        disabled={!hasPrevious}
                        onClick={previousPage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                        let pageNum = currentPage
                        if (totalPages <= 3) {
                          pageNum = i + 1
                        } else if (currentPage === 1) {
                          pageNum = i + 1
                        } else if (currentPage === totalPages) {
                          pageNum = totalPages - 2 + i
                        } else {
                          pageNum = currentPage - 1 + i
                        }
                        return (
                          <Button
                            key={i}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              pageNum === currentPage
                                ? "bg-orange-500 text-white hover:bg-orange-600"
                                : "border-black/10 dark:border-white/10",
                            )}
                            onClick={() => goToPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-black/10 dark:border-white/10"
                        disabled={!hasNext}
                        onClick={nextPage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-black max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Edit Announcement</DialogTitle>
            <DialogDescription className="text-black/60 dark:text-white/60">
              Update the announcement details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-black dark:text-white">
                Title *
              </Label>
              <Input
                id="edit-title"
                placeholder="Enter announcement title..."
                value={editForm.title}
                onChange={(e) => handleEditFormChange("title", e.target.value)}
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="edit-body" className="text-black dark:text-white">
                Content *
              </Label>
              <Textarea
                id="edit-body"
                placeholder="Write your announcement content here..."
                value={editForm.body}
                onChange={(e) => handleEditFormChange("body", e.target.value)}
                className="min-h-[120px] bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
              />
            </div>

            {/* Type and Pin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type" className="text-black dark:text-white">
                  Type
                </Label>
                <Select
                  value={editForm.type}
                  onValueChange={(value) => handleEditFormChange("type", value)}
                >
                  <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">
                      <div className="flex items-center">
                        <Info className="h-4 w-4 mr-2 text-green-500" />
                        Information
                      </div>
                    </SelectItem>
                    <SelectItem value="alert">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                        Alert
                      </div>
                    </SelectItem>
                    <SelectItem value="event">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        Event
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-black dark:text-white">Pin Announcement</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={editForm.isPinned}
                    onCheckedChange={(checked) => handleEditFormChange("isPinned", checked)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                  <span className="text-sm text-black/60 dark:text-white/60">
                    Pin to top of announcements
                  </span>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <Label className="text-black dark:text-white">Attachments</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editForm.hasImage}
                    onCheckedChange={(checked) => handleEditFormChange("hasImage", checked)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                  <ImageIcon className="h-4 w-4 text-black/60 dark:text-white/60" />
                  <span className="text-sm text-black/60 dark:text-white/60">Include image</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editForm.hasFile}
                    onCheckedChange={(checked) => handleEditFormChange("hasFile", checked)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                  <FileText className="h-4 w-4 text-black/60 dark:text-white/60" />
                  <span className="text-sm text-black/60 dark:text-white/60">Include document</span>
                </div>
              </div>

              {/* File Upload Areas */}
              {editForm.hasImage && (
                <div className="space-y-2">
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className="border-2 border-dashed border-black/20 dark:border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500/50 transition-colors block"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-black/40 dark:text-white/40" />
                    <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                      {imageFile ? imageFile.name : "Click to upload new image"}
                    </p>
                    <p className="text-xs text-black/40 dark:text-white/40">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>
              )}

              {editForm.hasFile && (
                <div className="space-y-2">
                  <input
                    id="edit-file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-file-upload"
                    className="border-2 border-dashed border-black/20 dark:border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500/50 transition-colors block"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-black/40 dark:text-white/40" />
                    <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                      {attachmentFile ? attachmentFile.name : "Click to upload new document"}
                    </p>
                    <p className="text-xs text-black/40 dark:text-white/40">PDF, DOC, DOCX up to 25MB</p>
                  </label>
                </div>
              )}
            </div>

            {/* Scheduling */}
            <div className="space-y-3">
              <Label className="text-black dark:text-white">Schedule Publication</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-scheduleDate" className="text-sm text-black/60 dark:text-white/60">
                    Date
                  </Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/40 dark:text-white/40" />
                    <Input
                      id="edit-scheduleDate"
                      type="date"
                      value={editForm.scheduleDate}
                      onChange={(e) => handleEditFormChange("scheduleDate", e.target.value)}
                      className="pl-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-scheduleTime" className="text-sm text-black/60 dark:text-white/60">
                    Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/40 dark:text-white/40" />
                    <Input
                      id="edit-scheduleTime"
                      type="time"
                      value={editForm.scheduleTime}
                      onChange={(e) => handleEditFormChange("scheduleTime", e.target.value)}
                      className="pl-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                    />
                  </div>
                </div>
              </div>
              {(editForm.scheduleDate || editForm.scheduleTime) && (
                <p className="text-xs text-black/50 dark:text-white/50">
                  Leave empty to keep current publication status
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-black/10 dark:border-white/10 text-black dark:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAnnouncement}
              disabled={!editForm.title.trim() || !editForm.body.trim()}
              className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 disabled:opacity-50"
            >
              Update Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="bg-white dark:bg-black max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Announcement Details</DialogTitle>
            <DialogDescription className="text-black/60 dark:text-white/60">
              View the complete announcement information and analytics.
            </DialogDescription>
          </DialogHeader>

          {viewDetailsAnnouncement && (
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-black/10 dark:border-white/10">
                  <AvatarImage src={getMediaUrl(viewDetailsAnnouncement.author_avatar) || "/placeholder.svg"} alt={viewDetailsAnnouncement.author} />
                  <AvatarFallback className="bg-orange-500/10 text-orange-500 dark:text-orange-400">
                    {viewDetailsAnnouncement.author
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-black dark:text-white">{viewDetailsAnnouncement.title}</h3>
                    {viewDetailsAnnouncement.is_pinned && <Pin className="h-5 w-5 text-orange-500 fill-current" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-black/60 dark:text-white/60">
                    <span className="font-medium">{viewDetailsAnnouncement.author}</span>
                    <span>•</span>
                    <span>{viewDetailsAnnouncement.time_ago}</span>
                    <Badge className={`${
                      viewDetailsAnnouncement.announcement_type === 'alert'
                        ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30'
                        : viewDetailsAnnouncement.announcement_type === 'event'
                        ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/30'
                        : 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/30'
                    }`}>
                      {viewDetailsAnnouncement.announcement_type === 'alert' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {viewDetailsAnnouncement.announcement_type === 'event' && <Calendar className="h-3 w-3 mr-1" />}
                      {viewDetailsAnnouncement.announcement_type === 'info' && <Info className="h-3 w-3 mr-1" />}
                      <span className="capitalize">{viewDetailsAnnouncement.announcement_type}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
                <p className="text-black dark:text-white whitespace-pre-wrap">{viewDetailsAnnouncement.content}</p>
              </div>

              {/* Attachments */}
              {(viewDetailsAnnouncement.has_image || viewDetailsAnnouncement.has_file) && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-black dark:text-white flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-orange-500" />
                    Attachments ({(viewDetailsAnnouncement.has_image ? 1 : 0) + (viewDetailsAnnouncement.has_file ? 1 : 0)})
                  </h4>
                  
                  {/* Image Panel */}
                  {viewDetailsAnnouncement.has_image && viewDetailsAnnouncement.image && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-black dark:text-white flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2 text-green-500" />
                          Image Preview
                        </h5>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => window.open(viewDetailsAnnouncement.image, '_blank')}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Full Size
                          </Button>
                          <Button
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = viewDetailsAnnouncement.image;
                              a.download = 'announcement-image';
                              a.click();
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 shadow-sm">
                        {imageLoading && !imageLoadError && (
                          <div className="p-8 text-center h-48 flex flex-col justify-center">
                            <RefreshCw className="h-8 w-8 mx-auto mb-3 text-orange-500 animate-spin" />
                            <p className="text-sm text-black/60 dark:text-white/60">Loading image...</p>
                          </div>
                        )}
                        {!imageLoadError && !imageLoading && (
                          <img 
                            src={getMediaUrl(viewDetailsAnnouncement.image)} 
                            alt="Announcement attachment" 
                            className="w-full max-h-96 object-contain hover:scale-105 transition-transform duration-200 cursor-pointer"
                            onClick={() => window.open(getMediaUrl(viewDetailsAnnouncement.image), '_blank')}
                            onLoadStart={() => setImageLoading(true)}
                            onError={() => {
                              console.error('Image failed to load:', viewDetailsAnnouncement.image);
                              setImageLoadError(true);
                              setImageLoading(false);
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', viewDetailsAnnouncement.image);
                              setImageLoadError(false);
                              setImageLoading(false);
                            }}
                          />
                        )}
                        {imageLoadError && (
                          <div className="p-8 text-center">
                            <div className="h-12 w-12 mx-auto mb-3 text-red-500">
                              <AlertCircle className="h-12 w-12" />
                            </div>
                            <p className="text-sm text-black/60 dark:text-white/60 mb-3">Failed to load image</p>
                            <p className="text-xs text-black/40 dark:text-white/40 mb-2">
                              The image might be corrupted, moved, or you may not have permission to view it.
                            </p>
                            <p className="text-xs font-mono text-black/30 dark:text-white/30 mb-4 break-all">
                              URL: {viewDetailsAnnouncement.image}
                            </p>
                            <div className="flex justify-center gap-2">
                              <Button
                                onClick={() => retryImageLoad(viewDetailsAnnouncement.image)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Retry
                              </Button>
                              <Button
                                onClick={() => window.open(getMediaUrl(viewDetailsAnnouncement.image), '_blank')}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Try Direct Link
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-black/50 dark:text-white/50 text-center">
                        Click image to view in full size
                      </div>
                    </div>
                  )}

                  {/* Document Panel */}
                  {viewDetailsAnnouncement.has_file && viewDetailsAnnouncement.file && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-black dark:text-white flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          Document Preview
                        </h5>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => window.open(getMediaUrl(viewDetailsAnnouncement.file), '_blank')}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                          <Button
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = getMediaUrl(viewDetailsAnnouncement.file);
                              a.download = viewDetailsAnnouncement.file.split('/').pop() || 'document';
                              a.click();
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 shadow-sm">
                        <div className="max-h-96 overflow-y-auto">
                          {viewDetailsAnnouncement.file.toLowerCase().endsWith('.pdf') ? (
                            <div className="relative">
                              {!pdfLoadError ? (
                                <>
                                  <iframe 
                                    src={`${getMediaUrl(viewDetailsAnnouncement.file)}#toolbar=1&navpanes=1&scrollbar=1`}
                                    className="w-full h-96"
                                    title="PDF Document Preview"
                                    onLoad={() => setPdfLoadError(false)}
                                    onError={() => setPdfLoadError(true)}
                                  />
                                  <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm rounded px-2 py-1">
                                    <span className="text-xs text-white">PDF Preview</span>
                                  </div>
                                </>
                              ) : (
                                <div className="p-8 text-center h-96 flex flex-col justify-center">
                                  <div className="h-16 w-16 mx-auto mb-4 text-red-500">
                                    <FileText className="h-16 w-16" />
                                  </div>
                                  <p className="text-lg font-medium text-black dark:text-white mb-2">PDF Preview Failed</p>
                                  <p className="text-sm text-black/60 dark:text-white/60 mb-4">
                                    Unable to display PDF preview. The file might be corrupted or protected.
                                  </p>
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      onClick={() => {
                                        setPdfLoadError(false);
                                        // Force iframe reload
                                        const iframe = document.querySelector(`iframe[src*="${viewDetailsAnnouncement.file}"]`) as HTMLIFrameElement;
                                        if (iframe) {
                                          iframe.src = iframe.src;
                                        }
                                      }}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Retry Preview
                                    </Button>
                                    <Button
                                      onClick={() => window.open(viewDetailsAnnouncement.file, '_blank')}
                                      className="bg-blue-500 hover:bg-blue-600 text-white"
                                      size="sm"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Open PDF
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : viewDetailsAnnouncement.file.toLowerCase().match(/\.(doc|docx)$/) ? (
                            <div className="p-6 text-center">
                              <div className="h-16 w-16 mx-auto mb-4 text-blue-500">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,12H18V14H10V12M10,16H15V18H10V16Z" />
                                </svg>
                              </div>
                              <p className="text-lg font-medium text-black dark:text-white mb-2">Word Document</p>
                              <p className="text-sm text-black/60 dark:text-white/60 mb-4">
                                {viewDetailsAnnouncement.file.split('/').pop()}
                              </p>
                              <p className="text-xs text-black/50 dark:text-white/50 mb-4">
                                Preview not available for Word documents. Use the buttons above to open or download.
                              </p>
                              <Button
                                onClick={() => window.open(viewDetailsAnnouncement.file, '_blank')}
                                className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
                                size="sm"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Open Document
                              </Button>
                            </div>
                          ) : (
                            <div className="p-6 text-center">
                              <FileText className="h-16 w-16 mx-auto mb-4 text-black/40 dark:text-white/40" />
                              <p className="text-lg font-medium text-black dark:text-white mb-2">Document</p>
                              <p className="text-sm text-black/60 dark:text-white/60 mb-4">
                                {viewDetailsAnnouncement.file.split('/').pop()}
                              </p>
                              <div className="flex justify-center gap-2">
                                <Button
                                  onClick={() => window.open(viewDetailsAnnouncement.file, '_blank')}
                                  className="bg-blue-500 hover:bg-blue-600 text-white"
                                  size="sm"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Open Document
                                </Button>
                                <Button
                                  onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = viewDetailsAnnouncement.file;
                                    a.download = viewDetailsAnnouncement.file.split('/').pop() || 'document';
                                    a.click();
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-black/50 dark:text-white/50 text-center">
                        {viewDetailsAnnouncement.file.toLowerCase().endsWith('.pdf') 
                          ? 'PDF preview - Use browser controls to zoom and navigate'
                          : 'Use the buttons above to open or download the document'
                        }
                      </div>
                    </div>
                  )}

                  {/* Attachment Indicators (when no direct URLs available) */}
                  {(viewDetailsAnnouncement.has_image || viewDetailsAnnouncement.has_file) && 
                   (!viewDetailsAnnouncement.image && !viewDetailsAnnouncement.file) && (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        {viewDetailsAnnouncement.has_image && (
                          <div className="flex-1 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-green-500" />
                              </div>
                              <div>
                                <p className="font-medium text-green-700 dark:text-green-400">Image Attached</p>
                                <p className="text-sm text-green-600 dark:text-green-500">Image file is attached to this announcement</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {viewDetailsAnnouncement.has_file && (
                          <div className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-medium text-blue-700 dark:text-blue-400">Document Attached</p>
                                <p className="text-sm text-blue-600 dark:text-blue-500">Document file is attached to this announcement</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-black/50 dark:text-white/50">
                          File URLs are not available for preview at this time
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 text-center">
                  <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-black dark:text-white">{viewDetailsAnnouncement.views_count.toLocaleString()}</div>
                  <div className="text-sm text-black/60 dark:text-white/60">Views</div>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 text-center">
                  <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-black dark:text-white">{viewDetailsAnnouncement.likes_count}</div>
                  <div className="text-sm text-black/60 dark:text-white/60">Likes</div>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 text-center">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-black dark:text-white">{viewDetailsAnnouncement.comments_count}</div>
                  <div className="text-sm text-black/60 dark:text-white/60">Comments</div>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 text-center">
                  <PieChart className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-black dark:text-white">{viewDetailsAnnouncement.engagement_rate || 0}%</div>
                  <div className="text-sm text-black/60 dark:text-white/60">Engagement</div>
                </div>
              </div>

              {/* Schedule Info */}
              {viewDetailsAnnouncement.scheduled_at && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-black dark:text-white">Scheduled Publication</span>
                  </div>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    This announcement was scheduled to be published on {new Date(viewDetailsAnnouncement.scheduled_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDetailsDialogOpen(false)}
              className="border-black/10 dark:border-white/10 text-black dark:text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AnnouncementCard({
  announcement,
  onPin,
  onDelete,
  onViewDetails,
  onEdit,
  isPinned,
  isSelected,
  onSelect,
}: {
  announcement: any
  onPin: (id: number) => void
  onDelete: (id: number) => void
  onViewDetails: (announcement: any) => void
  onEdit: (announcement: any) => void
  isPinned: boolean
  isSelected: boolean
  onSelect: (id: number) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(announcement.likes_count || 0)
  const [isTogglingLike, setIsTogglingLike] = useState(false)
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-4 w-4" />
      case "event":
        return <Calendar className="h-4 w-4" />
      case "info":
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30"
      case "event":
        return "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/30"
      case "info":
      default:
        return "bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/30"
    }
  }

  // Load like status on component mount
  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        const response = await announcementAPI.getLikeStatus(announcement.id)
        setLiked(response.liked)
        setLikesCount(response.likes_count)
      } catch (error) {
        console.error('Failed to load like status:', error)
      }
    }
    loadLikeStatus()
  }, [announcement.id])

  // Load comments when showing comments
  const loadComments = async () => {
    if (isLoadingComments) return
    
    setIsLoadingComments(true)
    try {
      const response = await announcementAPI.getComments(announcement.id)
      setComments(response.comments)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  // Toggle comments visibility
  const toggleComments = () => {
    if (!showComments) {
      loadComments()
    }
    setShowComments(!showComments)
  }

  // Handle like toggle
  const handleLikeToggle = async () => {
    if (isTogglingLike) return
    
    setIsTogglingLike(true)
    try {
      const response = await announcementAPI.toggleLike(announcement.id)
      setLiked(response.liked)
      setLikesCount(response.likes_count)
    } catch (error) {
      console.error('Failed to toggle like:', error)
      alert('Failed to update like. Please try again.')
    } finally {
      setIsTogglingLike(false)
    }
  }

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isSubmittingComment) return
    
    setIsSubmittingComment(true)
    try {
      const comment = await announcementAPI.addComment(announcement.id, newComment.trim())
      setComments(prev => [...prev, comment])
      setNewComment("")
      // You could add a toast notification here for success
    } catch (error) {
      console.error('Failed to add comment:', error)
      // You could add a toast notification here for error
      alert('Failed to add comment. Please try again.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Handle comment form submission
  const handleCommentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCommentSubmit()
    }
  }

  return (
    <Card
      className={cn(
        "p-6 border shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-black",
        isPinned ? "border-orange-500/30 bg-orange-500/5 dark:bg-orange-500/5" : "border-black/10 dark:border-white/10",
        isSelected && "ring-2 ring-orange-500/50",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(announcement.id)}
            className="mt-1 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
          />
          <Avatar className="h-10 w-10 border-2 border-black/10 dark:border-white/10">
            <AvatarImage src={getMediaUrl(announcement.author_avatar) || "/placeholder.svg"} alt={announcement.author} />
            <AvatarFallback className="bg-orange-500/10 text-orange-500 dark:text-orange-400">
              {announcement.author
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-black dark:text-white">{announcement.title}</h3>
              {isPinned && <Pin className="h-4 w-4 text-orange-500 fill-current" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
              <span>{announcement.author}</span>
              <span>•</span>
              <span>{announcement.time_ago}</span>
              <Badge className={getTypeBadge(announcement.announcement_type)}>
                {getTypeIcon(announcement.announcement_type)}
                <span className="ml-1 capitalize">{announcement.announcement_type}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-black/50 dark:text-white/50">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-black">
            <DropdownMenuItem className="cursor-pointer" onClick={() => onViewDetails(announcement)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(announcement)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onPin(announcement.id)}>
              {isPinned ? (
                <>
                  <PinOff className="h-4 w-4 mr-2" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4 mr-2" />
                  Pin
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-500 dark:text-red-400"
              onClick={() => onDelete(announcement.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="mb-4 ml-16">
        <p className="text-black/70 dark:text-white/70 line-clamp-3">{announcement.content}</p>
      </div>

      {/* Attachments */}
      {(announcement.has_image || announcement.has_file) && (
        <div className="flex gap-2 mb-4 ml-16">
          {announcement.has_image && (
            <div className="flex items-center gap-1 text-sm text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
              <ImageIcon className="h-3 w-3" />
              Image
            </div>
          )}
          {announcement.has_file && (
            <div className="flex items-center gap-1 text-sm text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
              <FileText className="h-3 w-3" />
              Document
            </div>
          )}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10 ml-16">
        <div className="flex items-center gap-4 text-sm text-black/60 dark:text-white/60">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer hover:text-black dark:hover:text-white">
                  <Eye className="h-4 w-4" />
                  <span>{announcement.views_count.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Views</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleLikeToggle}
                  disabled={isTogglingLike}
                  className={cn(
                    "flex items-center gap-1 cursor-pointer transition-colors",
                    liked ? "text-red-500" : "hover:text-red-500",
                    isTogglingLike && "opacity-50"
                  )}
                >
                  <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                  <span>{likesCount}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{liked ? 'Unlike' : 'Like'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={toggleComments}
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length || announcement.comments_count}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showComments ? 'Hide Comments' : 'Show Comments'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-black/50 dark:text-white/50">Engagement: {announcement.engagement_rate || 0}%</span>
          <div className="w-16 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-300"
              style={{ width: `${announcement.engagement_rate || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 ml-16">
          {/* Comment Input */}
          <div className="mb-4">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 border border-black/10 dark:border-white/10">
                <AvatarFallback className="bg-orange-500/10 text-orange-500 dark:text-orange-400 text-xs">
                  You
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleCommentKeyPress}
                  className="min-h-[80px] bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || isSubmittingComment}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isSubmittingComment ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="ml-2">Comment</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
                <span className="ml-2 text-sm text-black/60 dark:text-white/60">Loading comments...</span>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-black/10 dark:border-white/10">
                    <AvatarImage 
                      src={getMediaUrl(comment.user.profile_picture) || "/placeholder.svg"} 
                      alt={comment.user.username} 
                    />
                    <AvatarFallback className="bg-orange-500/10 text-orange-500 dark:text-orange-400 text-xs">
                      {comment.user.first_name?.[0] || comment.user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-black dark:text-white">
                          {comment.user.first_name && comment.user.last_name 
                            ? `${comment.user.first_name} ${comment.user.last_name}`
                            : comment.user.username
                          }
                        </span>
                        {comment.is_author && (
                          <Badge 
                            variant="outline" 
                            className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-xs px-2 py-0"
                          >
                            Author
                          </Badge>
                        )}
                        <span className="text-xs text-black/50 dark:text-white/50">
                          {comment.time_ago}
                        </span>
                      </div>
                      <p className="text-sm text-black/70 dark:text-white/70">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-black/30 dark:text-white/30" />
                <p className="text-sm text-black/60 dark:text-white/60">No comments yet</p>
                <p className="text-xs text-black/40 dark:text-white/40">Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
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
