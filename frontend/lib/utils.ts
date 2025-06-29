import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get the absolute media URL
export function getMediaUrl(relativePath?: string | null): string {
  if (!relativePath) return ""
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  
  // If the path already starts with http, return as is
  if (relativePath.startsWith('http')) {
    return relativePath
  }
  
  // If the path starts with /, remove it to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
  
  return `${API_BASE_URL}/${cleanPath}`
}
