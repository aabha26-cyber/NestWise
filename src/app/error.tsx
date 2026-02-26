'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-dark-bg text-dark-text-primary">
      <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
      <p className="text-dark-text-secondary mb-6 text-center max-w-md">
        {error?.message || 'An error occurred.'}
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-3 rounded-lg bg-dark-accent-green text-white font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg border border-dark-border bg-dark-card font-medium hover:bg-dark-surface transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}
