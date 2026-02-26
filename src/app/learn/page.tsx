'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { courses, getAllLessonIds, type Course, type Lesson, type Resource } from '@/lib/courses'
import { getProgressStats, markLessonComplete, getCompletedLessonIds } from '@/lib/learnProgress'

function ResourceLink({ resource }: { resource: Resource }) {
  const isVideo = resource.type === 'video'
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg bg-dark-surface hover:bg-dark-card border border-dark-border hover:border-dark-accent-green/50 transition-all group"
    >
      <span className="text-xl shrink-0">{isVideo ? '▶️' : '📄'}</span>
      <div className="min-w-0">
        <p className="font-medium text-dark-text-primary group-hover:text-dark-accent-green transition-colors">
          {resource.title}
        </p>
        <p className="text-sm text-dark-text-secondary">{resource.source}</p>
        {resource.description && (
          <p className="text-xs text-dark-text-muted mt-1">{resource.description}</p>
        )}
      </div>
      <span className="text-dark-text-muted text-sm shrink-0">↗</span>
    </a>
  )
}

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
  const hasResources = (lesson.articles?.length ?? 0) + (lesson.videos?.length ?? 0) > 0
  return (
    <div className="border border-dark-border rounded-xl overflow-hidden bg-dark-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-dark-surface/50 transition-colors"
      >
        <span className="text-2xl">{lesson.icon}</span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-dark-text-primary">{lesson.title}</h3>
          {hasResources && (
            <p className="text-sm text-dark-text-secondary mt-0.5">
              {lesson.articles?.length ?? 0} article{(lesson.articles?.length ?? 0) !== 1 ? 's' : ''},{' '}
              {lesson.videos?.length ?? 0} video{(lesson.videos?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {completed && <span className="text-dark-accent-green text-lg" title="Completed">✓</span>}
          {userId && !completed && onMarkComplete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMarkComplete() }}
              className="px-3 py-1 rounded-lg bg-dark-accent-green/20 text-dark-accent-green text-sm font-medium hover:bg-dark-accent-green/30 transition-colors"
            >
              Mark complete
            </button>
          )}
          <span className="text-dark-text-muted">{open ? '▼' : '▶'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-dark-border">
          <p className="text-dark-text-secondary leading-relaxed whitespace-pre-line pt-4">
            {lesson.content}
          </p>
          {hasResources && (
            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-semibold text-dark-text-primary uppercase tracking-wide">
                Worth reading & watching
              </h4>
              <div className="grid gap-2">
                {lesson.articles?.map((a) => (
                  <ResourceLink key={a.url} resource={a} />
                ))}
                {lesson.videos?.map((v) => (
                  <ResourceLink key={v.url} resource={v} />
                ))}
              </div>
            </div>
          )}
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
        <span className="text-4xl">{course.icon}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-dark-text-primary">{course.title}</h2>
          <p className="text-dark-text-secondary mt-1">{course.description}</p>
        </div>
        <span className="text-dark-text-muted shrink-0">{expanded ? '▼' : '▶'}</span>
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
        <h1 className="text-4xl font-bold text-dark-text-primary mb-4">Learn Investing</h1>
        <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
          Structured courses with articles and videos for beginners. Take your time and explore.
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
          Have Questions? Ask AI
        </Link>
      </div>

      <div className="mt-12 p-6 bg-dark-surface/50 border border-dark-border rounded-lg">
        <p className="text-sm text-dark-text-muted text-center">
          <strong className="text-dark-text-secondary">Remember:</strong> This content is for
          educational purposes only and does not constitute financial advice. External links go to
          Investopedia, SEC, Khan Academy, and other trusted sources. Always consult a qualified
          financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  )
}
