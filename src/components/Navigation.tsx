'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from './AuthButton'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/explore', label: 'Explore' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/watchlist', label: 'Watchlist' },
    { href: '/chat', label: 'Ask AI' },
    { href: '/learn', label: 'Learn' },
  ]

  return (
    <nav className="border-b border-dark-border bg-dark-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-dark-text-primary">
              NestWise
            </span>
            <span className="text-sm text-dark-text-secondary hidden sm:inline">
              Calm investing, clearly explained
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-dark-card text-dark-accent-green'
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
