"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Calendar,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Search,
  Bell,
  Home,
  Hash,
  User,
  Settings,
  MoreHorizontal,
  ImageIcon,
  Video,
  Smile,
  MessageSquare,
  ArrowLeft,
  Plus,
  Filter,
  Eye,
  BarChart3,
  Zap,
  X,
  Check,
  Mic,
  Camera,
  MapPinIcon,
  Star,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

type ContentType = "post" | "event" | "forum" | "story" | "poll"

interface BaseContent {
  id: number
  type: ContentType
  author: {
    name: string
    avatar: string
    username: string
    isOnline?: boolean
    isVerified?: boolean
  }
  timestamp: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
  views?: number
}

interface Post extends BaseContent {
  type: "post"
  content: string
  images?: string[]
  hashtags: string[]
  location?: string
  mentions?: string[]
}

interface Event extends BaseContent {
  type: "event"
  title: string
  description: string
  date: string
  time: string
  location: string
  eventType: string
  image: string
  interested: number
  price?: string
}

interface ForumTopic extends BaseContent {
  type: "forum"
  title: string
  content: string
  category: string
  replies: number
  views: number
  isPinned?: boolean
}

interface Poll extends BaseContent {
  type: "poll"
  question: string
  options: Array<{
    id: number
    text: string
    votes: number
    percentage: number
  }>
  totalVotes: number
  hasVoted: boolean
  votedOption?: number
  expiresAt: string
}

type FeedContent = Post | Event | ForumTopic | Poll

const feedData: FeedContent[] = [
  {
    id: 1,
    type: "post",
    author: {
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@alexchen",
      isOnline: true,
      isVerified: true,
    },
    timestamp: "2 hours ago",
    content:
      "Just finished my first hackathon project! 🚀 Built a student collaboration platform using React and Node.js. The experience was incredible and I learned so much from my teammates. Can't wait for the next one!",
    images: [
      "/placeholder.svg?height=300&width=500",
      "/placeholder.svg?height=300&width=500",
      "/placeholder.svg?height=300&width=500",
    ],
    hashtags: ["hackathon", "coding", "studentlife"],
    location: "Tech Hub, Campus",
    mentions: ["@mikechen", "@sarahw"],
    likes: 42,
    comments: 8,
    shares: 3,
    views: 156,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 2,
    type: "poll",
    author: {
      name: "Student Council",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@studentcouncil",
      isOnline: true,
      isVerified: true,
    },
    timestamp: "3 hours ago",
    question: "What should be the theme for this year's spring festival?",
    options: [
      { id: 1, text: "Retro 80s", votes: 45, percentage: 35 },
      { id: 2, text: "Futuristic Tech", votes: 38, percentage: 30 },
      { id: 3, text: "Cultural Fusion", votes: 32, percentage: 25 },
      { id: 4, text: "Eco-Friendly", votes: 13, percentage: 10 },
    ],
    totalVotes: 128,
    hasVoted: false,
    expiresAt: "2024-03-20T23:59:59Z",
    likes: 23,
    comments: 15,
    shares: 8,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 3,
    type: "event",
    author: {
      name: "Student Events",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@studentevents",
      isOnline: false,
      isVerified: true,
    },
    timestamp: "4 hours ago",
    title: "Annual Tech Conference 2024",
    description:
      "Join us for the biggest tech event of the year! Industry leaders, workshops, and networking opportunities await. Don't miss out on this incredible learning experience.",
    date: "2024-03-15",
    time: "9:00 AM",
    location: "Main Auditorium",
    eventType: "Conference",
    image: "/placeholder.svg?height=300&width=500",
    price: "Free for students",
    interested: 156,
    likes: 89,
    comments: 12,
    shares: 24,
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: 4,
    type: "forum",
    author: {
      name: "Jordan Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@jordanlee",
      isOnline: true,
    },
    timestamp: "6 hours ago",
    title: "Best study spots on campus during finals week?",
    content:
      "With finals approaching, I'm looking for quiet study spots that aren't too crowded. The library gets packed, and I need somewhere with good WiFi and maybe some coffee nearby. Any recommendations?",
    category: "Student Life",
    replies: 23,
    views: 145,
    likes: 15,
    comments: 23,
    shares: 5,
    isLiked: false,
    isBookmarked: false,
    isPinned: false,
  },
]

const trendingTopics = [
  { tag: "hackathon", posts: 156, growth: "+12%" },
  { tag: "studylife", posts: 89, growth: "+8%" },
  { tag: "finals", posts: 234, growth: "+25%" },
  { tag: "campuslife", posts: 67, growth: "+5%" },
  { tag: "coding", posts: 123, growth: "+15%" },
]

const liveActivities = [
  { user: "Alex Chen", action: "liked your post", time: "2m ago", avatar: "/placeholder.svg?height=32&width=32" },
  {
    user: "Sarah Wilson",
    action: "commented on your photo",
    time: "5m ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    user: "Mike Johnson",
    action: "started following you",
    time: "8m ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export default function SocialMediaView() {
  const [feedContent, setFeedContent] = useState<FeedContent[]>(feedData)
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(liveActivities)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const storyTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // Simulate live notifications
    const interval = setInterval(() => {
      const randomActions = [
        "liked your post",
        "commented on your photo",
        "shared your event",
        "mentioned you in a comment",
        "started following you",
      ]
      const randomUsers = ["Emma Davis", "Tom Wilson", "Lisa Chen", "Mark Johnson"]

      const newNotification = {
        user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
        action: randomActions[Math.floor(Math.random() * randomActions.length)],
        time: "now",
        avatar: "/placeholder.svg?height=32&width=32",
      }

      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)])
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleLike = (id: number) => {
    setFeedContent((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item,
      ),
    )
  }

  const handleBookmark = (id: number) => {
    setFeedContent((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item)),
    )
  }

  const handleVote = (pollId: number, optionId: number) => {
    setFeedContent((prev) =>
      prev.map((item) => {
        if (item.id === pollId && item.type === "poll") {
          const poll = item as Poll
          if (poll.hasVoted) return item

          const updatedOptions = poll.options.map((option) => ({
            ...option,
            votes: option.id === optionId ? option.votes + 1 : option.votes,
          }))

          const newTotal = poll.totalVotes + 1
          const updatedOptionsWithPercentage = updatedOptions.map((option) => ({
            ...option,
            percentage: Math.round((option.votes / newTotal) * 100),
          }))

          return {
            ...poll,
            options: updatedOptionsWithPercentage,
            totalVotes: newTotal,
            hasVoted: true,
            votedOption: optionId,
          }
        }
        return item
      }),
    )
  }

  const handlePost = async () => {
    if (!newPost.trim()) return

    setIsPosting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newPostData: Post = {
      id: Date.now(),
      type: "post",
      author: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "@you",
        isOnline: true,
      },
      timestamp: "now",
      content: newPost,
      hashtags: newPost.match(/#\w+/g)?.map((tag) => tag.slice(1)) || [],
      mentions: newPost.match(/@\w+/g) || [],
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      isLiked: false,
      isBookmarked: false,
    }

    setFeedContent((prev) => [newPostData, ...prev])
    setNewPost("")
    setIsPosting(false)
  }

  const filteredContent = feedContent.filter((item) => {
    if (selectedFilter === "all") return true
    return item.type === selectedFilter
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Quick Actions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  <div className="p-6">
                    <h3 className="font-semibold text-black mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-black/80 hover:text-black hover:bg-black/5"
                      >
                        <Home className="h-4 w-4 mr-3" />
                        Home
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-black/80 hover:text-black hover:bg-black/5"
                      >
                        <Hash className="h-4 w-4 mr-3" />
                        Explore
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-black/80 hover:text-black hover:bg-black/5"
                      >
                        <Bell className="h-4 w-4 mr-3" />
                        Notifications
                      </Button>
                      <Link href="/chat" className="block">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-black/80 hover:text-black hover:bg-black/5"
                        >
                          <MessageSquare className="h-4 w-4 mr-3" />
                          Chat
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-black/80 hover:text-black hover:bg-black/5"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-black/80 hover:text-black hover:bg-black/5"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Trending Topics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                      <h3 className="font-semibold text-black">Trending</h3>
                    </div>
                    <div className="space-y-4">
                      {trendingTopics.map((topic, index) => (
                        <motion.div
                          key={topic.tag}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
                        >
                          <div>
                            <p className="font-medium text-black">#{topic.tag}</p>
                            <p className="text-sm text-black/60">{topic.posts} posts</p>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mb-1" />
                            <p className="text-xs text-green-600 font-medium">{topic.growth}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Live Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <Zap className="h-5 w-5 mr-2 text-green-500" />
                      <h3 className="font-semibold text-black">Live Activity</h3>
                    </div>
                    <div className="space-y-3">
                      {notifications.slice(0, 3).map((notification, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center space-x-3"
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
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Content Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 overflow-x-auto">
                      <Filter className="h-4 w-4 text-black/60 flex-shrink-0" />
                      {["all", "post", "event", "forum", "poll"].map((filter) => (
                        <Button
                          key={filter}
                          variant={selectedFilter === filter ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedFilter(filter)}
                          className={cn(
                            "capitalize flex-shrink-0",
                            selectedFilter === filter
                              ? "bg-black text-white"
                              : "text-black/60 hover:text-black hover:bg-black/5",
                          )}
                        >
                          {filter}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Create Post */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  <div className="p-6">
                    <div className="flex space-x-4">
                      <Avatar className="h-12 w-12 ring-2 ring-black/5">
                        <AvatarImage src="/placeholder.svg?height=48&width=48" alt="You" />
                        <AvatarFallback className="bg-[#9b9bff] text-white">You</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="What's happening on campus? Use @mentions and #hashtags..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="border-none resize-none focus:ring-0 p-0 text-lg placeholder:text-black/50 bg-transparent"
                          rows={3}
                        />
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/10">
                          <div className="flex space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-black/60 hover:text-black hover:bg-black/5"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-black/60 hover:text-black hover:bg-black/5"
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-black/60 hover:text-black hover:bg-black/5"
                            >
                              <MapPinIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-black/60 hover:text-black hover:bg-black/5"
                            >
                              <Smile className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-black/60">{280 - newPost.length}</span>
                            <Button
                              onClick={handlePost}
                              disabled={!newPost.trim() || isPosting || newPost.length > 280}
                              className="bg-black text-white hover:bg-black/90 rounded-full px-6"
                            >
                              {isPosting ? "Posting..." : "Post"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Feed Content */}
              <AnimatePresence>
                {filteredContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {item.type === "post" && <PostCard post={item} onLike={handleLike} onBookmark={handleBookmark} />}
                    {item.type === "event" && (
                      <EventCard event={item} onLike={handleLike} onBookmark={handleBookmark} />
                    )}
                    {item.type === "forum" && (
                      <ForumCard forum={item} onLike={handleLike} onBookmark={handleBookmark} />
                    )}
                    {item.type === "poll" && <PollCard poll={item} onVote={handleVote} onLike={handleLike} />}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Load More */}
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button variant="outline" className="px-8 border-black/10 text-black hover:bg-black/5 rounded-full">
                  Load More Content
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Enhanced Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  <div className="p-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 h-4 w-4" />
                      <Input
                        placeholder="Search campus..."
                        className="pl-10 border-black/10 bg-black/5 text-black placeholder:text-black/50 focus:border-black focus:ring-black"
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {["#hackathon", "#studylife", "#events"].map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-black/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Suggested Connections */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  <div className="p-6">
                    <h3 className="font-semibold text-black mb-4">Suggested for You</h3>
                    <div className="space-y-4">
                      {[
                        { name: "Sarah Wilson", username: "@sarahw", mutual: 5, isVerified: true },
                        { name: "Mike Chen", username: "@mikechen", mutual: 3, isVerified: false },
                        { name: "Emma Davis", username: "@emmad", mutual: 8, isVerified: true },
                      ].map((user, index) => (
                        <motion.div
                          key={user.username}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 ring-2 ring-black/5">
                              <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user.name} />
                              <AvatarFallback className="bg-[#99c805] text-white">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-1">
                                <p className="font-medium text-sm text-black">{user.name}</p>
                                {user.isVerified && <Check className="w-3 h-3 text-blue-500" />}
                              </div>
                              <p className="text-xs text-black/60">{user.mutual} mutual friends</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-black/10 text-black hover:bg-black/5 rounded-full"
                          >
                            Follow
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <Calendar className="h-5 w-5 mr-2 text-[#99c805]" />
                      <h3 className="font-semibold text-black">Upcoming Events</h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Study Group", time: "Today 3:00 PM", color: "bg-orange-500", attendees: 12 },
                        { title: "Career Fair", time: "Tomorrow 10:00 AM", color: "bg-[#99c805]", attendees: 156 },
                        { title: "Movie Night", time: "Friday 7:00 PM", color: "bg-[#9b9bff]", attendees: 45 },
                      ].map((event, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
                        >
                          <div className={cn("w-3 h-3 rounded-full", event.color)}></div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-black">{event.title}</p>
                            <p className="text-xs text-black/60">{event.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-black/60">{event.attendees}</p>
                            <Users className="w-3 h-3 text-black/40" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white shadow-lg"
          onClick={() => setShowQuickActions(!showQuickActions)}
        >
          <Plus className="h-6 w-6" />
        </Button>

        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 space-y-2"
            >
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-[#99c805] hover:bg-[#7ba004] text-white shadow-lg"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-[#9b9bff] hover:bg-[#7a7aff] text-white shadow-lg"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function PostCard({
  post,
  onLike,
  onBookmark,
}: {
  post: Post
  onLike: (id: number) => void
  onBookmark: (id: number) => void
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFullContent, setShowFullContent] = useState(false)

  const isLongContent = post.content.length > 200

  return (
    <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-black/5">
                <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                <AvatarFallback className="bg-[#9b9bff] text-white">{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {post.author.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-black">{post.author.name}</p>
                {post.author.isVerified && <Check className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="flex items-center space-x-2 text-sm text-black/60">
                <span>{post.author.username}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-black/60 hover:text-black hover:bg-black/5">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-black whitespace-pre-wrap leading-relaxed">
            {isLongContent && !showFullContent ? `${post.content.slice(0, 200)}...` : post.content}
          </p>
          {isLongContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-black/60 hover:text-black p-0 h-auto mt-1"
            >
              {showFullContent ? "Show less" : "Show more"}
            </Button>
          )}

          {/* Hashtags and Mentions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {post.hashtags.map((tag) => (
              <Badge key={tag} className="bg-black/10 text-black hover:bg-black/20 transition-colors cursor-pointer">
                #{tag}
              </Badge>
            ))}
            {post.mentions?.map((mention) => (
              <Badge
                key={mention}
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
              >
                {mention}
              </Badge>
            ))}
          </div>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4 rounded-xl overflow-hidden relative">
            <img
              src={post.images[currentImageIndex] || "/placeholder.svg"}
              alt="Post content"
              className="w-full h-64 object-cover"
            />
            {post.images.length > 1 && (
              <>
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                  {currentImageIndex + 1} / {post.images.length}
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {post.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentImageIndex ? "bg-white" : "bg-white/50",
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Stats */}
        {post.views && (
          <div className="flex items-center space-x-4 text-sm text-black/60 mb-3">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views} views</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-black/10">
          <div className="flex items-center space-x-6">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post.id)}
                className={cn(
                  "flex items-center space-x-2 hover:bg-red-50 transition-colors",
                  post.isLiked ? "text-red-500" : "text-black/60 hover:text-red-500",
                )}
              >
                <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                <span>{post.likes}</span>
              </Button>
            </motion.div>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-black/60 hover:text-black hover:bg-black/5"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-black/60 hover:text-black hover:bg-black/5"
            >
              <Share2 className="h-4 w-4" />
              <span>{post.shares}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(post.id)}
            className={cn(
              "hover:bg-orange-50 transition-colors",
              post.isBookmarked ? "text-orange-500" : "text-black/60 hover:text-orange-500",
            )}
          >
            <Bookmark className={cn("h-4 w-4", post.isBookmarked && "fill-current")} />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function EventCard({
  event,
  onLike,
  onBookmark,
}: {
  event: Event
  onLike: (id: number) => void
  onBookmark: (id: number) => void
}) {
  return (
    <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-black/5">
                <AvatarImage src={event.author.avatar || "/placeholder.svg"} alt={event.author.name} />
                <AvatarFallback className="bg-orange-500 text-white">{event.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {event.author.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-black">{event.author.name}</p>
                {event.author.isVerified && <Check className="w-4 h-4 text-blue-500" />}
              </div>
              <p className="text-sm text-black/60">
                {event.author.username} • {event.timestamp}
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">Event</Badge>
        </div>

        {/* Event Image */}
        <div className="mb-4 rounded-xl overflow-hidden">
          <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover" />
        </div>

        {/* Event Details */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-black mb-3">{event.title}</h3>
          <p className="text-black/80 mb-4 leading-relaxed">{event.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm text-black/70 mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span>{new Date(event.date).toISOString().split('T')[0]}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span>{event.interested} interested</span>
            </div>
          </div>

          {event.price && (
            <div className="flex items-center space-x-2 text-sm">
              <Star className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-600">{event.price}</span>
            </div>
          )}
        </div>

        {/* Event Actions */}
        <div className="mb-4">
          <Button className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white rounded-full">
            <Heart className="mr-2 h-4 w-4" />
            I'm Interested
          </Button>
        </div>

        {/* Social Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-black/10">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(event.id)}
              className={cn(
                "flex items-center space-x-2 hover:bg-red-50 transition-colors",
                event.isLiked ? "text-red-500" : "text-black/60 hover:text-red-500",
              )}
            >
              <Heart className={cn("h-4 w-4", event.isLiked && "fill-current")} />
              <span>{event.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-black/60 hover:text-black hover:bg-black/5"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{event.comments}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-black/60 hover:text-black hover:bg-black/5"
            >
              <Share2 className="h-4 w-4" />
              <span>{event.shares}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(event.id)}
            className={cn(
              "hover:bg-orange-50 transition-colors",
              event.isBookmarked ? "text-orange-500" : "text-black/60 hover:text-orange-500",
            )}
          >
            <Bookmark className={cn("h-4 w-4", event.isBookmarked && "fill-current")} />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function ForumCard({
  forum,
  onLike,
  onBookmark,
}: {
  forum: ForumTopic
  onLike: (id: number) => void
  onBookmark: (id: number) => void
}) {
  return (
    <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-black/5">
                <AvatarImage src={forum.author.avatar || "/placeholder.svg"} alt={forum.author.name} />
                <AvatarFallback className="bg-[#9b9bff] text-white">{forum.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {forum.author.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-black">{forum.author.name}</p>
                {forum.author.isVerified && <Check className="w-4 h-4 text-blue-500" />}
              </div>
              <p className="text-sm text-black/60">
                {forum.author.username} • {forum.timestamp}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {forum.isPinned && (
              <Badge variant="outline" className="text-xs">
                Pinned
              </Badge>
            )}
            <Badge className="bg-gradient-to-r from-[#9b9bff] to-[#6262cf] text-white">Forum</Badge>
          </div>
        </div>

        {/* Forum Content */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="outline" className="text-xs border-black/20 text-black/70">
              {forum.category}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-black mb-3">{forum.title}</h3>
          <p className="text-black/80 leading-relaxed">{forum.content}</p>
        </div>

        {/* Forum Stats */}
        <div className="flex items-center space-x-4 text-sm text-black/60 mb-4 p-3 bg-black/5 rounded-lg">
          <span className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4 text-[#9b9bff]" />
            <span>{forum.replies} replies</span>
          </span>
          <span className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-[#9b9bff]" />
            <span>{forum.views} views</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-black/10">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(forum.id)}
              className={cn(
                "flex items-center space-x-2 hover:bg-red-50 transition-colors",
                forum.isLiked ? "text-red-500" : "text-black/60 hover:text-red-500",
              )}
            >
              <Heart className={cn("h-4 w-4", forum.isLiked && "fill-current")} />
              <span>{forum.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-black/60 hover:text-[#9b9bff] hover:bg-[#9b9bff]/10"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Reply</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-black/60 hover:text-black hover:bg-black/5"
            >
              <Share2 className="h-4 w-4" />
              <span>{forum.shares}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(forum.id)}
            className={cn(
              "hover:bg-orange-50 transition-colors",
              forum.isBookmarked ? "text-orange-500" : "text-black/60 hover:text-orange-500",
            )}
          >
            <Bookmark className={cn("h-4 w-4", forum.isBookmarked && "fill-current")} />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function PollCard({
  poll,
  onVote,
  onLike,
}: {
  poll: Poll
  onVote: (pollId: number, optionId: number) => void
  onLike: (id: number) => void
}) {
  const timeLeft = new Date(poll.expiresAt).getTime() - new Date().getTime()
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))

  return (
    <Card className="overflow-hidden border border-black/10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-black/5">
                <AvatarImage src={poll.author.avatar || "/placeholder.svg"} alt={poll.author.name} />
                <AvatarFallback className="bg-purple-500 text-white">{poll.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {poll.author.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-black">{poll.author.name}</p>
                {poll.author.isVerified && <Check className="w-4 h-4 text-blue-500" />}
              </div>
              <p className="text-sm text-black/60">
                {poll.author.username} • {poll.timestamp}
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-400 to-purple-600 text-white">Poll</Badge>
        </div>

        {/* Poll Question */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-black mb-4">{poll.question}</h3>

          {/* Poll Options */}
          <div className="space-y-3">
            {poll.options.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: poll.hasVoted ? 1 : 1.02 }}
                whileTap={{ scale: poll.hasVoted ? 1 : 0.98 }}
              >
                <Button
                  variant="outline"
                  className={cn(
                    "w-full p-4 h-auto justify-between border-black/10 hover:border-black/20 transition-all",
                    poll.hasVoted && poll.votedOption === option.id && "border-purple-500 bg-purple-50",
                    poll.hasVoted && "cursor-default",
                  )}
                  onClick={() => !poll.hasVoted && onVote(poll.id, option.id)}
                  disabled={poll.hasVoted}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-left">{option.text}</span>
                    <div className="flex items-center space-x-2">
                      {poll.hasVoted && <span className="text-sm font-medium">{option.percentage}%</span>}
                      {poll.hasVoted && poll.votedOption === option.id && <Check className="w-4 h-4 text-purple-500" />}
                    </div>
                  </div>
                  {poll.hasVoted && (
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-purple-500 transition-all duration-500"
                      style={{ width: `${option.percentage}%` }}
                    />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Poll Stats */}
          <div className="flex items-center justify-between mt-4 text-sm text-black/60">
            <span>{poll.totalVotes} votes</span>
            <span>{hoursLeft > 0 ? `${hoursLeft}h left` : "Poll ended"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-black/10">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(poll.id)}
              className={cn(
                "flex items-center space-x-2 hover:bg-red-50 transition-colors",
                poll.isLiked ? "text-red-500" : "text-black/60 hover:text-red-500",
              )}
            >
              <Heart className={cn("h-4 w-4", poll.isLiked && "fill-current")} />
              <span>{poll.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-black/60 hover:text-black hover:bg-black/5"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{poll.comments}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-black/60 hover:text-black hover:bg-black/5"
            >
              <Share2 className="h-4 w-4" />
              <span>{poll.shares}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
