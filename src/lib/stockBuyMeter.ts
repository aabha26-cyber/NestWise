import type { StockData } from '@/lib/stockApi'

export interface BuyMeterResult {
  /** 0–100 for the visual meter (learning / research vibe, not a buy signal) */
  score: number
  headline: string
  reasons: string[]
  disclaimer: string
}

/**
 * Beginner-friendly “research meter” — NOT financial advice.
 * Higher score = more interesting to learn about *after* reading and asking a trusted adult.
 */
export function getResearchMeter(stock: StockData): BuyMeterResult {
  const absCh = Math.abs(stock.changePercent)
  let score = 52
  const reasons: string[] = []

  if (stock.description && stock.description.length > 80) {
    score += 12
    reasons.push('There is a real company story to read — great for building context before you pretend-buy in the simulator.')
  } else {
    reasons.push('Try reading the “what they do” section above — understanding the business is the fun part.')
  }

  if (absCh < 1.5) {
    score += 8
    reasons.push('Price moved a smaller amount today — sometimes easier to focus on the business instead of the drama.')
  } else if (absCh < 4) {
    score += 4
    reasons.push('Today had a medium-sized move — normal for many stocks; good day to notice how news can swing prices.')
  } else {
    score -= 6
    reasons.push('Big price swing today — exciting to watch, but a reminder that stocks can be jumpy.')
  }

  if (stock.changePercent >= 0) {
    score += 3
    reasons.push('Today’s direction was up — still, one day never tells the whole story.')
  } else {
    score += 0
    reasons.push('Today’s direction was down — even good companies have bad days in the market.')
  }

  score = Math.max(12, Math.min(96, Math.round(score)))

  const headline =
    score >= 72
      ? 'Great one to explore in the simulator'
      : score >= 48
        ? 'Solid for learning — take your time'
        : 'Extra wiggly — perfect day to practice patience'

  return {
    score,
    headline,
    reasons: reasons.slice(0, 3),
    disclaimer:
      'This meter is for learning only. It does not tell you to buy or sell. Always ask a parent, teacher, or trusted adult before real money.',
  }
}
