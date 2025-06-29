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
  Lock,
  Unlock,
  UserPlus,
  RefreshCw,
  HelpCircle,
  Download,
  CheckCircle,
  ArrowUpDown,
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
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Add type declaration for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [viewingUser, setViewingUser] = useState<any>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responseModal, setResponseModal] = useState<{ isOpen: boolean; data: any }>({ isOpen: false, data: null })
  const addUserFormRef = useRef<HTMLFormElement>(null)
  const [profile, setProfile] = useState<any>(null)

  // Add new state variables for advanced filters
  const [joinDateFrom, setJoinDateFrom] = useState<string>("")
  const [joinDateTo, setJoinDateTo] = useState<string>("")
  const [lastActivityFilter, setLastActivityFilter] = useState<string>("any")

  const router = useRouter()
  const itemsPerPage = 8

  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminProfile = async () => {
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

    fetchAdminProfile()
  }, [router])

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('access_token')
        
        if (!token) {
          router.push('/login')
          return
        }

        console.log('Fetching users...') // Debug log
        
        // Build query parameters for advanced filters
        const queryParams = new URLSearchParams()
        if (joinDateFrom) queryParams.append('join_date_from', joinDateFrom)
        if (joinDateTo) queryParams.append('join_date_to', joinDateTo)
        if (lastActivityFilter !== 'any') queryParams.append('last_activity', lastActivityFilter)
        
        const url = `http://localhost:8000/api/users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        })
        
        console.log('Response status:', response.status) // Debug log
        
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token')
          router.push('/login')
          return
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Received users data:', data) // Debug log
        setUsers(data)
        setError(null)
      } catch (err) {
        console.error('Error details:', err) // Debug log
        setError(err instanceof Error ? err.message : 'Failed to load users. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [router, joinDateFrom, joinDateTo, lastActivityFilter]) // Add filter dependencies

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page on new search
  }

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1) // Reset to first page on new filter
  }

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page on new filter
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle checkbox selection
  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
    setIsAllSelected(!isAllSelected)
  }

  // Handle bulk deactivate
  const handleBulkDeactivate = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      // Update each selected user
      for (const userId of selectedUsers) {
        const response = await fetch(`http://localhost:8000/api/users/${userId}/update/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            status: 'Inactive'
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to deactivate user ${userId}`)
        }
      }

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (selectedUsers.includes(user.id)) {
            return { ...user, status: "Inactive" }
          }
          return user
        })
      )

      setSelectedUsers([])
      setIsAllSelected(false)

      // Show success message
      setResponseModal({
        isOpen: true,
        data: {
          message: 'Selected users have been deactivated successfully'
        }
      })
    } catch (error) {
      console.error('Error deactivating users:', error)
      setResponseModal({
        isOpen: true,
        data: {
          message: error instanceof Error ? error.message : 'Failed to deactivate users'
        }
      })
    }
  }

  // Handle bulk activate
  const handleBulkActivate = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      // Update each selected user
      for (const userId of selectedUsers) {
        const response = await fetch(`http://localhost:8000/api/users/${userId}/update/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            status: 'Active'
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to activate user ${userId}`)
        }
      }

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (selectedUsers.includes(user.id)) {
            return { ...user, status: "Active" }
          }
          return user
        })
      )

      setSelectedUsers([])
      setIsAllSelected(false)

      // Show success message
      setResponseModal({
        isOpen: true,
        data: {
          message: 'Selected users have been activated successfully'
        }
      })
    } catch (error) {
      console.error('Error activating users:', error)
      setResponseModal({
        isOpen: true,
        data: {
          message: error instanceof Error ? error.message : 'Failed to activate users'
        }
      })
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      // Delete each selected user
      for (const userId of selectedUsers) {
        const response = await fetch(`http://localhost:8000/api/users/${userId}/delete/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to delete user ${userId}`)
        }
      }

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => !selectedUsers.includes(user.id)))
      setSelectedUsers([])
      setIsAllSelected(false)

      // Show success message
      setResponseModal({
        isOpen: true,
        data: {
          message: 'Selected users have been deleted successfully'
        }
      })
    } catch (error) {
      console.error('Error deleting users:', error)
      setResponseModal({
        isOpen: true,
        data: {
          message: error instanceof Error ? error.message : 'Failed to delete users'
        }
      })
    }
  }

  // Handle toggle user status
  const handleToggleStatus = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      // Get current user status
      const currentUser = users.find(user => user.id === userId)
      if (!currentUser) {
        throw new Error('User not found')
      }

      const newStatus = currentUser.status === 'Active' ? 'Inactive' : 'Active'

      const response = await fetch(`http://localhost:8000/api/users/${userId}/update/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      // Update the users list with the new status
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === userId) {
            return {
              ...user,
              status: newStatus
            }
          }
          return user
        })
      )

      // Show success message
      setResponseModal({
        isOpen: true,
        data: {
          message: `User status successfully updated to ${newStatus}`
        }
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      setResponseModal({
        isOpen: true,
        data: {
          message: error instanceof Error ? error.message : 'Failed to update user status'
        }
      })
    }
  }

  // Handle edit user
  const handleEditUser = (user: any) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  // Handle save edited user
  const handleSaveUser = async () => {
    if (editingUser) {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        // Format the data according to backend expectations
        const formattedData = {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role === 'Étudiant' ? 'STUDENT' : 
                editingUser.role === 'Membre BDE' ? 'BDE' : 
                editingUser.role === 'Administrateur' ? 'ADMIN' : 'STUDENT',
          status: editingUser.status === 'Active'
        }

        const response = await fetch(`http://localhost:8000/api/users/${editingUser.id}/update/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formattedData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        // Update the users list with the response data
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.id === editingUser.id) {
              const updatedUser = {
                ...user,
                name: `${data.user.first_name} ${data.user.last_name}`.trim(),
                email: data.user.email,
                role: data.user.role === 'STUDENT' ? 'Étudiant' :
                      data.user.role === 'BDE' ? 'Membre BDE' :
                      data.user.role === 'ADMIN' ? 'Administrateur' : 'Étudiant',
                status: data.user.is_active ? 'Active' : 'Inactive'
              }
              return updatedUser
            }
            return user
          })
        )
        setIsEditDialogOpen(false)
        setEditingUser(null)
      } catch (error) {
        console.error('Error updating user:', error)
        // You might want to show an error message to the user here
      }
    }
  }

  // Handle delete user
  const handleDeleteUser = (user: any) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  // Handle view user profile
  const handleViewProfile = (user: any) => {
    setViewingUser(user)
    setIsProfileDialogOpen(true)
  }

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          // Redirect to login if no token found
          router.push('/login')
          return
        }

        const response = await fetch(`http://localhost:8000/api/users/${userToDelete.id}/delete/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token')
          router.push('/login')
          return
        }

        const data = await response.json()

        // Remove the user from the local state
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id))
        setIsDeleteDialogOpen(false)
        setUserToDelete(null)

        // Show success message in modal
        setResponseModal({
          isOpen: true,
          data: {
            message: data.message || 'User deleted successfully'
          }
        })
      } catch (error) {
        console.error('Error deleting user:', error)
        setResponseModal({
          isOpen: true,
          data: {
            message: error instanceof Error ? error.message : 'Failed to delete user'
          }
        })
      }
    }
  }

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter

      // Add advanced filter logic
      const matchesJoinDate = !joinDateFrom || !joinDateTo || (
        new Date(user.joinDate) >= new Date(joinDateFrom) &&
        new Date(user.joinDate) <= new Date(joinDateTo)
      )

      const matchesLastActivity = lastActivityFilter === "any" || (
        lastActivityFilter === "today" && user.lastActive.includes("hour") ||
        lastActivityFilter === "week" && (user.lastActive.includes("day") && parseInt(user.lastActive) <= 7) ||
        lastActivityFilter === "month" && (user.lastActive.includes("day") && parseInt(user.lastActive) <= 30)
      )

      return matchesSearch && matchesRole && matchesStatus && matchesJoinDate && matchesLastActivity
    })
    .sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc" 
          ? (a.name || '').localeCompare(b.name || '') 
          : (b.name || '').localeCompare(a.name || '')
      } else if (sortField === "email") {
        return sortDirection === "asc" 
          ? (a.email || '').localeCompare(b.email || '') 
          : (b.email || '').localeCompare(a.email || '')
      } else if (sortField === "role") {
        return sortDirection === "asc" 
          ? (a.role || '').localeCompare(b.role || '') 
          : (b.role || '').localeCompare(a.role || '')
      } else if (sortField === "status") {
        return sortDirection === "asc" 
          ? (a.status || '').localeCompare(b.status || '') 
          : (b.status || '').localeCompare(a.status || '')
      }
      return 0
    })

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  // Calculate user statistics
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === "Active").length
  const bdeMembers = users.filter((user) => user.role === "Membre BDE").length

  // Handle add new user
  const handleAddUser = async (userData: any) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Format the data according to backend expectations
      const formattedData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role === 'Étudiant' ? 'STUDENT' : 
              userData.role === 'Membre BDE' ? 'BDE' : 
              userData.role === 'Administrateur' ? 'ADMIN' : 'STUDENT'
      }

      const response = await fetch('http://localhost:8000/api/users/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Add the new user to the local state with proper formatting
      const newUser = {
        id: data.user.id,
        name: `${data.user.first_name} ${data.user.last_name}`.trim(),
        email: data.user.email,
        role: data.user.role === 'STUDENT' ? 'Étudiant' :
              data.user.role === 'BDE' ? 'Membre BDE' :
              data.user.role === 'ADMIN' ? 'Administrateur' : 'Étudiant',
        status: 'Active',
        lastActive: 'Just now',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        avatar: "/placeholder.svg?height=40&width=40"
      }
      
      setUsers((prevUsers) => [...prevUsers, newUser])
      
      // Show success message
      setResponseModal({
        isOpen: true,
        data: {
          message: 'User created successfully'
        }
      })
      
      return true
    } catch (error) {
      console.error('Error creating user:', error)
      // Show error message
      setResponseModal({
        isOpen: true,
        data: {
          message: error instanceof Error ? error.message : 'Failed to create user'
        }
      })
      return false
    }
  }

  // Add function to reset advanced filters
  const resetAdvancedFilters = () => {
    setJoinDateFrom("")
    setJoinDateTo("")
    setLastActivityFilter("any")
  }

  // Add this function before the return statement
  const handleExportUsers = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('http://localhost:8000/api/users/export/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to export users')
      }

      const data = await response.json()

      // Create a new jsPDF instance with landscape orientation
      const doc = new jsPDF('landscape')

      // Define columns
      const columns = [
        { header: 'ID', dataKey: 'ID' },
        { header: 'Name', dataKey: 'Name' },
        { header: 'Email', dataKey: 'Email' },
        { header: 'Role', dataKey: 'Role' },
        { header: 'Join Date', dataKey: 'Join Date' },
        { header: 'Year of Study', dataKey: 'Year of Study' },
        { header: 'Major', dataKey: 'Major' },
        { header: 'Phone', dataKey: 'Phone' },
        { header: 'Location', dataKey: 'Location' }
      ]

      // Add the table using autoTable with adjusted settings for landscape
      autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: data.map((user: Record<string, string>) => columns.map(col => user[col.dataKey])),
        startY: 10,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [253, 126, 20], // Orange color
          textColor: 255,
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 20 }, // ID
          1: { cellWidth: 30 }, // Name
          2: { cellWidth: 40 }, // Email
          3: { cellWidth: 25 }, // Role
          4: { cellWidth: 25 }, // Join Date
          5: { cellWidth: 25 }, // Year of Study
          6: { cellWidth: 30 }, // Major
          7: { cellWidth: 25 }, // Phone
          8: { cellWidth: 30 }  // Location
        }
      })

      // Save the PDF
      doc.save('users-report.pdf')

      // Show success message
      setResponseModal({
        isOpen: true,
        data: {
          message: 'Users exported successfully'
        }
      })
    } catch (error) {
      console.error('Error exporting users:', error)
      setResponseModal({
        isOpen: true,
        data: {
          message: error instanceof Error ? error.message : 'Failed to export users'
        }
      })
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
          <p className="mt-4 text-black dark:text-white">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-white-100 dark:bg-black">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Retry
          </button>
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
            <SidebarItem icon={Users} label="Users" active href="/dashboard-admin/users" />
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
              <h1 className="text-xl font-bold text-black dark:text-white">User Management</h1>
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

        {/* Users Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {/* User Statistics */}
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
                        <Users className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-black/60 dark:text-white/60">Total Users</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{filteredUsers.length}</p>
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
                        <p className="text-sm text-black/60 dark:text-white/60">Active Users</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{filteredUsers.filter(user => user.status === "Active").length}</p>
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
                        <p className="text-sm text-black/60 dark:text-white/60">BDE Members</p>
                        <p className="text-2xl font-bold text-black dark:text-white">{filteredUsers.filter(user => user.role === "Membre BDE").length}</p>
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
                          placeholder="Search by name, email, or ID..."
                          className="w-full pl-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                          value={searchQuery}
                          onChange={handleSearchChange}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="w-40">
                        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                          <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Étudiant">Étudiant</SelectItem>
                            <SelectItem value="Membre BDE">Membre BDE</SelectItem>
                            <SelectItem value="Administrateur">Administrateur</SelectItem>
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
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
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
                              Filter users by multiple criteria
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="join-date" className="text-black dark:text-white">
                                Join Date
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  id="join-date-from"
                                  type="date"
                                  placeholder="From"
                                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                  value={joinDateFrom}
                                  onChange={(e) => setJoinDateFrom(e.target.value)}
                                />
                                <Input
                                  id="join-date-to"
                                  type="date"
                                  placeholder="To"
                                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                  value={joinDateTo}
                                  onChange={(e) => setJoinDateTo(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-black dark:text-white">Last Activity</Label>
                              <RadioGroup 
                                value={lastActivityFilter} 
                                onValueChange={setLastActivityFilter}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="any" id="any" />
                                  <Label htmlFor="any" className="text-black dark:text-white">
                                    Any time
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="today" id="today" />
                                  <Label htmlFor="today" className="text-black dark:text-white">
                                    Today
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="week" id="week" />
                                  <Label htmlFor="week" className="text-black dark:text-white">
                                    This week
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="month" id="month" />
                                  <Label htmlFor="month" className="text-black dark:text-white">
                                    This month
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              className="border-black/10 dark:border-white/10"
                              onClick={resetAdvancedFilters}
                            >
                              Reset
                            </Button>
                            <Button 
                              className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
                              onClick={() => {
                                // Close the dialog
                                const dialog = document.querySelector('[role="dialog"]')
                                if (dialog) {
                                  const closeButton = dialog.querySelector('button[aria-label="Close"]')
                                  if (closeButton) {
                                    (closeButton as HTMLButtonElement).click()
                                  }
                                }
                              }}
                            >
                              Apply Filters
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        className="border-black/10 dark:border-white/10"
                        onClick={handleExportUsers}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add User
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-black">
                          <DialogHeader>
                            <DialogTitle className="text-black dark:text-white">Add New User</DialogTitle>
                            <DialogDescription className="text-black/60 dark:text-white/60">
                              Fill in the details to create a new user account
                            </DialogDescription>
                          </DialogHeader>
                          <form ref={addUserFormRef} onSubmit={async (e) => {
                            e.preventDefault()
                            const formData = new FormData(e.currentTarget)
                            const userData = {
                              name: formData.get('name') as string,
                              email: formData.get('email') as string,
                              password: formData.get('password') as string,
                              role: formData.get('role') as string
                            }
                            
                            // Validate required fields
                            if (!userData.name || !userData.email || !userData.password || !userData.role) {
                              setResponseModal({
                                isOpen: true,
                                data: {
                                  message: 'Please fill in all required fields'
                                }
                              })
                              return
                            }
                            
                            // Validate email format
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                            if (!emailRegex.test(userData.email)) {
                              setResponseModal({
                                isOpen: true,
                                data: {
                                  message: 'Please enter a valid email address'
                                }
                              })
                              return
                            }
                            
                            // Validate password length
                            if (userData.password.length < 8) {
                              setResponseModal({
                                isOpen: true,
                                data: {
                                  message: 'Password must be at least 8 characters long'
                                }
                              })
                              return
                            }
                            
                            const success = await handleAddUser(userData)
                            if (success) {
                              addUserFormRef.current?.reset()
                              // Close the dialog
                              const dialog = document.querySelector('[role="dialog"]')
                              if (dialog) {
                                const closeButton = dialog.querySelector('button[aria-label="Close"]')
                                if (closeButton) {
                                  (closeButton as HTMLButtonElement).click()
                                }
                              }
                            }
                          }}>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="name" className="text-black dark:text-white">
                                  Full Name
                                </Label>
                                <Input
                                  id="name"
                                  name="name"
                                  placeholder="Enter full name"
                                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-black dark:text-white">
                                  Email
                                </Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  placeholder="Enter email address"
                                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="password" className="text-black dark:text-white">
                                  Password
                                </Label>
                                <Input
                                  id="password"
                                  name="password"
                                  type="password"
                                  placeholder="Enter password"
                                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="role" className="text-black dark:text-white">
                                  Role
                                </Label>
                                <Select name="role" defaultValue="STUDENT">
                                  <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="STUDENT">Étudiant</SelectItem>
                                    <SelectItem value="BDE">Membre BDE</SelectItem>
                                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="border-black/10 dark:border-white/10"
                                onClick={() => {
                                  const dialog = document.querySelector('[role="dialog"]')
                                  if (dialog) {
                                    const closeButton = dialog.querySelector('button[aria-label="Close"]')
                                    if (closeButton) {
                                      (closeButton as HTMLButtonElement).click()
                                    }
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90">
                                Create User
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Users Table */}
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
                            onClick={() => handleSortChange("name")}
                          >
                            Name
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </button>
                        </th>
                        <th className="p-3 text-left">
                          <button
                            className="flex items-center text-sm font-medium text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                            onClick={() => handleSortChange("email")}
                          >
                            Email
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </button>
                        </th>
                        <th className="p-3 text-left">
                          <button
                            className="flex items-center text-sm font-medium text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                            onClick={() => handleSortChange("role")}
                          >
                            Role
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
                      {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="p-3">
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => handleSelectUser(user.id)}
                                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                  <AvatarFallback className="bg-orange-500/10 text-orange-500 dark:text-orange-400">
                                    {user.name ? user.name.charAt(0) : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-black dark:text-white">{user.name || 'Unknown User'}</p>
                                  <p className="text-xs text-black/60 dark:text-white/60">ID: {user.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-black/80 dark:text-white/80">{user.email}</td>
                            <td className="p-3">
                              <Badge
                                className={
                                  user.role === "Membre BDE"
                                    ? "bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff] border-[#6262cf]/30"
                                    : user.role === "Administrateur"
                                    ? "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30"
                                    : "bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/30"
                                }
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge
                                className={
                                  user.status === "Active"
                                    ? "bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/30"
                                    : "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30"
                                }
                              >
                                {user.status}
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
                                        onClick={() => handleViewProfile(user)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View Profile</p>
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
                                        onClick={() => handleEditUser(user)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit User</p>
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
                                        onClick={() => handleToggleStatus(user.id)}
                                      >
                                        {user.status === "Active" ? (
                                          <Lock className="h-4 w-4" />
                                        ) : (
                                          <Unlock className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{user.status === "Active" ? "Deactivate" : "Activate"} User</p>
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
                                        onClick={() => handleDeleteUser(user)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete User</p>
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
                              <Users className="h-12 w-12 text-black/30 dark:text-white/30 mb-2" />
                              <p className="text-lg font-medium text-black/70 dark:text-white/70 mb-1">
                                No users found
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
                    {selectedUsers.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-black/70 dark:text-white/70">
                          {selectedUsers.length} selected
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-black/10 dark:border-white/10"
                          onClick={handleBulkActivate}
                        >
                          <Unlock className="h-3.5 w-3.5 mr-1" />
                          Activate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-black/10 dark:border-white/10"
                          onClick={handleBulkDeactivate}
                        >
                          <Lock className="h-3.5 w-3.5 mr-1" />
                          Deactivate
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
                                Delete Selected Users
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-black/60 dark:text-white/60">
                                Are you sure you want to delete {selectedUsers.length} selected users? This action
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
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
                      {filteredUsers.length}
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-black">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Edit User</DialogTitle>
            <DialogDescription className="text-black/60 dark:text-white/60">
              Make changes to the user profile
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-black dark:text-white">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-black dark:text-white">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-black dark:text-white">
                  Role
                </Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Étudiant">Étudiant</SelectItem>
                    <SelectItem value="Membre BDE">Membre BDE</SelectItem>
                    <SelectItem value="Administrateur">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-black dark:text-white">
                  Status
                </Label>
                <Select
                  value={editingUser.status}
                  onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                >
                  <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-black/10 dark:border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black dark:text-white">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-black/60 dark:text-white/60">
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black/10 dark:border-white/10 text-black dark:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="bg-white dark:bg-black max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">User Profile</DialogTitle>
            <DialogDescription className="text-black/60 dark:text-white/60">
              Detailed information about the user
            </DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="py-4">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left column - Avatar and basic info */}
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="h-24 w-24 mb-4 border-2 border-orange-500/20">
                    <AvatarImage
                      src={viewingUser.avatar || "/placeholder.svg?height=96&width=96"}
                      alt={viewingUser.name}
                    />
                    <AvatarFallback className="text-2xl bg-orange-500/10 text-orange-500 dark:text-orange-400">
                      {viewingUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge
                    className={
                      viewingUser.status === "Active"
                        ? "bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/30 mb-2"
                        : "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30 mb-2"
                    }
                  >
                    {viewingUser.status}
                  </Badge>
                  <Badge
                    className={
                      viewingUser.role === "Membre BDE"
                        ? "bg-[#6262cf]/10 text-[#6262cf] dark:text-[#9b9bff] border-[#6262cf]/30"
                        : viewingUser.role === "Administrateur"
                        ? "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30"
                        : "bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/30"
                    }
                  >
                    {viewingUser.role}
                  </Badge>
                </div>

                {/* Right column - User details */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">{viewingUser.name}</h3>
                      <p className="text-sm text-black/60 dark:text-white/60">{viewingUser.email}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-black/50 dark:text-white/50">USER ID</p>
                        <p className="text-sm font-medium text-black dark:text-white">{viewingUser.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-black/50 dark:text-white/50">JOINED</p>
                        <p className="text-sm font-medium text-black dark:text-white">{viewingUser.joinDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-black/50 dark:text-white/50">LAST ACTIVE</p>
                        <p className="text-sm font-medium text-black dark:text-white">{viewingUser.lastActive}</p>
                      </div>
                      <div>
                        <p className="text-xs text-black/50 dark:text-white/50">ACCOUNT TYPE</p>
                        <p className="text-sm font-medium text-black dark:text-white">{viewingUser.role}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-black dark:text-white mb-2">Activity Summary</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-black/60 dark:text-white/60">Forum Posts</span>
                            <span className="font-medium text-black dark:text-white">24</span>
                          </div>
                          <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: "60%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-black/60 dark:text-white/60">Events Attended</span>
                            <span className="font-medium text-black dark:text-white">8</span>
                          </div>
                          <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: "40%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-black/60 dark:text-white/60">Login Frequency</span>
                            <span className="font-medium text-black dark:text-white">High</span>
                          </div>
                          <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: "85%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-sm font-semibold text-black dark:text-white mb-2">Recent Activity</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 p-2 rounded-md bg-black/5 dark:bg-white/5">
                          <MessageSquare className="h-4 w-4 text-black/60 dark:text-white/60 mt-0.5" />
                          <div>
                            <p className="text-sm text-black dark:text-white">Posted in "Spring Event Planning"</p>
                            <p className="text-xs text-black/60 dark:text-white/60">2 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded-md bg-black/5 dark:bg-white/5">
                          <Calendar className="h-4 w-4 text-black/60 dark:text-white/60 mt-0.5" />
                          <div>
                            <p className="text-sm text-black dark:text-white">RSVP'd to "End of Year Party"</p>
                            <p className="text-xs text-black/60 dark:text-white/60">1 week ago</p>
                          </div>
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
              {viewingUser && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black/10 dark:border-white/10"
                    onClick={() => {
                      setIsProfileDialogOpen(false)
                      handleEditUser(viewingUser)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      viewingUser?.status === "Active"
                        ? "border-black/10 dark:border-white/10"
                        : "border-green-500/30 text-green-500 dark:text-green-400 hover:bg-green-500/10"
                    }
                    onClick={() => {
                      handleToggleStatus(viewingUser.id)
                      setIsProfileDialogOpen(false)
                    }}
                  >
                    {viewingUser?.status === "Active" ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
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

      {/* Response Modal */}
      <Dialog open={responseModal.isOpen} onOpenChange={(open) => setResponseModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-green-600 dark:text-green-400">Success</DialogTitle>
            <DialogDescription>
              {responseModal.data?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setResponseModal(prev => ({ ...prev, isOpen: false }))}
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
