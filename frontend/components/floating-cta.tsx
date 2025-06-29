"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogIn, Map, X, ChevronRight, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FloatingCTA() {
  const [showCampusTour, setShowCampusTour] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    // Show buttons after a delay
    const timer = setTimeout(() => {
      setShowButtons(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence>
        {showButtons && (
          <motion.div
            className="fixed bottom-6 right-6 z-40 flex flex-col gap-4"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} className="relative group">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-black/20 to-black/10 opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
              <Button
                size="lg"
                className="relative rounded-full shadow-lg flex items-center gap-2 bg-white border border-black/10 text-black hover:bg-white"
              >
                <LogIn className="h-5 w-5 text-black" />
                <span className="font-medium">Sign Up / Login</span>
                <ChevronRight className="h-4 w-4 text-black/70" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="relative group">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-black/20 to-black/10 opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
              <Button
                size="lg"
                onClick={() => setShowCampusTour(true)}
                className="relative rounded-full shadow-lg flex items-center gap-2 bg-white border border-black/10 text-black hover:bg-white"
              >
                <Globe className="h-5 w-5 text-black" />
                <span className="font-medium">Explore Campus</span>
                <ChevronRight className="h-4 w-4 text-black/70" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campus Tour Modal */}
      <AnimatePresence>
        {showCampusTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl overflow-hidden border border-black/10 shadow-2xl w-full max-w-4xl max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-black/10">
                <h3 className="text-xl font-bold text-black flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-black" />
                  Virtual Campus Tour
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCampusTour(false)}
                  className="rounded-full hover:bg-black/5 text-black/70 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
                <div className="aspect-video bg-black/5 rounded-lg mb-6 flex items-center justify-center border border-black/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-minimal-grid opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-black/10 flex items-center justify-center animate-pulse">
                      <Map className="h-8 w-8 text-black" />
                    </div>
                  </div>
                  <p className="text-black/50 relative z-10">Interactive 3D campus tour would load here</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: "Student Union Hall", color: "black" },
                    { name: "Library", color: "black" },
                    { name: "Sports Center", color: "black" },
                  ].map((place, index) => (
                    <motion.div
                      key={place.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <Button
                        variant="outline"
                        className="rounded-lg h-auto py-3 w-full border-black/10 text-black hover:bg-black/5"
                      >
                        {place.name}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <p className="text-black/70 mb-4">
                  Explore our beautiful campus virtually! Click on different locations to get a 360° view and learn more
                  about our facilities.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
