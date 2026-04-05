import { NextRequest, NextResponse } from 'next/server'

/** Yahoo chart: daily closes for sparkline / deep-dive chart */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')?.trim().toUpperCase()
  const range = searchParams.get('range') || '3mo' // 1mo | 3mo | 6mo | 1y
  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 })
  }

  const allowed = new Set(['1mo', '3mo', '6mo', '1y'])
  const r = allowed.has(range) ? range : '3mo'

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${r}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) {
      return NextResponse.json({ points: [], error: 'Upstream error' }, { status: 200 })
    }
    const data = await res.json()
    const result = data.chart?.result?.[0]
    if (!result?.timestamp?.length) {
      return NextResponse.json({ points: [] })
    }
    const quote = result.indicators?.quote?.[0]
    const closes = quote?.close ?? []
    const timestamps: number[] = result.timestamp
    const points: { t: number; c: number }[] = []
    for (let i = 0; i < timestamps.length; i++) {
      const c = closes[i]
      if (typeof c === 'number' && !Number.isNaN(c)) {
        points.push({ t: timestamps[i], c })
      }
    }
    return NextResponse.json({ points, range: r, symbol })
  } catch {
    return NextResponse.json({ points: [] })
  }
}
