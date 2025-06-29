"use client"

import { motion } from "framer-motion"
import { Calendar, MapPin, Clock, Users, Heart, ChevronRight, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Event, eventApi } from "@/services/api"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

type EventType = "hackathon" | "social" | "volunteer" | "workshop" | "other"

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  hackathon: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black",
  },
  social: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black",
  },
  volunteer: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black",
  },
  workshop: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black",
  },
  other: {
    bg: "bg-black/10",
    text: "text-black",
    border: "border-black",
  },
}

export function EventCards() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const data = await eventApi.getEvents()
        setEvents(data)
      } catch (err) {
        console.error("Failed to fetch events:", err)
        setError("Failed to load events. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <section className="py-20 bg-neutral-white-100 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-gradient-to-r from-orange-400 to-orange-600 text-white mb-4"
          >
            UPCOMING EVENTS
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4 text-black"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Discover What's Happening
          </motion.h2>

          <motion.p
            className="text-black/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            From hackathons to social gatherings, there's something for everyone. Join the excitement and be part of our
            vibrant community.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-black/50" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <Button 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.length > 0 ? (
              events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-4 text-center py-10">
                <p className="text-black/70">No upcoming events at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        )}

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <Link
            href="/events"
            className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Button className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md bg-white/95 hover:bg-white/100 text-black transition-all duration-300 group-hover:-translate-y-0.5 border border-black/10 hover:shadow-md">
              <span className="opacity-90 group-hover:opacity-100 transition-opacity">View All Events</span>
              <ChevronRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function EventCard({ event }: { event: Event }) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const typeColor = typeColors[event.type] || typeColors.other

  const handleInterest = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to mark your interest in events.",
        duration: 3000,
      })
      router.push('/login')
      return
    }

    try {
      // Call the API to mark interest
      const response = await eventApi.markInterest(event.id)
      toast({
        title: "Success!",
        description: response.message,
        duration: 3000,
      })
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Unauthorized, redirect to login
        router.push('/login')
      } else {
        toast({
          title: "Error",
          description: "Failed to mark interest. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      }
    }
  }

  return (
    <motion.div
      className="h-[400px] perspective-1000"
      whileHover={{ scale: 1.03, zIndex: 10 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer",
          isHovered ? "rotate-y-180" : "",
        )}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden">
          <Card className="w-full h-full overflow-hidden border-none bg-white shadow-lg">
            <div className="relative h-48">
              <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div
                className={cn(
                  "absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium",
                  typeColor.bg,
                  typeColor.text,
                )}
              >
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </div>
            </div>
            <div className="p-6 relative">
              {/* Divider line */}
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-black/10"></div>

              <h3 className="text-xl font-bold mb-2 text-black">{event.title}</h3>
              <p className="text-black/70 mb-4 line-clamp-2">{event.description}</p>
              <div className="flex items-center text-black/50 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-black/50">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{event.location}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <Card className="w-full h-full overflow-hidden border border-black/10 bg-white shadow-lg">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-xl font-bold mb-4 text-black">{event.title}</h3>
              <p className="text-black/80 mb-4">{event.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-black/70">
                  <Calendar className="h-4 w-4 mr-2 text-black" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-black/70">
                  <Clock className="h-4 w-4 mr-2 text-black" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-black/70">
                  <MapPin className="h-4 w-4 mr-2 text-black" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-black/70">
                  <Users className="h-4 w-4 mr-2 text-black" />
                  <span>{event.interested} interested</span>
                  {event.capacity && (
                    <span className="ml-1">/ {event.capacity} capacity</span>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <Button 
                  className="w-full rounded-full bg-[#ff3636] hover:bg-[#ff3636]/90 text-white"
                  onClick={handleInterest}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  I'm Interested
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}