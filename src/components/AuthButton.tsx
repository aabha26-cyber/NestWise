'use client'

import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function AuthButton() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-dark-surface rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (isSignedIn && user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/profile"
          className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-dark-accent-green/50 interactive-pop inline-flex"
          title="Profile"
        >
          {user.imageUrl ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-dark-accent-green">
              <Image
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-dark-accent-green bg-dark-surface flex items-center justify-center text-xs font-medium text-dark-text-primary">
              {(user.firstName?.[0] || user.primaryEmailAddress?.emailAddress?.[0] || '?').toUpperCase()}
            </div>
          )}
        </Link>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-dark-text-primary">
            {user.fullName || user.firstName || 'User'}
          </p>
          <p className="text-xs text-dark-text-secondary">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
        <SignOutButton>
          <button className="btn-secondary text-sm px-4 py-2 whitespace-nowrap interactive-pop">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    )
  }

  return (
    <SignInButton mode="modal">
      <button className="btn-primary flex items-center space-x-2 whitespace-nowrap interactive-pop">
        <span>Sign in</span>
      </button>
    </SignInButton>
  )
}
