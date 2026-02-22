import Link from 'next/link'

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
          <div className="text-5xl mb-4">⚠️</div>
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
