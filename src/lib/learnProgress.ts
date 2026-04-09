/**
 * Learning progress (completed lessons) per user.
 * Persisted to Supabase when configured, localStorage fallback.
 */

import { supabase, isSupabaseConfigured } from './supabase'

const KEY_PREFIX = 'nestwise_learn_progress_'

function getLocalCompletedIds(userId: string): string[] {
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

function setLocalCompletedIds(userId: string, ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(ids))
  } catch (e) {
    console.error('Learn progress save failed:', e)
  }
}

export async function getCompletedLessonIds(userId: string): Promise<string[]> {
  const local = getLocalCompletedIds(userId)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_learn_progress')
        .select('lesson_id')
        .eq('user_id', userId)
      if (error) throw error
      const remote = (data || []).map((r) => r.lesson_id)
      const merged = Array.from(new Set(local.concat(remote)))
      // Sync any local-only completions up to Supabase (covers device migration)
      const onlyLocal = local.filter((id) => !remote.includes(id))
      if (onlyLocal.length > 0) {
        const rows = onlyLocal.map((lesson_id) => ({ user_id: userId, lesson_id }))
        supabase
          .from('user_learn_progress')
          .upsert(rows, { onConflict: 'user_id,lesson_id' })
          .then(({ error: upsertErr }) => {
            if (upsertErr) console.error('Learn progress sync failed:', upsertErr)
          })
      }
      // Also cache merged result locally so offline works
      setLocalCompletedIds(userId, merged)
      return merged
    } catch (e) {
      console.error('Supabase learn progress fetch failed, using localStorage:', e)
    }
  }
  return local
}

export async function markLessonComplete(userId: string, lessonId: string): Promise<void> {
  const completed = getLocalCompletedIds(userId)
  if (!completed.includes(lessonId)) {
    setLocalCompletedIds(userId, [...completed, lessonId])
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('user_learn_progress')
        .upsert({ user_id: userId, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' })
      if (error) throw error
    } catch (e) {
      console.error('Supabase lesson complete failed:', e)
    }
  }
}

export async function isLessonComplete(userId: string, lessonId: string): Promise<boolean> {
  const ids = await getCompletedLessonIds(userId)
  return ids.includes(lessonId)
}

export async function getProgressStats(userId: string, totalLessons: number): Promise<{ completed: number; percent: number }> {
  const ids = await getCompletedLessonIds(userId)
  const completed = ids.length
  return {
    completed,
    percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
  }
}
