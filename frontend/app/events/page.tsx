"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, Clock, Users, Heart, Search, Filter, ChevronDown, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Event, eventApi } from "@/services/api" // Import the API service


type EventType = "hackathon" | "social" | "volunteer" | "workshop" | "cultural" | "sports"

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  hackathon: {
    bg: "bg-orange-500/10",
    text: "text-orange-600",
    border: "border-orange-500/20",
  },
  social: {
    bg: "bg-[#99c805]/10",
    text: "text-[#99c805]",
    border: "border-[#99c805]/20",
  },
  volunteer: {
    bg: "bg-[#9b9bff]/10",
    text: "text-[#6262cf]",
    border: "border-[#6262cf]/20",
  },
  workshop: {
    bg: "bg-orange-500/10",
    text: "text-orange-600",
    border: "border-orange-500/20",
  },
  cultural: {
    bg: "bg-[#9b9bff]/10",
    text: "text-[#6262cf]",
    border: "border-[#6262cf]/20",
  },
  sports: {
    bg: "bg-[#99c805]/10",
    text: "text-[#99c805]",
    border: "border-[#99c805]/20",
  },
  other: { // Default color for any unrecognized event type
    bg: "bg-gray-200",
    text: "text-gray-700",
    border: "border-gray-300",
  }
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const data = await eventApi.getEvents()
        setEvents(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch events:", err)
        setError("Failed to load events. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || event.type === selectedType

    return matchesSearch && matchesType
  })

  // Extract featured events (you might need to adjust this based on your backend data)
  const featuredEvents = events.filter((event) => 
    // Assuming events with high interest count are featured
    event.interested > 100
  ).slice(0, 3) // Get up to 3 featured events

  // Handle interest button click
  const handleInterestClick = async (eventId: number) => {
    try {
      await eventApi.markInterest(eventId)
      
      // Update the local state to reflect the change
      // This is a simplified approach - in a real app, you might want to fetch the updated data
      setEvents(events.map(event => {
        if (event.id === eventId) {
          return { ...event, interested: event.interested + 1 }
        }
        return event
      }))
    } catch (err) {
      console.error("Failed to mark interest:", err)
      // You might want to show an error toast or message here
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-400/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#9b9bff]/10 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-black text-white mb-4">
                EVENTS CALENDAR
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 text-black"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Discover Campus Events
            </motion.h1>

            <motion.p
              className="text-lg text-black/70 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Find and join exciting events happening around campus. From workshops to parties, there's something for
              everyone.
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
                    placeholder="Search events..."
                    className="pl-10 bg-white border-black/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search events"
                  />
                </div>

                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-black/10 rounded-md px-4 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-[#99c805]"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    aria-label="Filter by event type"
                  >
                    <option value="all">All Types</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="social">Social</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="workshop">Workshop</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/40 h-4 w-4 pointer-events-none" />
                </div>

                <Button className="bg-gradient-to-r from-[#99c805] to-[#e2ff85] text-white hover:opacity-90">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse inline-block h-8 w-8 rounded-full bg-[#99c805]"></div>
          <p className="mt-4 text-black/70">Loading events...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
            <p>{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Featured Events */}
      {!loading && !error && featuredEvents.length > 0 && (
        <section className="py-12 bg-neutral-white-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-black">Featured Events</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <FeaturedEventCard key={event.id} event={event} onInterestClick={handleInterestClick} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Events */}
      {!loading && !error && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-black">All Events</h2>
              <Tabs defaultValue="upcoming" className="w-full md:w-auto">
                <TabsList className="bg-black/5 w-full md:w-auto">
                  <TabsTrigger value="upcoming" className="flex-1 md:flex-initial">
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger value="past" className="flex-1 md:flex-initial">
                    Past
                  </TabsTrigger>
                  <TabsTrigger value="interested" className="flex-1 md:flex-initial">
                    I'm Interested
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-black/70 text-lg">No events found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedType("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} onInterestClick={handleInterestClick} />
                ))}
              </div>
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
                <Button variant="outline" size="sm" className="w-8 h-8 p-0" aria-label="Next page">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Create Event CTA */}
      <section className="py-16 bg-neutral-white-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-minimal-grid opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-black">Want to organize an event?</h2>
            <p className="text-black/70 mb-8">
              If you're part of a student organization or club, you can submit your event to be featured on our
              platform.
            </p>
            <Button className="bg-gradient-to-r from-[#99c805] to-[#e2ff85] text-white hover:opacity-90 rounded-full px-8 py-6 text-lg">
              Submit Your Event
            </Button>
          </div>
        </div>
      </section>

      

      <Footer />
    </main>
  )
}

// Updates to components to support the API data

function FeaturedEventCard({ event, onInterestClick }: { event: Event, onInterestClick: (id: number) => void }) {
  const typeColor = typeColors[event.type] || typeColors.other;
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch (e) {
      return dateStr
    }
  }

  return (
    <Card className="overflow-hidden border border-black/10 bg-white shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48">
        <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className={cn("rounded-full mb-2", typeColor.bg, typeColor.text)}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Badge>
          <h3 className="text-xl font-bold text-white">{event.title}</h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-black/70 mb-4 line-clamp-2">{event.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-black/70">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-black/70">
            <Clock className="h-4 w-4 mr-2" />
            <span>{event.time}</span>
          </div>
        </div>

        <div className="flex items-center text-black/70 mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{event.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-black/50 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {event.interested} interested
          </span>

          <Button
            className="rounded-full bg-[#ff3636] hover:bg-[#ff3636]/90 text-white"
            onClick={() => onInterestClick(event.id)}
          >
            <Heart className="mr-2 h-4 w-4" />
            I'm Interested
          </Button>
        </div>
      </div>
    </Card>
  )
}

function EventCard({ event, onInterestClick }: { event: Event, onInterestClick: (id: number) => void }) {
  const typeColor = typeColors[event.type] || typeColors.other;
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch (e) {
      return dateStr
    }
  }

  return (
    <Card className="overflow-hidden border border-black/10 bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-40">
        <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
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

      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 text-black group-hover:text-black/80 transition-colors">{event.title}</h3>
        <p className="text-black/70 mb-4 line-clamp-2">{event.description}</p>

        <div className="flex items-center text-black/50 mb-2">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">{formatDate(event.date)}</span>
          <Clock className="h-4 w-4 ml-4 mr-2" />
          <span className="text-sm">{event.time}</span>
        </div>

        <div className="flex items-center text-black/50 mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm">{event.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-black/50 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {event.interested} interested
          </span>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-black/10 hover:bg-black/5"
              onClick={() => window.location.href = `/events/${event.id}`}
            >
              Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-black/10 hover:bg-[#ff3636]/10"
              onClick={() => onInterestClick(event.id)}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}