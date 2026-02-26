import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getPortfolio, resetSimulator } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const cash = Number(body?.cash ?? 10000)
    if (!Number.isFinite(cash) || cash < 0) {
      return NextResponse.json({ error: 'Invalid cash amount' }, { status: 400 })
    }

    const portfolio = await getPortfolio(userId)
    if (!portfolio) {
      return NextResponse.json({ error: 'No portfolio to reset' }, { status: 400 })
    }

    await resetSimulator(portfolio.id, cash)
    return NextResponse.json({ success: true, cash })
  } catch (err: unknown) {
    console.error('Portfolio reset error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to reset portfolio' },
      { status: 500 }
    )
  }
}
