'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { getSimulatorState } from '@/lib/simulatorStorage'
import { getMultipleStocks } from '@/lib/stockApi'
import { getOrCreatePortfolio, getHoldings } from '@/lib/portfolio'
import { IconOrb, NestWiseIcon } from '@/components/NestWiseIcon'

// ─── Animated simulator preview card ────────────────────────────────────────

const MOCK_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.84, change: +1.23 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.39, change: +12.67 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -4.11 },
  { symbol: 'MSFT', name: 'Microsoft', price: 415.22, change: +2.88 },
  { symbol: 'AMZN', name: 'Amazon', price: 184.70, change: +0.94 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 167.90, change: -1.55 },
]

// Deterministic sparkline path so it's stable across renders
function SparklinePath({ up, width = 80, height = 32 }: { up: boolean; width?: number; height?: number }) {
  const points = up
    ? [0.6, 0.5, 0.65, 0.45, 0.55, 0.35, 0.4, 0.25, 0.3, 0.1]
    : [0.3, 0.4, 0.25, 0.45, 0.35, 0.5, 0.4, 0.6, 0.55, 0.75]
  const pts = points.map((y, i) => `${(i / (points.length - 1)) * width},${y * height}`)
  const d = `M ${pts.join(' L ')}`
  const color = up ? '#58cc02' : '#ef4444'
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polyline points={pts.join(' ')} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <linearGradient id={`sg-${up}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
      <polygon
        points={`0,${height} ${pts.join(' ')} ${width},${height}`}
        fill={`url(#sg-${up})`}
      />
    </svg>
  )
}

function SimulatorPreview() {
  const [mounted, setMounted] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [prices, setPrices] = useState(MOCK_STOCKS.map((s) => s.price))
  const [activeChange, setActiveChange] = useState(MOCK_STOCKS[0].change)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Only animate after client mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)

    const stockCycle = setInterval(() => {
      setActiveIdx((i) => (i + 1) % MOCK_STOCKS.length)
    }, 2200)

    intervalRef.current = setInterval(() => {
      setPrices((prev) =>
        prev.map((p, i) => {
          const delta = (Math.random() - 0.49) * (MOCK_STOCKS[i].price * 0.003)
          return Math.max(1, p + delta)
        })
      )
      setActiveChange((prev) => prev + (Math.random() - 0.5) * 0.4)
    }, 900)

    return () => {
      clearInterval(stockCycle)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Keep activeChange in sync when stock cycles
  useEffect(() => {
    setActiveChange(MOCK_STOCKS[activeIdx].change)
  }, [activeIdx])

  const active = MOCK_STOCKS[activeIdx]
  const activePrice = prices[activeIdx]
  const isUp = activeChange >= 0

  return (
    <div className="relative w-full max-w-sm">
      {/* Glow behind card */}
      <div className="absolute -inset-4 rounded-3xl bg-dark-accent-green/10 blur-2xl opacity-60 pointer-events-none" />

      <div className="relative rounded-2xl bg-dark-card border border-dark-border overflow-hidden shadow-2xl">
        {/* Terminal header bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-dark-surface border-b border-dark-border">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <span className="w-3 h-3 rounded-full bg-dark-accent-green/80" />
          <span className="ml-2 text-xs text-dark-text-muted font-mono">nestwise · simulator</span>
          {/* Live pulse */}
          <span className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dark-accent-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-dark-accent-green" />
            </span>
            <span className="text-xs font-bold text-dark-accent-green">LIVE</span>
          </span>
        </div>

        {/* Portfolio summary bar */}
        <div className="px-4 py-3 bg-dark-bg/60 border-b border-dark-border flex items-center justify-between">
          <div>
            <p className="text-xs text-dark-text-muted font-mono">Portfolio value</p>
            <p className="text-xl font-bold text-dark-text-primary font-mono tabular-nums">$12,483.50</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-dark-text-muted">Today</p>
            <p className="text-sm font-bold text-dark-accent-green">+$143.20</p>
          </div>
        </div>

        {/* Scrolling ticker list */}
        <div className="divide-y divide-dark-border/50">
          {MOCK_STOCKS.slice(0, 4).map((s, i) => {
            const p = mounted ? prices[i] : s.price
            const up = s.change >= 0
            const isActive = mounted && i === activeIdx
            return (
              <div
                key={s.symbol}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-300 ${
                  isActive ? 'bg-dark-accent-green/8' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-dark-surface flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-dark-text-primary">{s.symbol.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-dark-text-primary truncate">{s.symbol}</p>
                  <p className="text-xs text-dark-text-muted truncate">{s.name}</p>
                </div>
                <div className="shrink-0">
                  <SparklinePath up={up} width={48} height={22} />
                </div>
                <div className="text-right shrink-0 w-20">
                  <p className="text-xs font-bold text-dark-text-primary font-mono tabular-nums">
                    ${p.toFixed(2)}
                  </p>
                  <p className={`text-xs font-semibold ${up ? 'text-dark-accent-green' : 'text-red-400'}`}>
                    {up ? '+' : ''}{s.change.toFixed(2)}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail panel for active stock — keyed on activeIdx only after mount */}
        <div
          key={mounted ? activeIdx : 'static'}
          className="px-4 py-4 bg-dark-surface/60 border-t border-dark-border"
          style={mounted ? { animation: 'nestwise-fade-slide 0.35s ease both' } : undefined}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-extrabold text-dark-text-primary">{active.symbol}</p>
              <p className="text-xs text-dark-text-muted">{active.name}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-dark-text-primary font-mono tabular-nums">
                ${activePrice.toFixed(2)}
              </p>
              <p className={`text-xs font-bold ${isUp ? 'text-dark-accent-green' : 'text-red-400'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(activeChange).toFixed(2)}%
              </p>
            </div>
          </div>
          <SparklinePath up={isUp} width={280} height={52} />
          <div className="mt-3 flex gap-2">
            <button className="flex-1 py-1.5 rounded-lg bg-dark-accent-green text-white text-xs font-bold">
              Buy
            </button>
            <button className="flex-1 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-dark-text-secondary text-xs font-semibold">
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Home page ───────────────────────────────────────────────────────────────

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [portfolioValue, setPortfolioValue] = useState<number | null>(null)
  const [dailyChange, setDailyChange] = useState<number | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  useEffect(() => {
    if (!isSignedIn || !user?.id) return
    const userId = user.id

    const cacheKey = `nestwise_portfolio_cache_${userId}`
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { value, change } = JSON.parse(cached)
        setPortfolioValue(value)
        setDailyChange(change ?? null)
      }
    } catch { /* ignore */ }

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
        const change = prev != null ? total - prev : null
        if (!cancelled) {
          setPortfolioValue(total)
          setDailyChange(change)
          try { localStorage.setItem(cacheKey, JSON.stringify({ value: total, change })) } catch { /* ignore */ }
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
        if (!cancelled) {
          setPortfolioValue(total)
          try { localStorage.setItem(cacheKey, JSON.stringify({ value: total, change: null })) } catch { /* ignore */ }
        }
      } catch {
        if (!cancelled) setPortfolioValue(0)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isSignedIn, user?.id])

  return (
    <div className="min-h-screen">
      {/* Portfolio banner */}
      {(!isLoaded || isSignedIn) && (
        <section className="border-b border-dark-border bg-dark-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {isLoaded && isSignedIn && portfolioValue != null ? (
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
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="h-4 w-24 bg-dark-surface rounded animate-pulse mb-2" />
                  <div className="h-8 w-40 bg-dark-surface rounded animate-pulse" />
                </div>
                <div className="h-10 w-36 bg-dark-surface rounded-xl animate-pulse" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center mb-14 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-text-primary tracking-tight max-w-3xl mx-auto leading-tight">
            Your finance journey made{' '}
            <span className="relative inline-block animate-nestwise-pop text-dark-accent-green drop-shadow-[0_0_18px_rgba(88,204,2,0.55)]">
              easy!
            </span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-dark-text-secondary max-w-2xl mx-auto leading-relaxed">
            Short lessons, a stock simulator with play money, and an AI that explains money topics in plain English. Educational
            only, not advice.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link
            href="/learn"
            className="card interactive-pop hover:border-dark-accent-green/60 transition-all duration-300 group hover:shadow-[0_12px_40px_-8px_rgba(88,204,2,0.22)]"
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
            className="card interactive-pop hover:border-dark-accent-green/60 transition-all duration-300 group hover:shadow-[0_12px_40px_-8px_rgba(88,204,2,0.22)]"
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
            className="card interactive-pop hover:border-dark-accent-green/60 transition-all duration-300 group hover:shadow-[0_12px_40px_-8px_rgba(88,204,2,0.22)]"
          >
            <div className="mb-5">
              <IconOrb name="bot" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
              Ask AI
            </h3>
            <p className="text-dark-text-secondary">
              Get educational answers about money, always framed as learning, not personalized advice.
            </p>
          </Link>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
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
            Ask where to invest, best investment ideas, or any question. The bot can suggest our top 3 investment options, then you can invest with one click after you confirm.
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
                    Search by company name or symbol. Whether you're investing for the first time or exploring new strategies, there's something for you.
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
                    Build your portfolio, track performance, and reset anytime to try a new strategy. No pressure, just learning.
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

            {/* Animated mock trading terminal */}
            <div className="order-1 lg:order-2 flex justify-center">
              <SimulatorPreview />
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
