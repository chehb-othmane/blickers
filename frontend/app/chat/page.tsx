"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  ImageIcon,
  Video,
  File,
  ArrowLeft,
  Check,
  CheckCheck,
  Phone,
  VideoIcon as VideoCall,
  Filter,
  Bell,
  X,
  Menu,
  MessageCircle,
  MessageSquare,
  Sparkles,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  Copy,
  Reply,
  Forward,
  Loader,
  Settings,
  AlertCircle,
  Pin,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import NextLink from "next/link"
import { getMinimalShadow, getMinimalBorder } from "@/lib/theme-utils"

// Types
interface Notification {
  id: string
  user: string
  action: string
  time: string
  avatar?: string
}

interface ChatUser {
  id: string
  name: string
  avatar: string
  status: "online" | "offline" | "away" | "busy" | "invisible"
  lastSeen?: string
  unreadCount?: number
  isTyping?: boolean
  isVerified?: boolean
  mood?: string
  customStatus?: string
  lastMessage?: {
    text: string
    time: string
    isRead: boolean
    isSent: boolean
    isDelivered: boolean
    type?: "text" | "image" | "video" | "audio" | "file" | "location" | "contact" | "poll" | "event" | "ai"
  }
}

interface Message {
  id: string
  text: string
  time: string
  sender: "me" | "other" | "system"
  status: "sending" | "sent" | "delivered" | "read" | "failed"
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
  }>
  replyTo?: {
    id: string
    text: string
    sender: "me" | "other"
  }
  edited?: boolean
  pinned?: boolean
  media?: {
    type: "image" | "video" | "audio" | "file" | "location" | "contact" | "poll" | "event" | "ai" | "voice"
    url?: string
    name?: string
    size?: string
    duration?: number
    thumbnail?: string
    location?: {
      lat: number
      lng: number
      name: string
    }
    poll?: {
      question: string
      options: Array<{
        text: string
        votes: number
      }>
      totalVotes: number
      expiresAt?: string
    }
    event?: {
      title: string
      date: string
      location: string
      attendees: number
    }
    ai?: {
      type: "suggestion" | "translation" | "summary" | "answer"
      content: string
    }
    voice?: {
      duration: number
      waveform: number[]
    }
  }
  isForwarded?: boolean
  isEdited?: boolean
  isDeleted?: boolean
  isEncrypted?: boolean
  isHighlighted?: boolean
  isScheduled?: boolean
  scheduledFor?: string
  mentions?: string[]
  hashtags?: string[]
  links?: string[]
  readBy?: string[]
  deliveredTo?: string[]
  sentAt?: string
  deliveredAt?: string
  readAt?: string
}

// Mock Data
const users: ChatUser[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "online",
    unreadCount: 3,
    isTyping: true,
    isVerified: true,
    mood: "Excited",
    customStatus: "Working on my thesis 📚",
    lastMessage: {
      text: "Are you coming to the study group tonight?",
      time: "10:42 AM",
      isRead: false,
      isSent: true,
      isDelivered: true,
    },
  },
  {
    id: "2",
    name: "Alex Chen",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "online",
    isVerified: true,
    lastMessage: {
      text: "I just submitted the project. Let me know what you think!",
      time: "9:15 AM",
      isRead: true,
      isSent: true,
      isDelivered: true,
      type: "file",
    },
  },
  {
    id: "3",
    name: "Jordan Lee",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "away",
    lastSeen: "2 hours ago",
    mood: "Relaxed",
    lastMessage: {
      text: "Thanks for the notes from yesterday's lecture!",
      time: "Yesterday",
      isRead: true,
      isSent: true,
      isDelivered: true,
    },
  },
  {
    id: "4",
    name: "Mia Johnson",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "busy",
    lastSeen: "5 hours ago",
    customStatus: "Do not disturb - Final exam prep",
    lastMessage: {
      text: "Can we reschedule our meeting to tomorrow?",
      time: "Yesterday",
      isRead: true,
      isSent: true,
      isDelivered: true,
    },
  },
  {
    id: "5",
    name: "Prof. Williams",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "online",
    isVerified: true,
    lastMessage: {
      text: "Office hours are canceled today. Please email me if you need help.",
      time: "Monday",
      isRead: true,
      isSent: true,
      isDelivered: true,
    },
  },
  {
    id: "6",
    name: "Study Group",
    avatar: "/placeholder.svg?height=48&width=48",
    status: "online",
    unreadCount: 12,
    lastMessage: {
      text: "Emma: I found a great resource for our project!",
      time: "Monday",
      isRead: false,
      isSent: true,
      isDelivered: true,
    },
  },
]

const initialMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      text: "Hey! How's your day going?",
      time: "10:30 AM",
      sender: "other",
      status: "read",
    },
    {
      id: "m2",
      text: "Pretty good! Just finished my assignment for Prof. Williams' class.",
      time: "10:32 AM",
      sender: "me",
      status: "read",
    },
    {
      id: "m3",
      text: "Nice! Was it difficult? I haven't started yet 😅",
      time: "10:33 AM",
      sender: "other",
      status: "read",
      reactions: [
        {
          emoji: "😂",
          count: 1,
          users: ["me"],
        },
      ],
    },
    {
      id: "m4",
      text: "Not too bad once you understand the requirements. I can help you get started if you want!",
      time: "10:35 AM",
      sender: "me",
      status: "read",
    },
    {
      id: "m5",
      text: "That would be amazing! Are you free later today?",
      time: "10:36 AM",
      sender: "other",
      status: "read",
    },
    {
      id: "m6",
      text: "Yeah, I'm free after 3 PM. We could meet at the library?",
      time: "10:38 AM",
      sender: "me",
      status: "read",
    },
    {
      id: "m7",
      text: "Perfect! The library at 3:30 works for me.",
      time: "10:40 AM",
      sender: "other",
      status: "read",
    },
    {
      id: "m8",
      text: "Great! I'll see you there.",
      time: "10:41 AM",
      sender: "me",
      status: "read",
    },
    {
      id: "m9",
      text: "Are you coming to the study group tonight?",
      time: "10:42 AM",
      sender: "other",
      status: "delivered",
    },
  ],
}

const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😎", "🤔", "👏", "✨", "😍", "🙏", "💯", "🌟", "🥳"]

const quickReplies = [
  "I'll get back to you soon!",
  "Thanks for the info!",
  "Can we discuss this later?",
  "I'm in a meeting right now.",
  "Sounds good!",
  "On my way!",
  "Could you send me more details?",
  "Let's schedule a call.",
]

// Custom Components
const StatusIndicator = ({ status }: { status: ChatUser["status"] }) => {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    invisible: "bg-transparent border-2 border-gray-400",
  }

  return (
    <span
      className={`absolute bottom-0 right-0 w-3 h-3 ${statusColors[status]} rounded-full border-2 border-white`}
    ></span>
  )
}

const VerifiedBadge = () => (
  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
    <Check className="h-2.5 w-2.5 text-white" />
  </Badge>
)

const MessageStatus = ({ status }: { status: Message["status"] }) => {
  if (status === "sending") return <Loader className="h-3 w-3 animate-spin" />
  if (status === "sent") return <Check className="h-3 w-3" />
  if (status === "delivered") return <CheckCheck className="h-3 w-3" />
  if (status === "read") return <CheckCheck className="h-3 w-3 text-green-400" />
  if (status === "failed") return <AlertCircle className="h-3 w-3 text-red-500" />
  return null
}

const MessageBubble = ({ message }: { message: Message }) => {
  const [showReactions, setShowReactions] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const getMessageStyle = () => {
    if (message.sender === "me") {
      return "bg-black text-white ml-auto rounded-2xl rounded-br-md"
    } else if (message.sender === "other") {
      return `bg-white text-black mr-auto rounded-2xl rounded-bl-md ${getMinimalBorder()}`
    } else {
      return "bg-transparent"
    }
  }

  if (message.sender === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className={`px-4 py-2 rounded-full bg-black/5 text-sm text-black/70 ${getMinimalBorder()}`}>
          <div className="flex items-center space-x-1">
            <Info className="h-3 w-3" />
            <span>{message.text}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex mb-6", message.sender === "me" ? "justify-end" : "justify-start")}
    >
      <div className="relative group max-w-xs lg:max-w-md">
        {/* Hover Actions */}
        <div
          className={`absolute ${message.sender === "me" ? "left-0" : "right-0"} top-1/2 -translate-y-1/2 ${
            message.sender === "me" ? "-translate-x-full pr-2" : "translate-x-full pl-2"
          } opacity-0 group-hover:opacity-100 transition-all duration-200`}
        >
          <div className="flex items-center space-x-1">
            <Popover open={showReactions} onOpenChange={setShowReactions}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 rounded-full bg-white ${getMinimalShadow()} ${getMinimalBorder()}`}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" side={message.sender === "me" ? "left" : "right"}>
                <div className="grid grid-cols-5 gap-2">
                  {emojis.map((emoji) => (
                    <Button key={emoji} variant="ghost" size="sm" className="h-8 w-8 p-0 text-lg hover:bg-black/5">
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={showOptions} onOpenChange={setShowOptions}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 rounded-full bg-white ${getMinimalShadow()} ${getMinimalBorder()}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" side={message.sender === "me" ? "left" : "right"}>
                <div className="space-y-0.5">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal">
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal">
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  {message.sender === "me" && (
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="w-full justify-start text-sm font-normal">
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "px-4 py-3 transition-all duration-200 hover:scale-[1.02]",
            getMessageStyle(),
            getMinimalShadow(),
            message.pinned && "border-l-4 border-yellow-400",
          )}
        >
          {message.replyTo && (
            <div
              className={`mb-2 p-2 text-xs rounded ${getMinimalBorder()} ${
                message.sender === "me" ? "bg-black/20 border-white/30" : "bg-black/5"
              }`}
            >
              <p className="font-medium">{message.replyTo.sender === "me" ? "You" : "Sarah Wilson"}</p>
              <p className="truncate opacity-70">{message.replyTo.text}</p>
            </div>
          )}

          {message.isForwarded && (
            <div className="mb-2 text-xs flex items-center opacity-70">
              <Forward className="h-3 w-3 mr-1" />
              Forwarded
            </div>
          )}

          <p className="leading-relaxed">{message.text}</p>

          {message.edited && <span className="text-xs opacity-70 ml-1">(edited)</span>}

          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex -mb-2 mt-2 ${message.sender === "me" ? "justify-start" : "justify-end"}`}>
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-white ${getMinimalShadow()} ${getMinimalBorder()}`}
              >
                {message.reactions.map((reaction, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-sm">{reaction.emoji}</span>
                    {reaction.count > 1 && <span className="text-xs ml-0.5 font-medium">{reaction.count}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className={cn(
              "flex items-center justify-end space-x-1 mt-2 text-xs",
              message.sender === "me" ? "text-white/70" : "text-black/60",
            )}
          >
            <span>{message.time}</span>
            {message.sender === "me" && <MessageStatus status={message.status} />}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      user: "Sarah Wilson",
      action: "sent you a message",
      time: "2 minutes ago",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    {
      id: "2",
      user: "Alex Chen",
      action: "liked your message",
      time: "5 minutes ago",
      avatar: "/placeholder.svg?height=32&width=32"
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setShowSidebar(true)
      }
    }

    checkMobileView()
    window.addEventListener("resize", checkMobileView)
    return () => window.removeEventListener("resize", checkMobileView)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, activeChat])

  // Auto-select first chat on desktop
  useEffect(() => {
    if (!activeChat && users.length > 0 && !isMobileView) {
      setActiveChat(users[0])
    }
  }, [activeChat, isMobileView])

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !activeChat) return

    const newMessage: Message = {
      id: `m${Date.now()}`,
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sender: "me",
      status: "sending",
    }

    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage],
    }))

    setMessage("")

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChat.id]: prev[activeChat.id].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg,
        ),
      }))
    }, 500)

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChat.id]: prev[activeChat.id].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
        ),
      }))
    }, 1000)

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChat.id]: prev[activeChat.id].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "read" } : msg,
        ),
      }))
    }, 2000)
  }, [message, activeChat])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 ${getMinimalBorder()} border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50`}
      >
        <div className="fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-b border-black/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center">
              <Image
                src="/favicon.ico"
                alt="Blickers Logo"
                width={60}
                height={60}
                className="mr-2"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Your profile" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Live Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 right-4 w-80 bg-white border border-black/10 rounded-lg shadow-lg z-30"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Live Activity</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-black/5"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.avatar || "/placeholder.svg"} alt={notification.user} />
                        <AvatarFallback>{notification.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{notification.user}</span> {notification.action}
                        </p>
                        <p className="text-xs text-black/60">{notification.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-80px)]">
        <div className={`h-full ${getMinimalBorder()} ${getMinimalShadow()} overflow-hidden rounded-xl bg-white`}>
          <div className="flex h-full">
            {/* Sidebar */}
            <AnimatePresence>
              {(showSidebar || !isMobileView) && (
                <motion.div
                  initial={isMobileView ? { x: -300, opacity: 0 } : { opacity: 1 }}
                  animate={isMobileView ? { x: 0, opacity: 1 } : { opacity: 1 }}
                  exit={isMobileView ? { x: -300, opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`w-full lg:w-1/3 xl:w-1/4 ${getMinimalBorder()} border-r flex flex-col bg-white`}
                >
                  {/* Sidebar Header */}
                  <div className={`p-4 ${getMinimalBorder()} border-b flex items-center justify-between`}>
                    <h2 className="text-xl font-bold text-black">Messages</h2>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" className="rounded-full text-black/70 hover:text-black">
                        <Filter className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full text-black/70 hover:text-black">
                        <Bell className="h-5 w-5" />
                      </Button>
                      {isMobileView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full lg:hidden"
                          onClick={() => setShowSidebar(false)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search */}
                  <div className={`p-4 ${getMinimalBorder()} border-b`}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 h-4 w-4" />
                      <Input
                        placeholder="Search conversations..."
                        className={`pl-10 ${getMinimalBorder()} bg-black/5 text-black placeholder:text-black/50 focus:border-black focus:ring-black`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Chat List */}
                  <div className="flex-1 overflow-y-auto">
                    <AnimatePresence>
                      {filteredUsers.map((user) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "p-4 flex items-center space-x-3 cursor-pointer transition-all duration-200 hover:bg-black/5",
                            activeChat?.id === user.id && "bg-black/5",
                          )}
                          onClick={() => {
                            setActiveChat(user)
                            if (isMobileView) setShowSidebar(false)
                          }}
                        >
                          <div className="relative">
                            <Avatar className={`h-12 w-12 border-2 border-white ${getMinimalShadow()}`}>
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <StatusIndicator status={user.status} />
                            {user.isVerified && <VerifiedBadge />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-black truncate">{user.name}</p>
                              <p className="text-xs text-black/60">{user.lastMessage?.time}</p>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              {user.isTyping ? (
                                <p className="text-sm text-green-600 font-medium">typing...</p>
                              ) : user.customStatus ? (
                                <p className="text-sm italic text-black/70 truncate">{user.customStatus}</p>
                              ) : (
                                <p className="text-sm text-black/70 truncate">{user.lastMessage?.text}</p>
                              )}
                              <div className="flex items-center">
                                {user.unreadCount ? (
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center">
                                    {user.unreadCount}
                                  </Badge>
                                ) : user.lastMessage?.isSent ? (
                                  user.lastMessage.isRead ? (
                                    <CheckCheck className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Check className="h-4 w-4 text-black/60" />
                                  )
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Area */}
            <AnimatePresence>
              {(activeChat || !isMobileView) && (
                <motion.div
                  initial={isMobileView ? { x: 300, opacity: 0 } : { opacity: 1 }}
                  animate={isMobileView ? { x: 0, opacity: 1 } : { opacity: 1 }}
                  exit={isMobileView ? { x: 300, opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col bg-white"
                >
                  {activeChat ? (
                    <>
                      {/* Chat Header */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 ${getMinimalBorder()} border-b flex items-center justify-between bg-white`}
                      >
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-full"
                            onClick={() => {
                              setActiveChat(null)
                              setShowSidebar(true)
                            }}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={activeChat.avatar || "/placeholder.svg"} alt={activeChat.name} />
                              <AvatarFallback>{activeChat.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <StatusIndicator status={activeChat.status} />
                            {activeChat.isVerified && <VerifiedBadge />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <p className="font-medium text-black">{activeChat.name}</p>
                              {activeChat.isVerified && (
                                <Badge className="h-4 px-1 text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-black/60">
                              {activeChat.isTyping ? (
                                <span className="text-green-600 font-medium">typing...</span>
                              ) : activeChat.status === "online" ? (
                                "Online"
                              ) : activeChat.status === "away" ? (
                                "Away"
                              ) : activeChat.status === "busy" ? (
                                <span className="text-red-500">Do not disturb</span>
                              ) : (
                                `Last seen ${activeChat.lastSeen}`
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="rounded-full text-black/70 hover:text-black">
                            <Phone className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full text-black/70 hover:text-black">
                            <VideoCall className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full text-black/70 hover:text-black">
                            <Search className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full text-black/70 hover:text-black">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </div>
                      </motion.div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50/30">
                        <AnimatePresence>
                          {(messages[activeChat.id] || []).map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                          ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className={`p-4 ${getMinimalBorder()} border-t bg-white`}>
                        <div className="flex items-end space-x-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-black/70 hover:text-black"
                              >
                                <Paperclip className="h-5 w-5" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2" side="top">
                              <div className="grid grid-cols-3 gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex flex-col items-center space-y-1 h-auto py-3"
                                >
                                  <ImageIcon className="h-6 w-6 text-purple-500" />
                                  <span className="text-xs">Photo</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex flex-col items-center space-y-1 h-auto py-3"
                                >
                                  <Video className="h-6 w-6 text-red-500" />
                                  <span className="text-xs">Video</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex flex-col items-center space-y-1 h-auto py-3"
                                >
                                  <File className="h-6 w-6 text-blue-500" />
                                  <span className="text-xs">File</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex flex-col items-center space-y-1 h-auto py-3"
                                >
                                  <MapPin className="h-6 w-6 text-green-500" />
                                  <span className="text-xs">Location</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex flex-col items-center space-y-1 h-auto py-3"
                                >
                                  <Calendar className="h-6 w-6 text-orange-500" />
                                  <span className="text-xs">Event</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex flex-col items-center space-y-1 h-auto py-3"
                                >
                                  <Sparkles className="h-6 w-6 text-pink-500" />
                                  <span className="text-xs">Poll</span>
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>

                          <div className="flex-1 relative">
                            <Textarea
                              placeholder="Type a message..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className={`min-h-[44px] max-h-[120px] resize-none pr-20 ${getMinimalBorder()} bg-black/5 text-black placeholder:text-black/50 focus:border-black focus:ring-black`}
                              rows={1}
                            />

                            <div className="absolute right-2 top-2 flex items-center space-x-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-black/70 hover:text-black"
                                  >
                                    <Smile className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2" side="top">
                                  <div className="grid grid-cols-8 gap-1">
                                    {emojis.map((emoji) => (
                                      <Button
                                        key={emoji}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-lg hover:bg-black/5"
                                        onClick={() => setMessage(message + emoji)}
                                      >
                                        {emoji}
                                      </Button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {message.trim() ? (
                            <Button
                              onClick={handleSendMessage}
                              className="rounded-full h-11 w-11 p-0 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-lg"
                            >
                              <Send className="h-5 w-5" />
                            </Button>
                          ) : (
                            <Button className="rounded-full h-11 w-11 p-0 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-lg">
                              <Mic className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-gray-50/30">
                      <div className="text-center">
                        <MessageCircle className="h-16 w-16 mx-auto text-black/20 mb-4" />
                        <h3 className="text-xl font-medium text-black/60 mb-2">Welcome to Blickers Chat</h3>
                        <p className="text-black/40">Select a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
