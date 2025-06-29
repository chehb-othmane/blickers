"use client"
import { motion } from "framer-motion"
import { ArrowDown, Calendar, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

// Import Link at the top of the file
import Link from "next/link"

// Update the FloatingPaths component to use the same colors as the rectangles
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => {
    // Determine color based on index to create variety
    let color
    if (i % 3 === 0) {
      // Orange paths (same as "Upcoming Events" rectangle)
      color = `rgba(249, 115, 22, ${0.2 + i * 0.01})`
    } else if (i % 3 === 1) {
      // Green paths (same as "Forums" rectangle)
      color = `rgba(153, 200, 5, ${0.2 + i * 0.01})`
    } else {
      // Purple paths (same as the four small rectangles)
      color = `rgba(155, 155, 255, ${0.2 + i * 0.01})`
    }

    return {
      id: i,
      d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
        380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
        152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
        684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
      color: color,
      width: 0.5 + i * 0.03,
    }
  })

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Floating paths background */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Remove the FloatingColorPath component usage */}

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-orange-400/20 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-[#99c805]/20 blur-3xl"></div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="mb-8">
            <span className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-black text-white mb-4">
              STUDENT UNION PLATFORM
            </span>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter flex flex-wrap items-center justify-center">
            <motion.span
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 150,
                damping: 25,
              }}
              className="text-black mr-4"
            >
              Welcome to
            </motion.span>
            <motion.span
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 150,
                damping: 25,
              }}
              className="text-black bg-clip-text bg-gradient-to-r from-black to-black/80"
            >
              Blickers
            </motion.span>
          </h1>

          <motion.p
            className="text-xl md:text-2xl mb-10 text-black/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Connect, engage, and experience university life like never before
          </motion.p>

          {/* Replace the Button components in the flex container with: */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Link
              href="/events"
              className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <Button
                size="lg"
                className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md bg-white/95 hover:bg-white/100 text-black transition-all duration-300 group-hover:-translate-y-0.5 border border-black/10 hover:shadow-md"
              >
                <Calendar className="mr-2 h-5 w-5" />
                <span className="opacity-90 group-hover:opacity-100 transition-opacity">Explore Events</span>
                <span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300">
                  →
                </span>
              </Button>
            </Link>

            <Link href="/forum">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full text-lg px-8 py-6 border-black/10 text-black hover:bg-black/5 transition-all hover:scale-105"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Join Forums
              </Button>
            </Link>
          </motion.div>

          {/* Platform Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="relative mx-auto max-w-3xl"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
                className="bg-white rounded-2xl overflow-hidden border border-black/10 shadow-lg"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <div className="w-3 h-3 rounded-full bg-[#99c805]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#9b9bff]"></div>
                    </div>
                    <div className="text-black/50 text-sm">Blickers Platform</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <div className="h-40 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">Upcoming Events</span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="h-40 rounded-lg bg-gradient-to-tr from-[#e2ff85] to-[#99c805] flex items-center justify-center">
                        <span className="text-white font-bold text-xl">Forums</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-lg bg-[#9b9bff] flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#6262cf]"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -top-5 -left-5 w-10 h-10 border-t-2 border-l-2 border-orange-500"></div>
              <div className="absolute -bottom-5 -right-5 w-10 h-10 border-b-2 border-r-2 border-[#99c805]"></div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ArrowDown className="text-black/70" />
        </motion.div>
      </div>
    </section>
  )
}
