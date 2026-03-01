import { supabase, type WatchlistItem } from './supabase'

export type { WatchlistItem }

const WATCHLIST_STORAGE_PREFIX = 'nestwise_watchlist_'

function getLocalWatchlist(userId: string): WatchlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_PREFIX + userId)
    if (!raw) return []
    const arr = JSON.parse(raw) as WatchlistItem[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function setLocalWatchlist(userId: string, items: WatchlistItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(WATCHLIST_STORAGE_PREFIX + userId, JSON.stringify(items))
  } catch (e) {
    console.error('Watchlist save failed:', e)
  }
}

// Get user's watchlist
export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
  if (supabase) {
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
  return getLocalWatchlist(userId)
}

// Add stock to watchlist
export async function addToWatchlist(userId: string, symbol: string): Promise<WatchlistItem> {
  const sym = symbol.toUpperCase()
  if (supabase) {
    const { data, error } = await supabase
      .from('watchlists')
      .insert({
        user_id: userId,
        symbol: sym,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('watchlists')
          .select('*')
          .eq('user_id', userId)
          .eq('symbol', sym)
          .single()
        return existing!
      }
      throw new Error(`Failed to add to watchlist: ${error.message}`)
    }
    return data
  }
  const items = getLocalWatchlist(userId)
  if (items.some((i) => i.symbol === sym)) {
    return items.find((i) => i.symbol === sym)!
  }
  const newItem: WatchlistItem = {
    id: `local-${sym}-${Date.now()}`,
    user_id: userId,
    symbol: sym,
    created_at: new Date().toISOString(),
  }
  setLocalWatchlist(userId, [...items, newItem])
  return newItem
}

// Remove stock from watchlist
export async function removeFromWatchlist(userId: string, symbol: string): Promise<void> {
  const sym = symbol.toUpperCase()
  if (supabase) {
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', sym)

    if (error) {
      throw new Error(`Failed to remove from watchlist: ${error.message}`)
    }
    return
  }
  const items = getLocalWatchlist(userId).filter((i) => i.symbol !== sym)
  setLocalWatchlist(userId, items)
}

// Check if stock is in watchlist
export async function isInWatchlist(userId: string, symbol: string): Promise<boolean> {
  const sym = symbol.toUpperCase()
  if (supabase) {
    const { data, error } = await supabase
      .from('watchlists')
      .select('id')
      .eq('user_id', userId)
      .eq('symbol', sym)
      .single()
    return !error && !!data
  }
  return getLocalWatchlist(userId).some((i) => i.symbol === sym)
}
