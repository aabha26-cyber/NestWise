'use client'

import { useEffect } from 'react'
import { ClerkProvider } from '@clerk/nextjs'

function ThemeSync() {
  useEffect(() => {
    const theme = typeof window !== 'undefined' ? localStorage.getItem('nestwise_theme') : null
    if (theme === 'light') document.documentElement.classList.add('light')
    else document.documentElement.classList.remove('light')
  }, [])
  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeSync />
      {children}
    </ClerkProvider>
  )
}
