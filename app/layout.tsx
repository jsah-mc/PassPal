import type { Metadata } from 'next'
import Script from 'next/script'

import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import SupabaseProvider from '@/integrations/supabase/provider'

import './globals.css'

export const metadata: Metadata = {
  title: 'PassPal',
  applicationName: 'PassPal',
  description: 'PassPal keeps your passwords and secure notes organized.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
}

const themeScript = `
(() => {
  const storageKey = 'theme'
  const getStoredTheme = () => {
    try {
      return localStorage.getItem(storageKey)
    } catch {
      return null
    }
  }
  const storedTheme = getStoredTheme()
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme =
    storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : prefersDark
        ? 'dark'
        : 'light'

  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.classList.toggle('light', theme === 'light')
})()
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <SupabaseProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <SidebarTrigger className="fixed top-4 left-4 z-30 border bg-background shadow-sm md:hidden" />
              <main className="flex-1">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
