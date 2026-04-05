import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/learn',
  '/learn/(.*)',
  '/goals',
  '/explore',
  '/dashboard',
  '/dashboard/(.*)',
  '/portfolio',
  '/portfolio/(.*)',
  '/watchlist',
  '/chat',
  '/suggestions',
  '/auth/signin(.*)',
  '/auth/signup(.*)',
  '/auth/error',
  /** Let all API handlers run; they return 401 JSON as needed. Otherwise Clerk redirects break client fetch(). */
  '/api/(.*)',
])

// Without a secret key, Clerk middleware cannot authenticate; skip it so the app still runs locally.
const clerkSecretConfigured = Boolean(process.env.CLERK_SECRET_KEY?.trim())

export default clerkSecretConfigured
  ? clerkMiddleware(async (auth, request) => {
      if (isPublicRoute(request)) return

      const url = request.nextUrl

      // Avoid redirect loop: let through when coming back from Clerk (session may not be set yet on first request)
      const referer = request.headers.get('referer') ?? ''
      if (referer.includes('accounts.dev') || referer.includes('clerk.')) return

      // Clerk callback or redirect params – let through so the flow can complete
      if (url.searchParams.has('__clerk') || url.searchParams.has('__clerk_ticket')) return

      // Never redirect to sign-in if we're already on an auth page (safety)
      if (url.pathname.startsWith('/auth/')) return NextResponse.next()

      try {
        const authObj = await auth()
        if (!authObj.userId) {
          const returnBackUrl = url.pathname.startsWith('/auth/') ? '/' : request.url
          return authObj.redirectToSignIn({ returnBackUrl })
        }
      } catch {
        // If Clerk fails (e.g. missing env), allow request through so app routes still resolve
      }
    })
  : function middleware() {
      return NextResponse.next()
    }

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
