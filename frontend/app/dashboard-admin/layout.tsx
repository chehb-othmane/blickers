"use client"

import type React from "react"

import { ThemeProvider } from "@/lib/theme-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="theme-transition">{children}</div>
    </ThemeProvider>
  )
}
