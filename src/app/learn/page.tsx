'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { courses, getAllLessonIds, type Course, type Lesson } from '@/lib/courses'
import { getProgressStats, markLessonComplete, getCompletedLessonIds } from '@/lib/learnProgress'
import { NestWiseIcon } from '@/components/NestWiseIcon'

function LessonCard({
  lesson,
  defaultOpen = false,
  completed = false,
  onMarkComplete,
  userId,
}: {
  lesson: Lesson
  defaultOpen?: boolean
  completed?: boolean
  onMarkComplete?: () => void
  userId?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-dark-border rounded-xl overflow-hidden bg-dark-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-dark-surface/50 transition-colors"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dark-accent-green/10 text-dark-accent-green ring-1 ring-dark-accent-green/20">
          <NestWiseIcon name={lesson.icon} size={20} />
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-dark-text-primary">{lesson.title}</h3>
          <p className="text-sm text-dark-text-secondary mt-0.5">NestWise lesson · read & mark complete</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {completed && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-dark-accent-green/20 text-dark-accent-green" title="Completed">
              <NestWiseIcon name="check" size={16} />
            </span>
          )}
          {userId && !completed && onMarkComplete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMarkComplete() }}
              className="px-3 py-1 rounded-lg bg-dark-accent-green/20 text-dark-accent-green text-sm font-medium hover:bg-dark-accent-green/30 transition-colors"
            >
              Mark complete
            </button>
          )}
          <NestWiseIcon name={open ? 'chevron-down' : 'chevron-right'} className="text-dark-text-muted" size={20} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-dark-border">
          <p className="text-dark-text-secondary leading-relaxed whitespace-pre-line pt-4">
            {lesson.content}
          </p>
        </div>
      )}
    </div>
  )
}

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
  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 text-left"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-dark-accent-green/10 text-dark-accent-green ring-1 ring-dark-accent-green/25">
          <NestWiseIcon name={course.icon} size={28} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-dark-text-primary">{course.title}</h2>
          <p className="text-dark-text-secondary mt-1">{course.description}</p>
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
              <h3 className="text-sm font-semibold text-dark-accent-green uppercase tracking-wide mb-3">
                {mod.title}
              </h3>
              <div className="space-y-3">
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

export default function Learn() {
  const { user } = useUser()
  const totalLessons = getAllLessonIds().length
  const [completedIds, setCompletedIds] = useState<string[]>([])

  useEffect(() => {
    if (user?.id) setCompletedIds(getCompletedLessonIds(user.id))
  }, [user?.id])

  const { completed, percent } = getProgressStats(user?.id ?? '', totalLessons)

  const handleMarkComplete = (lessonId: string) => {
    if (!user?.id) return
    markLessonComplete(user.id, lessonId)
    setCompletedIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-dark-text-primary mb-4">Learn</h1>
        <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
          NestWise curriculum — budgeting, credit, taxes, insurance, investing, and more. Written for clarity, not hype.
        </p>
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

      <div className="card mb-10 p-0 overflow-hidden border-dark-border">
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
            <NestWiseIcon name="arrow-right" className="ml-auto text-dark-text-muted group-hover:text-dark-accent-green shrink-0" size={18} />
          </Link>
          <Link href="/goals" className="flex items-center gap-3 p-4 sm:p-5 hover:bg-dark-card/40 transition-colors group">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dark-accent-green/10 text-dark-accent-green ring-1 ring-dark-accent-green/20" aria-hidden>
              <NestWiseIcon name="target" size={22} />
            </span>
            <div className="min-w-0 text-left">
              <p className="font-semibold text-dark-text-primary group-hover:text-dark-accent-green transition-colors">
                Savings goal
              </p>
              <p className="text-xs sm:text-sm text-dark-text-secondary">Pretend goal vs simulator gains</p>
            </div>
            <NestWiseIcon name="arrow-right" className="ml-auto text-dark-text-muted group-hover:text-dark-accent-green shrink-0" size={18} />
          </Link>
        </div>
      </div>

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

      <div className="mt-12 p-6 bg-dark-surface/50 border border-dark-border rounded-lg">
        <p className="text-sm text-dark-text-muted text-center">
          <strong className="text-dark-text-secondary">Remember:</strong> Lessons and tools are for education only
          and do not constitute tax, legal, or financial advice. Always consult a qualified professional for decisions
          about your situation.
        </p>
      </div>
    </div>
  )
}
