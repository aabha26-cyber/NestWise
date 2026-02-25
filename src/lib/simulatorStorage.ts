/**
 * Local simulator storage (Investopedia-style).
 * Works without API/Supabase so the simulator always runs with virtual cash.
 */

export interface SimulatorHolding {
  symbol: string
  shares: number
  average_cost: number
}

export interface SimulatorState {
  cashBalance: number
  holdings: SimulatorHolding[]
  initialCash: number
  createdAt: string
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
  const state: SimulatorState = {
    cashBalance: initialCash,
    holdings: [],
    initialCash,
    createdAt: new Date().toISOString(),
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
  const state: SimulatorState = {
    cashBalance: newCash,
    holdings: [],
    initialCash: newCash,
    createdAt: new Date().toISOString(),
  }
  setSimulatorState(userId, state)
}
