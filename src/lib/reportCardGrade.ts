import { getSectorBreakdown, getPortfolioRiskScore } from '@/lib/sectors'

export function computeLetterGrade(input: {
  totalReturnPercent: number
  sectorCount: number
  topHoldingPercent: number
}): { grade: string; summary: string } {
  let pts = 0
  const { totalReturnPercent, sectorCount, topHoldingPercent } = input

  if (totalReturnPercent >= 8) pts += 3
  else if (totalReturnPercent >= 2) pts += 2
  else if (totalReturnPercent >= 0) pts += 1

  if (sectorCount >= 4) pts += 3
  else if (sectorCount >= 3) pts += 2
  else if (sectorCount >= 2) pts += 1

  if (topHoldingPercent <= 35) pts += 3
  else if (topHoldingPercent <= 55) pts += 2
  else if (topHoldingPercent <= 70) pts += 1

  let grade = 'F'
  if (pts >= 8) grade = 'A'
  else if (pts >= 6) grade = 'B'
  else if (pts >= 4) grade = 'C'
  else if (pts >= 2) grade = 'D'

  const summary =
    grade === 'A'
      ? 'Nice mix of learning habits: balance and curiosity show up in your pretend portfolio.'
      : grade === 'B'
        ? 'Solid effort — a bit more spreading out could make the ride smoother.'
        : grade === 'C'
          ? 'Room to grow: try adding a different sector or an ETF to spread risk.'
          : grade === 'D'
            ? 'Keep practicing — one big position or choppy returns are normal when you’re learning.'
            : 'Start small in the simulator: add a few different ideas and watch how they move together.'

  return { grade, summary }
}

export function coachMessage(
  sectorBreakdown: ReturnType<typeof getSectorBreakdown>,
  risk: ReturnType<typeof getPortfolioRiskScore>
): string {
  const top = sectorBreakdown[0]
  if (!top) {
    return 'Add a few holdings in the simulator to see how a report card works — even tiny pretend positions count.'
  }
  if (sectorBreakdown.length >= 4) {
    return `You’re touching several areas of the market — that’s the spirit of diversification. Your biggest slice is ${top.sector} at ${top.percent.toFixed(0)}%.`
  }
  if (risk.concentrationPercent > 55) {
    return `A lot of your pretend money is in one place (${top.sector}, ~${top.percent.toFixed(0)}%). That can feel exciting but bumpy — try adding something from another sector for balance.`
  }
  return `${top.sector} is your largest theme (~${top.percent.toFixed(0)}%). See if you can name one company from a different sector you’d like to learn about next.`
}
