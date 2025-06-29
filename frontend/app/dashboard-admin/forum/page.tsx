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
  Edit,
  Eye,
  Plus,
  Trash2,
  Megaphone,
  CheckCircle,
  Search,
  HelpCircle,
  RefreshCw,
  Pin,
  Lock,
  Unlock,
  MessageCircle,
  Clock,
  MoreHorizontal,
  Star,
  Hash,
  Reply,
  ThumbsUp,
  Send,
  Bookmark,
  Share,
  ChevronDown,
  ChevronUp,
  Tag,
  Activity,
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
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ForumPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedThread, setSelectedThread] = useState<number | null>(null)
  const [newThreadTitle, setNewThreadTitle] = useState("")
  const [newThreadContent, setNewThreadContent] = useState("")
  const [newThreadCategory, setNewThreadCategory] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  if (!mounted) {
    return null
  }

  // Mock data for forum categories
  const forumCategories = [
    { id: "all", name: "All Categories", count: 181, color: "gray" },
    { id: "help", name: "Help & Support", count: 45, color: "blue" },
    { id: "events", name: "Events Discussion", count: 23, color: "green" },
    { id: "general", name: "General Discussion", count: 67, color: "purple" },
    { id: "ideas", name: "Ideas & Suggestions", count: 34, color: "orange" },
    { id: "announcements", name: "Announcements", count: 12, color: "red" },
  ]

  // Mock data for forum threads
  const forumThreads = [
    {
      id: 1,
      title: "How to register for upcoming hackathon?",
      content: "I'm trying to register for the hackathon but can't find the registration link. Can someone help me?",
      category: "help",
      author: "Sarah Chen",
      authorAvatar: "SC",
      replies: 12,
      views: 234,
      upvotes: 18,
      lastActivity: "2 hours ago",
      isPinned: false,
      isLocked: false,
      isSolved: true,
      tags: ["hackathon", "registration", "help"],
      createdAt: "2 days ago",
    },
    {
      id: 2,
      title: "New campus facilities - What do you think?",
      content:
        "The university just announced new facilities coming to campus. What are your thoughts on the proposed changes?",
      category: "general",
      author: "Mike Johnson",
      authorAvatar: "MJ",
      replies: 28,
      views: 456,
      upvotes: 35,
      lastActivity: "4 hours ago",
      isPinned: true,
      isLocked: false,
      isSolved: false,
      tags: ["campus", "facilities", "discussion"],
      createdAt: "1 day ago",
    },
    {
      id: 3,
      title: "Suggestion: Extended library hours during exams",
      content:
        "Would it be possible to extend library hours during final exams? Many students would benefit from this.",
      category: "ideas",
      author: "Emma Wilson",
      authorAvatar: "EW",
      replies: 15,
      views: 189,
      upvotes: 42,
      lastActivity: "6 hours ago",
      isPinned: false,
      isLocked: false,
      isSolved: false,
      tags: ["library", "exams", "suggestion"],
      createdAt: "3 days ago",
    },
    {
      id: 4,
      title: "Important: Changes to final exam schedule",
      content:
        "Please note the important changes to the final exam schedule. All students should review these updates.",
      category: "announcements",
      author: "Admin Team",
      authorAvatar: "AT",
      replies: 45,
      views: 892,
      upvotes: 67,
      lastActivity: "1 day ago",
      isPinned: true,
      isLocked: true,
      isSolved: false,
      tags: ["exams", "schedule", "important"],
      createdAt: "2 days ago",
    },
    {
      id: 5,
      title: "Looking for study group partners",
      content: "I'm looking for people to form a study group for the upcoming midterms. Anyone interested?",
      category: "general",
      author: "Alex Kim",
      authorAvatar: "AK",
      replies: 8,
      views: 123,
      upvotes: 12,
      lastActivity: "1 day ago",
      isPinned: false,
      isLocked: false,
      isSolved: false,
      tags: ["study-group", "midterms", "collaboration"],
      createdAt: "4 days ago",
    },
  ]

  // Mock data for thread replies
  const threadReplies = [
    {
      id: 1,
      threadId: 1,
      content: "You can find the registration link on the student portal under 'Events'. Make sure you're logged in!",
      author: "Taylor Smith",
      authorAvatar: "TS",
      upvotes: 8,
      createdAt: "1 day ago",
      isBestAnswer: true,
    },
    {
      id: 2,
      threadId: 1,
      content: "Thanks! I found it. The registration deadline is next Friday for anyone else looking.",
      author: "Sarah Chen",
      authorAvatar: "SC",
      upvotes: 3,
      createdAt: "1 day ago",
      isBestAnswer: false,
    },
  ]

  const filteredThreads = forumThreads.filter((thread) => {
    const matchesCategory = selectedCategory === "all" || thread.category === selectedCategory
    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleCreateThread = () => {
    console.log("Creating thread:", { newThreadTitle, newThreadContent, newThreadCategory })
    setNewThreadTitle("")
    setNewThreadContent("")
    setNewThreadCategory("")
  }

  const handleReply = (threadId: number) => {
    console.log("Replying to thread:", threadId, "with content:", replyContent)
    setReplyContent("")
  }

  const handleUpvote = (threadId: number, type: "thread" | "reply", replyId?: number) => {
    console.log("Upvoting:", type, threadId, replyId)
  }

  const handleReport = (threadId: number, type: "thread" | "reply", replyId?: number) => {
    console.log("Reporting:", type, threadId, replyId)
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
                placeholder="Search threads..."
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
            <SidebarItem icon={Megaphone} label="Announcements" href="/dashboard-admin/announcements" />

            <div className="mt-6 mb-2 px-3 text-xs font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
              Content
            </div>
            <SidebarItem icon={MessageSquare} label="Forum" active href="/dashboard-admin/forum" />
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
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 mr-2 text-orange-500" />
                <h1 className="text-xl font-bold text-black dark:text-white">Forum</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Create New Thread */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Thread
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white dark:bg-black">
                  <DialogHeader>
                    <DialogTitle className="text-black dark:text-white">Create New Thread</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Category</label>
                      <Select value={newThreadCategory} onValueChange={setNewThreadCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="help">Help & Support</SelectItem>
                          <SelectItem value="events">Events Discussion</SelectItem>
                          <SelectItem value="general">General Discussion</SelectItem>
                          <SelectItem value="ideas">Ideas & Suggestions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Title</label>
                      <Input
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        placeholder="Enter thread title..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Content</label>
                      <Textarea
                        value={newThreadContent}
                        onChange={(e) => setNewThreadContent(e.target.value)}
                        placeholder="Write your thread content..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <DialogTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogTrigger>
                      <Button
                        onClick={handleCreateThread}
                        className="bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                      >
                        Create Thread
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Notifications */}
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="relative border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 bg-transparent"
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
                  <DropdownMenuLabel className="text-black dark:text-white">Forum Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                  <DropdownMenuItem className="p-0 focus:bg-transparent cursor-default">
                    <div className="flex items-start p-3 gap-3 w-full rounded-md cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200">
                      <div className="mt-1 p-1 rounded-full bg-blue-500/20 flex-shrink-0">
                        <Reply className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-black dark:text-white">New Reply</p>
                        <p className="text-xs mt-1 text-black/70 dark:text-white/70">Someone replied to your thread</p>
                        <p className="text-xs mt-1 text-black/50 dark:text-white/50">5 minutes ago</p>
                      </div>
                    </div>
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

        {/* Forum Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl">
            {/* Forum Overview Stats */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-orange-500 rounded-full mr-2"></span>
                Forum Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: "Total Threads", value: "181", icon: MessageCircle, change: "+12", color: "blue", delay: 0 },
                  { title: "Total Replies", value: "1,080", icon: Reply, change: "+45", color: "green", delay: 0.1 },
                  { title: "Active Users", value: "234", icon: Users, change: "+8", color: "purple", delay: 0.2 },
                  {
                    title: "Today's Activity",
                    value: "47",
                    icon: Activity,
                    change: "+15",
                    color: "orange",
                    delay: 0.3,
                  },
                ].map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: card.delay }}
                  >
                    <ForumSummaryCard
                      title={card.title}
                      value={card.value}
                      icon={card.icon}
                      change={card.change}
                      color={card.color as "blue" | "green" | "purple" | "orange"}
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {forumCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "transition-all duration-200",
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                        : "border-black/10 dark:border-white/10 bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
                    )}
                  >
                    <Hash className="h-4 w-4 mr-1" />
                    {category.name}
                    <Badge variant="secondary" className="ml-2 bg-black/10 dark:bg-white/10">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Thread List */}
            <div className="space-y-4">
              {filteredThreads.map((thread) => (
                <Card
                  key={thread.id}
                  className="border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-black"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {thread.isPinned && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Pin className="h-4 w-4 text-orange-500" />
                                </TooltipTrigger>
                                <TooltipContent>Pinned Thread</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {thread.isLocked && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Lock className="h-4 w-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>Locked Thread</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {thread.isSolved && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </TooltipTrigger>
                                <TooltipContent>Solved</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              thread.category === "help" && "bg-blue-500/10 text-blue-500 border-blue-500/30",
                              thread.category === "events" && "bg-green-500/10 text-green-500 border-green-500/30",
                              thread.category === "general" && "bg-purple-500/10 text-purple-500 border-purple-500/30",
                              thread.category === "ideas" && "bg-orange-500/10 text-orange-500 border-orange-500/30",
                              thread.category === "announcements" && "bg-red-500/10 text-red-500 border-red-500/30",
                            )}
                          >
                            {forumCategories.find((cat) => cat.id === thread.category)?.name}
                          </Badge>
                        </div>

                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2 hover:text-orange-500 cursor-pointer transition-colors">
                          {thread.title}
                        </h3>

                        <p className="text-black/70 dark:text-white/70 mb-3 line-clamp-2">{thread.content}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {thread.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border-black/10 dark:border-white/10"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-black/60 dark:text-white/60">
                            <div className="flex items-center space-x-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-orange-500/10 text-orange-500">
                                  {thread.authorAvatar}
                                </AvatarFallback>
                              </Avatar>
                              <span>{thread.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{thread.createdAt}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Reply className="h-4 w-4" />
                              <span>{thread.replies} replies</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{thread.views} views</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpvote(thread.id, "thread")}
                              className="text-black/60 dark:text-white/60 hover:text-orange-500 hover:bg-orange-500/10"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {thread.upvotes}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-black/60 dark:text-white/60 hover:text-blue-500 hover:bg-blue-500/10"
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-black/60 dark:text-white/60 hover:text-green-500 hover:bg-green-500/10"
                            >
                              <Share className="h-4 w-4" />
                            </Button>

                            {/* Admin/Moderator Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Thread
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Thread
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {thread.isPinned ? (
                                    <>
                                      <Pin className="h-4 w-4 mr-2" />
                                      Unpin Thread
                                    </>
                                  ) : (
                                    <>
                                      <Pin className="h-4 w-4 mr-2" />
                                      Pin Thread
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {thread.isLocked ? (
                                    <>
                                      <Unlock className="h-4 w-4 mr-2" />
                                      Unlock Thread
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Lock Thread
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleReport(thread.id, "thread")}
                                  className="text-orange-600"
                                >
                                  <Flag className="h-4 w-4 mr-2" />
                                  Report Thread
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Thread
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Thread Replies Preview */}
                        {selectedThread === thread.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 border-t border-black/10 dark:border-white/10 pt-4"
                          >
                            <h4 className="font-semibold mb-4 text-black dark:text-white">Replies</h4>
                            <div className="space-y-4">
                              {threadReplies
                                .filter((reply) => reply.threadId === thread.id)
                                .map((reply) => (
                                  <div
                                    key={reply.id}
                                    className={cn(
                                      "p-4 rounded-lg border",
                                      reply.isBestAnswer
                                        ? "bg-green-500/5 border-green-500/20"
                                        : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10",
                                    )}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarFallback className="text-xs bg-orange-500/10 text-orange-500">
                                            {reply.authorAvatar}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-black dark:text-white">{reply.author}</span>
                                        <span className="text-xs text-black/50 dark:text-white/50">
                                          {reply.createdAt}
                                        </span>
                                        {reply.isBestAnswer && (
                                          <Badge className="bg-green-500 text-white">
                                            <Star className="h-3 w-3 mr-1" />
                                            Best Answer
                                          </Badge>
                                        )}
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Reply
                                          </DropdownMenuItem>
                                          {!reply.isBestAnswer && (
                                            <DropdownMenuItem>
                                              <Star className="h-4 w-4 mr-2" />
                                              Mark as Best Answer
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => handleReport(thread.id, "reply", reply.id)}
                                            className="text-orange-600"
                                          >
                                            <Flag className="h-4 w-4 mr-2" />
                                            Report Reply
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-red-600">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Reply
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    <p className="text-black/70 dark:text-white/70 mb-2">{reply.content}</p>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUpvote(thread.id, "reply", reply.id)}
                                        className="text-black/60 dark:text-white/60 hover:text-orange-500 hover:bg-orange-500/10"
                                      >
                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                        {reply.upvotes}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-black/60 dark:text-white/60 hover:text-blue-500 hover:bg-blue-500/10"
                                      >
                                        <Reply className="h-3 w-3 mr-1" />
                                        Reply
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {/* Reply Form */}
                            <div className="mt-4 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                              <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your reply..."
                                className="mb-3"
                              />
                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleReply(thread.id)}
                                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Post Reply
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Toggle Replies Button */}
                        {thread.replies > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedThread(selectedThread === thread.id ? null : thread.id)}
                            className="mt-3 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                          >
                            {selectedThread === thread.id ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Hide Replies
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Show {thread.replies} Replies
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredThreads.length === 0 && (
              <Card className="p-12 text-center border border-black/10 dark:border-white/10 bg-white dark:bg-black">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-black/30 dark:text-white/30" />
                <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">No threads found</h3>
                <p className="text-black/60 dark:text-white/60 mb-4">
                  {searchQuery ? `No threads match your search "${searchQuery}"` : "No threads in this category yet"}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Thread
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </Card>
            )}
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

function ForumSummaryCard({
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
  color: "blue" | "green" | "purple" | "orange"
}) {
  const colorClasses = {
    blue: "bg-gradient-to-r from-blue-400 to-blue-600 text-white",
    green: "bg-gradient-to-r from-green-400 to-green-600 text-white",
    purple: "bg-gradient-to-r from-purple-400 to-purple-600 text-white",
    orange: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
  }

  const isPositive = change.startsWith("+")

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
      <Card className="p-6 border overflow-hidden relative border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-black">
        <motion.div
          className="absolute -right-10 -top-10 w-20 h-20 rounded-full opacity-10"
          initial={{
            backgroundColor:
              color === "blue" ? "#3b82f6" : color === "green" ? "#10b981" : color === "purple" ? "#8b5cf6" : "#f97316",
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
              isPositive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400",
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
