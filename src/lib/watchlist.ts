import { supabase, type WatchlistItem } from './supabase'

// Get user's watchlist
export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch watchlist: ${error.message}`)
  }

  return data || []
}

// Add stock to watchlist
export async function addToWatchlist(userId: string, symbol: string): Promise<WatchlistItem> {
  const { data, error } = await supabase
    .from('watchlists')
    .insert({
      user_id: userId,
      symbol: symbol.toUpperCase(),
    })
    .select()
    .single()

  if (error) {
    // If already exists, just return (ignore duplicate error)
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', userId)
        .eq('symbol', symbol.toUpperCase())
        .single()
      return existing!
    }
    throw new Error(`Failed to add to watchlist: ${error.message}`)
  }

  return data
}

// Remove stock from watchlist
export async function removeFromWatchlist(userId: string, symbol: string): Promise<void> {
  const { error } = await supabase
    .from('watchlists')
    .delete()
    .eq('user_id', userId)
    .eq('symbol', symbol.toUpperCase())

  if (error) {
    throw new Error(`Failed to remove from watchlist: ${error.message}`)
  }
}

// Check if stock is in watchlist
export async function isInWatchlist(userId: string, symbol: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('watchlists')
    .select('id')
    .eq('user_id', userId)
    .eq('symbol', symbol.toUpperCase())
    .single()

  return !error && !!data
}
