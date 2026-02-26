import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-dark-text-primary mb-2">404</h1>
      <p className="text-dark-text-secondary mb-8">This page could not be found.</p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-dark-accent-green text-white font-medium hover:opacity-90 transition-opacity"
        >
          Go to Home
        </Link>
        <Link
          href="/suggestions"
          className="px-6 py-3 rounded-lg border border-dark-border bg-dark-card text-dark-text-primary font-medium hover:bg-dark-surface transition-colors"
        >
          Investment Suggestions
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-lg border border-dark-border bg-dark-card text-dark-text-primary font-medium hover:bg-dark-surface transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
