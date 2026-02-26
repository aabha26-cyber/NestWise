import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getPortfolio, createPortfolio } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const initialCash = Number(body?.initialCash ?? 10000)
    if (!Number.isFinite(initialCash) || initialCash < 0) {
      return NextResponse.json({ error: 'Invalid initialCash' }, { status: 400 })
    }

    const existing = await getPortfolio(userId)
    if (existing) {
      return NextResponse.json({ portfolio: existing })
    }

    const portfolio = await createPortfolio(userId, initialCash)
    return NextResponse.json({ portfolio })
  } catch (err: unknown) {
    console.error('Portfolio init error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to init portfolio' },
      { status: 500 }
    )
  }
}
