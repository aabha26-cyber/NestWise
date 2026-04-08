'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import {
  courses,
  getAllLessonIds,
  getTotalReadTime,
  type Course,
  type Lesson,
  type LessonSection,
} from '@/lib/courses'
import { getProgressStats, markLessonComplete, getCompletedLessonIds } from '@/lib/learnProgress'
import { NestWiseIcon } from '@/components/NestWiseIcon'

// ─── Section block renderer ───────────────────────────────────────────────────

function SectionBlock({ section }: { section: LessonSection }) {
  const { type, heading, body } = section

  if (type === 'hook') {
    return (
      <blockquote className="border-l-4 border-amber-400/60 bg-amber-400/[0.07] pl-4 pr-3 py-3 rounded-r-xl my-5 italic text-dark-text-secondary leading-relaxed text-[0.95rem]">
        {body}
      </blockquote>
    )
  }

  if (type === 'concept') {
    return (
      <p className="text-dark-text-secondary leading-relaxed my-4 text-sm sm:text-[0.95rem]">
        {body}
      </p>
    )
  }

  if (type === 'example') {
    return (
      <div className="bg-cyan-400/[0.07] border border-cyan-400/25 rounded-xl p-4 my-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-400">
            <NestWiseIcon name="circle-dollar-sign" size={14} />
          </span>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            {heading ?? 'Real example'}
          </span>
        </div>
        <p className="text-dark-text-secondary text-sm leading-relaxed">{body}</p>
      </div>
    )
  }

  if (type === 'tip') {
    return (
      <div className="bg-dark-accent-green/[0.08] border border-dark-accent-green/25 rounded-xl p-4 my-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-dark-accent-green/20 text-dark-accent-green">
            <NestWiseIcon name="sparkles" size={14} />
          </span>
          <span className="text-xs font-semibold text-dark-accent-green uppercase tracking-wider">
            {heading ?? 'The move'}
          </span>
        </div>
        <p className="text-dark-text-secondary text-sm leading-relaxed">{body}</p>
      </div>
    )
  }

  if (type === 'warning') {
    return (
      <div className="bg-orange-400/[0.08] border border-orange-400/25 rounded-xl p-4 my-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-400/20 text-orange-400">
            <NestWiseIcon name="alert-triangle" size={14} />
          </span>
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
            {heading ?? 'Watch out'}
          </span>
        </div>
        <p className="text-dark-text-secondary text-sm leading-relaxed">{body}</p>
      </div>
    )
  }

  if (type === 'action') {
    return (
      <div className="bg-violet-400/[0.08] border border-violet-400/25 rounded-xl p-4 my-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-400/20 text-violet-400">
            <NestWiseIcon name="target" size={14} />
          </span>
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
            {heading ?? 'Try this'}
          </span>
        </div>
        <p className="text-dark-text-secondary text-sm leading-relaxed">{body}</p>
      </div>
    )
  }

  if (type === 'takeaways') {
    const bullets = body
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('•'))
      .map((l) => l.replace(/^•\s*/, ''))
    return (
      <div className="bg-dark-surface/70 border border-dark-border/70 rounded-xl p-4 my-5">
        <p className="text-[10px] font-bold text-dark-text-primary uppercase tracking-widest mb-3">
          Key takeaways
        </p>
        <ul className="space-y-2.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dark-accent-green/20 text-dark-accent-green mt-0.5">
                <NestWiseIcon name="check" size={11} />
              </span>
              <span className="text-sm text-dark-text-secondary leading-snug">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return null
}

// ─── Quick check component ────────────────────────────────────────────────────

function QuickCheck({
  check,
  revealed,
  onReveal,
}: {
  check: { question: string; reveal: string }
  revealed: boolean
  onReveal: () => void
}) {
  return (
    <div className="mt-6 border border-dashed border-dark-accent-green/40 rounded-xl p-4 bg-dark-surface/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-dark-accent-green/15 text-dark-accent-green">
          <NestWiseIcon name="list-checks" size={14} />
        </span>
        <span className="text-xs font-semibold text-dark-accent-green uppercase tracking-wider">
          Quick check
        </span>
      </div>
      <p className="text-dark-text-primary font-medium text-sm leading-snug mb-4">
        {check.question}
      </p>
      {!revealed ? (
        <button
          type="button"
          onClick={onReveal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-accent-green/15 text-dark-accent-green text-sm font-medium hover:bg-dark-accent-green/25 transition-colors border border-dark-accent-green/30"
        >
          <NestWiseIcon name="eye" size={15} />
          Reveal answer
        </button>
      ) : (
        <div className="bg-dark-card/80 rounded-xl p-3.5 border border-dark-accent-green/20 animate-fade-in">
          <div className="flex items-center gap-1.5 mb-2">
            <NestWiseIcon name="check" size={14} className="text-dark-accent-green" />
            <span className="text-xs font-semibold text-dark-accent-green">Answer</span>
          </div>
          <p className="text-dark-text-secondary text-sm leading-relaxed">{check.reveal}</p>
        </div>
      )}
    </div>
  )
}

// ─── Lesson card ──────────────────────────────────────────────────────────────

function LessonCard({
  lesson,
  completed = false,
  onMarkComplete,
  userId,
}: {
  lesson: Lesson
  completed?: boolean
  onMarkComplete?: () => void
  userId?: string
}) {
  const [open, setOpen] = useState(false)
  const [checkRevealed, setCheckRevealed] = useState(false)

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors ${
        open
          ? 'border-dark-accent-green/40 bg-dark-card'
          : 'border-dark-border bg-dark-card/50 hover:border-dark-border/80'
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dark-accent-green/10 text-dark-accent-green ring-1 ring-dark-accent-green/20">
          <NestWiseIcon name={lesson.icon} size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-dark-text-primary leading-tight">{lesson.title}</h3>
          <p className="text-xs text-dark-text-muted mt-0.5">
            {lesson.readTime} min read
            {lesson.check && <span className="ml-1.5 text-dark-accent-green/70">· quick check included</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {completed && (
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-dark-accent-green/20 text-dark-accent-green"
              title="Completed"
            >
              <NestWiseIcon name="check" size={13} />
            </span>
          )}
          {userId && !completed && onMarkComplete && !open && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMarkComplete()
              }}
              className="hidden sm:block px-3 py-1 rounded-lg bg-dark-surface text-dark-text-muted text-xs font-medium hover:bg-dark-accent-green/20 hover:text-dark-accent-green transition-colors border border-dark-border"
            >
              Mark done
            </button>
          )}
          <NestWiseIcon
            name={open ? 'chevron-down' : 'chevron-right'}
            className="text-dark-text-muted"
            size={18}
          />
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-5 pt-1 border-t border-dark-border/60">
          <div className="mt-2">
            {lesson.sections.map((section, i) => (
              <SectionBlock key={i} section={section} />
            ))}
          </div>

          {lesson.check && (
            <QuickCheck
              check={lesson.check}
              revealed={checkRevealed}
              onReveal={() => setCheckRevealed(true)}
            />
          )}

          {/* Mark complete */}
          {userId && !completed && onMarkComplete && (
            <button
              type="button"
              onClick={onMarkComplete}
              className="mt-5 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-dark-accent-green/20 text-dark-accent-green text-sm font-semibold hover:bg-dark-accent-green/30 transition-colors border border-dark-accent-green/30"
            >
              ✓ Mark lesson complete
            </button>
          )}
          {completed && (
            <p className="mt-5 text-xs text-dark-accent-green/70 font-medium">
              ✓ You completed this lesson
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Course section ───────────────────────────────────────────────────────────

function CourseSection({
  course,
  completedLessonIds,
  onMarkComplete,
  userId,
}: {
  course: Course
  completedLessonIds: string[]
  onMarkComplete: (lessonId: string) => void
  userId?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const doneCount = allLessons.filter((l) => completedLessonIds.includes(l.id)).length
  const totalMins = getTotalReadTime(course)
  const pct = allLessons.length > 0 ? Math.round((doneCount / allLessons.length) * 100) : 0

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 text-left"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-dark-accent-green/10 text-dark-accent-green ring-1 ring-dark-accent-green/25">
          <NestWiseIcon name={course.icon} size={28} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-dark-text-primary">{course.title}</h2>
          <p className="text-dark-text-secondary text-sm mt-0.5">{course.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-dark-text-muted">
              {allLessons.length} lesson{allLessons.length !== 1 ? 's' : ''} · {totalMins} min
            </span>
            {doneCount > 0 && (
              <span className="text-xs text-dark-accent-green font-medium">
                {doneCount}/{allLessons.length} done
              </span>
            )}
          </div>
          {pct > 0 && (
            <div className="mt-2 h-1 w-full max-w-xs rounded-full bg-dark-surface overflow-hidden">
              <div
                className="h-full bg-dark-accent-green/70 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
        <NestWiseIcon
          name={expanded ? 'chevron-down' : 'chevron-right'}
          className="text-dark-text-muted shrink-0 mt-1"
          size={22}
        />
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {course.modules.map((mod) => (
            <div key={mod.title}>
              <h3 className="text-xs font-bold text-dark-accent-green uppercase tracking-widest mb-3">
                {mod.title}
              </h3>
              <div className="space-y-2.5">
                {mod.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    completed={completedLessonIds.includes(lesson.id)}
                    onMarkComplete={() => onMarkComplete(lesson.id)}
                    userId={userId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Learn() {
  const { user } = useUser()
  const totalLessons = getAllLessonIds().length
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [progressStats, setProgressStats] = useState({ completed: 0, percent: 0 })

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      const ids = await getCompletedLessonIds(user.id)
      setCompletedIds(ids)
      const stats = await getProgressStats(user.id, totalLessons)
      setProgressStats(stats)
    })()
  }, [user?.id, totalLessons])

  const { completed, percent } = progressStats

  const handleMarkComplete = async (lessonId: string) => {
    if (!user?.id) return
    await markLessonComplete(user.id, lessonId)
    setCompletedIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]))
    const stats = await getProgressStats(user.id, totalLessons)
    setProgressStats(stats)
  }

  const totalMinutes = courses.reduce((s, c) => s + getTotalReadTime(c), 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-dark-text-primary mb-3">Learn</h1>
        <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
          NestWise curriculum — {totalLessons} lessons across 9 courses, {totalMinutes} min total. Budgeting, credit, taxes, insurance, investing — written for real life.
        </p>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs">
          {[
            { color: 'bg-amber-400/60', label: 'Real scenario' },
            { color: 'bg-cyan-400/60', label: 'Example with $' },
            { color: 'bg-dark-accent-green/60', label: 'The move' },
            { color: 'bg-orange-400/60', label: 'Watch out' },
            { color: 'bg-violet-400/60', label: 'Try this' },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-dark-text-muted">
              <span className={`inline-block w-2 h-2 rounded-full ${item.color}`} />
              {item.label}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        {user && totalLessons > 0 && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-dark-text-secondary mb-2">
              <span>Your progress</span>
              <span>{completed} / {totalLessons} lessons ({percent}%)</span>
            </div>
            <div className="h-2 rounded-full bg-dark-surface overflow-hidden">
              <div
                className="h-full bg-dark-accent-green transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="card mb-8 p-0 overflow-hidden border-dark-border">
        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-dark-border">
          <Link
            href="/learn/quiz"
            className="flex items-center gap-3 p-4 sm:p-5 hover:bg-dark-card/40 transition-colors group"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dark-accent-green/10 text-dark-accent-green ring-1 ring-dark-accent-green/20" aria-hidden>
              <NestWiseIcon name="list-checks" size={22} />
            </span>
            <div className="min-w-0 text-left">
              <p className="font-semibold text-dark-text-primary group-hover:text-dark-accent-green transition-colors">
                Daily quiz
              </p>
              <p className="text-xs sm:text-sm text-dark-text-secondary">5 questions · streaks · teach-back</p>
            </div>
            <NestWiseIcon
              name="arrow-right"
              className="ml-auto text-dark-text-muted group-hover:text-dark-accent-green shrink-0"
              size={18}
            />
          </Link>
          <Link
            href="/goals"
            className="flex items-center gap-3 p-4 sm:p-5 hover:bg-dark-card/40 transition-colors group"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dark-accent-green/10 text-dark-accent-green ring-1 ring-dark-accent-green/20" aria-hidden>
              <NestWiseIcon name="target" size={22} />
            </span>
            <div className="min-w-0 text-left">
              <p className="font-semibold text-dark-text-primary group-hover:text-dark-accent-green transition-colors">
                Savings goal
              </p>
              <p className="text-xs sm:text-sm text-dark-text-secondary">Set a goal · see a path</p>
            </div>
            <NestWiseIcon
              name="arrow-right"
              className="ml-auto text-dark-text-muted group-hover:text-dark-accent-green shrink-0"
              size={18}
            />
          </Link>
        </div>
      </div>

      {/* Course list */}
      <div className="space-y-4">
        {courses.map((course) => (
          <CourseSection
            key={course.id}
            course={course}
            completedLessonIds={completedIds}
            onMarkComplete={handleMarkComplete}
            userId={user?.id}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/chat" className="btn-primary inline-block">
          Have questions? Ask AI
        </Link>
      </div>

      <div className="mt-10 p-5 bg-dark-surface/40 border border-dark-border rounded-xl">
        <p className="text-xs text-dark-text-muted text-center leading-relaxed">
          <strong className="text-dark-text-secondary">Heads up:</strong> These lessons are for education only —
          not tax, legal, or financial advice. Every situation is different. Consult a qualified professional
          before making real financial decisions.
        </p>
      </div>
    </div>
  )
}
