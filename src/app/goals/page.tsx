'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { getMultipleStocks } from '@/lib/stockApi'
import { getSimulatorState } from '@/lib/simulatorStorage'
import {
  getGoal,
  setGoal,
  clearGoal,
  goalProgressFromGains,
  projectDaysToGoal,
  type InvestingGoal,
} from '@/lib/investingGoalStorage'

const PRESETS = [
  { label: 'New video game', amount: 80 },
  { label: 'Bike helmet', amount: 60 },
  { label: 'Science kit', amount: 45 },
  { label: 'Savings for college fun', amount: 500 },
]

export default function GoalsPage() {
  const { user, isLoaded } = useUser()
  const [goal, setGoalState] = useState<InvestingGoal | null>(null)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('100')
  const [gains, setGains] = useState(0)
  const [avgDaily, setAvgDaily] = useState(0)
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    getGoal(user.id).then((g) => setGoalState(g))
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const state = getSimulatorState(user.id)
    if (!state) {
      setGains(0)
      setTotalValue(0)
      setAvgDaily(0)
      return
    }
    const symbols = state.holdings.map((h) => h.symbol)
    ;(async () => {
      const stocks = symbols.length ? await getMultipleStocks(symbols) : []
      const map = new Map(stocks.map((s) => [s.symbol, s]))
      let tv = state.cashBalance
      for (const h of state.holdings) {
        tv += (map.get(h.symbol)?.price ?? 0) * h.shares
      }
      const initial = state.initialCash
      const g = Math.max(0, tv - initial)
      setTotalValue(tv)
      setGains(g)

      const hist = state.valueHistory ?? []
      if (hist.length >= 2) {
        const first = hist[0].totalValue
        const last = hist[hist.length - 1].totalValue
        const days = Math.max(1, hist.length - 1)
        setAvgDaily(Math.max(0, (last - first) / days))
      } else {
        setAvgDaily(0)
      }
    })()
  }, [user?.id])

  const progress = useMemo(() => {
    if (!goal) return 0
    return goalProgressFromGains(gains, goal.targetAmount)
  }, [goal, gains])

  const remaining = goal ? Math.max(0, goal.targetAmount - gains) : 0
  const etaDays = goal ? projectDaysToGoal(remaining, avgDaily) : null

  const milestones = useMemo(() => {
    if (!goal) return []
    const t = goal.targetAmount
    return [0.25, 0.5, 0.75, 1].map((p) => ({
      pct: p * 100,
      label: p === 1 ? 'Goal!' : `${Math.round(p * 100)}%`,
      value: t * p,
    }))
  }, [goal])

  if (!isLoaded) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-dark-text-secondary">Loading…</div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card text-center py-12">
          <p className="text-dark-text-secondary mb-4">Sign in to set a goal tied to your simulator.</p>
          <Link href="/auth/signin" className="btn-primary inline-block">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  const saveGoal = async () => {
    const n = parseFloat(amount)
    if (!label.trim() || !Number.isFinite(n) || n <= 0) return
    const g: InvestingGoal = {
      id: `goal-${Date.now()}`,
      label: label.trim(),
      targetAmount: n,
      createdAt: new Date().toISOString(),
    }
    await setGoal(user.id, g)
    setGoalState(g)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-dark-text-primary mb-2">My investing goal</h1>
      <p className="text-dark-text-secondary mb-8">
        Pick something fun. Your <strong className="text-dark-text-primary">virtual gains</strong> in the simulator fill the
        bar — not real money, just practice.
      </p>

      {!goal && (
        <div className="card mb-8 space-y-4">
          <h2 className="font-semibold text-dark-text-primary">Set your goal</h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setLabel(p.label)
                  setAmount(String(p.amount))
                }}
                className="px-3 py-1.5 rounded-lg border border-dark-border text-sm text-dark-text-secondary hover:border-dark-accent-green/50 hover:text-dark-text-primary transition-colors"
              >
                {p.label} (~${p.amount})
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm text-dark-text-muted mb-1">What are you saving for?</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary"
              placeholder="e.g. New headset"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-text-muted mb-1">Target ($) — pretend dollars</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full max-w-xs bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary"
            />
          </div>
          <button type="button" onClick={saveGoal} className="btn-primary">
            Start tracking
          </button>
        </div>
      )}

      {goal && (
        <>
          <div className="card mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-dark-text-muted">Goal</p>
                <h2 className="text-2xl font-bold text-dark-text-primary">{goal.label}</h2>
                <p className="text-dark-text-secondary mt-1">
                  Target: <span className="text-dark-accent-green font-semibold">${goal.targetAmount.toLocaleString()}</span>{' '}
                  · Virtual gains so far: <span className="font-semibold">${gains.toFixed(2)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await clearGoal(user.id)
                  setGoalState(null)
                  setLabel('')
                  setAmount('100')
                }}
                className="text-sm text-dark-text-muted hover:text-red-400 transition-colors"
              >
                Reset goal
              </button>
            </div>

            <div className="mb-2 flex justify-between text-sm text-dark-text-muted">
              <span>Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-4 rounded-full bg-dark-surface border border-dark-border overflow-hidden mb-8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="relative pt-8 pb-2">
              <div className="absolute left-0 right-0 top-6 h-1 bg-dark-border rounded" />
              <div className="flex justify-between relative">
                {milestones.map((m) => (
                  <div key={m.pct} className="flex flex-col items-center w-1/4">
                    <div
                      className={`w-3 h-3 rounded-full border-2 z-10 ${
                        progress >= m.pct - 0.01
                          ? 'bg-dark-accent-green border-dark-accent-green'
                          : 'bg-dark-bg border-dark-border'
                      }`}
                    />
                    <span className="text-xs text-dark-text-muted mt-2 text-center">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-dark-surface/80 border border-dark-border">
              <p className="text-sm font-medium text-dark-text-primary mb-1">Projection (rough, for learning)</p>
              <p className="text-dark-text-secondary text-sm">
                {etaDays === null && remaining > 0 && (
                  <>Keep trading in the simulator — we need a few value snapshots to estimate a daily pace.</>
                )}
                {etaDays === 0 && remaining <= 0 && <>You’ve reached your virtual target — set a new goal or keep learning.</>}
                {etaDays !== null && etaDays > 0 && remaining > 0 && (
                  <>
                    If your <span className="text-dark-text-primary">average virtual change</span> stayed around $
                    {avgDaily.toFixed(2)}/day, you might hit your goal in roughly <strong>{etaDays}</strong> day
                    {etaDays === 1 ? '' : 's'}. Real markets don’t move in straight lines — this is just math practice.
                  </>
                )}
              </p>
              <p className="text-xs text-dark-text-muted mt-3">
                Portfolio value (simulator): ${totalValue.toFixed(2)}
              </p>
            </div>
          </div>

          <Link href="/portfolio" className="btn-primary inline-block">
            Open simulator
          </Link>
        </>
      )}
    </div>
  )
}
