// Stock API utilities - using Yahoo Finance API (free, no key required)
// Fallback to mock data if API fails

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  description?: string
  whyInvest?: string
}

// Cache for API responses (5 minute cache)
const cache = new Map<string, { data: StockData; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Client-safe: call our API (avoids CORS). Server-side: call Yahoo directly.
async function fetchFromYahooFinance(symbol: string): Promise<StockData | null> {
  if (typeof window !== 'undefined') {
    // Browser: proxy via our API so we don't hit CORS
    try {
      const response = await fetch(`/api/stocks?symbol=${encodeURIComponent(symbol)}`)
      if (!response.ok) return null
      const json = await response.json()
      return json.stock ?? null
    } catch (error: any) {
      console.error(`Error fetching ${symbol}:`, error)
      return null
    }
  }
  // Server: fetch Yahoo directly (no CORS)
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    const data = await response.json()
    const result = data.chart?.result?.[0]
    if (!result) return null
    const meta = result.meta
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0
    const previousClose = meta.previousClose || currentPrice
    const change = currentPrice - previousClose
    const changePercent = previousClose ? (change / previousClose) * 100 : 0
    return {
      symbol: meta.symbol,
      name: meta.longName || meta.shortName || symbol,
      price: currentPrice,
      change,
      changePercent,
    }
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error)
    return null
  }
}

// Only used on server (getStockData caches full data from API when on client)
async function fetchStockDescription(symbol: string): Promise<{ description: string; whyInvest: string } | null> {
  if (typeof window !== 'undefined') return null
  try {
    const response = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryProfile`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    const data = await response.json()
    const profile = data.quoteSummary?.result?.[0]?.summaryProfile
    if (!profile) return null
    return {
      description: profile.longBusinessSummary || profile.description || '',
      whyInvest: `Some investors consider ${symbol} because ${(profile.longBusinessSummary || '').substring(0, 200) || 'it represents a company in the market.'}`,
    }
  } catch (error) {
    console.error(`Error fetching description for ${symbol}:`, error)
    return null
  }
}

export async function getStockData(symbol: string): Promise<StockData | null> {
  const cached = cache.get(symbol)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  const stockData = await fetchFromYahooFinance(symbol)
  if (!stockData) return null
  if (typeof window === 'undefined') {
    const description = await fetchStockDescription(symbol)
    if (description) {
      stockData.description = description.description
      stockData.whyInvest = description.whyInvest
    }
  }
  cache.set(symbol, { data: stockData, timestamp: Date.now() })
  return stockData
}

export async function getMultipleStocks(symbols: string[]): Promise<StockData[]> {
  if (typeof window !== 'undefined' && symbols.length > 0) {
    try {
      const response = await fetch(`/api/stocks?symbols=${encodeURIComponent(symbols.join(','))}`)
      if (!response.ok) return []
      const json = await response.json()
      const stocks = json.stocks ?? []
      stocks.forEach((s: StockData) => cache.set(s.symbol, { data: s, timestamp: Date.now() }))
      return stocks
    } catch (error) {
      console.error('Error fetching multiple stocks:', error)
      return []
    }
  }
  const promises = symbols.map((symbol) => getStockData(symbol))
  const results = await Promise.all(promises)
  return results.filter((stock): stock is StockData => stock !== null)
}

// Default symbols when search is empty: US, global, and ETFs (broad “all stocks” feel)
const POPULAR_STOCKS = [
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX', 'DIS', 'JPM',
  'V', 'MA', 'WMT', 'JNJ', 'PG', 'BAC', 'XOM', 'UNH', 'HD', 'KO',
  'PYPL', 'ADBE', 'NKE', 'CRM', 'INTC', 'AMD', 'AVGO', 'ORCL', 'CSCO', 'PEP',
  'COST', 'MCD', 'ABBV', 'TMO', 'ABT', 'DHR', 'NEE', 'LIN', 'PM', 'BMY',
  'SPY', 'QQQ', 'VTI', 'VOO', 'IWM',
]

export async function searchStocks(query: string): Promise<StockData[]> {
  if (!query.trim()) {
    return getMultipleStocks(POPULAR_STOCKS.slice(0, 24))
  }

  // Global search: call Yahoo search API via our proxy
  if (typeof window !== 'undefined') {
    try {
      const searchRes = await fetch(
        `/api/stocks/search?q=${encodeURIComponent(query.trim())}&limit=20`
      )
      if (!searchRes.ok) return []
      const { quotes } = await searchRes.json()
      if (!quotes?.length) return []
      const symbols = quotes.map((q: { symbol: string }) => q.symbol)
      const stocks = await getMultipleStocks(symbols)
      // Preserve order from search; fill name from search if price fetch failed
      const bySymbol = new Map(stocks.map((s) => [s.symbol, s]))
      return symbols
        .map((sym: string) => {
          const st = bySymbol.get(sym)
          if (st) return st
          const q = quotes.find((q: { symbol: string }) => q.symbol === sym)
          if (!q) return null
          return {
            symbol: q.symbol,
            name: q.name || q.symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          } as StockData
        })
        .filter((s: StockData | null): s is StockData => s !== null)
    } catch (e) {
      console.error('Search error:', e)
      return []
    }
  }

  // Server fallback: try query as single symbol
  const stockData = await getStockData(query.trim().toUpperCase())
  return stockData ? [stockData] : []
}
