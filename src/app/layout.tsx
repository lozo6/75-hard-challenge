import type { Metadata, Viewport } from 'next'
import './globals.css'
import StoreProvider from '@/components/StoreProvider'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: '75 Hard Challenge',
  description: 'Minimal 75 Hard tracker with strict/coach modes',
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#020817',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <StoreProvider>
          <ServiceWorkerRegister />
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
