'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export default function Home() {
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-dark-text-primary mb-6">
            Learn investing without pressure
          </h1>
          <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto mb-12">
            Track markets, simulate portfolios, and ask AI — no advice, just clarity.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <Link href="/learn" className="card hover:border-dark-accent-green/50 transition-all duration-300 group">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
              Learn
            </h3>
            <p className="text-dark-text-secondary">
              Understand the basics of investing with simple, beginner-friendly explanations.
            </p>
          </Link>

          <Link href="/portfolio" className="card hover:border-dark-accent-green/50 transition-all duration-300 group">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
              Simulate
            </h3>
            <p className="text-dark-text-secondary">
              Practice with a simulated portfolio. No real money, just learning.
            </p>
          </Link>

          <Link href="/chat" className="card hover:border-dark-accent-green/50 transition-all duration-300 group">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
              Ask AI
            </h3>
            <p className="text-dark-text-secondary">
              Get educational answers to your investing questions. Always safe, never advice.
            </p>
          </Link>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          {isSignedIn ? (
            <Link href="/dashboard" className="btn-primary inline-block">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/auth/signin" className="btn-primary inline-block">
              Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Disclaimer Footer */}
      <footer className="border-t border-dark-border bg-dark-surface/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm text-dark-text-muted text-center max-w-3xl mx-auto">
            <strong className="text-dark-text-secondary">Disclaimer:</strong> NestWise is an educational platform only. 
            This app does not provide financial advice, investment recommendations, or trading signals. 
            All portfolio simulations use fake money. Market data is for educational purposes. 
            Always consult with a qualified financial advisor before making investment decisions. 
            Inspired by modern investing apps like Wealthsimple, but with no real account connections.
          </p>
        </div>
      </footer>
    </div>
  )
}
