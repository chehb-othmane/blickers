"use client"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { EventCards } from "@/components/event-cards"
import { ForumPreview } from "@/components/forum-preview"
import { FloatingCTA } from "@/components/floating-cta"
import { Footer } from "@/components/footer"


export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <EventCards />
      <ForumPreview />
      <FloatingCTA />
      <Footer />
    </main>
  )
}
