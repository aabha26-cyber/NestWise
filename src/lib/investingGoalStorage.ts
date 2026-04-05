/**
 * Local-only investing goals for kids — virtual progress tied to simulator portfolio gains.
 */

export interface InvestingGoal {
  id: string
  label: string
  targetAmount: number
  createdAt: string
}

const KEY = (userId: string) => `nestwise_goal_${userId}`

export function getGoal(userId: string): InvestingGoal | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY(userId))
    if (!raw) return null
    const g = JSON.parse(raw) as InvestingGoal
    if (!g?.label || typeof g.targetAmount !== 'number') return null
    return g
  } catch {
    return null
  }
}

export function setGoal(userId: string, goal: InvestingGoal): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY(userId), JSON.stringify(goal))
}

export function clearGoal(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY(userId))
}

/** Progress 0–100 from virtual gains toward target (capped). */
export function goalProgressFromGains(gains: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.max(0, (gains / target) * 100))
}

/** Rough ETA: days to reach target at current average daily gain */
export function projectDaysToGoal(
  remaining: number,
  avgDailyGain: number
): number | null {
  if (remaining <= 0) return 0
  if (avgDailyGain <= 0) return null
  return Math.ceil(remaining / avgDailyGain)
}
