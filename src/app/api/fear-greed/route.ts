import { NextResponse } from 'next/server'

/**
 * Returns a Fear & Greed style indicator (0-100).
 * Uses Alternative.me FNG for crypto as a market-sentiment proxy when available;
 * otherwise returns a neutral default so the UI always works.
 */
export async function GET() {
  try {
    const res = await fetch('https://api.alternative.me/fng/', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error('Fetch failed')
    const data = await res.json()
    const value = Number(data?.data?.[0]?.value ?? 50)
    const classification = data?.data?.[0]?.value_classification ?? 'Neutral'
    const valueNum = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 50))
    return NextResponse.json({
      value: Math.round(valueNum),
      label: classification,
    })
  } catch {
    return NextResponse.json({ value: 50, label: 'Neutral' })
  }
}
