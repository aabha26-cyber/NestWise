import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'An error occurred during authentication.',
  }

  const error = searchParams.error || 'Default'
  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="flex justify-center mb-6">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <AlertTriangle className="w-9 h-9" strokeWidth={1.65} aria-hidden />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-dark-text-primary mb-4">
            Authentication Error
          </h1>
          <p className="text-dark-text-secondary mb-6">{message}</p>
          <Link href="/auth/signin" className="btn-primary inline-block">
            Try Again
          </Link>
          <div className="mt-6">
            <Link
              href="/"
              className="text-sm text-dark-text-secondary hover:text-dark-text-primary"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
