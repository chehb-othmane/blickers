"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AudioContextType {
  isMuted: boolean
  toggleMute: () => void
  audio: HTMLAudioElement | null
  playAudio: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element only once
    const audioElement = new Audio('/audio.mp3')
    audioElement.loop = true
    audioElement.volume = 0.5
    audioElement.preload = 'auto'
    setAudio(audioElement)

    // Load muted state from localStorage
    const savedMutedState = localStorage.getItem('audioMuted')
    if (savedMutedState === 'true') {
      audioElement.muted = true
      setIsMuted(true)
    }

    // Try to play audio when user interacts with the page
    const handleUserInteraction = () => {
      if (audioElement.paused) {
        audioElement.play().catch(error => {
          console.log('Audio play failed:', error)
        })
      }
      // Remove the event listeners after first interaction
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)

    return () => {
      audioElement.pause()
      audioElement.currentTime = 0
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [])

  const toggleMute = () => {
    if (audio) {
      const newMutedState = !isMuted
      audio.muted = newMutedState
      setIsMuted(newMutedState)
      localStorage.setItem('audioMuted', String(newMutedState))
    }
  }

  const playAudio = () => {
    if (audio && audio.paused) {
      audio.play().catch(error => {
        console.log('Audio play failed:', error)
      })
    }
  }

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, audio, playAudio }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
} 