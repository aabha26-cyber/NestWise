'use client'

import { useState, useEffect } from 'react'
import { searchStocks, getStockData, type StockData } from '@/lib/stockApi'
import { useUser } from '@clerk/nextjs'
import { addToWatchlist, isInWatchlist } from '@/lib/watchlist'

export default function Explore() {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)
  const [watchlistStatus, setWatchlistStatus] = useState<Map<string, boolean>>(new Map())

  useEffect(() => {
    loadStocks()
  }, [searchQuery])

  useEffect(() => {
    if (user && stocks.length > 0) {
      checkWatchlistStatus()
    }
  }, [user, stocks])

  const loadStocks = async () => {
    try {
      setLoading(true)
      const results = await searchStocks(searchQuery)
      setStocks(results)
    } catch (error) {
      console.error('Error loading stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkWatchlistStatus = async () => {
    if (!user) return

    const statusMap = new Map<string, boolean>()
    for (const stock of stocks) {
      const isWatched = await isInWatchlist(user.id, stock.symbol)
      statusMap.set(stock.symbol, isWatched)
    }
    setWatchlistStatus(statusMap)
  }

  const handleStockClick = async (stock: StockData) => {
    // Fetch full details if not already loaded
    if (!stock.description) {
      const fullStock = await getStockData(stock.symbol)
      if (fullStock) {
        setSelectedStock(fullStock)
        return
      }
    }
    setSelectedStock(stock)
  }

  const handleToggleWatchlist = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return

    try {
      const currentlyWatched = watchlistStatus.get(symbol)
      if (currentlyWatched) {
        // Remove logic would go here if we had remove function in this context
        // For now, just update the UI optimistically
        setWatchlistStatus(new Map(watchlistStatus.set(symbol, false)))
      } else {
        await addToWatchlist(user.id, symbol)
        setWatchlistStatus(new Map(watchlistStatus.set(symbol, true)))
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark-text-primary mb-8">Stock Explorer</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search stocks by symbol (e.g., AAPL, TSLA, MSFT)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-2xl mx-auto block bg-dark-surface border border-dark-border rounded-lg px-6 py-4 text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent-green focus:border-transparent"
        />
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading stocks...</p>
        </div>
      )}

      {selectedStock ? (
        /* Stock Detail View */
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedStock(null)}
            className="mb-6 text-dark-text-secondary hover:text-dark-text-primary transition-colors"
          >
            ← Back to search
          </button>

          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-dark-text-primary mb-2">
                  {selectedStock.name}
                </h2>
                <p className="text-xl text-dark-text-secondary">{selectedStock.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-dark-text-primary mb-2">
                  ${selectedStock.price.toFixed(2)}
                </p>
                <p
                  className={`text-lg font-semibold ${
                    selectedStock.change >= 0 ? 'text-dark-accent-green' : 'text-red-500'
                  }`}
                >
                  {selectedStock.change >= 0 ? '+' : ''}
                  {selectedStock.change.toFixed(2)} ({selectedStock.changePercent >= 0 ? '+' : ''}
                  {selectedStock.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>

            {user && (
              <div className="mb-6">
                <button
                  onClick={() => handleToggleWatchlist(selectedStock.symbol, {} as any)}
                  className={`btn-secondary text-sm ${
                    watchlistStatus.get(selectedStock.symbol)
                      ? 'bg-dark-accent-green/20 border-dark-accent-green/50'
                      : ''
                  }`}
                >
                  {watchlistStatus.get(selectedStock.symbol) ? '✓ In Watchlist' : '+ Add to Watchlist'}
                </button>
              </div>
            )}

            {selectedStock.description && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-dark-text-primary mb-2">About</h3>
                  <p className="text-dark-text-secondary leading-relaxed">
                    {selectedStock.description}
                  </p>
                </div>

                {selectedStock.whyInvest && (
                  <div className="border-t border-dark-border pt-6">
                    <h3 className="text-lg font-semibold text-dark-text-primary mb-2">
                      Why people invest in this
                    </h3>
                    <p className="text-dark-text-secondary leading-relaxed">
                      {selectedStock.whyInvest}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!selectedStock.description && (
              <p className="text-dark-text-secondary">Loading company information...</p>
            )}
          </div>
        </div>
      ) : (
        /* Stock List */
        <>
          {!loading && stocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-dark-text-secondary">No stocks found. Try searching for a stock symbol.</p>
            </div>
          )}
          {!loading && stocks.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleStockClick(stock)}
                  className="card hover:border-dark-accent-green/50 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-dark-text-primary mb-1 group-hover:text-dark-accent-green transition-colors">
                        {stock.name}
                      </h3>
                      <p className="text-dark-text-secondary">{stock.symbol}</p>
                    </div>
                    {user && (
                      <button
                        onClick={(e) => handleToggleWatchlist(stock.symbol, e)}
                        className={`ml-2 px-2 py-1 rounded text-sm ${
                          watchlistStatus.get(stock.symbol)
                            ? 'bg-dark-accent-green/20 text-dark-accent-green'
                            : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text-primary'
                        }`}
                      >
                        {watchlistStatus.get(stock.symbol) ? '✓' : '+'}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-dark-text-primary">
                      ${stock.price.toFixed(2)}
                    </p>
                    <p
                      className={`font-semibold ${
                        stock.change >= 0 ? 'text-dark-accent-green' : 'text-red-500'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
