import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

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
  '/auth/signin(.*)',
  '/auth/signup(.*)',
  '/api/webhook(.*)',
  '/api/stocks',
  '/api/stocks/(.*)',
  '/api/stock-overview',
  '/api/portfolio',
  '/api/portfolio/init',
  '/api/portfolio/reset',
])

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return

  // Avoid redirect loop: if the request is coming back from Clerk (e.g. after sign-in),
  // let it through so the session cookie can be set and the page can load.
  const referer = request.headers.get('referer') ?? ''
  if (referer.includes('accounts.dev') || referer.includes('clerk.')) return

  const authObj = await auth()
  if (!authObj.userId) {
    return authObj.redirectToSignIn({ returnBackUrl: request.url })
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
