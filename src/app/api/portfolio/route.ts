import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getPortfolio, getHoldings } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const portfolio = await getPortfolio(userId)
    if (!portfolio) {
      return NextResponse.json({ portfolio: null, holdings: [] })
    }
    const holdings = await getHoldings(portfolio.id)
    return NextResponse.json({ portfolio, holdings })
  } catch (err: unknown) {
    console.error('GET /api/portfolio error:', err)
    // Return null portfolio so the client can show start-simulator instead of a broken error.
    // "fetch failed" usually means Supabase is unreachable (network/env).
    return NextResponse.json({ portfolio: null, holdings: [] })
  }
}
