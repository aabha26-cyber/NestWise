/**
 * Watchlist notes ("Why I'm watching") per user.
 * Persisted to Supabase when configured, localStorage fallback.
 */

import { supabase, isSupabaseConfigured } from './supabase'

const KEY_PREFIX = 'nestwise_watchlist_notes_'

function getLocalNotes(userId: string): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(KEY_PREFIX + userId)
    if (!raw) return {}
    const data = JSON.parse(raw) as Record<string, string>
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

function setLocalNotes(userId: string, notes: Record<string, string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(notes))
  } catch (e) {
    console.error('Watchlist notes save failed:', e)
  }
}

export async function getWatchlistNotes(userId: string): Promise<Record<string, string>> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_watchlist_notes')
        .select('symbol, note')
        .eq('user_id', userId)
      if (error) throw error
      const notes: Record<string, string> = {}
      for (const row of data || []) {
        if (row.note) notes[row.symbol] = row.note
      }
      return notes
    } catch (e) {
      console.error('Supabase watchlist notes fetch failed, using localStorage:', e)
    }
  }
  return getLocalNotes(userId)
}

export async function setWatchlistNote(userId: string, symbol: string, note: string): Promise<void> {
  const trimmed = note.trim()

  if (isSupabaseConfigured && supabase) {
    try {
      if (trimmed) {
        const { error } = await supabase
          .from('user_watchlist_notes')
          .upsert(
            { user_id: userId, symbol, note: trimmed },
            { onConflict: 'user_id,symbol' }
          )
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_watchlist_notes')
          .delete()
          .eq('user_id', userId)
          .eq('symbol', symbol)
        if (error) throw error
      }
      return
    } catch (e) {
      console.error('Supabase watchlist note save failed, using localStorage:', e)
    }
  }

  const notes = getLocalNotes(userId)
  if (trimmed) {
    notes[symbol] = trimmed
  } else {
    delete notes[symbol]
  }
  setLocalNotes(userId, notes)
}

export async function getWatchlistNote(userId: string, symbol: string): Promise<string> {
  const notes = await getWatchlistNotes(userId)
  return notes[symbol] ?? ''
}
