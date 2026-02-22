'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { getWatchlist, addToWatchlist, removeFromWatchlist, type WatchlistItem } from '@/lib/watchlist'
import { getMultipleStocks, type StockData } from '@/lib/stockApi'
import Link from 'next/link'

interface WatchlistItemWithStock extends WatchlistItem {
  stock?: StockData
}

export default function WatchlistPage() {
  const { user, isLoaded: userLoaded } = useUser()
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<WatchlistItemWithStock[]>([])
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoaded || !user) return
    loadWatchlist()
  }, [userLoaded, user])

  const loadWatchlist = async () => {
    try {
      setLoading(true)
      if (!user?.id) return

      const items = await getWatchlist(user.id)
      
      // Fetch current stock prices
      const symbols = items.map(item => item.symbol)
      const stocks = await getMultipleStocks(symbols)
      const stockMap = new Map(stocks.map(s => [s.symbol, s]))

      const itemsWithStocks: WatchlistItemWithStock[] = items.map(item => ({
        ...item,
        stock: stockMap.get(item.symbol),
      }))

      setWatchlist(itemsWithStocks)
    } catch (error) {
      console.error('Error loading watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (symbol: string) => {
    if (!user) return

    try {
      setProcessing(symbol)
      await addToWatchlist(user.id, symbol)
      await loadWatchlist()
    } catch (error) {
      console.error('Error adding to watchlist:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleRemove = async (symbol: string) => {
    if (!user) return

    try {
      setProcessing(symbol)
      await removeFromWatchlist(user.id, symbol)
      await loadWatchlist()
    } catch (error) {
      console.error('Error removing from watchlist:', error)
    } finally {
      setProcessing(null)
    }
  }

  if (!userLoaded || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <p className="text-dark-text-secondary mb-4">Please sign in to manage your watchlist.</p>
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
          <p className="text-dark-text-secondary">Loading watchlist...</p>
        </div>
      </div>
    )
  }

  const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX']
  const watchlistSymbols = new Set(watchlist.map(item => item.symbol))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark-text-primary mb-8">Watchlist</h1>

      {/* Watchlist Items */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-6">Your Watched Stocks</h2>
        {watchlist.length === 0 ? (
          <p className="text-dark-text-secondary text-center py-8">
            Your watchlist is empty. Add stocks to track their prices.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-dark-surface rounded-lg border border-dark-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-dark-text-primary">
                      {item.stock?.name || item.symbol}
                    </h3>
                    <p className="text-dark-text-secondary">{item.symbol}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.symbol)}
                    disabled={processing === item.symbol}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
                {item.stock ? (
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-dark-text-primary mb-1">
                      ${item.stock.price.toFixed(2)}
                    </p>
                    <p className={`text-sm ${item.stock.change >= 0 ? 'text-dark-accent-green' : 'text-red-500'}`}>
                      {item.stock.change >= 0 ? '+' : ''}
                      {item.stock.change.toFixed(2)} ({item.stock.changePercent >= 0 ? '+' : ''}
                      {item.stock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                ) : (
                  <p className="text-dark-text-secondary text-sm mt-4">Loading price...</p>
                )}
                <Link
                  href={`/explore?symbol=${item.symbol}`}
                  className="mt-4 inline-block text-sm text-dark-accent-green hover:underline"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Stocks */}
      <div className="card">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Add Stocks to Watchlist</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {popularStocks.map((symbol) => {
            const isWatched = watchlistSymbols.has(symbol)
            return (
              <button
                key={symbol}
                onClick={() => isWatched ? handleRemove(symbol) : handleAdd(symbol)}
                disabled={processing === symbol}
                className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                  isWatched
                    ? 'bg-dark-accent-green/20 border-dark-accent-green/50'
                    : 'bg-dark-surface hover:bg-dark-card border-dark-border hover:border-dark-accent-green/50'
                } disabled:opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-dark-text-primary">{symbol}</span>
                  <span className={isWatched ? 'text-dark-accent-green' : 'text-dark-text-secondary'}>
                    {isWatched ? '✓' : '+'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
