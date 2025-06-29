"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  HelpCircle,
  Download,
  CheckCircle,
  ArrowUpDown,
  MapPin,
  Clock,
  UserPlus,
  Upload,
  AlertCircle,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { format, parseISO, isBefore, startOfToday } from "date-fns"
import { eventService } from "../../../src/services/eventService"
import type { Event, EventType, EventParticipant } from "../../../src/services/eventService"
import { Switch } from "@/components/ui/switch"

interface EventFormData {
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  status: 'Upcoming' | 'Full' | 'Past' | 'Cancelled';
  is_published: boolean;
}

interface ExportEventData {
  ID: string;
  Title: string;
  Type: string;
  Description: string;
  'Start Date': string;
  'Start Time': string;
  'End Date': string;
  'End Time': string;
  Location: string;
  Capacity: string;
  Status: string;
  Registered: string;
  Interested: string;
  Attended: string;
  'Created Date': string;
  Published: string;
}

export default function EventsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("title")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<any>(null)
  const [viewingEvent, setViewingEvent] = useState<any>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    capacityMin: "",
    capacityMax: "",
  })
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false)
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [participantsError, setParticipantsError] = useState<string | null>(null)

  const router = useRouter()
  const itemsPerPage = 8
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch events and event types on component mount
  useEffect(() => {
    fetchEvents()
    fetchEventTypes()
    fetchProfile()
  }, [])

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('http://localhost:8000/api/users/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (response.status === 401) {
        localStorage.removeItem('access_token')
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchEvents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await eventService.getEvents()
      setEvents(data)
    } catch (err) {
      setError("Failed to fetch events")
      console.error("Error fetching events:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEventTypes = async () => {
    try {
      const types = await eventService.getEventTypes()
      setEventTypes(types)
    } catch (err) {
      console.error("Error fetching event types:", err)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page on new search
  }

  // Handle type filter change
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1) // Reset to first page on new filter
    fetchEvents() // Refetch events with new filter
  }

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page on new filter
    fetchEvents() // Refetch events with new filter
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    fetchEvents() // Refetch events with new sort
  }

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(events.map((event) => event.id))
    }
    setIsAllSelected(!isAllSelected)
  }

  // Handle checkbox selection
  const handleSelectEvent = (eventId: number) => {
    setSelectedEvents((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId)
      } else {
        return [...prev, eventId]
      }
    })
  }

  // Handle bulk cancel
  const handleBulkCancel = () => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (selectedEvents.includes(event.id)) {
          return { ...event, status: "Cancelled" }
        }
        return event
      }),
    )
    setSelectedEvents([])
    setIsAllSelected(false)
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      // Delete each selected event
      await Promise.all(selectedEvents.map(eventId => eventService.deleteEvent(eventId)))
      setEvents(prevEvents => prevEvents.filter(event => !selectedEvents.includes(event.id)))
      setSelectedEvents([])
      setIsAllSelected(false)
    } catch (err) {
      console.error('Error deleting events:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete events')
    }
  }

  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setEditingEvent({ ...event })
    setIsEditDialogOpen(true)
  }

  // Handle save edited event
  const handleSaveEvent = async (formData: FormData) => {
    try {
      if (!editingEvent) {
        throw new Error('No event selected for editing');
      }

      // Ensure all required fields are present
      const requiredFields = ['title', 'description', 'type', 'start_date', 'end_date', 'start_time', 'end_time', 'location', 'capacity'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`${field} is required`);
        }
      }

      // Convert capacity to number
      const capacity = formData.get('capacity');
      if (capacity) {
        const capacityNum = parseInt(capacity.toString(), 10);
        if (isNaN(capacityNum) || capacityNum <= 0) {
          throw new Error('Capacity must be a positive number');
        }
        formData.set('capacity', capacityNum.toString());
      }

      // Ensure status is set
      if (!formData.get('status')) {
        formData.set('status', 'Upcoming');
      }

      // Ensure is_published is set
      if (!formData.has('is_published')) {
        formData.set('is_published', 'true');
      }

      // Log form data for debugging
      console.log('Submitting form data:', Object.fromEntries(formData.entries()));

      const updatedEvent = await eventService.updateEvent(editingEvent.id, formData);
      
      // Update the events list with the updated event
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      
      // Close the edit dialog
      setIsEditDialogOpen(false);
      setEditingEvent(null);
    } catch (err) {
      console.error('Error updating event:', err);
      alert(err instanceof Error ? err.message : 'Failed to update event');
    }
  }

  // Handle delete event
  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete event
  const confirmDeleteEvent = async () => {
    try {
      if (!eventToDelete) return
      
      await eventService.deleteEvent(eventToDelete.id)
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventToDelete.id))
      setIsDeleteDialogOpen(false)
      setEventToDelete(null)
    } catch (err) {
      console.error('Error deleting event:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete event')
    }
  }

  // Handle view event details
  const handleViewEvent = (event: any) => {
    setViewingEvent(event)
    setIsProfileDialogOpen(true)
  }

  // Handle create event
  const handleCreateEvent = async (formData: FormData) => {
    try {
      const newEvent = await eventService.createEvent(formData)
      setEvents(prevEvents => [...prevEvents, newEvent])
      setIsCreateDialogOpen(false)
    } catch (err) {
      console.error('Error creating event:', err)
      alert(err instanceof Error ? err.message : 'Failed to create event')
    }
  }

  // Filter events based on search query and filters
  const filteredEvents = events.filter((event) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.id.toString().includes(searchQuery.toLowerCase())

    // Type filter
    const matchesType = typeFilter === "all" || event.type === typeFilter

    // Status filter
    const matchesStatus = statusFilter === "all" || event.status === statusFilter

    // Advanced filters
    const matchesDateFrom = !advancedFilters.dateFrom || new Date(event.start_date) >= new Date(advancedFilters.dateFrom)
    const matchesDateTo = !advancedFilters.dateTo || new Date(event.end_date) <= new Date(advancedFilters.dateTo)
    
    // Capacity filters
    const matchesCapacityMin = !advancedFilters.capacityMin || event.capacity >= parseInt(advancedFilters.capacityMin)
    const matchesCapacityMax = !advancedFilters.capacityMax || event.capacity <= parseInt(advancedFilters.capacityMax)

    return matchesSearch && matchesType && matchesStatus && 
           matchesDateFrom && matchesDateTo && matchesCapacityMin && matchesCapacityMax
  })

  // Sort filtered events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1
    
    switch (sortField) {
      case "title":
        return direction * a.title.localeCompare(b.title)
      case "type":
        return direction * a.type.localeCompare(b.type)
      case "date":
        return direction * (new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      case "status":
        return direction * a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = sortedEvents.slice(startIndex, startIndex + itemsPerPage)

  // Calculate event statistics based on filtered events
  const totalEvents = sortedEvents.length
  const upcomingEvents = sortedEvents.filter((event) => event.status === "Upcoming").length
  const totalRegistrations = sortedEvents.reduce((sum, event) => sum + event.registered, 0)

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (name: string, value: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setCurrentPage(1) // Reset to first page on filter change
  }

  // Handle reset advanced filters
  const handleResetAdvancedFilters = () => {
    setAdvancedFilters({
      dateFrom: "",
      dateTo: "",
      capacityMin: "",
      capacityMax: "",
    })
    setCurrentPage(1)
  }

  // Update the exportEvents function
  const exportEvents = async () => {
    try {
      // Show loading state
      const exportButton = document.querySelector('button[onClick="exportEvents"]');
      if (exportButton) {
        exportButton.setAttribute('disabled', 'true');
        exportButton.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Exporting...';
      }

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Make the API request
      const response = await fetch('/api/events/export/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies if any
      });
      
      // Log response details for debugging
      console.log('Export response status:', response.status);
      console.log('Export response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Export error details:', errorData);
        throw new Error(`Failed to export events: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as ExportEventData[];
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No event data received');
      }
      
      // Convert data to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row: ExportEventData) => headers.map(header => `"${row[header as keyof ExportEventData]}"`).join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `events_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert('Events exported successfully!');
    } catch (error) {
      console.error('Error exporting events:', error);
      alert(error instanceof Error ? error.message : 'Failed to export events. Please try again.');
    } finally {
      // Reset button state
      const exportButton = document.querySelector('button[onClick="exportEvents"]');
      if (exportButton) {
        exportButton.removeAttribute('disabled');
        exportButton.innerHTML = '<Download className="h-4 w-4 mr-2" /> Export';
      }
    }
  };

  const handleManageParticipants = async (event: Event) => {
    try {
      setLoadingParticipants(true);
      setParticipantsError(null);
      const data = await eventService.getEventParticipants(event.id);
      setParticipants(data);
      setIsParticipantsDialogOpen(true);
    } catch (error) {
      setParticipantsError('Failed to load participants. Please try again.');
      console.error('Error loading participants:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  if (!mounted) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-white-100 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-black dark:text-white">Loading events...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-white-100 dark:bg-black">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-black dark:text-white">{error}</p>
          <Button 
            onClick={fetchEvents}
            className="mt-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
          >
            Try Again
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
                  src={profile?.profile_picture ? 
                    (profile.profile_picture.startsWith('http') ? 
                      profile.profile_picture : 
                      `${process.env.NEXT_PUBLIC_API_URL}${profile.profile_picture}`) 
                    : "/placeholder.svg?height=40&width=40"} 
                  alt={profile?.name || "Admin User"}
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
            <SidebarItem icon={Calendar} label="Events" active href="/dashboard-admin/events" />
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
              <h1 className="text-xl font-bold text-black dark:text-white">Event Management</h1>
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

        {/* Events Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {/* Event Statistics */}
            <section className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-orange-500/10 mr-4">
                        <Calendar className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-black/60 dark:text-white/60">Total Events</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{totalEvents}</p>
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
                      <div className="p-2 rounded-full bg-green-500/10 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-black/60 dark:text-white/60">Upcoming Events</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{upcomingEvents}</p>
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
                      <div className="p-2 rounded-full bg-[#6262cf]/10 mr-4">
                        <UserPlus className="h-6 w-6 text-[#6262cf] dark:text-[#9b9bff]" />
                      </div>
                      <div>
                        <p className="text-sm text-black/60 dark:text-white/60">Total Registrations</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{totalRegistrations}</p>
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
                          placeholder="Search by title, description, location, or ID..."
                          className="w-full pl-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                          value={searchQuery}
                          onChange={handleSearchChange}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="w-40">
                        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                          <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {eventTypes.map((type) => (
                              <SelectItem key={type.id} value={type.name}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-40">
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                          <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                            <SelectItem value="Full">Full</SelectItem>
                            <SelectItem value="Past">Past</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-black/10 dark:border-white/10">
                            <Filter className="h-4 w-4 mr-2" />
                            More Filters
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-black">
                          <DialogHeader>
                            <DialogTitle className="text-black dark:text-white">Advanced Filters</DialogTitle>
                            <DialogDescription className="text-black/60 dark:text-white/60">
                              Filter events by multiple criteria
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="event-date" className="text-black dark:text-white">
                                Date Range
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  id="event-date-from"
                                  type="date"
                                  placeholder="From"
                                  value={advancedFilters.dateFrom}
                                  onChange={(e) => handleAdvancedFilterChange("dateFrom", e.target.value)}
                                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                />
                                <Input
                                  id="event-date-to"
                                  type="date"
                                  placeholder="To"
                                  value={advancedFilters.dateTo}
                                  onChange={(e) => handleAdvancedFilterChange("dateTo", e.target.value)}
                                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="capacity-range" className="text-black dark:text-white">
                                Capacity Range
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  id="capacity-min"
                                  type="number"
                                  min="0"
                                  placeholder="Min capacity"
                                  value={advancedFilters.capacityMin}
                                  onChange={(e) => handleAdvancedFilterChange("capacityMin", e.target.value)}
                                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                />
                                <Input
                                  id="capacity-max"
                                  type="number"
                                  min="0"
                                  placeholder="Max capacity"
                                  value={advancedFilters.capacityMax}
                                  onChange={(e) => handleAdvancedFilterChange("capacityMax", e.target.value)}
                                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              className="border-black/10 dark:border-white/10"
                              onClick={handleResetAdvancedFilters}
                            >
                              Reset
                            </Button>
                            <DialogClose asChild>
                              <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
                                Apply Filters
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" className="border-black/10 dark:border-white/10" onClick={exportEvents}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Event
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-black max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-black dark:text-white">Create New Event</DialogTitle>
                            <DialogDescription className="text-black/60 dark:text-white/60">
                              Fill in the details to create a new event
                            </DialogDescription>
                          </DialogHeader>
                          <EventForm onSubmit={handleCreateEvent} onCancel={() => setIsCreateDialogOpen(false)} eventTypes={eventTypes} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Events Table */}
            <section className="mb-6">
              <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                        <th className="p-3 text-left">
                          <div className="flex items-center">
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                              className="mr-2 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />
                          </div>
                        </th>
                        <th className="p-3 text-left">
                          <button
                            className="flex items-center text-sm font-medium text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                            onClick={() => handleSortChange("title")}
                          >
                            Event
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </button>
                        </th>
                        <th className="p-3 text-left">
                          <button
                            className="flex items-center text-sm font-medium text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                            onClick={() => handleSortChange("type")}
                          >
                            Type
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </button>
                        </th>
                        <th className="p-3 text-left">
                          <button
                            className="flex items-center text-sm font-medium text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                            onClick={() => handleSortChange("date")}
                          >
                            Start Date & Time
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </button>
                        </th>
                        <th className="p-3 text-left">
                          <button
                            className="flex items-center text-sm font-medium text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                            onClick={() => handleSortChange("date")}
                          >
                            End Date & Time
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </button>
                        </th>
                        <th className="p-3 text-left">
                          <button
                            className="flex items-center text-sm font-medium text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                            onClick={() => handleSortChange("status")}
                          >
                            Status
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </button>
                        </th>
                        <th className="p-3 text-left">
                          <span className="text-sm font-medium text-black dark:text-white">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEvents.length > 0 ? (
                        paginatedEvents.map((event) => (
                          <tr
                            key={event.id}
                            className="border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="p-3">
                              <Checkbox
                                checked={selectedEvents.includes(event.id)}
                                onCheckedChange={() => handleSelectEvent(event.id)}
                                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <div className="h-10 w-16 mr-3 rounded-md overflow-hidden bg-black/5 dark:bg-white/5">
                                  <img
                                    src={event.image || "/placeholder.svg"}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "/placeholder.svg";
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-black dark:text-white">{event.title}</p>
                                  <p className="text-xs text-black/60 dark:text-white/60">ID: {event.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge
                                className={
                                  event.type === "Hackathon"
                                    ? "bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff] border-[#6262cf]/30"
                                    : event.type === "Workshop"
                                      ? "bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/30"
                                      : event.type === "Volunteering"
                                        ? "bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/30"
                                        : "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/30"
                                }
                              >
                                {event.type}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="text-sm font-medium text-black dark:text-white">
                                  {format(parseISO(event.start_date), "MMM d, yyyy")}
                                </p>
                                <p className="text-xs text-black/60 dark:text-white/60">
                                  {event.start_time.substring(0, 5)}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="text-sm font-medium text-black dark:text-white">
                                  {format(parseISO(event.end_date), "MMM d, yyyy")}
                                </p>
                                <p className="text-xs text-black/60 dark:text-white/60">
                                  {event.end_time.substring(0, 5)}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge
                                className={
                                  event.status === "Upcoming"
                                    ? "bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/30"
                                    : event.status === "Full"
                                      ? "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30"
                                      : "bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/30"
                                }
                              >
                                {event.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                                        onClick={() => handleViewEvent(event)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View Details</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                                        onClick={() => handleEditEvent(event)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit Event</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                                        onClick={() => handleDeleteEvent(event)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete Event</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-black/60 dark:text-white/60">
                            <div className="flex flex-col items-center">
                              <Calendar className="h-12 w-12 text-black/30 dark:text-white/30 mb-2" />
                              <p className="text-lg font-medium text-black/70 dark:text-white/70 mb-1">
                                No events found
                              </p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination and Bulk Actions */}
                <div className="p-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center">
                    {selectedEvents.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-black/70 dark:text-white/70">
                          {selectedEvents.length} selected
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-black/10 dark:border-white/10"
                          onClick={handleBulkCancel}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Cancel Events
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white dark:bg-black">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-black dark:text-white">
                                Delete Selected Events
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-black/60 dark:text-white/60">
                                Are you sure you want to delete {selectedEvents.length} selected events? This action
                                cannot be undone.
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
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-black/60 dark:text-white/60">
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEvents.length)} of{" "}
                      {filteredEvents.length}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-black/10 dark:border-white/10"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
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
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-black/10 dark:border-white/10"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </main>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="bg-white dark:bg-black max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Event Details</DialogTitle>
            <DialogDescription className="text-black/60 dark:text-white/60">
              Detailed information about the event
            </DialogDescription>
          </DialogHeader>
          {viewingEvent && (
            <div className="py-4">
              <div className="space-y-6">
                {/* Event Image */}
                <div className="relative w-full aspect-video overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
                  <img
                    src={viewingEvent.image || "/placeholder.svg"}
                    alt={viewingEvent.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>

                {/* Event Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{viewingEvent.title}</h3>
                    <p className="text-sm text-black/60 dark:text-white/60 mb-4">{viewingEvent.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-black/50 dark:text-white/50" />
                        <span className="text-sm text-black dark:text-white">
                          {format(parseISO(viewingEvent.date), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-black/50 dark:text-white/50" />
                        <span className="text-sm text-black dark:text-white">
                          {viewingEvent.time} - {viewingEvent.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-black/50 dark:text-white/50" />
                        <span className="text-sm text-black dark:text-white">{viewingEvent.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-black/50 dark:text-white/50">EVENT ID</p>
                        <p className="text-sm font-medium text-black dark:text-white">{viewingEvent.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-black/50 dark:text-white/50">TYPE</p>
                        <Badge
                          className={
                            viewingEvent.type === "Hackathon"
                              ? "bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff] border-[#6262cf]/30"
                              : "bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/30"
                          }
                        >
                          {viewingEvent.type}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-black/50 dark:text-white/50">STATUS</p>
                        <Badge
                          className={
                            viewingEvent.status === "Upcoming"
                              ? "bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/30"
                              : viewingEvent.status === "Full"
                                ? "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30"
                                : "bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/30"
                          }
                        >
                          {viewingEvent.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-black/50 dark:text-white/50">CREATED</p>
                        <p className="text-sm font-medium text-black dark:text-white">{viewingEvent.createdDate}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-black/50 dark:text-white/50 mb-2">REGISTRATION PROGRESS</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-black dark:text-white">
                            {viewingEvent.registered} / {viewingEvent.capacity} registered
                          </span>
                          <span className="text-black/60 dark:text-white/60">
                            {Math.round((viewingEvent.registered / viewingEvent.capacity) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-300"
                            style={{ width: `${(viewingEvent.registered / viewingEvent.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {viewingEvent && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black/10 dark:border-white/10"
                    onClick={() => {
                      setIsProfileDialogOpen(false)
                      handleEditEvent(viewingEvent)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-black/10 dark:border-white/10"
                    onClick={() => {
                      setIsProfileDialogOpen(false);
                      handleManageParticipants(viewingEvent);
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Participants
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="default"
              onClick={() => setIsProfileDialogOpen(false)}
              className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-black max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Edit Event</DialogTitle>
            <DialogDescription className="text-black/60 dark:text-white/60">
              Make changes to the event details
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <EventForm event={editingEvent} onSubmit={handleSaveEvent} onCancel={() => setIsEditDialogOpen(false)} eventTypes={eventTypes} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black dark:text-white">Delete Event</AlertDialogTitle>
            <AlertDialogDescription className="text-black/60 dark:text-white/60">
              Are you sure you want to delete this event? This action cannot be undone and will affect all registered
              participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black/10 dark:border-white/10 text-black dark:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDeleteEvent}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Participants Dialog */}
      <Dialog open={isParticipantsDialogOpen} onOpenChange={setIsParticipantsDialogOpen}>
        <DialogContent className="bg-white dark:bg-black max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Event Participants</DialogTitle>
            <DialogDescription className="text-black/60 dark:text-white/60">
              Manage participants for this event
            </DialogDescription>
          </DialogHeader>
          
          {loadingParticipants ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : participantsError ? (
            <div className="text-red-500 text-center py-4">{participantsError}</div>
          ) : (
            <div className="py-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-black/60 dark:text-white/60">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-black/60 dark:text-white/60">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-black/60 dark:text-white/60">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id} className="border-b border-black/10 dark:border-white/10">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-orange-500">
                                {participant.first_name[0]}{participant.last_name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-black dark:text-white">
                                {participant.first_name} {participant.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-black dark:text-white">{participant.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              participant.status === 'REGISTERED'
                                ? 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/30'
                                : participant.status === 'INTERESTED'
                                ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/30'
                                : participant.status === 'ATTENDED'
                                ? 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/30'
                                : 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/30'
                            }
                          >
                            {participant.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => setIsParticipantsDialogOpen(false)}
              className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Event Form Component
const EventForm = ({
  event = null,
  onSubmit,
  onCancel,
  eventTypes,
}: {
  event?: Event | null
  onSubmit: (data: FormData) => void
  onCancel: () => void
  eventTypes: EventType[]
}) => {
  const formatTime = (time: string) => {
    if (!time) return "";
    // If time includes seconds, remove them
    return time.split(':').slice(0, 2).join(':');
  };

  const [formData, setFormData] = useState<Partial<EventFormData>>({
    title: event?.title || "",
    type: event?.type || "",
    description: event?.description || "",
    location: event?.location || "",
    status: (event?.status || "Upcoming") as EventFormData['status'],
    capacity: event?.capacity || 0,
    is_published: event?.is_published ?? true,
    start_date: event?.start_date ? new Date(event.start_date).toISOString().split('T')[0] : "",
    end_date: event?.end_date ? new Date(event.end_date).toISOString().split('T')[0] : "",
    start_time: formatTime(event?.start_time || ""),
    end_time: formatTime(event?.end_time || ""),
  })

  const [syncDates, setSyncDates] = useState(false)
  const [imagePreview, setImagePreview] = useState(event?.image || "/placeholder.svg?height=200&width=400")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: Partial<EventFormData>) => {
      const newData = { ...prev, [name]: value }
      
      // If syncDates is true and start_date is changed, update end_date
      if (syncDates && name === 'start_date') {
        newData.end_date = value
      }
      
      return newData
    })
  }

  const handleSyncDatesChange = (checked: boolean) => {
    setSyncDates(checked)
    if (checked) {
      // If no start date is set, use today's date
      const today = new Date().toISOString().split('T')[0]
      setFormData((prev: Partial<EventFormData>) => ({
        ...prev,
        start_date: prev.start_date || today,
        end_date: prev.start_date || today
      }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const imageUrl = URL.createObjectURL(file)
      setImagePreview(imageUrl)
    }
  }

  const handleStatusChange = (value: EventFormData['status']) => {
    setFormData((prev: Partial<EventFormData>) => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.start_date || 
          !formData.end_date || !formData.start_time || !formData.end_time || 
          !formData.location || !formData.capacity) {
        throw new Error('Please fill in all required fields')
      }

      // Create FormData object to handle file upload
      const formDataObj = new FormData()
      
      // Add all required fields
      formDataObj.append('title', formData.title)
      formDataObj.append('description', formData.description)
      formDataObj.append('type', formData.type || eventTypes[0]?.name || '')
      formDataObj.append('start_date', formData.start_date)
      formDataObj.append('end_date', formData.end_date)
      
      // Format time values to HH:MM format
      const formatTime = (time: string) => {
        // If time includes seconds, remove them
        return time.split(':').slice(0, 2).join(':')
      }
      
      formDataObj.append('start_time', formatTime(formData.start_time))
      formDataObj.append('end_time', formatTime(formData.end_time))
      formDataObj.append('location', formData.location)
      
      // Ensure capacity is converted to a number and then to string
      const capacity = parseInt(formData.capacity.toString(), 10)
      if (isNaN(capacity) || capacity <= 0) {
        throw new Error('Capacity must be a positive number')
      }
      formDataObj.append('capacity', capacity.toString())
      
      // Add optional fields
      if (selectedImage) {
        formDataObj.append('image', selectedImage)
      }
      formDataObj.append('status', formData.status || 'Upcoming')
      
      // Convert boolean to proper string value for Django
      formDataObj.append('is_published', formData.is_published ? 'True' : 'False')
      
      // Call the onSubmit handler with the FormData
      await onSubmit(formDataObj)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit form')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Image and Basic Info */}
        <div className="col-span-4 space-y-6">
          {/* Event Image */}
          <div className="space-y-2">
            <Label className="text-black dark:text-white">Event Image</Label>
            <div className="flex flex-col items-center space-y-3 border-2 border-dashed rounded-lg p-4 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
              <div className="relative w-full aspect-video overflow-hidden rounded-md bg-black/10 dark:bg-white/10">
                <img 
                  src={imagePreview || "/placeholder.svg"} 
                  alt="Event preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 border-black/10 dark:border-white/10"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Image</span>
                </Button>
                <p className="text-xs text-black/60 dark:text-white/60">Recommended size: 1200×600px. Max size: 2MB</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-black dark:text-white">
                Event Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-black dark:text-white">
                Event Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-black dark:text-white">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                required
              />
            </div>
          </div>
        </div>

        {/* Right Column - Description and Additional Settings */}
        <div className="col-span-8 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-black dark:text-white">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 h-32"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-black dark:text-white">
                Start Date
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-black dark:text-white">
                End Date
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                required
                disabled={syncDates}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-black dark:text-white">
                Start Time
              </Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-black dark:text-white">
                End Time
              </Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                required
              />
            </div>
          </div>

          {/* Sync Dates Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="sync-dates"
              checked={syncDates}
              onCheckedChange={handleSyncDatesChange}
            />
            <Label htmlFor="sync-dates" className="text-black dark:text-white">
              Use same date for start and end
            </Label>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-black dark:text-white">
                Capacity
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Enter maximum capacity"
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-black dark:text-white">
                Status
              </Label>
              <Select
                value={formData.status as EventFormData['status']}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Past">Past</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_published: checked as boolean })
              }
            />
            <Label htmlFor="is_published" className="text-black dark:text-white">
              Publish Event
            </Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} className="border-black/10 dark:border-white/10">
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
          {event ? "Update Event" : "Create Event"}
        </Button>
      </DialogFooter>
    </form>
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
