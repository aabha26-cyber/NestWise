'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { getSimulatorState } from '@/lib/simulatorStorage'
import { getMultipleStocks } from '@/lib/stockApi'
import { getOrCreatePortfolio, getHoldings } from '@/lib/portfolio'
import { IconOrb, NestWiseIcon } from '@/components/NestWiseIcon'

export default function Home() {
  const { isSignedIn, user } = useUser()
  const [portfolioValue, setPortfolioValue] = useState<number | null>(null)
  const [dailyChange, setDailyChange] = useState<number | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  useEffect(() => {
    if (!isSignedIn || !user?.id) return
    const userId = user.id
    let cancelled = false
    async function load() {
      const localState = getSimulatorState(userId)
      if (localState) {
        let stocksValue = 0
        if (localState.holdings.length > 0) {
          const stocks = await getMultipleStocks(localState.holdings.map((h) => h.symbol))
          const map = new Map(stocks.map((s) => [s.symbol, s]))
          for (const h of localState.holdings) {
            stocksValue += (map.get(h.symbol)?.price ?? 0) * h.shares
          }
        }
        const total = localState.cashBalance + stocksValue
        const history = localState.valueHistory || []
        const prev = history.length >= 2 ? history[history.length - 2]?.totalValue : null
        if (!cancelled) {
          setPortfolioValue(total)
          setDailyChange(prev != null ? total - prev : null)
        }
        return
      }
      try {
        const portfolio = await getOrCreatePortfolio(userId)
        const holdings = await getHoldings(portfolio.id)
        let total = portfolio.cash_balance
        if (holdings.length > 0) {
          const stocks = await getMultipleStocks(holdings.map((h) => h.symbol))
          const map = new Map(stocks.map((s) => [s.symbol, s]))
          for (const h of holdings) {
            total += (map.get(h.symbol)?.price ?? 0) * h.shares
          }
        }
        if (!cancelled) setPortfolioValue(total)
      } catch {
        if (!cancelled) setPortfolioValue(null)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isSignedIn, user?.id])

  return (
    <div className="min-h-screen">
      {/* Signed-in: Wealth summary */}
      {isSignedIn && portfolioValue != null && (
        <section className="border-b border-dark-border bg-dark-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-dark-text-secondary text-sm mb-1">Your portfolio</p>
                <p className="text-2xl sm:text-3xl font-bold text-dark-text-primary">
                  ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {dailyChange != null && (
                  <p className={`text-sm mt-1 ${dailyChange >= 0 ? 'text-dark-accent-green' : 'text-red-500'}`}>
                    {dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(2)} today
                  </p>
                )}
              </div>
              <Link href="/dashboard" className="btn-primary interactive-pop inline-flex items-center gap-2">
                View dashboard
                <NestWiseIcon name="arrow-right" size={18} className="opacity-90" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="home-hero-animate-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-text-primary mb-6 opacity-0 animate-home-hero-title tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Learn money by doing—lessons, practice trades, and plain-English help
          </h1>
          <p className="home-hero-animate-sub text-lg sm:text-xl text-dark-text-secondary max-w-2xl mx-auto mb-12 opacity-0 animate-home-hero-sub leading-relaxed">
            NestWise is here to nudge you into action: open a short course when you have five minutes, try the stock simulator
            with fake money, or ask the AI to explain a term. Pick any path below—small steps add up.
            <span className="mt-4 block text-sm sm:text-base text-dark-text-muted font-semibold">
              Free to use · Educational only—not financial advice
            </span>
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <Link
            href="/learn"
            style={{ animationDelay: '220ms' }}
            className="home-feature-animate card interactive-pop opacity-0 animate-home-card-in hover:border-dark-accent-green/60 transition-all duration-300 group hover:shadow-[0_12px_40px_-8px_rgba(88,204,2,0.22)]"
          >
            <div className="mb-5">
              <IconOrb name="book-open" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
              Learn
            </h3>
            <p className="text-dark-text-secondary">
              Understand the basics of investing with simple, beginner-friendly explanations.
            </p>
          </Link>

          <Link
            href="/portfolio"
            style={{ animationDelay: '360ms' }}
            className="home-feature-animate card interactive-pop opacity-0 animate-home-card-in hover:border-dark-accent-green/60 transition-all duration-300 group hover:shadow-[0_12px_40px_-8px_rgba(88,204,2,0.22)]"
          >
            <div className="mb-5">
              <IconOrb name="briefcase" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
              Simulate
            </h3>
            <p className="text-dark-text-secondary">
              Practice with a simulated portfolio. No real money, just learning.
            </p>
          </Link>

          <Link
            href="/chat"
            style={{ animationDelay: '500ms' }}
            className="home-feature-animate card interactive-pop opacity-0 animate-home-card-in hover:border-dark-accent-green/60 transition-all duration-300 group hover:shadow-[0_12px_40px_-8px_rgba(88,204,2,0.22)]"
          >
            <div className="mb-5">
              <IconOrb name="bot" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
              Ask AI
            </h3>
            <p className="text-dark-text-secondary">
              Get educational answers about money — always framed as learning, not personalized advice.
            </p>
          </Link>
        </div>

        {/* CTA */}
        <div className="home-cta-animate text-center mt-16 opacity-0 animate-home-cta">
          {isSignedIn ? (
            <Link href="/dashboard" className="btn-primary interactive-pop inline-block">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/auth/signin" className="btn-primary interactive-pop inline-block">
              Get started free
            </Link>
          )}
        </div>
      </section>

      {/* Chat with AI on home */}
      <section className="border-t border-dark-border bg-dark-card/30 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-dark-text-primary mb-2 text-center">Ask the bot</h2>
          <p className="text-dark-text-secondary text-center text-sm mb-6">
            Ask where to invest, best investment ideas, or any question. The bot can suggest our top 3 investment options—then invest with one click after you confirm.
          </p>
          <div className="card">
            {chatMessages.length > 0 && (
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm ${
                      m.role === 'user'
                        ? 'bg-dark-accent-green/20 text-dark-text-primary ml-4'
                        : 'bg-dark-surface text-dark-text-secondary'
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const q = chatInput.trim()
                if (!q || chatLoading) return
                setChatMessages((prev) => [...prev, { role: 'user', content: q }])
                setChatInput('')
                setChatLoading(true)
                try {
                  const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      messages: [...chatMessages, { role: 'user', content: q }].map((m) => ({
                        role: m.role,
                        content: m.content,
                      })),
                    }),
                  })
                  const data = await res.json()
                  const reply = data.message || data.error || 'Sorry, I could not respond.'
                  setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }])
                } catch {
                  setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Try again or go to Ask AI.' }])
                } finally {
                  setChatLoading(false)
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="e.g. Where should I invest? Best investment?"
                className="flex-1 px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-dark-text-primary placeholder:text-dark-text-muted text-sm"
                disabled={chatLoading}
              />
              <button type="submit" disabled={chatLoading} className="btn-primary interactive-pop px-4 py-3 text-sm whitespace-nowrap disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none">
                {chatLoading ? '…' : 'Ask'}
              </button>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                href="/suggestions"
                className="inline-flex items-center gap-1.5 text-dark-accent-green hover:underline font-medium rounded-lg px-1 py-0.5 interactive-pop"
              >
                See top 3 investment options
                <NestWiseIcon name="arrow-right" size={16} />
              </Link>
              <Link href="/chat" className="text-dark-text-muted hover:text-dark-text-secondary">
                Full chat
              </Link>
            </div>
          </div>
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
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-dark-accent-green/15 ring-1 ring-dark-accent-green/25 flex items-center justify-center text-dark-accent-green">
                  <NestWiseIcon name="laptop" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-text-primary mb-1">Practice with virtual money</h3>
                  <p className="text-dark-text-secondary text-sm">
                    Choose your starting balance and trade with fake money. Sharpen your knowledge of how the stock market works before risking your own.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-dark-accent-green/15 ring-1 ring-dark-accent-green/25 flex items-center justify-center text-dark-accent-green">
                  <NestWiseIcon name="trending-up" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-text-primary mb-1">Trade a wide range of stocks & ETFs</h3>
                  <p className="text-dark-text-secondary text-sm">
                    Search by company name or symbol. Whether you’re investing for the first time or exploring new strategies, there’s something for you.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-dark-accent-green/15 ring-1 ring-dark-accent-green/25 flex items-center justify-center text-dark-accent-green">
                  <NestWiseIcon name="trophy" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-text-primary mb-1">Learn at your own pace</h3>
                  <p className="text-dark-text-secondary text-sm">
                    Build your portfolio, track performance, and reset anytime to try a new strategy. No pressure—just learning.
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <Link href="/portfolio" className="btn-primary interactive-pop inline-flex items-center gap-2">
                  <span>Open simulator</span>
                  <NestWiseIcon name="arrow-right" size={18} className="opacity-90" />
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-dark-accent-green to-transparent" />
                <div className="relative text-center p-8">
                  <div className="flex justify-center mb-5">
                    <span className="inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-dark-accent-green/10 text-dark-accent-green ring-1 ring-dark-accent-green/30">
                      <NestWiseIcon name="bar-chart-3" size={44} />
                    </span>
                  </div>
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
