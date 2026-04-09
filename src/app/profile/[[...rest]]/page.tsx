'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useUser, SignInButton, useClerk } from '@clerk/nextjs'
import { useMounted } from '@/hooks/useMounted'
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
import CoinLoader from '@/components/CoinLoader'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { openUserProfile } = useClerk()
  const mounted = useMounted()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Bio + todos
  const [bio, setBio] = useState('')
  const [bioDraft, setBioDraft] = useState('')
  const [bioSaving, setBioSaving] = useState(false)
  const [bioLoaded, setBioLoaded] = useState(false)
  const [todos, setTodos] = useState<UserTodo[]>([])
  const [todoInput, setTodoInput] = useState('')
  const [todosLoading, setTodosLoading] = useState(true)

  // Photo
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoErr, setPhotoErr] = useState<string | null>(null)

  // Display name
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Password
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
    }
  }, [user?.id])

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
    return () => { cancelled = true }
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
    if (!user?.id || !todoInput.trim()) return
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

  const handleSaveName = async () => {
    if (!user) return
    setNameSaving(true)
    setNameMsg(null)
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() })
      try { await user.reload() } catch { /* ignore */ }
      setNameMsg({ type: 'ok', text: 'Name updated!' })
    } catch (err: unknown) {
      setNameMsg({ type: 'err', text: err instanceof Error ? err.message : 'Could not update name.' })
    } finally {
      setNameSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return
    setPwMsg(null)
    if (!pwNew || pwNew.length < 8) {
      setPwMsg({ type: 'err', text: 'New password must be at least 8 characters.' })
      return
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ type: 'err', text: 'Passwords do not match.' })
      return
    }
    setPwSaving(true)
    try {
      await user.updatePassword({ currentPassword: pwCurrent, newPassword: pwNew })
      setPwMsg({ type: 'ok', text: 'Password changed!' })
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
    } catch (err: unknown) {
      setPwMsg({ type: 'err', text: err instanceof Error ? err.message : 'Could not change password.' })
    } finally {
      setPwSaving(false)
    }
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
      try { await user.reload() } catch { /* ignore */ }
    } catch (err: unknown) {
      setPhotoErr(err instanceof Error ? err.message : 'Could not update your photo.')
    } finally {
      setPhotoBusy(false)
      e.target.value = ''
    }
  }

  if (!mounted || !isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center py-12">
          <CoinLoader text="Loading profile…" />
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
          <button type="button" className="btn-primary px-8 py-3">Sign in</button>
        </SignInButton>
        <p className="mt-6 text-sm text-dark-text-muted">
          <Link href="/" className="text-dark-accent-blue font-bold hover:underline">Back to home</Link>
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
          Your NestWise space — photo, bio, tasks, and account settings.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Left column ── */}
        <div className="space-y-6">

          {/* Profile picture */}
          <div className="card border-2 border-dark-accent-green/25">
            <p className="text-xs font-bold uppercase tracking-wide text-dark-accent-green mb-4">Profile picture</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="absolute inset-0 rounded-full bg-dark-accent-green/20 blur-xl scale-110" aria-hidden />
                {user.imageUrl ? (
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-dark-accent-green shadow-playful ring-4 ring-dark-accent-green/20">
                    <Image src={user.imageUrl} alt="" width={112} height={112} className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="relative w-28 h-28 rounded-full bg-dark-surface border-4 border-dashed border-dark-border flex items-center justify-center text-3xl font-extrabold text-dark-text-primary ring-4 ring-dark-accent-green/15">
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-3">
                <p className="text-dark-text-secondary text-sm leading-relaxed">
                  JPG, PNG, or WebP, up to 8MB. Shows in the header and here.
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

          {/* Bio */}
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
                  placeholder="What are you learning? Any money goals you're proud of?"
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

          {/* To-dos */}
          <div className="card border-2 border-dark-accent-green/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-accent-green/15 text-dark-accent-green">
                <NestWiseIcon name="list-checks" size={22} />
              </span>
              <h2 className="text-xl font-extrabold text-dark-text-primary">To-dos</h2>
            </div>
            <p className="text-dark-text-muted text-sm mb-4">
              Your personal checklist — finish a lesson, review your portfolio, whatever.
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
                    <span className={`flex-1 text-sm pt-0.5 font-medium ${todo.done ? 'text-dark-text-muted line-through' : 'text-dark-text-primary'}`}>
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

        {/* ── Right column ── */}
        <div className="space-y-6">

          {/* Account info */}
          <div className="card border-2 border-dark-border">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-accent-blue/15 text-dark-accent-blue">
                <NestWiseIcon name="user" size={20} />
              </span>
              <h2 className="text-xl font-extrabold text-dark-text-primary">Account info</h2>
            </div>

            {/* Email — read-only */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-dark-text-muted mb-1.5">Email</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-dark-surface border-2 border-dark-border">
                <NestWiseIcon name="mail" size={16} className="text-dark-text-muted shrink-0" />
                <span className="text-sm text-dark-text-secondary truncate">
                  {user.primaryEmailAddress?.emailAddress ?? '—'}
                </span>
                {user.primaryEmailAddress && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-dark-accent-green/15 text-dark-accent-green font-semibold shrink-0">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Username — show if set */}
            {user.username && (
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-dark-text-muted mb-1.5">Username</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-dark-surface border-2 border-dark-border">
                  <NestWiseIcon name="at-sign" size={16} className="text-dark-text-muted shrink-0" />
                  <span className="text-sm text-dark-text-secondary">@{user.username}</span>
                </div>
              </div>
            )}

            {/* Display name — editable */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-dark-text-muted mb-1.5">Display name</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-dark-text-muted mb-1">First</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setNameMsg(null) }}
                    placeholder="First name"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border-2 border-dark-border text-dark-text-primary placeholder-dark-text-muted text-sm focus:border-dark-accent-green focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-dark-text-muted mb-1">Last</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setNameMsg(null) }}
                    placeholder="Last name"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border-2 border-dark-border text-dark-text-primary placeholder-dark-text-muted text-sm focus:border-dark-accent-green focus:outline-none transition-colors"
                  />
                </div>
              </div>
              {nameMsg && (
                <p className={`text-sm font-medium mb-2 ${nameMsg.type === 'ok' ? 'text-dark-accent-green' : 'text-red-400'}`}>
                  {nameMsg.type === 'ok' ? '✓ ' : ''}{nameMsg.text}
                </p>
              )}
              <button
                type="button"
                onClick={handleSaveName}
                disabled={nameSaving || (firstName === (user.firstName ?? '') && lastName === (user.lastName ?? ''))}
                className="btn-primary text-sm px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nameSaving ? 'Saving…' : 'Save name'}
              </button>
            </div>
          </div>

          {/* Change password */}
          <div className="card border-2 border-dark-border">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-accent-green/15 text-dark-accent-green">
                <NestWiseIcon name="lock" size={20} />
              </span>
              <h2 className="text-xl font-extrabold text-dark-text-primary">Change password</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-dark-text-muted mb-1.5">Current password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwCurrent}
                  onChange={(e) => { setPwCurrent(e.target.value); setPwMsg(null) }}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border-2 border-dark-border text-dark-text-primary placeholder-dark-text-muted text-sm focus:border-dark-accent-green focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-dark-text-muted mb-1.5">New password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwNew}
                  onChange={(e) => { setPwNew(e.target.value); setPwMsg(null) }}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border-2 border-dark-border text-dark-text-primary placeholder-dark-text-muted text-sm focus:border-dark-accent-green focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-dark-text-muted mb-1.5">Confirm new password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwConfirm}
                  onChange={(e) => { setPwConfirm(e.target.value); setPwMsg(null) }}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border-2 border-dark-border text-dark-text-primary placeholder-dark-text-muted text-sm focus:border-dark-accent-green focus:outline-none transition-colors"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                <input
                  type="checkbox"
                  checked={showPw}
                  onChange={() => setShowPw((v) => !v)}
                  className="rounded border-dark-border accent-dark-accent-green w-4 h-4"
                />
                <span className="text-sm text-dark-text-muted">Show passwords</span>
              </label>

              {pwMsg && (
                <p className={`text-sm font-medium ${pwMsg.type === 'ok' ? 'text-dark-accent-green' : 'text-red-400'}`}>
                  {pwMsg.type === 'ok' ? '✓ ' : ''}{pwMsg.text}
                </p>
              )}

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
                className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwSaving ? 'Changing…' : 'Change password'}
              </button>
            </div>
          </div>

          {/* Advanced */}
          <div className="card border-2 border-dark-border/50 bg-dark-surface/30">
            <p className="text-xs font-bold uppercase tracking-wide text-dark-text-muted mb-3">Advanced</p>
            <button
              type="button"
              onClick={() => openUserProfile()}
              className="btn-secondary text-sm px-5 py-2.5 flex items-center gap-2"
            >
              <NestWiseIcon name="settings" size={16} />
              Manage connected accounts &amp; 2FA
            </button>
            <p className="text-xs text-dark-text-muted mt-2 leading-relaxed">
              Opens a panel for OAuth connections, two-factor auth, and linked social accounts.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
