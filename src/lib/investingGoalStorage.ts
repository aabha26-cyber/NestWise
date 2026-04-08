/**
 * Investing goals for kids — virtual progress tied to simulator portfolio gains.
 * Persisted to Supabase when configured, localStorage fallback.
 */

import { supabase, isSupabaseConfigured } from './supabase'

export interface InvestingGoal {
  id: string
  label: string
  targetAmount: number
  createdAt: string
}

const KEY = (userId: string) => `nestwise_goal_${userId}`

function getLocalGoal(userId: string): InvestingGoal | null {
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

export async function getGoal(userId: string): Promise<InvestingGoal | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('user_id, label, target_amount, created_at')
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      if (data) {
        return {
          id: data.user_id,
          label: data.label,
          targetAmount: Number(data.target_amount),
          createdAt: data.created_at,
        }
      }
      return null
    } catch (e) {
      console.error('Supabase goal fetch failed, using localStorage:', e)
    }
  }
  return getLocalGoal(userId)
}

export async function setGoal(userId: string, goal: InvestingGoal): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('user_goals')
        .upsert(
          {
            user_id: userId,
            label: goal.label,
            target_amount: goal.targetAmount,
            created_at: goal.createdAt,
          },
          { onConflict: 'user_id' }
        )
      if (error) throw error
      return
    } catch (e) {
      console.error('Supabase goal save failed, using localStorage:', e)
    }
  }
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY(userId), JSON.stringify(goal))
}

export async function clearGoal(userId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('user_id', userId)
      if (error) throw error
      return
    } catch (e) {
      console.error('Supabase goal clear failed, using localStorage:', e)
    }
  }
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY(userId))
}

export function goalProgressFromGains(gains: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.max(0, (gains / target) * 100))
}

export function projectDaysToGoal(
  remaining: number,
  avgDailyGain: number
): number | null {
  if (remaining <= 0) return 0
  if (avgDailyGain <= 0) return null
  return Math.ceil(remaining / avgDailyGain)
}
