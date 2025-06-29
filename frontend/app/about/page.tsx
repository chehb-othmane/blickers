"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Users, Award, Calendar, BookOpen, Heart, ChevronRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"


interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  avatar: string
  social: {
    email: string
    linkedin?: string
    twitter?: string
  }
}

interface Achievement {
  id: number
  title: string
  description: string
  year: string
  icon: React.ReactNode
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Hamza Benaghmouch",
    role: "President",
    bio: "Computer Science major with a passion for student advocacy and technology. Leading initiatives to enhance student experience on campus.",
    avatar: "/oth.jpeg?height=200&width=200",
    social: {
      email: "emma@blickers.edu",
      linkedin: "linkedin.com/in/emma-rodriguez",
      twitter: "twitter.com/emmarod",
    },
  },
  {
    id: 2,
    name: "Othmane Chehbouni",
    role: "Vice President",
    bio: "Business Administration student focused on creating meaningful connections between students and local businesses.",
    avatar: "/oth.jpeg?height=200&width=200",
    social: {
      email: "marcus@blickers.edu",
      linkedin: "linkedin.com/in/marcus-chen",
    },
  },
  {
    id: 3,
    name: "Sophia Patel",
    role: "Events Coordinator",
    bio: "Communications major with experience in event planning and community building. Passionate about creating inclusive campus events.",
    avatar: "/placeholder.svg?height=200&width=200",
    social: {
      email: "sophia@blickers.edu",
      twitter: "twitter.com/sophiapatel",
    },
  },
  {
    id: 4,
    name: "Jordan Taylor",
    role: "Treasurer",
    bio: "Finance student with a keen eye for budgeting and resource allocation. Ensuring student funds are used effectively.",
    avatar: "/placeholder.svg?height=200&width=200",
    social: {
      email: "jordan@blickers.edu",
      linkedin: "linkedin.com/in/jordan-taylor",
    },
  },
  {
    id: 5,
    name: "Zoe Washington",
    role: "Communications Director",
    bio: "Journalism major who manages all student union communications and social media presence. Advocate for transparent communication.",
    avatar: "/placeholder.svg?height=200&width=200",
    social: {
      email: "zoe@blickers.edu",
      twitter: "twitter.com/zoewash",
    },
  },
  {
    id: 6,
    name: "Alex Kim",
    role: "Technology Officer",
    bio: "Computer Engineering student who maintains the Blickers platform and explores new ways to use technology to improve student life.",
    avatar: "/placeholder.svg?height=200&width=200",
    social: {
      email: "alex@blickers.edu",
      linkedin: "linkedin.com/in/alex-kim",
    },
  },
]

const achievements: Achievement[] = [
  {
    id: 1,
    title: "Best Student Platform",
    description: "Recognized for creating the most innovative digital platform for student engagement.",
    year: "2023",
    icon: <Award className="h-8 w-8" />,
  },
  {
    id: 2,
    title: "Community Service Award",
    description: "Honored for organizing volunteer initiatives that contributed over 5,000 hours to local communities.",
    year: "2022",
    icon: <Heart className="h-8 w-8" />,
  },
  {
    id: 3,
    title: "Campus Event of the Year",
    description: "Our annual cultural festival was recognized as the most impactful campus event.",
    year: "2022",
    icon: <Calendar className="h-8 w-8" />,
  },
  {
    id: 4,
    title: "Academic Support Excellence",
    description: "Acknowledged for creating peer tutoring programs that improved student academic performance.",
    year: "2021",
    icon: <BookOpen className="h-8 w-8" />,
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-minimal-dots opacity-30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#99c805]/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#9b9bff]/10 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-gradient-to-r from-[#99c805] to-[#e2ff85] text-white mb-4">
                ABOUT BLICKERS
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 text-black"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your Student Union
            </motion.h1>

            <motion.p
              className="text-lg text-black/70 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We're dedicated to enhancing student life, fostering community, and representing student interests on
              campus.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-neutral-white-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-black">Our Mission</h2>
              <p className="text-black/70 mb-4">
                At Blickers, we believe in the power of student community. Our mission is to create a vibrant, inclusive
                campus environment where every student can thrive academically, socially, and personally.
              </p>
              <p className="text-black/70 mb-6">
                We work tirelessly to represent student interests, organize engaging events, facilitate meaningful
                discussions, and provide resources that enhance the university experience for all.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="mr-4 p-2 bg-orange-500/10 rounded-full text-orange-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black">Community</h3>
                    <p className="text-sm text-black/70">Building connections</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 p-2 bg-[#99c805]/10 rounded-full text-[#99c805]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black">Events</h3>
                    <p className="text-sm text-black/70">Creating experiences</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 p-2 bg-[#9b9bff]/10 rounded-full text-[#6262cf]">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black">Support</h3>
                    <p className="text-sm text-black/70">Academic resources</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 p-2 bg-orange-500/10 rounded-full text-orange-500">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black">Advocacy</h3>
                    <p className="text-sm text-black/70">Student representation</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-5 -left-5 w-10 h-10 border-t-2 border-l-2 border-[#99c805]"></div>
              <div className="absolute -bottom-5 -right-5 w-10 h-10 border-b-2 border-r-2 border-orange-500"></div>

              <div className="bg-white rounded-2xl overflow-hidden border border-black/10 shadow-lg">
                <div className="aspect-video bg-black/5 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src="/placeholder.svg?height=400&width=600"
                      alt="Student Union"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-black">Student-Centered Approach</h3>
                  <p className="text-black/70">
                    Everything we do is guided by student needs and feedback. We're constantly evolving to better serve
                    our diverse student body.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl font-bold mb-4 text-black"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Meet Our Team
            </motion.h2>

            <motion.p
              className="text-black/70 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Our dedicated team of student leaders works tirelessly to represent your interests and create a vibrant
              campus community.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TeamMemberCard member={member} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History & Achievements */}
      <section className="py-16 bg-neutral-white-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-minimal-grid opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl font-bold mb-4 text-black"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Our History & Achievements
            </motion.h2>

            <motion.p
              className="text-black/70 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Since our founding in 2010, Blickers has grown from a small group of passionate students to a
              comprehensive student union serving thousands.
            </motion.p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-black/10"></div>

              {/* Timeline Items */}
              <div className="space-y-12">
                <TimelineItem
                  year="2010"
                  title="The Beginning"
                  description="Blickers was founded by a group of 5 students with a vision to improve campus life."
                  position="left"
                />

                <TimelineItem
                  year="2015"
                  title="Digital Transformation"
                  description="Launched our first digital platform to connect students and streamline event management."
                  position="right"
                />

                <TimelineItem
                  year="2018"
                  title="Expansion"
                  description="Grew to represent over 10,000 students and expanded our services to include academic support."
                  position="left"
                />

                <TimelineItem
                  year="2020"
                  title="Virtual Adaptation"
                  description="Successfully transitioned to virtual events and support during the global pandemic."
                  position="right"
                />

                <TimelineItem
                  year="2023"
                  title="New Horizons"
                  description="Launched the redesigned Blickers platform with enhanced features for student engagement."
                  position="left"
                />
              </div>
            </div>

            {/* Achievements */}
            <div className="mt-20">
              <h3 className="text-2xl font-bold mb-8 text-black text-center">Recognition & Awards</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="border border-black/10 bg-white shadow-md p-6">
                      <div className="flex items-start">
                        <div className="mr-4 p-3 bg-black/5 rounded-full text-[#99c805]">{achievement.icon}</div>
                        <div>
                          <div className="flex items-center mb-2">
                            <h4 className="font-bold text-black">{achievement.title}</h4>
                            <Badge className="ml-2 bg-orange-500/10 text-orange-600">{achievement.year}</Badge>
                          </div>
                          <p className="text-black/70">{achievement.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl font-bold mb-4 text-black"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Join Our Team
            </motion.h2>

            <motion.p
              className="text-black/70 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Passionate about making a difference on campus? We're always looking for dedicated students to join our
              team and help shape the future of student life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Button className="bg-gradient-to-r from-[#9b9bff] to-[#6262cf] text-white hover:opacity-90 rounded-full px-8 py-6 text-lg">
                Apply to Join
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      

      <Footer />
    </main>
  )
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="overflow-hidden border border-black/10 bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
      <div className="p-6 text-center">
        <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-black/5">
          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
          <AvatarFallback className="bg-black/5 text-black text-xl">{member.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <h3 className="text-xl font-bold mb-1 text-black">{member.name}</h3>
        <Badge className="mb-4 bg-[#99c805]/10 text-[#99c805]">{member.role}</Badge>

        <p className="text-black/70 mb-6">{member.bio}</p>

        <div className="flex justify-center space-x-4">
          <Button variant="outline" size="sm" className="rounded-full border-black/10 hover:bg-black/5">
            Contact
          </Button>
        </div>
      </div>
    </Card>
  )
}

function TimelineItem({
  year,
  title,
  description,
  position,
}: {
  year: string
  title: string
  description: string
  position: "left" | "right"
}) {
  return (
    <motion.div
      className={`flex items-center ${position === "left" ? "flex-row" : "flex-row-reverse"}`}
      initial={{ opacity: 0, x: position === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className={`w-1/2 ${position === "left" ? "pr-8 text-right" : "pl-8"}`}>
        <h3 className="text-xl font-bold text-black">{title}</h3>
        <p className="text-black/70">{description}</p>
      </div>

      <div className="relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#99c805] z-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#99c805]/30 animate-pulse"></div>
      </div>

      <div className={`w-1/2 ${position === "left" ? "pl-8" : "pr-8 text-right"}`}>
        <Badge className="bg-orange-500/10 text-orange-600">{year}</Badge>
      </div>
    </motion.div>
  )
}
