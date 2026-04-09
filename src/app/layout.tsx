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
  title: 'NestWise · Your finance journey made easy',
  description:
    'Short lessons, a practice portfolio, and educational Q&A. No real money. Not financial advice.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script: runs before first paint so theme class is set before React hydrates.
            Must not set className on <html> — React reconciliation would strip the injected class. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nestwise_theme');if(t==='light'){document.documentElement.classList.add('light')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className={`min-h-screen bg-dark-bg font-sans antialiased ${nunito.variable} ${nunito.className}`}>
        <Providers>
          <Navigation />
          <main className="relative z-20">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
