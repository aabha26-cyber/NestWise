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

      {/* Stock Market Simulator section */}
      <section className="border-t border-dark-border bg-dark-surface/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-text-primary mb-4">
              Stock Market Simulator
            </h2>
            <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
              Practice stock trading with virtual money. No deposit needed.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-dark-accent-green/20 flex items-center justify-center text-2xl">
                  💻
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-text-primary mb-1">Practice with virtual money</h3>
                  <p className="text-dark-text-secondary text-sm">
                    Choose your starting balance and trade with fake money. Sharpen your knowledge of how the stock market works before risking your own.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-dark-accent-green/20 flex items-center justify-center text-2xl">
                  📈
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-text-primary mb-1">Trade a wide range of stocks & ETFs</h3>
                  <p className="text-dark-text-secondary text-sm">
                    Search by company name or symbol. Whether you’re investing for the first time or exploring new strategies, there’s something for you.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-dark-accent-green/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-text-primary mb-1">Learn at your own pace</h3>
                  <p className="text-dark-text-secondary text-sm">
                    Build your portfolio, track performance, and reset anytime to try a new strategy. No pressure—just learning.
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <Link href="/portfolio" className="btn-primary inline-flex items-center gap-2">
                  <span>Open simulator</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-dark-accent-green to-transparent" />
                <div className="relative text-center p-8">
                  <div className="text-6xl sm:text-7xl mb-4">📊</div>
                  <p className="text-dark-text-primary font-semibold text-lg">Portfolio view</p>
                  <p className="text-dark-text-secondary text-sm mt-1">Cash • Holdings • P&L</p>
                  <div className="mt-6 flex justify-center gap-4 text-sm">
                    <span className="px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-dark-text-secondary">Stocks</span>
                    <span className="px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-dark-text-secondary">ETFs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
