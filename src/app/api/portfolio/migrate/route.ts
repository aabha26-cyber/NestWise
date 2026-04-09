import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { getPortfolio, createPortfolio, updateCashBalance } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

/**
 * Migrates a localStorage simulator state into Supabase.
 * Called once automatically when the client detects local-only data.
 * Body: { cashBalance, initialCash, holdings: [{symbol, shares, average_cost}], transactions: [...] }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { cashBalance, initialCash, holdings = [], transactions = [] } = body

    if (typeof cashBalance !== 'number' || !Number.isFinite(cashBalance)) {
      return NextResponse.json({ error: 'Invalid cashBalance' }, { status: 400 })
    }

    // Get or create the Supabase portfolio
    let portfolio = await getPortfolio(userId)
    if (!portfolio) {
      portfolio = await createPortfolio(userId, initialCash ?? cashBalance)
    }

    // Overwrite cash balance with the local value (more recent)
    await updateCashBalance(portfolio.id, cashBalance)

    // Wipe existing holdings and replace with local ones
    await supabase.from('holdings').delete().eq('portfolio_id', portfolio.id)
    if (holdings.length > 0) {
      const rows = holdings.map((h: { symbol: string; shares: number; average_cost: number }) => ({
        portfolio_id: portfolio!.id,
        symbol: h.symbol,
        shares: h.shares,
        average_cost: h.average_cost,
      }))
      const { error } = await supabase.from('holdings').insert(rows)
      if (error) throw new Error(`Failed to insert holdings: ${error.message}`)
    }

    // Insert transactions (skip if they already exist — use created_at as rough dedup)
    if (transactions.length > 0) {
      const rows = transactions
        .slice(0, 500)
        .map((t: { symbol: string; type: string; shares: number; price: number; date: string }) => ({
          portfolio_id: portfolio!.id,
          symbol: t.symbol,
          type: t.type,
          shares: t.shares,
          price: t.price,
          total_amount: t.shares * t.price,
          created_at: t.date,
        }))
      // Best-effort: ignore duplicates
      await supabase.from('transactions').upsert(rows, { ignoreDuplicates: true })
    }

    return NextResponse.json({ success: true, portfolioId: portfolio.id })
  } catch (err: unknown) {
    console.error('Portfolio migrate error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Migration failed' },
      { status: 500 }
    )
  }
}
