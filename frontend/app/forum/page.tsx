"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  MessageSquare,
  Search,
  Users,
  Clock,
  ArrowRight,
  PlusCircle,
  BookOpen,
  TrendingUp,
  Bookmark,
  Filter,
  ChevronDown,
  Pin,
  Calendar,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { forumApi, ForumTopic } from "@/services/api"

interface ForumCategory {
  id: number
  name: string
  description: string
  icon: React.ReactNode
  topics: number
  posts: number
  color: string
}

const categories: ForumCategory[] = [
  {
    id: 1,
    name: "Academic Discussions",
    description: "Course materials, study groups, and academic advice",
    icon: <BookOpen className="h-6 w-6" />,
    topics: 124,
    posts: 1872,
    color: "text-orange-500",
  },
  {
    id: 2,
    name: "Campus Events",
    description: "Upcoming events, parties, and activities on campus",
    icon: <Calendar className="h-6 w-6" />,
    topics: 87,
    posts: 943,
    color: "text-[#99c805]",
  },
  {
    id: 3,
    name: "Student Life",
    description: "Housing, dining, transportation, and campus facilities",
    icon: <Users className="h-6 w-6" />,
    topics: 156,
    posts: 2341,
    color: "text-[#6262cf]",
  },
  {
    id: 4,
    name: "Career & Opportunities",
    description: "Internships, job postings, and career advice",
    icon: <TrendingUp className="h-6 w-6" />,
    topics: 92,
    posts: 1105,
    color: "text-orange-500",
  },
]

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Academic Discussions": {
    bg: "bg-orange-500/10",
    text: "text-orange-600",
    border: "border-orange-500/20",
  },
  "Campus Events": {
    bg: "bg-[#99c805]/10",
    text: "text-[#99c805]",
    border: "border-[#99c805]/20",
  },
  "Student Life": {
    bg: "bg-[#9b9bff]/10",
    text: "text-[#6262cf]",
    border: "border-[#6262cf]/20",
  },
  "Career & Opportunities": {
    bg: "bg-orange-500/10",
    text: "text-orange-600",
    border: "border-orange-500/20",
  },
  "default": {
    bg: "bg-gray-500/10",
    text: "text-gray-600",
    border: "border-gray-500/20",
  }
}

export default function ForumPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all")
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true)
        const data = await forumApi.getTopicPreviews()
        setTopics(data)
        setError(null)
      } catch (err) {
        setError("Failed to load forum topics. Please try again later.")
        console.error("Error fetching topics:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopics()
  }, [])

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.preview.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || topic.category_name === selectedCategory

    return matchesSearch && matchesCategory
  })

  const pinnedTopics = topics.filter((topic) => topic.is_pinned)

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#9b9bff]/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#99c805]/10 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-black text-white mb-4">
                COMMUNITY FORUM
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 text-black"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join the Conversation
            </motion.h1>

            <motion.p
              className="text-lg text-black/70 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connect with fellow students, ask questions, and share your thoughts on our active forum.
            </motion.p>

            {/* Search and Filter */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-4 mb-8 border border-black/10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 h-4 w-4" />
                  <Input
                    placeholder="Search topics..."
                    className="pl-10 bg-white border-black/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-black/10 rounded-md px-4 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-[#6262cf]"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as string | "all")}
                    aria-label="Filter by category"
                  >
                    <option value="all">All Categories</option>
                    <option value="Academic Discussions">Academic Discussions</option>
                    <option value="Campus Events">Campus Events</option>
                    <option value="Student Life">Student Life</option>
                    <option value="Career & Opportunities">Career & Opportunities</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/40 h-4 w-4 pointer-events-none" />
                </div>

                <Button className="bg-gradient-to-r from-[#9b9bff] to-[#6262cf] text-white hover:opacity-90">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }}>
              <Button className="bg-gradient-to-r from-[#99c805] to-[#e2ff85] text-white hover:opacity-90 rounded-full px-8 py-6 text-lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Start a New Topic
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Forum Categories */}
      <section className="py-12 bg-neutral-white-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-black">Forum Categories</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-black">Discussion Topics</h2>
            <Tabs defaultValue="recent" className="w-full md:w-auto">
              <TabsList className="bg-black/5 w-full md:w-auto">
                <TabsTrigger value="recent" className="flex-1 md:flex-initial">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="popular" className="flex-1 md:flex-initial">
                  Popular
                </TabsTrigger>
                <TabsTrigger value="unanswered" className="flex-1 md:flex-initial">
                  Unanswered
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-black/70 text-lg">Loading topics...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 text-lg">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* Pinned Topics */}
              {pinnedTopics.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-black/70 mb-4 flex items-center">
                    <Pin className="h-4 w-4 mr-2" />
                    Pinned Topics
                  </h3>

                  <div className="space-y-4">
                    {pinnedTopics.map((topic) => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Topics */}
              {filteredTopics.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-black/70 text-lg">No topics found matching your criteria.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTopics
                    .filter((topic) => !topic.is_pinned)
                    .map((topic) => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2 flex-wrap">
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                1
              </Button>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                2
              </Button>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                3
              </Button>
              <span className="text-black/50">...</span>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                8
              </Button>
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                <ArrowRight className="h-4 w-4" aria-label="Next page" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Forum Stats */}
      <section className="py-16 bg-neutral-white-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-minimal-grid opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <Card className="p-6 border border-black/10">
                <h3 className="text-4xl font-bold text-[#6262cf] mb-2">459</h3>
                <p className="text-black/70">Active Topics</p>
              </Card>

              <Card className="p-6 border border-black/10">
                <h3 className="text-4xl font-bold text-[#99c805] mb-2">5,247</h3>
                <p className="text-black/70">Total Posts</p>
              </Card>

              <Card className="p-6 border border-black/10">
                <h3 className="text-4xl font-bold text-orange-500 mb-2">1,892</h3>
                <p className="text-black/70">Community Members</p>
              </Card>
            </div>

            <div className="text-center mt-12">
              <h3 className="text-2xl font-bold mb-4 text-black">Forum Guidelines</h3>
              <p className="text-black/70 mb-6">
                Our forum is a place for respectful and constructive discussion. Please be kind to fellow students and
                follow our community guidelines.
              </p>
              <Button variant="outline" className="rounded-full border-black/10 hover:bg-black/5">
                Read Guidelines
              </Button>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </main>
  )
}

function CategoryCard({ category }: { category: ForumCategory }) {
  return (
    <Card className="border border-black/10 bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
      <div className="p-6 flex items-start gap-4">
        <div className={cn("p-3 rounded-full bg-black/5", category.color)}>{category.icon}</div>

        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-black group-hover:text-black/80 transition-colors">
            {category.name}
          </h3>
          <p className="text-black/60 mb-4">{category.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-black/50">{category.topics} topics</span>
              <span className="text-sm text-black/50">{category.posts} posts</span>
            </div>

            <Button
              variant="ghost"
              className="text-black hover:text-black hover:bg-black/10"
              onClick={() => (window.location.href = "/login")}
            >
              View Category
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function TopicCard({ topic }: { topic: ForumTopic }) {
  const categoryColor = categoryColors[topic.category_name] || categoryColors.default;

  return (
    <Card className="overflow-hidden border border-black/10 bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 ring-2 ring-black/5 shrink-0">
            <AvatarImage src={topic.author.avatar || "/placeholder.svg"} alt={topic.author.name} />
            <AvatarFallback className="bg-black/5 text-black">{topic.author.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <Badge className={cn("rounded-full", categoryColor.bg, categoryColor.text)}>{topic.category_name}</Badge>
              <div className="flex items-center gap-2 flex-wrap">
                {topic.is_pinned && (
                  <Badge variant="outline" className="rounded-full border-black/10 text-black/70">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {topic.views_count > 100 && (
                  <Badge className="rounded-full bg-orange-500/10 text-orange-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Hot
                  </Badge>
                )}
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2 text-black group-hover:text-black/80 transition-colors truncate">
              {topic.title}
            </h3>
            <p className="text-black/60 mb-4 line-clamp-2">{topic.preview}</p>

            <div className="flex flex-wrap items-center justify-between gap-y-2">
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                <span className="text-sm text-black/50">By {topic.author.name}</span>
                <span className="text-sm text-black/50 flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {topic.replies_count} replies
                </span>
                <span className="text-sm text-black/50 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {topic.views_count} views
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-sm text-black/50 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {topic.last_activity}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-black/5 border-t border-black/10 flex justify-between items-center">
        <Button
          variant="ghost"
          className="text-black hover:text-black hover:bg-black/10"
          onClick={() => (window.location.href = `/forum/topic/${topic.id}`)}
        >
          View Discussion
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-black/50 hover:text-black hover:bg-black/10"
          aria-label="Bookmark this topic"
          onClick={() => (window.location.href = "/login")}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
