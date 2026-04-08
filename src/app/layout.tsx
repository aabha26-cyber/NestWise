import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Providers from '@/components/Providers'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NestWise — Learn money skills, practice with a simulator, ask AI',
  description:
    'Learn how money works, practice investing with virtual cash, and get plain-English answers—all in one free app. No real money. Educational only, not financial advice.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${nunito.variable}`}>
      <body className={`min-h-screen bg-dark-bg font-sans antialiased ${nunito.className}`}>
        <Providers>
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
