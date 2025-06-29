"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, Clock, ArrowRight, Users, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { forumApi, type ForumTopic } from "@/services/api"

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Academic: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black/20",
  },
  Events: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black/20",
  },
  Housing: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black/20",
  },
  Social: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black/20",
  },
  General: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black/20",
  },
}

export function ForumPreview() {
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true)
        const topics = await forumApi.getTopicPreviews()
        setForumTopics(topics)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch forum topics:", err)
        setError("Unable to load forum topics. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [])

  return (
    <section className="py-20 bg-white clip-path-slant relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-minimal-grid opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-gradient-to-r from-[#9b9bff] to-[#6262cf] text-white mb-4"
          >
            COMMUNITY DISCUSSIONS
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4 text-black"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join the Conversation
          </motion.h2>

          <motion.p
            className="text-black/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Connect with fellow students, ask questions, and share your thoughts on our active forum. Discover trending
            topics and engage in meaningful discussions.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          {isLoading ? (
            // Loading state - show skeleton loaders
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border border-black/10 bg-white shadow-md p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-black/5 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-20 h-5 bg-black/5 rounded-full animate-pulse"></div>
                        <div className="w-24 h-4 bg-black/5 rounded animate-pulse"></div>
                      </div>
                      <div className="w-3/4 h-6 bg-black/5 rounded mb-2 animate-pulse"></div>
                      <div className="w-full h-4 bg-black/5 rounded mb-2 animate-pulse"></div>
                      <div className="w-full h-4 bg-black/5 rounded mb-4 animate-pulse"></div>
                      <div className="flex items-center justify-between">
                        <div className="w-32 h-4 bg-black/5 rounded animate-pulse"></div>
                        <div className="w-20 h-4 bg-black/5 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : error ? (
            // Error state
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-8"
            >
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="mx-auto"
              >
                Try Again
              </Button>
            </motion.div>
          ) : (
            // Loaded topics
            forumTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ForumTopicCard topic={topic} />
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <Link
            href="/forum"
            className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Button className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md bg-white/95 hover:bg-white/100 text-black transition-all duration-300 group-hover:-translate-y-0.5 border border-black/10 hover:shadow-md">
              <span className="opacity-90 group-hover:opacity-100 transition-opacity">Explore All Topics</span>
              <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function ForumTopicCard({ topic }: { topic: ForumTopic }) {
  // Get category color or use a default if not found
  const categoryColor = categoryColors[topic.category_name] || categoryColors.General;
  
  // Get the fallback character for avatar
  const getAvatarFallback = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };
  
  // Random number of users viewing (for UI enhancement)
  const usersViewing = Math.floor(Math.random() * 10) + 2;
  
  return (
    <Card className="overflow-hidden border border-black/10 bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 ring-2 ring-black/5">
            <AvatarImage 
              src={topic.author.avatar || "/placeholder.svg?height=40&width=40"} 
              alt={topic.author.name} 
            />
            <AvatarFallback className="bg-black/5 text-black">
              {getAvatarFallback(topic.author.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Badge className={cn("rounded-full", categoryColor.bg, categoryColor.text)}>
                {topic.category_name}
              </Badge>
              <span className="text-sm text-black/50 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {topic.last_activity}
              </span>
            </div>

            <h3 className="text-xl font-semibold mb-2 text-black group-hover:text-black/80 transition-colors">
              {topic.title}
              {topic.is_pinned && (
                <span className="ml-2 inline-flex items-center text-black">
                  <Star className="h-4 w-4 fill-black" />
                </span>
              )}
            </h3>
            <p className="text-black/60 mb-4">{topic.preview}</p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-black/50">By {topic.author.name}</span>
              <span className="text-sm text-black/50 flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                {topic.replies_count} replies
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-black/5 border-t border-black/10 flex justify-between items-center">
        <span className="text-sm text-black/50 flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {usersViewing} users viewing
        </span>
        <Link href={`/forum/topic/${topic.id}`}>
          <Button variant="ghost" className="text-black hover:text-black hover:bg-black/10">
            View Discussion
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}