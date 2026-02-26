'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isClerkSetup =
    error?.message?.toLowerCase().includes('publishable') ||
    error?.message?.toLowerCase().includes('clerk')

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui', background: '#0f0f0f', color: '#e5e5e5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Something went wrong</h1>
          {isClerkSetup ? (
            <p style={{ color: '#a3a3a3', marginBottom: 24 }}>
              Add your Clerk keys to <code style={{ background: '#262626', padding: '2px 6px', borderRadius: 4 }}>.env.local</code> and restart the dev server. Get keys at{' '}
              <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" style={{ color: '#059669' }}>dashboard.clerk.com</a>.
            </p>
          ) : (
            <p style={{ color: '#a3a3a3', marginBottom: 24 }}>{error?.message || 'An error occurred.'}</p>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{ padding: '12px 24px', borderRadius: 8, background: '#059669', color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer' }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid #404040', color: '#e5e5e5', textDecoration: 'none', fontWeight: 500 }}
            >
              Go to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
