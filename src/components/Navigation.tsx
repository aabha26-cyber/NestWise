'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from './AuthButton'
import { NestWiseIcon } from '@/components/NestWiseIcon'

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
      <NestWiseIcon name={light ? 'moon' : 'sun'} size={18} className="text-dark-text-secondary" />
    </button>
  )
}

const primaryNav = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/explore', label: 'Explore' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/learn', label: 'Learn' },
  { href: '/chat', label: 'Ask AI' },
]

const moreNav = [
  { href: '/learn/quiz', label: 'Daily quiz' },
  { href: '/goals', label: 'Goals' },
  { href: '/portfolio/report-card', label: 'Report card' },
  { href: '/suggestions', label: 'Suggestions' },
  { href: '/watchlist', label: 'Watchlist' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const moreActive = moreNav.some((m) => pathname === m.href || (m.href !== '/' && pathname.startsWith(m.href)))

  return (
    <nav className="border-b border-dark-border bg-dark-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <span className="text-lg sm:text-xl font-bold text-dark-text-primary whitespace-nowrap">
              NestWise
            </span>
            <span className="text-xs sm:text-sm text-dark-text-secondary hidden sm:inline truncate max-w-[10rem] lg:max-w-none">
              Money skills, clearly explained
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink-0">
            <button
              type="button"
              className="md:hidden px-2.5 py-2 rounded-lg text-sm font-medium border border-dark-border bg-dark-surface text-dark-text-secondary"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              Menu
            </button>
            <div className="hidden md:flex items-center gap-0.5">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 sm:px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                    pathname === item.href
                      ? 'bg-dark-card text-dark-accent-green'
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="relative pl-1" ref={moreRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMoreOpen((o) => !o)
                  }}
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  className={`px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-0.5 ${
                    moreActive || moreOpen
                      ? 'bg-dark-card text-dark-accent-green'
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
                  }`}
                >
                  More
                  <NestWiseIcon
                    name={moreOpen ? 'chevron-down' : 'chevron-down'}
                    size={14}
                    className={`opacity-70 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {moreOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 py-1 min-w-[11rem] rounded-xl border border-dark-border bg-dark-card shadow-xl z-[60]"
                  >
                    {moreNav.map((item) => (
                      <Link
                        key={item.href}
                        role="menuitem"
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`block px-3 py-2.5 text-sm transition-colors ${
                          pathname === item.href
                            ? 'text-dark-accent-green bg-dark-surface/80'
                            : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-surface/50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <ThemeToggle />
            <AuthButton />
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-dark-border py-3 px-1 space-y-0.5 max-h-[70vh] overflow-y-auto">
            {[...primaryNav, ...moreNav].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-dark-card text-dark-accent-green'
                    : 'text-dark-text-secondary hover:bg-dark-card/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
