/**
 * User profile bio and personal to-dos.
 * Supabase when configured; localStorage fallback.
 */

import { supabase, isSupabaseConfigured } from './supabase'

const BIO_PREFIX = 'nestwise_profile_bio_'
const TODOS_PREFIX = 'nestwise_todos_'

const MAX_BIO = 2000
const MAX_TITLE = 500

export interface UserTodo {
  id: string
  title: string
  done: boolean
  sortOrder: number
  createdAt?: string
}

function getLocalBio(userId: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(BIO_PREFIX + userId) ?? ''
  } catch {
    return ''
  }
}

function setLocalBio(userId: string, bio: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(BIO_PREFIX + userId, bio)
  } catch (e) {
    console.error('Bio local save failed:', e)
  }
}

function getLocalTodos(userId: string): UserTodo[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TODOS_PREFIX + userId)
    if (!raw) return []
    const data = JSON.parse(raw) as UserTodo[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function setLocalTodos(userId: string, todos: UserTodo[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TODOS_PREFIX + userId, JSON.stringify(todos))
  } catch (e) {
    console.error('Todos local save failed:', e)
  }
}

export async function getProfileBio(userId: string): Promise<string> {
  const local = getLocalBio(userId)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('user_profiles').select('bio').eq('user_id', userId).maybeSingle()
      if (error) throw error
      if (data?.bio != null && String(data.bio).length > 0) return String(data.bio)
      return local
    } catch (e) {
      console.error('Supabase bio fetch failed:', e)
    }
  }
  return local
}

export async function setProfileBio(userId: string, bio: string): Promise<void> {
  const trimmed = bio.slice(0, MAX_BIO)
  setLocalBio(userId, trimmed)
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('user_profiles').upsert(
        { user_id: userId, bio: trimmed, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      if (error) throw error
    } catch (e) {
      console.error('Supabase bio save failed:', e)
    }
  }
}

export async function getTodos(userId: string): Promise<UserTodo[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_todos')
        .select('id, title, done, sort_order, created_at')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error
      if (data?.length) {
        return data.map((r) => ({
          id: r.id,
          title: r.title,
          done: r.done,
          sortOrder: r.sort_order,
          createdAt: r.created_at,
        }))
      }
    } catch (e) {
      console.error('Supabase todos fetch failed:', e)
    }
  }
  return getLocalTodos(userId)
}

export async function addTodo(userId: string, title: string): Promise<UserTodo | null> {
  const t = title.trim().slice(0, MAX_TITLE)
  if (!t) return null

  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  const sortOrder = Date.now()

  const todo: UserTodo = {
    id,
    title: t,
    done: false,
    sortOrder,
    createdAt: new Date().toISOString(),
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_todos')
        .insert({
          id,
          user_id: userId,
          title: t,
          done: false,
          sort_order: sortOrder,
        })
        .select('id, title, done, sort_order, created_at')
        .single()
      if (error) throw error
      if (data) {
        return {
          id: data.id,
          title: data.title,
          done: data.done,
          sortOrder: data.sort_order,
          createdAt: data.created_at,
        }
      }
    } catch (e) {
      console.error('Supabase add todo failed:', e)
    }
  }

  const list = [...getLocalTodos(userId), todo]
  setLocalTodos(userId, list)
  return todo
}

export async function updateTodo(
  userId: string,
  todoId: string,
  patch: Partial<Pick<UserTodo, 'title' | 'done'>>
): Promise<void> {
  if (patch.title !== undefined) {
    patch = { ...patch, title: patch.title.trim().slice(0, MAX_TITLE) }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const row: Record<string, unknown> = {}
      if (patch.title !== undefined) row.title = patch.title
      if (patch.done !== undefined) row.done = patch.done
      if (Object.keys(row).length === 0) return
      const { error } = await supabase.from('user_todos').update(row).eq('id', todoId).eq('user_id', userId)
      if (error) throw error
      return
    } catch (e) {
      console.error('Supabase update todo failed:', e)
    }
  }

  const list = getLocalTodos(userId).map((x) =>
    x.id === todoId
      ? {
          ...x,
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.done !== undefined ? { done: patch.done } : {}),
        }
      : x
  )
  setLocalTodos(userId, list)
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('user_todos').delete().eq('id', todoId).eq('user_id', userId)
      if (error) throw error
      return
    } catch (e) {
      console.error('Supabase delete todo failed:', e)
    }
  }
  setLocalTodos(
    userId,
    getLocalTodos(userId).filter((x) => x.id !== todoId)
  )
}
