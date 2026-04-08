'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { useUser } from '@clerk/nextjs'
import {
  getTodaysQuiz,
  recordQuizFinished,
  getQuizStreak,
  type QuizQuestion,
} from '@/lib/dailyQuiz'
import { NestWiseIcon } from '@/components/NestWiseIcon'

export default function DailyQuizPage() {
  const { user } = useUser()
  const questions = useMemo(() => getTodaysQuiz(), [])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [streak, setStreak] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const scoreRef = useRef(0)

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    getQuizStreak(user?.id).then((s) => setStreak(s.streak))
  }, [finished, user?.id])

  const q: QuizQuestion | undefined = questions[index]

  const fireConfetti = useCallback(() => {
    const count = 200
    const defaults = { origin: { y: 0.65 }, zIndex: 100 }
    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }
    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#34d399', '#6ee7b7', '#a7f3d0'] })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }, [])

  const goNext = async () => {
    if (index + 1 >= questions.length) {
      const total = scoreRef.current
      setFinalScore(total)
      const { streak: s } = await recordQuizFinished(user?.id)
      setStreak(s)
      setFinished(true)
      if (total === questions.length) {
        setTimeout(() => fireConfetti(), 100)
      }
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const pick = (optionIndex: number) => {
    if (answered || !q) return
    setSelected(optionIndex)
    setAnswered(true)
    const correct = optionIndex === q.correctIndex
    if (correct) {
      setScore((s) => {
        const n = s + 1
        scoreRef.current = n
        return n
      })
    }
  }

  if (finished) {
    const final = finalScore
    const perfect = final === questions.length
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center">
        <div className="card">
          <div className="flex justify-center mb-4">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-accent-green/15 text-dark-accent-green ring-1 ring-dark-accent-green/30">
              <NestWiseIcon name={perfect ? 'party-popper' : 'sparkles'} size={36} className="text-dark-accent-green" />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-dark-text-primary mb-2">Nice work!</h1>
          <p className="text-dark-text-secondary mb-4">
            You got <span className="text-dark-accent-green font-semibold">{final}</span> out of{' '}
            {questions.length} today.
          </p>
          <p className="text-lg font-semibold text-amber-400 mb-6 inline-flex items-center justify-center gap-2 w-full">
            <NestWiseIcon name="flame" size={22} className="text-amber-400 shrink-0" />
            Streak: {streak} day{streak === 1 ? '' : 's'}
          </p>
          {perfect && (
            <p className="text-sm text-dark-text-muted mb-6">
              Perfect score — that’s the confetti talking. Keep learning a little every day.
            </p>
          )}
          <Link href="/learn" className="btn-primary inline-block">
            Back to Learn
          </Link>
        </div>
      </div>
    )
  }

  if (!q) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <p className="text-dark-text-secondary">No questions loaded.</p>
      </div>
    )
  }

  const letters = ['A', 'B', 'C', 'D'] as const
  const progress = ((index + (answered ? 0.5 : 0)) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link href="/learn" className="text-dark-text-secondary hover:text-dark-text-primary text-sm">
          ← Learn
        </Link>
        <div className="text-xs sm:text-sm text-dark-text-muted tabular-nums">
          Q{index + 1}/{questions.length} · {score} right
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-dark-surface border border-dark-border mb-6 overflow-hidden">
        <div
          className="h-full bg-dark-accent-green/90 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      <div className="card mb-6 shadow-lg shadow-black/10">
        <p className="text-xs font-medium text-dark-accent-green uppercase tracking-wide mb-3">Daily quiz</p>
        <h1 className="text-lg sm:text-xl font-bold text-dark-text-primary mb-6 leading-snug">{q.question}</h1>
        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const isSel = selected === i
            const isCor = i === q.correctIndex
            let cls =
              'w-full flex items-start gap-3 text-left px-3 sm:px-4 py-3 rounded-xl border text-sm transition-all '
            if (!answered) {
              cls += 'border-dark-border bg-dark-surface hover:border-dark-accent-green/50 text-dark-text-primary active:scale-[0.99]'
            } else {
              if (isCor) cls += 'border-dark-accent-green bg-dark-accent-green/15 text-dark-text-primary'
              else if (isSel && !isCor) cls += 'border-red-500/50 bg-red-500/10 text-dark-text-secondary'
              else cls += 'border-dark-border/60 bg-dark-surface/50 text-dark-text-muted'
            }
            return (
              <button key={i} type="button" onClick={() => pick(i)} disabled={answered} className={cls}>
                <span
                  className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    answered && isCor
                      ? 'bg-dark-accent-green text-dark-bg'
                      : answered && isSel && !isCor
                        ? 'bg-red-500/30 text-red-200'
                        : 'bg-dark-card border border-dark-border text-dark-text-secondary'
                  }`}
                >
                  {letters[i]}
                </span>
                <span className="leading-snug pt-0.5">{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      {answered && (
        <div className="card border-dark-accent-green/30 bg-dark-accent-green/5 mb-6">
          <h2 className="font-semibold text-dark-text-primary mb-2">Learn</h2>
          <p className="text-dark-text-secondary text-sm leading-relaxed">{q.teach}</p>
          <button type="button" onClick={goNext} className="btn-primary mt-4 w-full sm:w-auto">
            {index + 1 >= questions.length ? 'See results' : 'Next question'}
          </button>
        </div>
      )}

      <p className="text-xs text-dark-text-muted text-center">
        Educational only — not financial advice. Ask a trusted adult about real money.
      </p>
    </div>
  )
}
