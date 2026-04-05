/**
 * Achievements/badges. Unlocked state per user in localStorage.
 * `icon` is a Lucide icon name (see NestWiseIcon).
 */

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

export function getUnlockedAchievementIds(userId: string): string[] {
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

export function setUnlockedAchievementIds(userId: string, ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(ids))
  } catch (e) {
    console.error('Achievements save failed:', e)
  }
}

export function unlockAchievement(userId: string, achievementId: string): boolean {
  const unlocked = getUnlockedAchievementIds(userId)
  if (unlocked.includes(achievementId)) return false
  setUnlockedAchievementIds(userId, [...unlocked, achievementId])
  return true
}

export function isUnlocked(userId: string, achievementId: string): boolean {
  return getUnlockedAchievementIds(userId).includes(achievementId)
}

export function getUnlockedAchievements(userId: string): Achievement[] {
  const ids = getUnlockedAchievementIds(userId)
  return ACHIEVEMENTS.filter((a) => ids.includes(a.id))
}
