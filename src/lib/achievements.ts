/**
 * Achievements/badges. Persisted to Supabase when configured, localStorage fallback.
 * `icon` is a Lucide icon name (see NestWiseIcon).
 */

import { supabase, isSupabaseConfigured } from './supabase'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-trade', name: 'First Trade', description: 'Made your first simulated trade', icon: 'target' },
  { id: 'first-stock', name: 'First Stock', description: 'Bought your first stock', icon: 'trending-up' },
  { id: 'diversified-5', name: 'Diversified', description: 'Hold 5+ different stocks', icon: 'layout-grid' },
  { id: 'learn-basics', name: 'Basics Complete', description: 'Finished the first two investing lessons', icon: 'book-open' },
  { id: 'learn-all', name: 'Course Graduate', description: 'Completed all learning modules', icon: 'graduation-cap' },
  { id: 'watchlist-5', name: 'Watchlist Pro', description: 'Added 5 stocks to your watchlist', icon: 'eye' },
  { id: 'week-active', name: 'Week Active', description: 'Logged in and traded this week', icon: 'flame' },
  { id: 'in-the-green', name: 'In the Green', description: 'Portfolio total return above 0%', icon: 'leaf' },
]

const KEY_PREFIX = 'nestwise_achievements_'

function getLocalUnlockedIds(userId: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY_PREFIX + userId)
    if (!raw) return []
    const data = JSON.parse(raw) as string[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function setLocalUnlockedIds(userId: string, ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(ids))
  } catch (e) {
    console.error('Achievements save failed:', e)
  }
}

export async function getUnlockedAchievementIds(userId: string): Promise<string[]> {
  const local = getLocalUnlockedIds(userId)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
      if (error) throw error
      const remote = (data || []).map((r) => r.achievement_id)
      return Array.from(new Set(local.concat(remote)))
    } catch (e) {
      console.error('Supabase achievements fetch failed, using localStorage:', e)
    }
  }
  return local
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
  const unlocked = await getUnlockedAchievementIds(userId)
  if (unlocked.includes(achievementId)) return false

  const local = getLocalUnlockedIds(userId)
  if (!local.includes(achievementId)) {
    setLocalUnlockedIds(userId, [...local, achievementId])
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .upsert({ user_id: userId, achievement_id: achievementId }, { onConflict: 'user_id,achievement_id' })
      if (error) throw error
      return true
    } catch (e) {
      console.error('Supabase achievement unlock failed:', e)
    }
  }

  return true
}

export async function isUnlocked(userId: string, achievementId: string): Promise<boolean> {
  const ids = await getUnlockedAchievementIds(userId)
  return ids.includes(achievementId)
}

export async function getUnlockedAchievements(userId: string): Promise<Achievement[]> {
  const ids = await getUnlockedAchievementIds(userId)
  return ACHIEVEMENTS.filter((a) => ids.includes(a.id))
}
