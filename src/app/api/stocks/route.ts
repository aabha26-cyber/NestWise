import { NextRequest, NextResponse } from 'next/server'

// Server-side Yahoo Finance fetch (no CORS)
async function fetchYahooChart(symbol: string) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) return null
  const data = await res.json()
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
    description: undefined as string | undefined,
    whyInvest: undefined as string | undefined,
  }
}

async function fetchYahooDescription(symbol: string) {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryProfile`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const profile = data.quoteSummary?.result?.[0]?.summaryProfile
    if (!profile) return null
    return {
      description: profile.longBusinessSummary || profile.description || '',
      whyInvest: `Some investors consider ${symbol} because ${(profile.longBusinessSummary || '').substring(0, 200) || 'it represents a company in the market.'}`,
    }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const symbolsParam = searchParams.get('symbols')

  if (symbolsParam) {
    const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
    if (symbols.length === 0) {
      return NextResponse.json({ stocks: [] })
    }
    const results = await Promise.all(
      symbols.map(async (sym) => {
        const stock = await fetchYahooChart(sym)
        if (!stock) return null
        const desc = await fetchYahooDescription(sym)
        if (desc) {
          stock.description = desc.description
          stock.whyInvest = desc.whyInvest
        }
        return stock
      })
    )
    const stocks = results.filter((s): s is NonNullable<typeof s> => s !== null)
    return NextResponse.json({ stocks })
  }

  if (symbol) {
    const sym = symbol.trim().toUpperCase()
    const stock = await fetchYahooChart(sym)
    if (!stock) {
      return NextResponse.json({ stock: null })
    }
    const desc = await fetchYahooDescription(sym)
    if (desc) {
      stock.description = desc.description
      stock.whyInvest = desc.whyInvest
    }
    return NextResponse.json({ stock })
  }

  return NextResponse.json({ error: 'Missing symbol or symbols' }, { status: 400 })
}
