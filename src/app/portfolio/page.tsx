'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { getOrCreatePortfolio, getHoldings, addHolding, removeHolding, updateCashBalance, recordTransaction, type Holding } from '@/lib/portfolio'
import { getStockData, getMultipleStocks, type StockData } from '@/lib/stockApi'
import { format } from 'date-fns'
import Link from 'next/link'

interface HoldingWithStock extends Holding {
  stock?: StockData
}

export default function Portfolio() {
  const { user, isLoaded: userLoaded } = useUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [holdings, setHoldings] = useState<HoldingWithStock[]>([])
  const [cashBalance, setCashBalance] = useState(10000)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoaded || !user) return

    loadPortfolio()
  }, [userLoaded, user])

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user?.id) {
        setError('Please sign in to view your portfolio')
        return
      }

      // Get or create portfolio
      const portfolioData = await getOrCreatePortfolio(user.id)
      setPortfolio(portfolioData)
      setCashBalance(portfolioData.cash_balance)

      // Get holdings
      const holdingsData = await getHoldings(portfolioData.id)
      
      // Fetch current stock prices for each holding
      const symbols = holdingsData.map(h => h.symbol)
      const stockDataMap = new Map<string, StockData>()
      
      if (symbols.length > 0) {
        const stocks = await getMultipleStocks(symbols)
        stocks.forEach(stock => stockDataMap.set(stock.symbol, stock))
      }

      const holdingsWithStocks: HoldingWithStock[] = holdingsData.map(holding => ({
        ...holding,
        stock: stockDataMap.get(holding.symbol),
      }))

      setHoldings(holdingsWithStocks)
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio')
      console.error('Error loading portfolio:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async (symbol: string) => {
    if (!portfolio || !user) return

    try {
      setProcessing(symbol)
      setError(null)

      // Get current stock price
      const stock = await getStockData(symbol)
      if (!stock) {
        throw new Error(`Could not fetch price for ${symbol}`)
      }

      const shares = 1
      const cost = stock.price * shares

      if (cashBalance < cost) {
        throw new Error('Insufficient cash balance')
      }

      // Add holding
      await addHolding(portfolio.id, symbol, shares, stock.price)

      // Update cash balance
      const newBalance = cashBalance - cost
      await updateCashBalance(portfolio.id, newBalance)

      // Record transaction
      await recordTransaction(portfolio.id, symbol, 'buy', shares, stock.price)

      // Reload portfolio
      await loadPortfolio()
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

      // Get current stock price
      const stock = await getStockData(symbol)
      if (!stock) {
        throw new Error(`Could not fetch price for ${symbol}`)
      }

      const proceeds = stock.price * shares

      // Remove holding
      await removeHolding(portfolio.id, symbol, shares)

      // Update cash balance
      const newBalance = cashBalance + proceeds
      await updateCashBalance(portfolio.id, newBalance)

      // Record transaction
      await recordTransaction(portfolio.id, symbol, 'sell', shares, stock.price)

      // Reload portfolio
      await loadPortfolio()
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

  const totalValue = holdings.reduce((sum, holding) => {
    const currentPrice = holding.stock?.price || 0
    return sum + currentPrice * holding.shares
  }, 0)

  const totalPortfolioValue = cashBalance + totalValue

  const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-dark-text-primary">Portfolio</h1>
        <div className="flex items-center space-x-4">
          <Link href="/portfolio/transactions" className="btn-secondary text-sm">
            View Transactions
          </Link>
          <Link href="/portfolio/analytics" className="btn-secondary text-sm">
            Analytics
          </Link>
          <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-lg text-sm font-semibold">
            ⚠️ Simulation Mode
          </div>
        </div>
      </div>

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

      {/* Holdings */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-6">Your Holdings</h2>
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
                    <p className="text-dark-text-secondary">{holding.symbol}</p>
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSell(holding.symbol, 1)}
                      disabled={processing === holding.symbol || holding.shares < 1}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === holding.symbol ? '...' : '−'}
                    </button>
                    <button
                      onClick={() => handleBuy(holding.symbol)}
                      disabled={processing === holding.symbol}
                      className="bg-dark-accent-green/20 hover:bg-dark-accent-green/30 text-dark-accent-green px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === holding.symbol ? '...' : '+'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Add Stocks */}
      <div className="card">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Quick Add Stocks</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {popularStocks.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleBuy(symbol)}
              disabled={processing === symbol || cashBalance < 100}
              className="p-4 bg-dark-surface hover:bg-dark-card rounded-lg border border-dark-border text-left transition-all duration-200 hover:border-dark-accent-green/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-dark-text-primary">{symbol}</p>
                </div>
                <span className="text-dark-accent-green">
                  {processing === symbol ? '...' : '+'}
                </span>
              </div>
            </button>
          ))}
        </div>
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
