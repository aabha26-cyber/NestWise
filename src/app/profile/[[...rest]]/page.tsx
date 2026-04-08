'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'
import { NestWiseIcon } from '@/components/NestWiseIcon'
import {
  getProfileBio,
  setProfileBio,
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  type UserTodo,
} from '@/lib/userProfile'
import { isSupabaseConfigured } from '@/lib/supabase'

const UserProfile = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserProfile),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border-2 border-dark-border bg-dark-surface p-8 animate-pulse min-h-[280px] flex items-center justify-center">
        <p className="text-dark-text-muted text-sm font-semibold">Loading account settings…</p>
      </div>
    ),
  }
)

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [bio, setBio] = useState('')
  const [bioDraft, setBioDraft] = useState('')
  const [bioSaving, setBioSaving] = useState(false)
  const [bioLoaded, setBioLoaded] = useState(false)
  const [todos, setTodos] = useState<UserTodo[]>([])
  const [todoInput, setTodoInput] = useState('')
  const [todosLoading, setTodosLoading] = useState(true)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoErr, setPhotoErr] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !user?.id) {
      setTodosLoading(false)
      setBioLoaded(true)
      return
    }
    let cancelled = false
    ;(async () => {
      setTodosLoading(true)
      setBioLoaded(false)
      try {
        const [b, list] = await Promise.all([getProfileBio(user.id), getTodos(user.id)])
        if (cancelled) return
        setBio(b)
        setBioDraft(b)
        setTodos(list)
      } finally {
        if (!cancelled) {
          setTodosLoading(false)
          setBioLoaded(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isLoaded, user?.id])

  const handleSaveBio = async () => {
    if (!user?.id) return
    setBioSaving(true)
    try {
      await setProfileBio(user.id, bioDraft)
      setBio(bioDraft)
    } finally {
      setBioSaving(false)
    }
  }

  const handleAddTodo = async () => {
    if (!user?.id) return
    const t = await addTodo(user.id, todoInput)
    if (t) {
      setTodos((prev) => [...prev, t])
      setTodoInput('')
    }
  }

  const handleToggle = async (id: string, done: boolean) => {
    if (!user?.id) return
    await updateTodo(user.id, id, { done: !done })
    setTodos((prev) => prev.map((x) => (x.id === id ? { ...x, done: !done } : x)))
  }

  const handleDelete = async (id: string) => {
    if (!user?.id) return
    await deleteTodo(user.id, id)
    setTodos((prev) => prev.filter((x) => x.id !== id))
  }

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setPhotoErr(null)
    if (!file.type.startsWith('image/')) {
      setPhotoErr('Pick an image file (PNG, JPG, or WebP).')
      e.target.value = ''
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoErr('Use an image under 8MB.')
      e.target.value = ''
      return
    }
    setPhotoBusy(true)
    try {
      await user.setProfileImage({ file })
      try {
        await user.reload()
      } catch {
        /* Image often updates without reload; ignore reload failures */
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update your photo.'
      setPhotoErr(msg)
    } finally {
      setPhotoBusy(false)
      e.target.value = ''
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center py-12">
          <div className="w-10 h-10 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-text-secondary font-semibold">Loading profile…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-dark-text-primary mb-2">Your profile</h1>
        <p className="text-dark-text-secondary mb-6 text-lg">Sign in to set your bio, to-dos, and profile photo.</p>
        <SignInButton mode="modal">
          <button type="button" className="btn-primary px-8 py-3">
            Sign in
          </button>
        </SignInButton>
        <p className="mt-6 text-sm text-dark-text-muted">
          <Link href="/" className="text-dark-accent-blue font-bold hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    )
  }

  const initials =
    user.firstName?.[0] || user.lastName?.[0] || user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || '?'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="text-sm text-dark-accent-blue font-bold hover:underline inline-flex items-center gap-1 mb-4"
        >
          <NestWiseIcon name="chevron-right" size={14} className="rotate-180" />
          Dashboard
        </Link>
        <h1 className="text-4xl font-extrabold text-dark-text-primary tracking-tight">Profile</h1>
        <p className="text-dark-text-secondary mt-2 text-lg max-w-xl">
          Your NestWise space — photo, bio, tasks, and account settings in one place.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card border-2 border-dark-accent-blue/25 bg-gradient-to-br from-dark-card to-dark-surface/80">
            <p className="text-xs font-bold uppercase tracking-wide text-dark-accent-blue mb-4">Profile picture</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="absolute inset-0 rounded-full bg-dark-accent-green/20 blur-xl scale-110" aria-hidden />
                {user.imageUrl ? (
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-dark-accent-green shadow-playful ring-4 ring-dark-accent-blue/20">
                    <Image
                      src={user.imageUrl}
                      alt=""
                      width={112}
                      height={112}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="relative w-28 h-28 rounded-full bg-dark-surface border-4 border-dashed border-dark-border flex items-center justify-center text-3xl font-extrabold text-dark-text-primary ring-4 ring-dark-accent-blue/15">
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-3">
                <p className="text-dark-text-secondary text-sm leading-relaxed">
                  Choose a clear face or avatar — it shows in the header and here. JPG, PNG, or WebP, up to 8MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handlePhotoSelected}
                />
                <button
                  type="button"
                  disabled={photoBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-sm px-5 py-2.5 disabled:opacity-60"
                >
                  {photoBusy ? 'Uploading…' : user.imageUrl ? 'Change photo' : 'Upload photo'}
                </button>
                {photoErr && <p className="text-sm text-red-400 font-medium">{photoErr}</p>}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-extrabold text-dark-text-primary mb-1">About you</h2>
            <p className="text-dark-text-muted text-sm mb-4">
              Short bio. {isSupabaseConfigured ? 'Synced to your account.' : 'Saved on this device.'}
            </p>
            {!bioLoaded ? (
              <div className="h-28 bg-dark-surface rounded-xl animate-pulse border-2 border-dark-border/50" />
            ) : (
              <>
                <textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value.slice(0, 2000))}
                  placeholder="What are you learning? Any money goals you’re proud of?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-dark-surface border-2 border-dark-border text-dark-text-primary placeholder-dark-text-muted text-sm resize-y min-h-[110px] focus:border-dark-accent-green focus:outline-none transition-colors"
                />
                <div className="flex items-center justify-between mt-3 gap-3">
                  <span className="text-xs font-semibold text-dark-text-muted">{bioDraft.length}/2000</span>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    disabled={bioSaving || bioDraft === bio}
                    className="btn-primary text-sm px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bioSaving ? 'Saving…' : 'Save bio'}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="card border-2 border-dark-accent-green/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-accent-green/15 text-dark-accent-green">
                <NestWiseIcon name="list-checks" size={22} />
              </span>
              <h2 className="text-xl font-extrabold text-dark-text-primary">To-dos</h2>
            </div>
            <p className="text-dark-text-muted text-sm mb-4">
              Your personal checklist — finish a lesson, review your portfolio, whatever helps you stay on track.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={todoInput}
                onChange={(e) => setTodoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTodo())}
                placeholder="Add a task…"
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-surface border-2 border-dark-border text-dark-text-primary placeholder-dark-text-muted text-sm focus:border-dark-accent-green focus:outline-none"
              />
              <button type="button" onClick={handleAddTodo} className="btn-primary px-4 py-2.5 shrink-0 rounded-xl">
                <NestWiseIcon name="plus" size={20} />
              </button>
            </div>
            {todosLoading ? (
              <p className="text-dark-text-muted text-sm font-medium">Loading tasks…</p>
            ) : todos.length === 0 ? (
              <p className="text-dark-text-muted text-sm">No tasks yet — add one above.</p>
            ) : (
              <ul className="space-y-2">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-dark-surface border-2 border-dark-border/80 hover:border-dark-accent-green/30 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(todo.id, todo.done)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-colors ${
                        todo.done
                          ? 'bg-dark-accent-green border-dark-accent-green text-white'
                          : 'border-dark-border hover:border-dark-accent-green/60'
                      }`}
                      aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {todo.done && <NestWiseIcon name="check" size={14} className="text-white" />}
                    </button>
                    <span
                      className={`flex-1 text-sm pt-0.5 font-medium ${
                        todo.done ? 'text-dark-text-muted line-through' : 'text-dark-text-primary'
                      }`}
                    >
                      {todo.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(todo.id)}
                      className="opacity-70 hover:opacity-100 text-dark-text-muted hover:text-red-400 p-1.5 rounded-lg transition-opacity"
                      aria-label="Delete task"
                    >
                      <NestWiseIcon name="x" size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-0 overflow-hidden border-2 border-dark-border">
            <div className="px-5 pt-6 pb-3 border-b border-dark-border bg-dark-surface/40">
              <h2 className="text-xl font-extrabold text-dark-text-primary">Account &amp; security</h2>
              <p className="text-dark-text-secondary text-sm mt-1 leading-relaxed">
                Name, email, password, and connected accounts. Use the built-in Clerk panel below — it’s the same data
                as “Change photo” above, just with more options.
              </p>
            </div>
            <div className="p-3 sm:p-5 w-full min-w-0 overflow-x-auto bg-dark-bg/50">
              <div className="w-full min-w-[min(100%,320px)] max-w-[440px] mx-auto [&_.cl-rootBox]:!w-full">
                <UserProfile path="/profile" routing="path" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
