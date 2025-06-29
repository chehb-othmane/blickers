// app/providers.tsx
"use client"

import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

// app/layout.tsx - Import and use the Providers
import { Providers as AppProviders } from "./providers"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}