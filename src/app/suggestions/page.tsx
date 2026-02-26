'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { getStockData } from '@/lib/stockApi'
import {
  getSimulatorState,
  createSimulator,
  addSimulatorHolding,
  updateSimulatorCash,
  appendValueSnapshot,
  recordSimulatorTransaction,
} from '@/lib/simulatorStorage'

export interface SuggestionOption {
  id: string
  name: string
  description: string
  symbols: [string, string, string]
  risk: 'Low' | 'Medium' | 'High'
}

const OPTIONS: SuggestionOption[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: 'Stable, lower risk: broad market ETF plus bonds and healthcare.',
    symbols: ['VOO', 'BND', 'JNJ'],
    risk: 'Low',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Mix of growth and stability: S&P 500, tech, and financials.',
    symbols: ['SPY', 'AAPL', 'JPM'],
    risk: 'Medium',
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Higher growth potential: tech-heavy with large caps.',
    symbols: ['QQQ', 'NVDA', 'MSFT'],
    risk: 'High',
  },
]

export default function SuggestionsPage() {
  const { user, isLoaded } = useUser()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prices, setPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    const symbols = OPTIONS.flatMap((o) => o.symbols)
    const uniq = Array.from(new Set(symbols))
    Promise.all(uniq.map((s) => getStockData(s))).then((results) => {
      const map: Record<string, number> = {}
      uniq.forEach((s, i) => {
        if (results[i]) map[s] = results[i].price
      })
      setPrices(map)
    })
  }, [])

  const selected = OPTIONS.find((o) => o.id === selectedId)
  const cashAvailable = (() => {
    if (!user?.id) return 0
    const state = getSimulatorState(user.id)
    if (!state) return 0
    return state.cashBalance
  })()

  const handleInvest = async () => {
    if (!user?.id || !selected) return
    setError(null)
    setProcessing(true)
    let state = getSimulatorState(user.id)
    if (!state) {
      createSimulator(user.id, 10000)
      state = getSimulatorState(user.id)!
    }
    const cash = state.cashBalance
    if (cash < 100) {
      setError('Not enough cash. Add more in Portfolio or start the simulator.')
      setProcessing(false)
      return
    }
    const perStock = cash / 3
    let remainingCash = cash
    try {
      for (const symbol of selected.symbols) {
        const stock = await getStockData(symbol)
        if (!stock) continue
        const shares = Math.floor(perStock / stock.price)
        if (shares <= 0) continue
        const cost = shares * stock.price
        addSimulatorHolding(user.id, symbol, shares, stock.price)
        recordSimulatorTransaction(user.id, 'buy', symbol, shares, stock.price)
        remainingCash -= cost
        updateSimulatorCash(user.id, remainingCash)
      }
      const newState = getSimulatorState(user.id)!
      const totalValue = newState.cashBalance + newState.holdings.reduce((s, h) => s + (prices[h.symbol] ?? h.average_cost) * h.shares, 0)
      appendValueSnapshot(user.id, totalValue)
      setConfirmOpen(false)
      setSelectedId(null)
      window.location.href = '/portfolio'
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Investment failed')
    } finally {
      setProcessing(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-dark-text-secondary">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Investment suggestions</h1>
        <p className="text-dark-text-secondary">
          Top 3 options for your simulated portfolio. Choose one and invest your available cash equally across its 3 holdings.
        </p>
      </div>

      {!user && (
        <div className="card mb-8 p-6 text-center">
          <p className="text-dark-text-secondary mb-4">Sign in to use investment suggestions and invest with one click.</p>
          <Link href="/auth/signin" className="btn-primary inline-block">
            Sign in
          </Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {OPTIONS.map((option) => (
          <div
            key={option.id}
            className={`card border-2 transition-all ${
              selectedId === option.id ? 'border-dark-accent-green bg-dark-accent-green/5' : 'border-dark-border hover:border-dark-accent-green/50'
            }`}
          >
            <h3 className="text-xl font-semibold text-dark-text-primary mb-1">{option.name}</h3>
            <p className="text-sm text-dark-text-muted mb-2">{option.risk} risk</p>
            <p className="text-dark-text-secondary text-sm mb-4">{option.description}</p>
            <ul className="space-y-1 mb-6">
              {option.symbols.map((s) => (
                <li key={s} className="text-dark-text-primary font-medium">
                  {s} {prices[s] != null && <span className="text-dark-text-muted font-normal">${prices[s].toFixed(2)}</span>}
                </li>
              ))}
            </ul>
            {user && (
              <button
                type="button"
                onClick={() => {
                  setSelectedId(option.id)
                  setConfirmOpen(true)
                }}
                className="btn-primary w-full text-sm py-2"
              >
                Invest with this option
              </button>
            )}
          </div>
        ))}
      </div>

      {user && (
        <p className="mt-6 text-center text-dark-text-muted text-sm">
          Available cash: ${cashAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {' · '}
          <Link href="/portfolio" className="text-dark-accent-green hover:underline">Portfolio</Link>
        </p>
      )}

      {/* Confirm modal */}
      {confirmOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => !processing && setConfirmOpen(false)}>
          <div className="card max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Confirm investment</h3>
            <p className="text-dark-text-secondary text-sm mb-4">
              Invest your available cash (${cashAvailable.toLocaleString('en-US', { minimumFractionDigits: 2 })}) equally in: {selected.symbols.join(', ')}.
            </p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => !processing && setConfirmOpen(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="button" onClick={handleInvest} disabled={processing} className="btn-primary flex-1 disabled:opacity-50">
                {processing ? 'Investing…' : 'Confirm & invest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
