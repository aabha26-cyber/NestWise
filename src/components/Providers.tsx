'use client'

import { useEffect } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { nestWiseClerkAppearance } from '@/lib/clerkAppearance'
import { MoneyRainGate } from '@/components/MoneyRain'
import SplashScreen from '@/components/SplashScreen'

function ThemeSync() {
  useEffect(() => {
    /* The blocking <script> in layout.tsx already applied the correct theme class
       before first paint. This effect only runs as a safety-net: if somehow neither
       class is present (e.g. SSR-only render with no JS), default to dark. */
    const html = document.documentElement
    if (!html.classList.contains('light') && !html.classList.contains('dark')) {
      const saved = localStorage.getItem('nestwise_theme')
      html.classList.add(saved === 'light' ? 'light' : 'dark')
    }
  }, [])
  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={nestWiseClerkAppearance}>
      <ThemeSync />
      <SplashScreen />
      <MoneyRainGate />
      {children}
    </ClerkProvider>
  )
}
