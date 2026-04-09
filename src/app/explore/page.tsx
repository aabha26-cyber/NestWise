'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { searchStocks, getStockData, getMultipleStocks, CRYPTO_SYMBOLS, ETF_SYMBOLS, STOCK_ONLY_SYMBOLS, type StockData } from '@/lib/stockApi'
import { useUser } from '@clerk/nextjs'
import { addToWatchlist, isInWatchlist } from '@/lib/watchlist'
import StockDeepDive from '@/components/StockDeepDive'
import { NestWiseIcon } from '@/components/NestWiseIcon'
import CoinLoader from '@/components/CoinLoader'

function ExploreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card text-center py-12">
        <CoinLoader text="Loading explorer…" />
      </div>
    </div>
  )
}

function ExploreContent() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const symbolFromUrl = searchParams.get('symbol')?.trim() ?? ''

  type Category = 'all' | 'stocks' | 'etfs' | 'crypto'
  const [category, setCategory] = useState<Category>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)
  const [watchlistStatus, setWatchlistStatus] = useState<Map<string, boolean>>(new Map())
  const [aiOverview, setAiOverview] = useState<string | null>(null)
  const [aiOverviewLoading, setAiOverviewLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => loadStocks(), searchQuery.trim() ? 350 : 0)
    return () => clearTimeout(t)
  }, [searchQuery, category])

  useEffect(() => {
    if (user && stocks.length > 0) {
      checkWatchlistStatus()
    }
  }, [user, stocks])

  /** Open a stock from ?symbol= in the URL (e.g. watchlist links). */
  useEffect(() => {
    if (!symbolFromUrl) return
    let cancelled = false
    const sym = symbolFromUrl.toUpperCase()
    ;(async () => {
      let stock = await getStockData(sym)
      if (cancelled || !stock) return
      if (!stock.description) {
        const full = await getStockData(stock.symbol)
        if (full) stock = full
      }
      if (cancelled || !stock) return
      setSearchQuery(symbolFromUrl)
      setAiOverview(null)
      setSelectedStock(stock)
      setAiOverviewLoading(true)
      try {
        const res = await fetch('/api/stock-overview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: stock.symbol,
            name: stock.name,
            description: stock.description ?? undefined,
          }),
        })
        const data = await res.json()
        if (!cancelled && data.overview) setAiOverview(data.overview)
      } catch (e) {
        console.error('AI overview error:', e)
      } finally {
        if (!cancelled) setAiOverviewLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [symbolFromUrl])

  const loadStocks = async () => {
    try {
      setLoading(true)
      if (searchQuery.trim()) {
        const results = await searchStocks(searchQuery)
        setStocks(results)
      } else if (category === 'crypto') {
        const results = await getMultipleStocks(CRYPTO_SYMBOLS)
        setStocks(results)
      } else if (category === 'etfs') {
        const results = await getMultipleStocks(ETF_SYMBOLS)
        setStocks(results)
      } else if (category === 'stocks') {
        const results = await getMultipleStocks(STOCK_ONLY_SYMBOLS.slice(0, 24))
        setStocks(results)
      } else {
        const results = await searchStocks('')
        setStocks(results)
      }
    } catch (error: unknown) {
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

  const fetchAiOverview = async (stock: StockData) => {
    setAiOverviewLoading(true)
    try {
      const res = await fetch('/api/stock-overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          description: stock.description ?? undefined,
        }),
      })
      const data = await res.json()
      if (data.overview) setAiOverview(data.overview)
    } catch (e) {
      console.error('AI overview error:', e)
    } finally {
      setAiOverviewLoading(false)
    }
  }

  const handleStockClick = async (stock: StockData) => {
    setAiOverview(null)
    if (!stock.description) {
      const fullStock = await getStockData(stock.symbol)
      if (fullStock) {
        setSelectedStock(fullStock)
        fetchAiOverview(fullStock)
        return
      }
    }
    setSelectedStock(stock)
    fetchAiOverview(stock)
  }

  const backToSearch = () => {
    setSelectedStock(null)
    setAiOverview(null)
    router.replace('/explore')
  }

  const handleToggleWatchlist = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return

    try {
      const currentlyWatched = watchlistStatus.get(symbol)
      if (currentlyWatched) {
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
      <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Explore</h1>
      <p className="text-dark-text-secondary mb-6">
        Browse stocks, ETFs, and crypto. Click any asset for price, AI overview, and more.
      </p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { key: 'all', label: 'All' },
          { key: 'stocks', label: 'Stocks' },
          { key: 'etfs', label: 'ETFs' },
          { key: 'crypto', label: 'Crypto' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setCategory(tab.key); setSearchQuery('') }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              category === tab.key
                ? 'bg-dark-accent-green text-white shadow-playful-sm'
                : 'bg-dark-surface text-dark-text-secondary border border-dark-border hover:border-dark-accent-green/40 hover:text-dark-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by name or symbol (e.g., Apple, AAPL, Bitcoin, BTC-USD)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-2xl mx-auto block bg-dark-surface border border-dark-border rounded-lg px-6 py-4 text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent-green focus:border-transparent"
        />
      </div>

      {loading && !selectedStock && (
        <div className="text-center py-12">
          <CoinLoader text="Loading stocks..." />
        </div>
      )}

      {selectedStock ? (
        /* Stock Detail View */
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={backToSearch}
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
                  type="button"
                  onClick={() => handleToggleWatchlist(selectedStock.symbol, {} as React.MouseEvent)}
                  className={`btn-secondary text-sm ${
                    watchlistStatus.get(selectedStock.symbol)
                      ? 'bg-dark-accent-green/20 border-dark-accent-green/50'
                      : ''
                  }`}
                >
                  {watchlistStatus.get(selectedStock.symbol) ? (
                    <span className="inline-flex items-center gap-2">
                      <NestWiseIcon name="check" size={16} />
                      In watchlist
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <NestWiseIcon name="plus" size={16} />
                      Add to watchlist
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* AI Overview */}
            <div className="border-t border-dark-border pt-6">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-2 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-accent-green/10 text-dark-accent-green">
                  <NestWiseIcon name="bot" size={18} />
                </span>
                AI overview
              </h3>
              {aiOverviewLoading && (
                <div className="flex items-center gap-2 text-dark-text-secondary">
                  <div className="w-4 h-4 border-2 border-dark-accent-green border-t-transparent rounded-full animate-spin" />
                  <span>Generating overview...</span>
                </div>
              )}
              {!aiOverviewLoading && aiOverview && (
                <div className="space-y-4">
                  <p className="text-dark-text-secondary leading-relaxed whitespace-pre-line">
                    {aiOverview}
                  </p>
                  <p className="text-xs text-dark-text-muted italic">
                    Not financial advice. For education only.
                  </p>
                </div>
              )}
              {!aiOverviewLoading && !aiOverview && (
                <p className="text-dark-text-muted text-sm">
                  AI overview unavailable. Check back later or ask in Ask AI.
                </p>
              )}
            </div>

            {selectedStock.description && (
              <div className="space-y-6 border-t border-dark-border pt-6">
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
              <p className="text-dark-text-secondary border-t border-dark-border pt-6">
                Loading company information...
              </p>
            )}

            <StockDeepDive stock={selectedStock} />
          </div>
        </div>
      ) : (
        /* Stock List */
        <>
          {!loading && stocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-dark-text-secondary mb-2">No stocks found.</p>
              <p className="text-dark-text-muted text-sm">Try a company name (e.g. Apple, Samsung) or symbol (e.g. AAPL, 005930.KS).</p>
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
                        type="button"
                        onClick={(e) => handleToggleWatchlist(stock.symbol, e)}
                        className={`ml-2 px-2 py-1 rounded text-sm ${
                          watchlistStatus.get(stock.symbol)
                            ? 'bg-dark-accent-green/20 text-dark-accent-green'
                            : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text-primary'
                        }`}
                      >
                        {watchlistStatus.get(stock.symbol) ? (
                          <NestWiseIcon name="check" size={16} className="text-dark-accent-green" />
                        ) : (
                          <NestWiseIcon name="plus" size={16} />
                        )}
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

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreContent />
    </Suspense>
  )
}
