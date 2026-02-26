/**
 * Symbol-to-sector mapping for common US stocks. Used for sector-wise analysis.
 * Fallback: "Other" for unknown symbols.
 */

export const SYMBOL_SECTOR: Record<string, string> = {
  AAPL: 'Technology',
  MSFT: 'Technology',
  GOOGL: 'Technology',
  GOOG: 'Technology',
  META: 'Technology',
  AMZN: 'Consumer Cyclical',
  NVDA: 'Technology',
  TSLA: 'Consumer Cyclical',
  NFLX: 'Communication Services',
  ADBE: 'Technology',
  CRM: 'Technology',
  ORCL: 'Technology',
  INTC: 'Technology',
  AMD: 'Technology',
  QCOM: 'Technology',
  IBM: 'Technology',
  CSCO: 'Technology',
  AVGO: 'Technology',
  NOW: 'Technology',
  INTU: 'Technology',
  AMGN: 'Healthcare',
  JNJ: 'Healthcare',
  UNH: 'Healthcare',
  PFE: 'Healthcare',
  ABBV: 'Healthcare',
  TMO: 'Healthcare',
  ABT: 'Healthcare',
  DHR: 'Healthcare',
  MRK: 'Healthcare',
  LLY: 'Healthcare',
  JPM: 'Financials',
  BAC: 'Financials',
  WFC: 'Financials',
  GS: 'Financials',
  MS: 'Financials',
  C: 'Financials',
  AXP: 'Financials',
  BLK: 'Financials',
  SCHW: 'Financials',
  SPY: 'ETF',
  QQQ: 'ETF',
  VOO: 'ETF',
  VTI: 'ETF',
  IWM: 'ETF',
  BND: 'ETF',
  VEA: 'ETF',
  VWO: 'ETF',
}

export function getSector(symbol: string): string {
  return SYMBOL_SECTOR[symbol?.toUpperCase()] ?? 'Other'
}

export function getSectorBreakdown(
  holdings: Array<{ symbol: string; value: number }>
): Array<{ sector: string; value: number; percent: number }> {
  const bySector: Record<string, number> = {}
  let total = 0
  for (const h of holdings) {
    const sector = getSector(h.symbol)
    bySector[sector] = (bySector[sector] ?? 0) + h.value
    total += h.value
  }
  return Object.entries(bySector)
    .map(([sector, value]) => ({
      sector,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
}

/** Simple risk score 1-10: concentration (top holding %) + lack of diversification. */
export function getPortfolioRiskScore(
  holdings: Array<{ value: number }>,
  totalValue: number
): { score: number; label: string; concentrationPercent: number } {
  if (holdings.length === 0 || totalValue <= 0) {
    return { score: 1, label: 'Low', concentrationPercent: 0 }
  }
  const sorted = [...holdings].sort((a, b) => b.value - a.value)
  const topHoldingPercent = (sorted[0].value / totalValue) * 100
  const concentrationScore = Math.min(10, Math.round(topHoldingPercent / 10))
  const diversificationScore = Math.max(0, 5 - holdings.length)
  const score = Math.min(10, Math.max(1, concentrationScore + Math.floor(diversificationScore / 2)))
  const label = score <= 3 ? 'Low' : score <= 6 ? 'Medium' : 'High'
  return {
    score,
    label,
    concentrationPercent: topHoldingPercent,
  }
}
