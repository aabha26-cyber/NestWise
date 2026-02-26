import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/learn',
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
  '/api/webhook(.*)',
  '/api/stocks',
  '/api/stocks/(.*)',
  '/api/stock-overview',
  '/api/portfolio',
  '/api/portfolio/init',
  '/api/portfolio/reset',
  '/api/fear-greed',
  '/api/chat',
])

export default clerkMiddleware(async (auth, request) => {
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

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
