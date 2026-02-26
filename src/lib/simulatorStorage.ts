/**
 * Local simulator storage (Investopedia-style).
 * Works without API/Supabase so the simulator always runs with virtual cash.
 */

export interface SimulatorHolding {
  symbol: string
  shares: number
  average_cost: number
}

export interface ValueSnapshot {
  date: string // YYYY-MM-DD
  totalValue: number
}

export interface SimulatorTransaction {
  id: string
  date: string
  symbol: string
  shares: number
  price: number
  type: 'buy' | 'sell'
  averageCost?: number // for sell: cost basis used for realized gain
}

export interface RecurringDeposit {
  amount: number
  interval: 'week' | 'month'
  lastApplied: string // YYYY-MM-DD
}

export interface SimulatorState {
  cashBalance: number
  holdings: SimulatorHolding[]
  initialCash: number
  createdAt: string
  valueHistory?: ValueSnapshot[]
  transactions?: SimulatorTransaction[]
  recurringDeposit?: RecurringDeposit
}

const STORAGE_KEY_PREFIX = 'nestwise_simulator_'

function getKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`
}

export function getSimulatorState(userId: string): SimulatorState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(getKey(userId))
    if (!raw) return null
    const data = JSON.parse(raw) as SimulatorState
    if (!data || typeof data.cashBalance !== 'number' || !Array.isArray(data.holdings)) return null
    if (!Array.isArray(data.valueHistory)) data.valueHistory = []
    if (!Array.isArray(data.transactions)) data.transactions = []
    return data
  } catch {
    return null
  }
}

export function setSimulatorState(userId: string, state: SimulatorState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getKey(userId), JSON.stringify(state))
  } catch (e) {
    console.error('Simulator save failed:', e)
  }
}

export function createSimulator(userId: string, initialCash: number): SimulatorState {
  const today = new Date().toISOString().slice(0, 10)
  const state: SimulatorState = {
    cashBalance: initialCash,
    holdings: [],
    initialCash,
    createdAt: new Date().toISOString(),
    valueHistory: [{ date: today, totalValue: initialCash }],
    transactions: [],
  }
  setSimulatorState(userId, state)
  return state
}

export function updateSimulatorCash(userId: string, newCashBalance: number): void {
  const state = getSimulatorState(userId)
  if (!state) return
  state.cashBalance = newCashBalance
  setSimulatorState(userId, state)
}

export function addSimulatorHolding(
  userId: string,
  symbol: string,
  shares: number,
  price: number
): void {
  const state = getSimulatorState(userId)
  if (!state) return
  const existing = state.holdings.find((h) => h.symbol === symbol)
  if (existing) {
    const totalShares = existing.shares + shares
    const totalCost = existing.average_cost * existing.shares + price * shares
    existing.shares = totalShares
    existing.average_cost = totalCost / totalShares
  } else {
    state.holdings.push({ symbol, shares, average_cost: price })
  }
  setSimulatorState(userId, state)
}

export function removeSimulatorHolding(userId: string, symbol: string, shares: number): void {
  const state = getSimulatorState(userId)
  if (!state) return
  const idx = state.holdings.findIndex((h) => h.symbol === symbol)
  if (idx === -1) return
  const holding = state.holdings[idx]
  holding.shares -= shares
  if (holding.shares <= 0) {
    state.holdings.splice(idx, 1)
  }
  setSimulatorState(userId, state)
}

export function resetSimulatorLocal(userId: string, newCash: number): void {
  const today = new Date().toISOString().slice(0, 10)
  const state: SimulatorState = {
    cashBalance: newCash,
    holdings: [],
    initialCash: newCash,
    createdAt: new Date().toISOString(),
    valueHistory: [{ date: today, totalValue: newCash }],
    transactions: [],
  }
  setSimulatorState(userId, state)
}

/** Append a portfolio value snapshot for charting (one per day). */
export function appendValueSnapshot(userId: string, totalValue: number): void {
  const state = getSimulatorState(userId)
  if (!state) return
  const today = new Date().toISOString().slice(0, 10)
  const history = state.valueHistory || []
  const last = history[history.length - 1]
  if (last?.date === today) {
    last.totalValue = totalValue
  } else {
    history.push({ date: today, totalValue })
  }
  if (history.length > 365) history.splice(0, history.length - 365)
  state.valueHistory = history
  setSimulatorState(userId, state)
}

/** Get value history for chart (last N days). */
export function getSimulatorValueHistory(userId: string, days?: number): ValueSnapshot[] {
  const state = getSimulatorState(userId)
  if (!state?.valueHistory?.length) return []
  const list = [...state.valueHistory].sort((a, b) => a.date.localeCompare(b.date))
  if (days != null && days > 0) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cut = cutoff.toISOString().slice(0, 10)
    return list.filter((s) => s.date >= cut)
  }
  return list
}

/** Record a buy/sell for realized P&L. For sell, pass averageCost. */
export function recordSimulatorTransaction(
  userId: string,
  type: 'buy' | 'sell',
  symbol: string,
  shares: number,
  price: number,
  averageCost?: number
): void {
  const state = getSimulatorState(userId)
  if (!state) return
  const list = state.transactions || []
  list.push({
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    date: new Date().toISOString(),
    symbol,
    shares,
    price,
    type,
    averageCost,
  })
  if (list.length > 2000) list.splice(0, list.length - 1000)
  state.transactions = list
  setSimulatorState(userId, state)
}

/** Sum of realized gains from sold positions. */
export function getSimulatorRealizedGains(userId: string): number {
  const state = getSimulatorState(userId)
  if (!state?.transactions?.length) return 0
  return state.transactions
    .filter((t) => t.type === 'sell' && t.averageCost != null)
    .reduce((sum, t) => sum + (t.price - t.averageCost!) * t.shares, 0)
}

/** Set or clear recurring deposit (e.g. $500/month). */
export function setRecurringDeposit(
  userId: string,
  amount: number,
  interval: 'week' | 'month'
): void {
  const state = getSimulatorState(userId)
  if (!state) return
  if (amount <= 0) {
    state.recurringDeposit = undefined
  } else {
    state.recurringDeposit = {
      amount,
      interval,
      lastApplied: state.recurringDeposit?.lastApplied ?? new Date().toISOString().slice(0, 10),
    }
  }
  setSimulatorState(userId, state)
}

export function getRecurringDeposit(userId: string): RecurringDeposit | null {
  const state = getSimulatorState(userId)
  return state?.recurringDeposit ?? null
}

/** Apply recurring deposit if due; call when loading portfolio/dashboard. Returns true if applied. */
export function applyRecurringDepositIfDue(userId: string): boolean {
  const state = getSimulatorState(userId)
  const rd = state?.recurringDeposit
  if (!rd || rd.amount <= 0) return false
  const today = new Date().toISOString().slice(0, 10)
  const last = new Date(rd.lastApplied)
  const now = new Date()
  let due = false
  if (rd.interval === 'week') {
    const daysSince = (now.getTime() - last.getTime()) / (24 * 60 * 60 * 1000)
    due = daysSince >= 7
  } else {
    const monthsSince = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth())
    due = monthsSince >= 1
  }
  if (!due) return false
  state!.cashBalance += rd.amount
  state!.recurringDeposit = { ...rd, lastApplied: today }
  setSimulatorState(userId, state!)
  return true
}

/** Export holdings + transactions as CSV string. */
export function exportSimulatorDataCSV(userId: string): string {
  const state = getSimulatorState(userId)
  if (!state) return ''
  const rows: string[] = []
  rows.push('Type,Date,Symbol,Shares,Price,Cost Basis,Total')
  for (const t of state.transactions || []) {
    const total = t.shares * t.price
    const costBasis = t.averageCost != null ? t.averageCost * t.shares : ''
    rows.push(`${t.type},${t.date},${t.symbol},${t.shares},${t.price},${costBasis},${total.toFixed(2)}`)
  }
  rows.push('')
  rows.push('Holdings,Symbol,Shares,Average Cost,Current Value (estimate)')
  for (const h of state.holdings) {
    rows.push(`Holding,${h.symbol},${h.shares},${h.average_cost.toFixed(2)},`)
  }
  return rows.join('\n')
}
