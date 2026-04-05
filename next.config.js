/** @type {import('next').NextConfig} */
// Syntactically valid Clerk test key so the app can build and render without .env.local.
// Auth stays off until you set real keys: https://dashboard.clerk.com (see .env.local.example).
const PLACEHOLDER_CLERK_PUBLISHABLE_KEY = 'pk_test_Y2xlcmsk'

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || PLACEHOLDER_CLERK_PUBLISHABLE_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
}

module.exports = nextConfig
