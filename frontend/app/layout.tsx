import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AudioProvider } from '@/contexts/audio-context'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Blickers',
  description: 'Your Student Union Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="mdl-js">
      <body className={inter.className}>
        <AuthProvider>
        <AudioProvider>
          {children}
        </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
