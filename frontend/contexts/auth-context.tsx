"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { login as loginService, logout as logoutService } from "@/services/auth"

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  profile_picture: string | null
  bio: string | null
  year_of_study: number | null
  major: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("access_token")
        const userData = localStorage.getItem("user_data")
        
        if (accessToken && userData) {
          // Set user data from localStorage
          setUser(JSON.parse(userData))
          setIsLoading(false)
        } else {
          setUser(null)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await loginService(email, password)
      setUser(response.user)
      // Store user data in localStorage
      localStorage.setItem("user_data", JSON.stringify(response.user))
      router.push("/")
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await logoutService()
      setUser(null)
      // Clear user data from localStorage
      localStorage.removeItem("user_data")
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
      // Still clear user state even if the API call fails
      setUser(null)
      localStorage.removeItem("user_data")
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 