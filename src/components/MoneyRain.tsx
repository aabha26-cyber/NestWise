'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { usePathname } from 'next/navigation'
import {
  Coins,
  Banknote,
  DollarSign,
  PiggyBank,
  Wallet,
  CircleDollarSign,
  HandCoins,
  Gem,
  Trophy,
  Bitcoin,
  type LucideIcon,
} from 'lucide-react'

// Each entry: [icon component, color, twinkle-glow color]
const ICON_DEFS: [LucideIcon, string, string][] = [
  [Coins,           '#f59e0b', 'rgba(245,158,11,0.9)'],   // gold
  [DollarSign,      '#22c55e', 'rgba(34,197,94,0.9)'],    // green
  [Banknote,        '#4ade80', 'rgba(74,222,128,0.9)'],   // light green
  [CircleDollarSign,'#a3e635', 'rgba(163,230,53,0.9)'],   // lime
  [HandCoins,       '#fbbf24', 'rgba(251,191,36,0.9)'],   // amber
  [Wallet,          '#38bdf8', 'rgba(56,189,248,0.9)'],   // sky blue
  [PiggyBank,       '#f472b6', 'rgba(244,114,182,0.9)'],  // pink
  [Gem,             '#a78bfa', 'rgba(167,139,250,0.9)'],  // violet
  [Trophy,          '#f59e0b', 'rgba(245,158,11,0.9)'],   // gold
  [Bitcoin,         '#fb923c', 'rgba(251,146,60,0.9)'],   // orange
]

type Piece = {
  id: string
  leftPct: number
  delay: number
  duration: number
  drift: number
  iconDef: [LucideIcon, string, string]
  sizePx: number
  twinkle: boolean
  twinkleDelay: number
  twinkleDuration: number
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `m-${i}-${Math.random().toString(36).slice(2, 9)}`,
    leftPct: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 3.5,
    drift: (Math.random() - 0.5) * 90,
    iconDef: ICON_DEFS[Math.floor(Math.random() * ICON_DEFS.length)],
    sizePx: 22 + Math.floor(Math.random() * 18),
    twinkle: Math.random() < 0.4,
    twinkleDelay: Math.random() * 1.2,
    twinkleDuration: 0.35 + Math.random() * 0.45,
  }))
}

function MoneyRainBurst() {
  const [pieces, setPieces] = useState<Piece[] | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true)
      return
    }
    setPieces(makePieces(44))
    const t = window.setTimeout(() => setDone(true), 9500)
    return () => window.clearTimeout(t)
  }, [])

  if (done || !pieces) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[15] overflow-hidden" aria-hidden>
      {pieces.map((p) => {
        const [Icon, color, glowColor] = p.iconDef
        return (
          <span
            key={p.id}
            className="absolute will-change-transform select-none"
            style={
              {
                left: `${p.leftPct}%`,
                top: '-8vh',
                lineHeight: 1,
                animationName: p.twinkle
                  ? 'nestwise-money-fall, nestwise-twinkle-icon'
                  : 'nestwise-money-fall',
                animationDuration: p.twinkle
                  ? `${p.duration}s, ${p.twinkleDuration}s`
                  : `${p.duration}s`,
                animationTimingFunction: p.twinkle ? 'linear, ease-in-out' : 'linear',
                animationDelay: p.twinkle
                  ? `${p.delay}s, ${p.delay + p.twinkleDelay}s`
                  : `${p.delay}s`,
                animationFillMode: p.twinkle ? 'forwards, none' : 'forwards',
                animationIterationCount: p.twinkle ? '1, infinite' : '1',
                '--drift': `${p.drift}px`,
                '--glow': glowColor,
              } as CSSProperties
            }
          >
            <Icon
              size={p.sizePx}
              color={color}
              strokeWidth={1.5}
              style={{ display: 'block', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}
            />
          </span>
        )
      })}
    </div>
  )
}

export function MoneyRainGate() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted || pathname !== '/') return null
  return <MoneyRainBurst key={pathname} />
}
