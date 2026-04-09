'use client'

import { useEffect, useState } from 'react'
import { getChartTheme } from '@/lib/chartTheme'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { TooltipItem } from 'chart.js'
import type { StockData } from '@/lib/stockApi'
import { NestWiseIcon } from '@/components/NestWiseIcon'
import { getFunFact } from '@/lib/stockFunFacts'
import { getResearchMeter } from '@/lib/stockBuyMeter'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function simplifyForKids(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= 320) return t
  const cut = t.slice(0, 320)
  const last = cut.lastIndexOf('.')
  return (last > 120 ? cut.slice(0, last + 1) : cut) + ' …'
}

export default function StockDeepDive({ stock }: { stock: StockData }) {
  const [points, setPoints] = useState<{ t: number; c: number }[]>([])
  const [loadingChart, setLoadingChart] = useState(true)
  const funFact = getFunFact(stock.symbol, stock.name)
  const meter = getResearchMeter(stock)

  useEffect(() => {
    let cancelled = false
    setLoadingChart(true)
    fetch(`/api/stocks/history?symbol=${encodeURIComponent(stock.symbol)}&range=3mo`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setPoints(Array.isArray(data.points) ? data.points : [])
      })
      .catch(() => {
        if (!cancelled) setPoints([])
      })
      .finally(() => {
        if (!cancelled) setLoadingChart(false)
      })
    return () => {
      cancelled = true
    }
  }, [stock.symbol])

  const labels = points.map((p) => {
    const d = new Date(p.t * 1000)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  const data = points.map((p) => p.c)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Price',
        data,
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  }

  const ct = getChartTheme()
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1100,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...ct.tooltip,
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => {
            const y = ctx.parsed.y
            if (y == null) return ''
            return `$${Number(y).toFixed(2)}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: ct.grid },
        ticks: { color: ct.ticks, maxTicksLimit: 8 },
      },
      y: {
        grid: { color: ct.grid },
        ticks: {
          color: ct.ticks,
          callback: (v: string | number) => '$' + Number(v).toFixed(0),
        },
      },
    },
  }

  return (
    <div className="space-y-6 mt-8 border-t border-dark-border pt-8">
      <div>
        <h3 className="text-lg font-semibold text-dark-text-primary mb-1 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-accent-green/10 text-dark-accent-green" aria-hidden>
            <NestWiseIcon name="binoculars" size={18} />
          </span>
          Stock deep dive
        </h3>
        <p className="text-sm text-dark-text-muted">Animated chart (last ~3 months) — for learning, not predictions.</p>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-surface/50 overflow-hidden">
        <div className="h-56 sm:h-64 px-2 pt-4">
          {loadingChart ? (
            <div className="h-full flex items-center justify-center text-dark-text-secondary text-sm">
              Loading chart…
            </div>
          ) : points.length < 2 ? (
            <div className="h-full flex items-center justify-center text-dark-text-muted text-sm text-center px-4">
              Not enough history for a chart right now. Try another symbol or check back later.
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-dark-border bg-dark-card p-4">
          <h4 className="font-semibold text-dark-text-primary mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-surface text-dark-accent-green shrink-0" aria-hidden>
              <NestWiseIcon name="building-2" size={16} />
            </span>
            What this company does
          </h4>
          <p className="text-dark-text-secondary text-sm leading-relaxed">
            {stock.description
              ? simplifyForKids(stock.description)
              : 'We’re still loading the story of this company. In real life, smart investors read annual reports and trusted sources — ask a grown-up to help you search.'}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <h4 className="font-semibold text-dark-text-primary mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 shrink-0" aria-hidden>
              <NestWiseIcon name="sparkles" size={16} className="text-amber-400" />
            </span>
            Fun fact
          </h4>
          <p className="text-dark-text-secondary text-sm leading-relaxed">{funFact}</p>
        </div>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-card p-4 sm:p-6">
        <h4 className="font-semibold text-dark-text-primary mb-1 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-surface text-dark-accent-green shrink-0" aria-hidden>
            <NestWiseIcon name="sliders-horizontal" size={16} />
          </span>
          “Should I buy?” meter
        </h4>
        <p className="text-xs text-dark-text-muted mb-4">
          Not a recommendation — a playful way to think about research vs. hype.
        </p>
        <div className="mb-4">
          <div className="h-4 rounded-full bg-dark-surface overflow-hidden border border-dark-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500/80 via-emerald-400 to-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${meter.score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-dark-text-muted mt-1">
            <span>More to learn</span>
            <span>Cool to explore (in the simulator)</span>
          </div>
        </div>
        <p className="text-dark-accent-green font-medium mb-3">{meter.headline}</p>
        <ul className="space-y-2 text-sm text-dark-text-secondary list-disc pl-5">
          {meter.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
        <p className="text-xs text-dark-text-muted mt-4 italic">{meter.disclaimer}</p>
      </div>
    </div>
  )
}
