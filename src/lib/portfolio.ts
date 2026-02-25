import { supabase, type Portfolio, type Holding, type Transaction } from './supabase'

export type { Holding, Transaction }

// Get portfolio for a user without creating (returns null if none)
export async function getPortfolio(userId: string): Promise<Portfolio | null> {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Failed to fetch portfolio: ${error.message}`)
  return data
}

// Create a new portfolio with chosen starting cash (for simulator)
export async function createPortfolio(userId: string, initialCash: number): Promise<Portfolio> {
  const { data, error } = await supabase
    .from('portfolios')
    .insert({
      user_id: userId,
      cash_balance: Math.max(0, Number(initialCash)),
    })
    .select()
    .single()
  if (error || !data) throw new Error(`Failed to create portfolio: ${error?.message}`)
  return data
}

// Reset simulator: set cash and clear all holdings and transactions
export async function resetSimulator(portfolioId: string, newCash: number): Promise<void> {
  await supabase.from('holdings').delete().eq('portfolio_id', portfolioId)
  await supabase.from('transactions').delete().eq('portfolio_id', portfolioId)
  await updateCashBalance(portfolioId, Math.max(0, Number(newCash)))
}

// Get or create portfolio for a user (creates with default 10k if none)
export async function getOrCreatePortfolio(userId: string): Promise<Portfolio> {
  const existing = await getPortfolio(userId)
  if (existing) return existing
  return createPortfolio(userId, 10000)
}

// Get all holdings for a portfolio
export async function getHoldings(portfolioId: string): Promise<Holding[]> {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch holdings: ${error.message}`)
  }

  return data || []
}

// Add or update holding
export async function addHolding(
  portfolioId: string,
  symbol: string,
  shares: number,
  price: number
): Promise<Holding> {
  // Get existing holding
  const { data: existing } = await supabase
    .from('holdings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('symbol', symbol)
    .single()

  if (existing) {
    // Update existing holding
    const totalShares = existing.shares + shares
    const totalCost = (existing.average_cost || 0) * existing.shares + price * shares
    const newAverageCost = totalCost / totalShares

    const { data, error } = await supabase
      .from('holdings')
      .update({
        shares: totalShares,
        average_cost: newAverageCost,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update holding: ${error?.message}`)
    }

    return data
  } else {
    // Create new holding
    const { data, error } = await supabase
      .from('holdings')
      .insert({
        portfolio_id: portfolioId,
        symbol,
        shares,
        average_cost: price,
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to create holding: ${error?.message}`)
    }

    return data
  }
}

// Remove shares from holding
export async function removeHolding(
  portfolioId: string,
  symbol: string,
  shares: number
): Promise<void> {
  const { data: existing } = await supabase
    .from('holdings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('symbol', symbol)
    .single()

  if (!existing) {
    throw new Error('Holding not found')
  }

  const newShares = existing.shares - shares

  if (newShares <= 0) {
    // Delete holding if shares reach zero
    const { error } = await supabase
      .from('holdings')
      .delete()
      .eq('id', existing.id)

    if (error) {
      throw new Error(`Failed to delete holding: ${error.message}`)
    }
  } else {
    // Update shares
    const { error } = await supabase
      .from('holdings')
      .update({ shares: newShares })
      .eq('id', existing.id)

    if (error) {
      throw new Error(`Failed to update holding: ${error.message}`)
    }
  }
}

// Record a transaction
export async function recordTransaction(
  portfolioId: string,
  symbol: string,
  type: 'buy' | 'sell',
  shares: number,
  price: number
): Promise<Transaction> {
  const totalAmount = shares * price

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      portfolio_id: portfolioId,
      symbol,
      type,
      shares,
      price,
      total_amount: totalAmount,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(`Failed to record transaction: ${error?.message}`)
  }

  return data
}

// Update cash balance
export async function updateCashBalance(
  portfolioId: string,
  newBalance: number
): Promise<void> {
  const { error } = await supabase
    .from('portfolios')
    .update({ cash_balance: newBalance })
    .eq('id', portfolioId)

  if (error) {
    throw new Error(`Failed to update cash balance: ${error.message}`)
  }
}

// Get transaction history
export async function getTransactions(
  portfolioId: string,
  limit: number = 50
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return data || []
}

// Record portfolio value history
export async function recordPortfolioValue(
  portfolioId: string,
  totalValue: number
): Promise<void> {
  await supabase.from('portfolio_history').insert({
    portfolio_id: portfolioId,
    total_value: totalValue,
  })
}

// Get portfolio value history
export async function getPortfolioHistory(
  portfolioId: string,
  days: number = 30
): Promise<Array<{ total_value: number; recorded_at: string }>> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('portfolio_history')
    .select('total_value, recorded_at')
    .eq('portfolio_id', portfolioId)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch portfolio history: ${error.message}`)
  }

  return data || []
}
