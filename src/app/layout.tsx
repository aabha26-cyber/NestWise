import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'NestWise — Financial literacy, clearly explained',
  description:
    'Budgeting, credit, taxes, insurance, investing, and more. Courses, daily quiz, and a simulator — educational, not advice.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-bg">
        <Providers>
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
