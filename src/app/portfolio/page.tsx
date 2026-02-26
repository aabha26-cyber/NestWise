'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { addHolding, removeHolding, updateCashBalance, recordTransaction, type Holding } from '@/lib/portfolio'
import { getStockData, getMultipleStocks, searchStocks, type StockData } from '@/lib/stockApi'
import {
  getSimulatorState,
  createSimulator,
  addSimulatorHolding,
  removeSimulatorHolding,
  updateSimulatorCash,
  resetSimulatorLocal,
  appendValueSnapshot,
  recordSimulatorTransaction,
  exportSimulatorDataCSV,
  applyRecurringDepositIfDue,
  getRecurringDeposit,
  setRecurringDeposit,
} from '@/lib/simulatorStorage'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSectorBreakdown, getPortfolioRiskScore, getSector } from '@/lib/sectors'

interface HoldingWithStock extends Holding {
  stock?: StockData
}

const PRESET_CASH = [10000, 25000, 100000]

function PortfolioPageContent() {
  const { user, isLoaded: userLoaded } = useUser()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [holdings, setHoldings] = useState<HoldingWithStock[]>([])
  const [cashBalance, setCashBalance] = useState(0)
  const [processing, setProcessing] = useState<string | null>(null)
  const [showStartSimulator, setShowStartSimulator] = useState(false)
  const [initialCashChoice, setInitialCashChoice] = useState<number>(10000)
  const [customCash, setCustomCash] = useState('')
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetCashChoice, setResetCashChoice] = useState<number>(10000)
  const [resetCustomCash, setResetCustomCash] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedStockForTrade, setSelectedStockForTrade] = useState<StockData | null>(null)
  const [buySharesInput, setBuySharesInput] = useState('')
  const [buyDollarInput, setBuyDollarInput] = useState('')
  const [recurringDepositConfig, setRecurringDepositConfig] = useState<{ amount: number; interval: 'week' | 'month'; lastApplied: string } | null>(null)
  const [recurringAmount, setRecurringAmount] = useState('')
  const [recurringInterval, setRecurringInterval] = useState<'week' | 'month'>('month')
  const [fearGreed, setFearGreed] = useState<{ value: number; label: string } | null>(null)

  useEffect(() => {
    fetch('/api/fear-greed')
      .then((r) => r.json())
      .then((d) => setFearGreed({ value: d.value ?? 50, label: d.label ?? 'Neutral' }))
      .catch(() => setFearGreed({ value: 50, label: 'Neutral' }))
  }, [])

  useEffect(() => {
    if (!userLoaded || !user) return
    loadPortfolio()
  }, [userLoaded, user])

  // Open buy modal when arriving with ?symbol= or ?buy=
  useEffect(() => {
    const sym = searchParams.get('symbol') || searchParams.get('buy')
    if (!sym || loading || !portfolio || selectedStockForTrade) return
    getStockData(sym.trim().toUpperCase()).then((stock) => {
      if (stock) setSelectedStockForTrade(stock)
    })
  }, [searchParams, loading, portfolio, selectedStockForTrade])

  useEffect(() => {
    const t = setTimeout(() => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }
      setSearchLoading(true)
      searchStocks(searchQuery)
        .then(setSearchResults)
        .finally(() => setSearchLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [searchQuery])

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!user?.id) {
        setError('Please sign in to view your portfolio')
        return
      }
      applyRecurringDepositIfDue(user.id)
      const localState = getSimulatorState(user.id)
      if (localState) {
        setPortfolio({ id: 'local' })
        setCashBalance(localState.cashBalance)
        setShowStartSimulator(false)
        const symbols = localState.holdings.map((h) => h.symbol)
        const stockDataMap = new Map<string, StockData>()
        if (symbols.length > 0) {
          const stocks = await getMultipleStocks(symbols)
          stocks.forEach((stock) => stockDataMap.set(stock.symbol, stock))
        }
        const holdingsWithStocks: HoldingWithStock[] = localState.holdings.map((h) => ({
          id: `local-${h.symbol}`,
          portfolio_id: 'local',
          symbol: h.symbol,
          shares: h.shares,
          average_cost: h.average_cost,
          created_at: '',
          updated_at: '',
          stock: stockDataMap.get(h.symbol),
        }))
        setHoldings(holdingsWithStocks)
        const totalValue =
          localState.cashBalance +
          holdingsWithStocks.reduce((sum, h) => sum + (h.stock?.price ?? 0) * h.shares, 0)
        appendValueSnapshot(user.id, totalValue)
        setRecurringDepositConfig(getRecurringDeposit(user.id))
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/portfolio', { credentials: 'include' })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to fetch portfolio')
        }
        const { portfolio: portfolioData, holdings: holdingsData } = await res.json()
        if (!portfolioData) {
          setPortfolio(null)
          setHoldings([])
          setCashBalance(0)
          setShowStartSimulator(true)
          setError(null)
          setLoading(false)
          return
        }
        setShowStartSimulator(false)
        setPortfolio(portfolioData)
        setCashBalance(portfolioData.cash_balance)
        const holdingsList = Array.isArray(holdingsData) ? holdingsData : []
        const symbols = holdingsList.map((h: { symbol: string }) => h.symbol)
        const stockDataMap = new Map<string, StockData>()
        if (symbols.length > 0) {
          const stocks = await getMultipleStocks(symbols)
          stocks.forEach((stock) => stockDataMap.set(stock.symbol, stock))
        }
        const holdingsWithStocks: HoldingWithStock[] = holdingsList.map((holding: HoldingWithStock) => ({
          ...holding,
          stock: stockDataMap.get(holding.symbol),
        }))
        setHoldings(holdingsWithStocks)
      } catch (apiErr: any) {
        setPortfolio(null)
        setHoldings([])
        setCashBalance(0)
        setShowStartSimulator(true)
        setError(null)
      }
    } catch (err: any) {
      console.error('Error loading portfolio:', err)
      if (user?.id && !portfolio) {
        setShowStartSimulator(true)
        setError(null)
      } else {
        setError(err.message || 'Failed to load portfolio')
      }
    } finally {
      setLoading(false)
    }
  }

  const startSimulator = () => {
    const cash = customCash.trim() ? parseFloat(customCash) : initialCashChoice
    if (!Number.isFinite(cash) || cash <= 0) {
      setError('Enter a valid starting amount')
      return
    }
    if (!user?.id) return
    setError(null)
    createSimulator(user.id, cash)
    setPortfolio({ id: 'local' })
    setCashBalance(cash)
    setHoldings([])
    setShowStartSimulator(false)
  }

  const resetSimulator = async () => {
    const cash = resetCustomCash.trim() ? parseFloat(resetCustomCash) : resetCashChoice
    if (!Number.isFinite(cash) || cash < 0) {
      setError('Enter a valid amount')
      return
    }
    if (!user?.id) return
    setProcessing('reset')
    setError(null)
    if (portfolio?.id === 'local') {
      resetSimulatorLocal(user.id, cash)
      setResetModalOpen(false)
      setCashBalance(cash)
      setHoldings([])
      setProcessing(null)
      return
    }
    try {
      const res = await fetch('/api/portfolio/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cash }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to reset')
      }
      setResetModalOpen(false)
      await loadPortfolio()
    } catch (err: any) {
      setError(err.message || 'Failed to reset simulator')
    } finally {
      setProcessing(null)
    }
  }

  const handleBuy = async (symbol: string, sharesOrDollars?: { shares?: number; dollars?: number }) => {
    if (!portfolio || !user) return
    const shares = sharesOrDollars?.shares ?? (sharesOrDollars?.dollars ? undefined : 1)
    const dollarAmount = sharesOrDollars?.dollars

    try {
      setProcessing(symbol)
      setError(null)
      const stock = await getStockData(symbol)
      if (!stock) throw new Error(`Could not fetch price for ${symbol}`)
      let numShares = shares ?? 0
      if (dollarAmount != null && dollarAmount > 0) {
        numShares = Math.floor(dollarAmount / stock.price)
      }
      if (numShares <= 0) {
        throw new Error('Enter a valid number of shares or dollar amount')
      }
      const cost = stock.price * numShares
      if (cashBalance < cost) throw new Error('Insufficient cash balance')
      if (portfolio.id === 'local') {
        addSimulatorHolding(user.id, symbol, numShares, stock.price)
        updateSimulatorCash(user.id, cashBalance - cost)
        recordSimulatorTransaction(user.id, 'buy', symbol, numShares, stock.price)
        setCashBalance(cashBalance - cost)
        setSelectedStockForTrade(null)
        setBuySharesInput('')
        setBuyDollarInput('')
        await loadPortfolio()
      } else {
        await addHolding(portfolio.id, symbol, numShares, stock.price)
        await updateCashBalance(portfolio.id, cashBalance - cost)
        await recordTransaction(portfolio.id, symbol, 'buy', numShares, stock.price)
        setSelectedStockForTrade(null)
        setBuySharesInput('')
        setBuyDollarInput('')
        await loadPortfolio()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to buy stock')
      console.error('Error buying stock:', err)
    } finally {
      setProcessing(null)
    }
  }

  const handleSell = async (symbol: string, shares: number) => {
    if (!portfolio || !user) return

    try {
      setProcessing(symbol)
      setError(null)
      const stock = await getStockData(symbol)
      if (!stock) throw new Error(`Could not fetch price for ${symbol}`)
      const proceeds = stock.price * shares
      if (portfolio.id === 'local') {
        const localState = getSimulatorState(user.id)
        const holding = localState?.holdings.find((h) => h.symbol === symbol)
        const averageCost = holding?.average_cost
        removeSimulatorHolding(user.id, symbol, shares)
        updateSimulatorCash(user.id, cashBalance + proceeds)
        recordSimulatorTransaction(user.id, 'sell', symbol, shares, stock.price, averageCost)
        setCashBalance(cashBalance + proceeds)
        await loadPortfolio()
      } else {
        await removeHolding(portfolio.id, symbol, shares)
        const newBalance = cashBalance + proceeds
        await updateCashBalance(portfolio.id, newBalance)
        await recordTransaction(portfolio.id, symbol, 'sell', shares, stock.price)
        await loadPortfolio()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sell stock')
      console.error('Error selling stock:', err)
    } finally {
      setProcessing(null)
    }
  }

  if (!userLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold text-dark-text-primary mb-4">Sign In Required</h2>
          <p className="text-dark-text-secondary mb-6">Please sign in to view your portfolio.</p>
          <Link href="/auth/signin" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (showStartSimulator && !portfolio) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card max-w-xl mx-auto text-center py-12 px-8">
          <div className="text-5xl mb-4">💼</div>
          <h2 className="text-2xl font-bold text-dark-text-primary mb-2">Stock Market Simulator</h2>
          <p className="text-dark-text-secondary mb-8">
            Practice trading with virtual money. No deposit needed. Choose your starting balance and invest in any stock.
          </p>
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          <p className="text-dark-text-secondary text-sm mb-3">Starting virtual cash</p>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {PRESET_CASH.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setInitialCashChoice(amount)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  initialCashChoice === amount
                    ? 'bg-dark-accent-green text-white'
                    : 'bg-dark-surface text-dark-text-secondary hover:bg-dark-card border border-dark-border'
                }`}
              >
                ${(amount / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
          <div className="mb-6">
            <label className="block text-dark-text-secondary text-sm mb-1">Or custom amount ($)</label>
            <input
              type="number"
              min="1"
              step="100"
              value={customCash}
              onChange={(e) => setCustomCash(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full max-w-[200px] mx-auto px-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-text-primary"
            />
          </div>
          <button
            onClick={startSimulator}
            className="btn-primary px-8 py-3 text-lg"
          >
            Start simulation
          </button>
        </div>
      </div>
    )
  }

  const totalValue = holdings.reduce((sum, holding) => {
    const currentPrice = holding.stock?.price || 0
    return sum + currentPrice * holding.shares
  }, 0)

  const totalPortfolioValue = cashBalance + totalValue
  const holdingValues = holdings.map((h) => ({
    symbol: h.symbol,
    value: (h.stock?.price ?? 0) * h.shares,
  }))
  const sectorBreakdown = getSectorBreakdown(holdingValues)
  const riskIndicator = getPortfolioRiskScore(
    holdingValues.map((h) => ({ value: h.value })),
    totalValue || 1
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-dark-text-primary">Portfolio</h1>
        <div className="flex items-center flex-wrap gap-4">
          <Link href="/portfolio/transactions" className="btn-secondary text-sm">
            View Transactions
          </Link>
          <Link href="/portfolio/analytics" className="btn-secondary text-sm">
            Analytics
          </Link>
          {portfolio?.id === 'local' && (
            <button
              type="button"
              onClick={() => {
                if (!user?.id) return
                const csv = exportSimulatorDataCSV(user.id)
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `nestwise-portfolio-${new Date().toISOString().slice(0, 10)}.csv`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="btn-secondary text-sm"
            >
              Export CSV
            </button>
          )}
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="text-sm px-4 py-2 rounded-lg border border-dark-border text-dark-text-secondary hover:bg-dark-card hover:text-dark-text-primary transition-colors"
          >
            Reset simulator
          </button>
          <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-lg text-sm font-semibold">
            ⚠️ Simulation Mode
            {portfolio?.id === 'local' && (
              <span className="ml-1 font-normal text-yellow-400/90">(saved in this browser)</span>
            )}
          </div>
        </div>
      </div>

      {/* Reset simulator modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setResetModalOpen(false)}>
          <div className="card max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-4">Reset simulator</h3>
            <p className="text-dark-text-secondary text-sm mb-4">Clear all holdings and set a new cash balance. This cannot be undone.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_CASH.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setResetCashChoice(amount)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    resetCashChoice === amount ? 'bg-dark-accent-green text-white' : 'bg-dark-surface border border-dark-border text-dark-text-secondary'
                  }`}
                >
                  ${(amount / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
            <div className="mb-4">
              <input
                type="number"
                min="0"
                step="100"
                value={resetCustomCash}
                onChange={(e) => setResetCustomCash(e.target.value)}
                placeholder="Custom $"
                className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-text-primary text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setResetModalOpen(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="button" onClick={resetSimulator} disabled={processing === 'reset'} className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium disabled:opacity-50">
                {processing === 'reset' ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-dark-text-secondary text-sm mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-dark-text-primary">
            ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card">
          <p className="text-dark-text-secondary text-sm mb-1">Cash Balance</p>
          <p className="text-3xl font-bold text-dark-text-primary">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card">
          <p className="text-dark-text-secondary text-sm mb-1">Invested Value</p>
          <p className="text-3xl font-bold text-dark-text-primary">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {portfolio?.id === 'local' && user && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3">Recurring deposit</h3>
          {recurringDepositConfig ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-dark-text-secondary text-sm">
                Adding ${recurringDepositConfig.amount.toLocaleString()} per {recurringDepositConfig.interval}.
                Next deposit applied automatically when you visit.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRecurringDeposit(user.id, 0, 'month')
                  setRecurringDepositConfig(null)
                }}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-dark-text-secondary text-sm">Add</span>
              <input
                type="number"
                min="1"
                step="100"
                placeholder="500"
                value={recurringAmount}
                className="w-24 px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-text-primary text-sm"
                onChange={(e) => setRecurringAmount(e.target.value)}
              />
              <span className="text-dark-text-secondary text-sm">$ per</span>
              <select
                value={recurringInterval}
                onChange={(e) => setRecurringInterval(e.target.value as 'week' | 'month')}
                className="px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-text-primary text-sm"
              >
                <option value="week">week</option>
                <option value="month">month</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const amt = parseInt(recurringAmount, 10)
                  if (!Number.isFinite(amt) || amt <= 0) return
                  setRecurringDeposit(user.id, amt, recurringInterval)
                  setRecurringDepositConfig(getRecurringDeposit(user.id))
                }}
                className="btn-primary text-sm py-2"
              >
                Enable
              </button>
            </div>
          )}
        </div>
      )}

      {/* Risk · Sector · Fear & Greed */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3">Risk indicators</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-text-secondary">Portfolio risk</span>
              <span
                className={
                  riskIndicator.label === 'High' ? 'text-red-400 font-medium' : riskIndicator.label === 'Medium' ? 'text-yellow-400 font-medium' : 'text-dark-accent-green font-medium'
                }
              >
                {riskIndicator.label}
              </span>
            </div>
            <div className="h-2 rounded-full bg-dark-surface overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(riskIndicator.score / 10) * 100}%`,
                  backgroundColor:
                    riskIndicator.label === 'High' ? 'rgb(248 113 113)' : riskIndicator.label === 'Medium' ? 'rgb(250 204 21)' : 'rgb(16 185 129)',
                }}
              />
            </div>
            <p className="text-xs text-dark-text-muted">Top holding: {riskIndicator.concentrationPercent.toFixed(0)}% of invested</p>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3">Sector analysis</h3>
          {sectorBreakdown.length === 0 ? (
            <p className="text-dark-text-secondary text-sm">No holdings yet.</p>
          ) : (
            <ul className="space-y-2">
              {sectorBreakdown.map((s) => (
                <li key={s.sector} className="flex justify-between text-sm">
                  <span className="text-dark-text-primary">{s.sector}</span>
                  <span className="text-dark-text-secondary">{s.percent.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3">Market sentiment</h3>
          {fearGreed ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-dark-text-primary">{fearGreed.value}</span>
                <span className="text-dark-text-secondary text-sm">Fear & Greed</span>
              </div>
              <div className="h-2 rounded-full bg-dark-surface overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${fearGreed.value}%`,
                    backgroundColor:
                      fearGreed.value <= 25 ? 'rgb(239 68 68)' : fearGreed.value <= 45 ? 'rgb(251 146 60)' : fearGreed.value <= 55 ? 'rgb(250 204 21)' : fearGreed.value <= 75 ? 'rgb(34 197 94)' : 'rgb(16 185 129)',
                  }}
                />
              </div>
              <p className="text-xs text-dark-text-muted mt-1">{fearGreed.label}</p>
            </>
          ) : (
            <p className="text-dark-text-secondary text-sm">Loading…</p>
          )}
        </div>
      </div>

      {/* Individual holdings */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-6">Individual holdings</h2>
        {holdings.length === 0 ? (
          <p className="text-dark-text-secondary text-center py-8">
            No holdings yet. Add stocks to start building your simulated portfolio.
          </p>
        ) : (
          <div className="space-y-4">
            {holdings.map((holding) => {
              const currentPrice = holding.stock?.price || 0
              const currentValue = currentPrice * holding.shares
              const costBasis = (holding.average_cost || 0) * holding.shares
              const gainLoss = currentValue - costBasis
              const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0

              return (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-4 bg-dark-surface rounded-lg border border-dark-border"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-dark-text-primary">
                      {holding.stock?.name || holding.symbol}
                    </h3>
                    <p className="text-dark-text-secondary">
                      {holding.symbol}
                      <span className="ml-2 text-xs text-dark-text-muted">· {getSector(holding.symbol)}</span>
                    </p>
                    {holding.stock && (
                      <p className={`text-sm mt-1 ${holding.stock.change >= 0 ? 'text-dark-accent-green' : 'text-red-500'}`}>
                        {holding.stock.change >= 0 ? '+' : ''}
                        {holding.stock.change.toFixed(2)} ({holding.stock.changePercent >= 0 ? '+' : ''}
                        {holding.stock.changePercent.toFixed(2)}%)
                      </p>
                    )}
                  </div>
                  <div className="text-right mr-6">
                    <p className="text-dark-text-primary font-medium">
                      {holding.shares} {holding.shares === 1 ? 'share' : 'shares'}
                    </p>
                    <p className="text-dark-text-secondary text-sm">
                      ${currentPrice.toFixed(2)} per share
                    </p>
                  </div>
                  <div className="text-right mr-6">
                    <p className="text-lg font-semibold text-dark-text-primary">
                      ${currentValue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    {costBasis > 0 && (
                      <p className={`text-sm ${gainLoss >= 0 ? 'text-dark-accent-green' : 'text-red-500'}`}>
                        {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercent >= 0 ? '+' : ''}
                        {gainLossPercent.toFixed(2)}%)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSell(holding.symbol, 1)}
                      disabled={processing === holding.symbol || holding.shares < 1}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === holding.symbol ? '...' : '−1'}
                    </button>
                    <button
                      onClick={() => handleSell(holding.symbol, holding.shares)}
                      disabled={processing === holding.symbol || holding.shares < 1}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sell all
                    </button>
                    <button
                      onClick={() => handleBuy(holding.symbol)}
                      disabled={processing === holding.symbol}
                      className="bg-dark-accent-green/20 hover:bg-dark-accent-green/30 text-dark-accent-green px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Trade any stock */}
      <div className="card">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Trade stocks & ETFs</h2>
        <p className="text-dark-text-secondary text-sm mb-4">Search by company name or symbol. Practice with virtual money—no real money involved.</p>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by company name or symbol..."
          className="w-full max-w-md px-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-text-primary placeholder-dark-text-muted mb-4"
        />
        {searchLoading && <p className="text-dark-text-muted text-sm mb-2">Searching...</p>}
        {searchResults.length > 0 && !selectedStockForTrade && (
          <div className="border border-dark-border rounded-lg divide-y divide-dark-border max-h-64 overflow-y-auto mb-4">
            {searchResults.slice(0, 12).map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => setSelectedStockForTrade(stock)}
                className="w-full px-4 py-3 text-left hover:bg-dark-surface flex justify-between items-center"
              >
                <span className="font-medium text-dark-text-primary">{stock.symbol}</span>
                <span className="text-dark-text-secondary text-sm truncate max-w-[180px]">{stock.name}</span>
                <span className="text-dark-accent-green font-medium">${stock.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
        {selectedStockForTrade && (
          <div className="p-4 bg-dark-surface rounded-lg border border-dark-border mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-dark-text-primary">{selectedStockForTrade.symbol} – {selectedStockForTrade.name}</p>
                <p className="text-dark-text-secondary text-sm">${selectedStockForTrade.price.toFixed(2)} per share</p>
              </div>
              <button type="button" onClick={() => { setSelectedStockForTrade(null); setBuySharesInput(''); setBuyDollarInput('') }} className="text-dark-text-muted hover:text-dark-text-primary text-sm">
                Change
              </button>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-dark-text-secondary text-xs mb-1">Shares</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={buySharesInput}
                  onChange={(e) => { setBuySharesInput(e.target.value); setBuyDollarInput('') }}
                  placeholder="0"
                  className="w-28 px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-dark-text-primary"
                />
              </div>
              <span className="text-dark-text-muted">or</span>
              <div>
                <label className="block text-dark-text-secondary text-xs mb-1">Dollar amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={buyDollarInput}
                  onChange={(e) => { setBuyDollarInput(e.target.value); setBuySharesInput('') }}
                  placeholder="0"
                  className="w-28 px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-dark-text-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const shares = buySharesInput.trim() && Number.isFinite(parseFloat(buySharesInput)) ? parseFloat(buySharesInput) : undefined
                  const dollars = buyDollarInput.trim() && Number.isFinite(parseFloat(buyDollarInput)) ? parseFloat(buyDollarInput) : undefined
                  handleBuy(selectedStockForTrade.symbol, { shares, dollars })
                }}
                disabled={processing === selectedStockForTrade.symbol || (!buySharesInput.trim() && !buyDollarInput.trim())}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === selectedStockForTrade.symbol ? 'Buying...' : 'Buy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-dark-surface/50 border border-dark-border rounded-lg">
        <p className="text-sm text-dark-text-muted text-center">
          <strong className="text-dark-text-secondary">Note:</strong> This is a simulation only. 
          No real money is being used. All transactions are fake and for educational purposes.
        </p>
      </div>
    </div>
  )
}

function PortfolioLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card text-center py-12">
        <div className="w-8 h-8 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark-text-secondary">Loading...</p>
      </div>
    </div>
  )
}

export default function Portfolio() {
  return (
    <Suspense fallback={<PortfolioLoading />}>
      <PortfolioPageContent />
    </Suspense>
  )
}
