'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { getMultipleStocks, type StockData } from '@/lib/stockApi'
import { getSimulatorState } from '@/lib/simulatorStorage'
import { getSectorBreakdown, getPortfolioRiskScore } from '@/lib/sectors'
import { computeLetterGrade, coachMessage } from '@/lib/reportCardGrade'
import { Pie } from 'react-chartjs-2'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

type Row = { symbol: string; value: number; gain: number; pct: number }

export default function ReportCardPage() {
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [rows, setRows] = useState<Row[]>([])
  const [best, setBest] = useState<Row | null>(null)
  const [worst, setWorst] = useState<Row | null>(null)
  const [pieData, setPieData] = useState<{ labels: string[]; data: number[] } | null>(null)
  const [coach, setCoach] = useState('')
  const [grade, setGrade] = useState({ letter: '—', summary: '' })
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user?.id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const local = getSimulatorState(user.id)
      if (local) {
        const symbols = local.holdings.map((h) => h.symbol)
        const stocks = symbols.length ? await getMultipleStocks(symbols) : []
        const map = new Map(stocks.map((s: StockData) => [s.symbol, s]))
        let tv = local.cashBalance
        const perf: Row[] = []
        for (const h of local.holdings) {
          const price = map.get(h.symbol)?.price ?? 0
          const v = price * h.shares
          const c = h.average_cost * h.shares
          const gain = v - c
          const pct = c > 0 ? (gain / c) * 100 : 0
          tv += v
          perf.push({ symbol: h.symbol, value: v, gain, pct })
        }
        const holdingsValue = tv - local.cashBalance
        const sorted = [...perf].sort((a, b) => b.gain - a.gain)
        const breakdown = getSectorBreakdown(perf.map((p) => ({ symbol: p.symbol, value: p.value })))
        const risk = getPortfolioRiskScore(
          perf.map((p) => ({ value: p.value })),
          holdingsValue > 0 ? holdingsValue : 1
        )
        const initial = local.initialCash
        const retPct = initial > 0 ? ((tv - initial) / initial) * 100 : 0
        const topPct =
          perf.length && tv > 0 ? (Math.max(...perf.map((p) => p.value)) / tv) * 100 : 100
        const { grade: g, summary } = computeLetterGrade({
          totalReturnPercent: retPct,
          sectorCount: breakdown.length,
          topHoldingPercent: topPct,
        })
        if (!cancelled) {
          setTotalValue(tv)
          setTotalCost(initial)
          setRows(perf)
          setBest(sorted[0] ?? null)
          setWorst(sorted.length ? sorted[sorted.length - 1] : null)
          setPieData({
            labels: breakdown.map((b) => b.sector),
            data: breakdown.map((b) => b.percent),
          })
          setCoach(coachMessage(breakdown, risk))
          setGrade({ letter: g, summary })
          setLoading(false)
          setTimeout(() => setReveal(true), 200)
        }
        return
      }

      try {
        const res = await fetch('/api/portfolio', { credentials: 'include' })
        if (!res.ok) throw new Error('api')
        const { portfolio: p, holdings: h } = await res.json()
        if (!p || !Array.isArray(h) || h.length === 0) {
          if (!cancelled) {
            setLoading(false)
            setReveal(true)
          }
          return
        }
        const symbols = h.map((x: { symbol: string }) => x.symbol)
        const stocks = await getMultipleStocks(symbols)
        const map = new Map(stocks.map((s: StockData) => [s.symbol, s]))
        let tv = p.cash_balance
        let cost = 0
        const perf: Row[] = []
        for (const holding of h) {
          const price = map.get(holding.symbol)?.price ?? 0
          const v = price * holding.shares
          const c = (holding.average_cost || 0) * holding.shares
          cost += c
          tv += v
          const gain = v - c
          const pct = c > 0 ? (gain / c) * 100 : 0
          perf.push({ symbol: holding.symbol, value: v, gain, pct })
        }
        const sorted = [...perf].sort((a, b) => b.gain - a.gain)
        const breakdown = getSectorBreakdown(perf.map((p) => ({ symbol: p.symbol, value: p.value })))
        const holdingsVal = tv - p.cash_balance
        const risk = getPortfolioRiskScore(
          perf.map((p) => ({ value: p.value })),
          holdingsVal > 0 ? holdingsVal : 1
        )
        const retPct = cost > 0 ? ((holdingsVal - cost) / cost) * 100 : 0
        const topPct =
          perf.length && tv > 0 ? (Math.max(...perf.map((p) => p.value)) / tv) * 100 : 100
        const { grade: g, summary } = computeLetterGrade({
          totalReturnPercent: retPct,
          sectorCount: breakdown.length,
          topHoldingPercent: topPct,
        })
        if (!cancelled) {
          setTotalValue(tv)
          setTotalCost(cost)
          setRows(perf)
          setBest(sorted[0] ?? null)
          setWorst(sorted.length ? sorted[sorted.length - 1] : null)
          setPieData({
            labels: breakdown.map((b) => b.sector),
            data: breakdown.map((b) => b.percent),
          })
          setCoach(coachMessage(breakdown, risk))
          setGrade({ letter: g, summary })
          setLoading(false)
          setTimeout(() => setReveal(true), 200)
        }
      } catch {
        if (!cancelled) {
          setLoading(false)
          setReveal(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isLoaded, user?.id])

  if (!isLoaded) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-dark-text-secondary text-center">Loading…</div>
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-dark-text-secondary mb-4">Sign in to see your report card.</p>
        <Link href="/auth/signin" className="btn-primary inline-block">
          Sign in
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark-text-secondary">Building your report card…</p>
      </div>
    )
  }

  const returnPct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0

  const pieChart =
    pieData && pieData.data.some((d) => d > 0)
      ? {
          labels: pieData.labels,
          datasets: [
            {
              data: pieData.data,
              backgroundColor: [
                '#34d399',
                '#2dd4bf',
                '#38bdf8',
                '#a78bfa',
                '#fbbf24',
                '#fb7185',
                '#94a3b8',
              ],
              borderWidth: 0,
            },
          ],
        }
      : null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-text-primary">Portfolio report card</h1>
          <p className="text-dark-text-secondary text-sm mt-1">Simulator / practice account — for learning only.</p>
        </div>
        <Link href="/portfolio" className="text-sm text-dark-accent-green hover:underline">
          ← Portfolio
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-dark-text-secondary mb-4">No holdings yet — make a pretend trade to unlock your report card.</p>
          <Link href="/portfolio" className="btn-primary inline-block">
            Open portfolio
          </Link>
        </div>
      ) : (
        <>
          <div
            className={`card mb-8 text-center transition-all duration-700 ${
              reveal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <p className="text-sm text-dark-text-muted uppercase tracking-widest mb-2">Overall grade</p>
            <div
              className="text-8xl sm:text-9xl font-black bg-gradient-to-br from-emerald-300 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm transition-transform duration-700"
              style={{ transform: reveal ? 'scale(1)' : 'scale(0.5)' }}
            >
              {grade.letter}
            </div>
            <p className="text-dark-text-secondary mt-4 max-w-md mx-auto">{grade.summary}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="card transition-all duration-500 delay-100 hover:border-dark-accent-green/40">
              <p className="text-xs text-dark-text-muted mb-1">Total return</p>
              <p className={`text-2xl font-bold ${returnPct >= 0 ? 'text-dark-accent-green' : 'text-red-400'}`}>
                {returnPct >= 0 ? '+' : ''}
                {returnPct.toFixed(2)}%
              </p>
            </div>
            {best && (
              <div className="card transition-all duration-500 delay-150 hover:border-dark-accent-green/40">
                <p className="text-xs text-dark-text-muted mb-1">Best pick (unrealized)</p>
                <p className="text-xl font-bold text-dark-accent-green">{best.symbol}</p>
                <p className="text-sm text-dark-text-secondary">+${best.gain.toFixed(2)}</p>
              </div>
            )}
            {worst && (
              <div className="card transition-all duration-500 delay-200 hover:border-dark-accent-green/40">
                <p className="text-xs text-dark-text-muted mb-1">Needs patience</p>
                <p className="text-xl font-bold text-red-400">{worst.symbol}</p>
                <p className="text-sm text-dark-text-secondary">
                  {worst.gain >= 0 ? '+' : ''}${worst.gain.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="card">
              <h2 className="text-lg font-semibold text-dark-text-primary mb-4">Sectors (by value)</h2>
              {pieChart ? (
                <div className="h-64">
                  <Pie
                    data={pieChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#a0a0a0', boxWidth: 12 },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <p className="text-dark-text-muted text-sm">Not enough data for a chart.</p>
              )}
            </div>
            <div className="card flex flex-col justify-center">
              <h2 className="text-lg font-semibold text-dark-text-primary mb-2">Coach note</h2>
              <p className="text-dark-text-secondary leading-relaxed">{coach}</p>
              <p className="text-xs text-dark-text-muted mt-4 italic">
                Educational only — not advice. Talk to a trusted adult about real money.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
