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

async function fetchFromYahooFinance(symbol: string): Promise<StockData | null> {
  try {
    // Yahoo Finance API endpoint (free, no key required)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
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

async function fetchStockDescription(symbol: string): Promise<{ description: string; whyInvest: string } | null> {
  try {
    // Try to get company info from Yahoo Finance
    const response = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryProfile`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) return null

    const data = await response.json()
    const profile = data.quoteSummary?.result?.[0]?.summaryProfile

    if (!profile) return null

    return {
      description: profile.longBusinessSummary || profile.description || '',
      whyInvest: `Some investors consider ${symbol} because ${profile.longBusinessSummary?.substring(0, 200) || 'it represents a company in the market.'}`,
    }
  } catch (error) {
    console.error(`Error fetching description for ${symbol}:`, error)
    return null
  }
}

export async function getStockData(symbol: string): Promise<StockData | null> {
  // Check cache first
  const cached = cache.get(symbol)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  // Fetch from API
  const stockData = await fetchFromYahooFinance(symbol)
  if (!stockData) return null

  // Try to get description
  const description = await fetchStockDescription(symbol)
  if (description) {
    stockData.description = description.description
    stockData.whyInvest = description.whyInvest
  }

  // Cache the result
  cache.set(symbol, { data: stockData, timestamp: Date.now() })

  return stockData
}

export async function getMultipleStocks(symbols: string[]): Promise<StockData[]> {
  const promises = symbols.map((symbol) => getStockData(symbol))
  const results = await Promise.all(promises)
  return results.filter((stock): stock is StockData => stock !== null)
}

// Search stocks (using a predefined list for now, can be enhanced with API)
const POPULAR_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX', 'DIS', 'JPM', 'V', 'MA', 'WMT', 'JNJ', 'PG']

export async function searchStocks(query: string): Promise<StockData[]> {
  if (!query.trim()) {
    // Return popular stocks if no query
    return getMultipleStocks(POPULAR_STOCKS.slice(0, 6))
  }

  const upperQuery = query.toUpperCase()
  const matchingSymbols = POPULAR_STOCKS.filter(
    (symbol) => symbol.includes(upperQuery) || symbol === upperQuery
  )

  if (matchingSymbols.length === 0) {
    // If no match, try the query as a symbol
    const stockData = await getStockData(upperQuery)
    return stockData ? [stockData] : []
  }

  return getMultipleStocks(matchingSymbols)
}
