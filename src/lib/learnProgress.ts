/**
 * Learning progress (completed lessons) per user. Stored in localStorage.
 */

const KEY_PREFIX = 'nestwise_learn_progress_'

export function getCompletedLessonIds(userId: string): string[] {
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

export function setCompletedLessonIds(userId: string, ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(ids))
  } catch (e) {
    console.error('Learn progress save failed:', e)
  }
}

export function markLessonComplete(userId: string, lessonId: string): void {
  const completed = getCompletedLessonIds(userId)
  if (completed.includes(lessonId)) return
  setCompletedLessonIds(userId, [...completed, lessonId])
}

export function isLessonComplete(userId: string, lessonId: string): boolean {
  return getCompletedLessonIds(userId).includes(lessonId)
}

export function getProgressStats(userId: string, totalLessons: number): { completed: number; percent: number } {
  const completed = getCompletedLessonIds(userId).length
  return {
    completed,
    percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
  }
}
