'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from './AuthButton'

function ThemeToggle() {
  const [light, setLight] = useState(false)
  useEffect(() => {
    setLight(document.documentElement.classList.contains('light'))
  }, [])
  const toggle = () => {
    const next = !document.documentElement.classList.contains('light')
    if (next) {
      document.documentElement.classList.add('light')
      localStorage.setItem('nestwise_theme', 'light')
    } else {
      document.documentElement.classList.remove('light')
      localStorage.setItem('nestwise_theme', 'dark')
    }
    setLight(next)
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-lg border border-dark-border bg-dark-surface hover:bg-dark-card text-dark-text-secondary hover:text-dark-text-primary transition-colors"
      title={light ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {light ? '🌙' : '☀️'}
    </button>
  )
}

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/explore', label: 'Explore' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/suggestions', label: 'Suggestions' },
    { href: '/watchlist', label: 'Watchlist' },
    { href: '/chat', label: 'Ask AI' },
    { href: '/learn', label: 'Learn' },
  ]

  return (
    <nav className="border-b border-dark-border bg-dark-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-dark-text-primary whitespace-nowrap">
              NestWise
            </span>
            <span className="text-sm text-dark-text-secondary hidden sm:inline whitespace-nowrap">
              Calm investing, clearly explained
            </span>
          </Link>

          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <div className="hidden md:flex items-center gap-1 flex-nowrap overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                    pathname === item.href
                      ? 'bg-dark-card text-dark-accent-green'
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
