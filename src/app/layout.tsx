import type { Metadata } from 'next'
import './globals.css'
import StoreProvider from '@/components/StoreProvider'

export const metadata: Metadata = {
  title: '75 Hard Challenge',
  description: 'Minimal 75 Hard tracker with strict/coach modes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
