import { NextRequest, NextResponse } from 'next/server'

// Yahoo Finance search: returns matching symbols worldwide
const YAHOO_SEARCH_URL = 'https://query2.finance.yahoo.com/v1/finance/search'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50)

  if (!q || q.length < 1) {
    return NextResponse.json({ quotes: [] })
  }

  try {
    const url = new URL(YAHOO_SEARCH_URL)
    url.searchParams.set('q', q)
    url.searchParams.set('quotesCount', String(limit))
    url.searchParams.set('newsCount', '0')
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NestWise/1.0)' },
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      return NextResponse.json({ quotes: [] })
    }
    const data = await res.json()
    const quotes = (data.quotes || []).filter(
      (q: { symbol?: string; quoteType?: string }) =>
        q.symbol && (q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'INDEX' || !q.quoteType)
    )
    return NextResponse.json({
      quotes: quotes.slice(0, limit).map((q: { symbol: string; shortname?: string; longname?: string; exchange?: string }) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchange || '',
      })),
    })
  } catch (e) {
    console.error('Yahoo search error:', e)
    return NextResponse.json({ quotes: [] })
  }
}
