/**
 * Watchlist notes ("Why I'm watching") per user. Stored in localStorage.
 */

const KEY_PREFIX = 'nestwise_watchlist_notes_'

export function getWatchlistNotes(userId: string): Record<string, string> {
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

export function setWatchlistNote(userId: string, symbol: string, note: string): void {
  if (typeof window === 'undefined') return
  const notes = getWatchlistNotes(userId)
  if (note.trim()) {
    notes[symbol] = note.trim()
  } else {
    delete notes[symbol]
  }
  try {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(notes))
  } catch (e) {
    console.error('Watchlist notes save failed:', e)
  }
}

export function getWatchlistNote(userId: string, symbol: string): string {
  return getWatchlistNotes(userId)[symbol] ?? ''
}
