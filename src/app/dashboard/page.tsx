'use client'

import { useEffect, useState, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
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
import { getOrCreatePortfolio, getHoldings, getPortfolioHistory } from '@/lib/portfolio'
import { getMultipleStocks } from '@/lib/stockApi'
import {
  getSimulatorState,
  getSimulatorValueHistory,
  getSimulatorRealizedGains,
  applyRecurringDepositIfDue,
} from '@/lib/simulatorStorage'
import { getCompletedLessonIds } from '@/lib/learnProgress'
import { getAllLessonIds } from '@/lib/courses'
import {
  ACHIEVEMENTS,
  getUnlockedAchievementIds,
  unlockAchievement,
  getUnlockedAchievements,
} from '@/lib/achievements'
import { getSectorBreakdown, getPortfolioRiskScore } from '@/lib/sectors'
import { format } from 'date-fns'

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

type ChartTimeframe = '1M' | '3M' | 'All'

export default function Dashboard() {
  const { user, isLoaded: userLoaded } = useUser()
  const [loading, setLoading] = useState(true)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [cashBalance, setCashBalance] = useState(0)
  const [investedValue, setInvestedValue] = useState(0)
  const [dailyChange, setDailyChange] = useState(0)
  const [chartData, setChartData] = useState<any>(null)
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1M')
  const [realizedGains, setRealizedGains] = useState(0)
  const [unrealizedGains, setUnrealizedGains] = useState(0)
  const [initialCash, setInitialCash] = useState(0)
  const [isLocalSim, setIsLocalSim] = useState(false)
  const [topHoldings, setTopHoldings] = useState<Array<{ symbol: string; name?: string; value: number; percent: number }>>([])
  const [tradesThisWeek, setTradesThisWeek] = useState(0)
  const [unlockedAchievements, setUnlockedAchievements] = useState<typeof ACHIEVEMENTS>([])
  const [lessonsCompleted, setLessonsCompleted] = useState(0)
  const [fearGreed, setFearGreed] = useState<{ value: number; label: string } | null>(null)

  const daysForTimeframe: Record<ChartTimeframe, number | undefined> = {
    '1M': 30,
    '3M': 90,
    All: undefined,
  }

  useEffect(() => {
    if (!userLoaded) return
    if (!user) {
      setLoading(false)
      return
    }
    loadDashboard()
    const interval = setInterval(loadDashboard, 30000)
    return () => clearInterval(interval)
  }, [userLoaded, user])

  // When timeframe changes: for local sim rebuild chart from storage; for API refetch history
  useEffect(() => {
    if (!user?.id) return
    if (isLocalSim) {
      const history = getSimulatorValueHistory(user.id, daysForTimeframe[chartTimeframe])
      buildChartFromHistory(history)
    } else {
      loadDashboard()
    }
  }, [chartTimeframe])

  const loadDashboard = async () => {
    try {
      if (!user?.id) return

      applyRecurringDepositIfDue(user.id)
      const localState = getSimulatorState(user.id)
      if (localState) {
        setIsLocalSim(true)
        setCashBalance(localState.cashBalance)
        setInitialCash(localState.initialCash)
        setRealizedGains(getSimulatorRealizedGains(user.id))

        const symbols = localState.holdings.map((h) => h.symbol)
        let stocksValue = 0
        const holdingValues: Array<{ symbol: string; name?: string; value: number; cost: number }> = []
        if (symbols.length > 0) {
          const stocks = await getMultipleStocks(symbols)
          const stockMap = new Map(stocks.map((s) => [s.symbol, s]))
          for (const h of localState.holdings) {
            const stock = stockMap.get(h.symbol)
            const price = stock?.price ?? 0
            const value = price * h.shares
            const cost = h.average_cost * h.shares
            stocksValue += value
            holdingValues.push({
              symbol: h.symbol,
              name: stock?.name,
              value,
              cost,
            })
          }
        }
        const totalValue = localState.cashBalance + stocksValue
        setPortfolioValue(totalValue)
        setInvestedValue(stocksValue)
        setUnrealizedGains(holdingValues.reduce((s, h) => s + (h.value - h.cost), 0))

        const totalForPercent = totalValue || 1
        setTopHoldings(
          holdingValues
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .map((h) => ({
              symbol: h.symbol,
              name: h.name,
              value: h.value,
              percent: (h.value / totalForPercent) * 100,
            }))
        )

        const history = getSimulatorValueHistory(user.id, daysForTimeframe[chartTimeframe])
        if (history.length >= 2) {
          setDailyChange(totalValue - (history[history.length - 2]?.totalValue ?? totalValue))
        } else {
          setDailyChange(0)
        }

        buildChartFromHistory(history)

        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const txThisWeek = (localState.transactions ?? []).filter(
          (t) => new Date(t.date) >= weekAgo
        ).length
        setTradesThisWeek(txThisWeek)

        const completedIds = getCompletedLessonIds(user.id)
        setLessonsCompleted(completedIds.length)

        const totalReturn =
          localState.initialCash > 0
            ? (localState.cashBalance + stocksValue - localState.initialCash) / localState.initialCash
            : 0
        if (localState.transactions && localState.transactions.length >= 1) unlockAchievement(user.id, 'first-trade')
        if (localState.holdings && localState.holdings.length >= 1) unlockAchievement(user.id, 'first-stock')
        if (localState.holdings && localState.holdings.length >= 5) unlockAchievement(user.id, 'diversified-5')
        if (totalReturn > 0) unlockAchievement(user.id, 'in-the-green')
        const basicsLessonIds = ['what-is-stock', 'market-basics']
        if (basicsLessonIds.every((id) => completedIds.includes(id))) unlockAchievement(user.id, 'learn-basics')
        if (completedIds.length >= getAllLessonIds().length && getAllLessonIds().length > 0) unlockAchievement(user.id, 'learn-all')
        unlockAchievement(user.id, 'week-active')
        setUnlockedAchievements(getUnlockedAchievements(user.id))

        setLoading(false)
        return
      }

      setIsLocalSim(false)
      const portfolio = await getOrCreatePortfolio(user.id)
      setCashBalance(portfolio.cash_balance)
      setInitialCash(portfolio.cash_balance)

      const holdings = await getHoldings(portfolio.id)
      let stocksValue = 0
      const holdingValues: Array<{ symbol: string; name?: string; value: number; cost: number }> = []
      if (holdings.length > 0) {
        const stocks = await getMultipleStocks(holdings.map((h) => h.symbol))
        const stockMap = new Map(stocks.map((s) => [s.symbol, s]))
        for (const h of holdings) {
          const stock = stockMap.get(h.symbol)
          const price = stock?.price ?? 0
          const value = price * h.shares
          const cost = (h.average_cost || 0) * h.shares
          stocksValue += value
          holdingValues.push({
            symbol: h.symbol,
            name: stock?.name,
            value,
            cost,
          })
        }
      }
      const totalValue = stocksValue + portfolio.cash_balance
      setPortfolioValue(totalValue)
      setInvestedValue(stocksValue)
      setUnrealizedGains(holdingValues.reduce((s, h) => s + (h.value - h.cost), 0))
      setRealizedGains(0)

      const completedIds = getCompletedLessonIds(user.id)
      setLessonsCompleted(completedIds.length)
      const basicsLessonIds = ['what-is-stock', 'market-basics']
      if (basicsLessonIds.every((id) => completedIds.includes(id))) unlockAchievement(user.id, 'learn-basics')
      if (completedIds.length >= getAllLessonIds().length && getAllLessonIds().length > 0) unlockAchievement(user.id, 'learn-all')
      setUnlockedAchievements(getUnlockedAchievements(user.id))
      setTradesThisWeek(0)

      const totalForPercent = totalValue || 1
      setTopHoldings(
        holdingValues
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
          .map((h) => ({
            symbol: h.symbol,
            name: h.name,
            value: h.value,
            percent: (h.value / totalForPercent) * 100,
          }))
      )

      const days = daysForTimeframe[chartTimeframe] ?? 365
      const history = await getPortfolioHistory(portfolio.id, Math.min(days, 365))
      if (history.length >= 2) {
        setDailyChange(totalValue - (history[history.length - 2]?.total_value ?? totalValue))
      } else {
        setDailyChange(0)
      }

      if (history.length > 0) {
        setChartData({
          labels: history.map((h) => format(new Date(h.recorded_at), 'MMM d')),
          datasets: [
            {
              label: 'Portfolio Value',
              data: history.map((h) => h.total_value),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
            },
          ],
        })
      } else {
        setChartData({
          labels: [format(new Date(), 'MMM d')],
          datasets: [
            {
              label: 'Portfolio Value',
              data: [totalValue],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
            },
          ],
        })
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  function buildChartFromHistory(history: Array<{ date: string; totalValue: number }>) {
    if (history.length === 0) {
      setChartData(null)
      return
    }
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
    setChartData({
      labels: sorted.map((h) => format(new Date(h.date), 'MMM d')),
      datasets: [
        {
          label: 'Portfolio Value',
          data: sorted.map((h) => h.totalValue),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    })
  }

  function buildChart() {
    if (!user?.id) return
    if (isLocalSim) {
      const history = getSimulatorValueHistory(user.id, daysForTimeframe[chartTimeframe])
      buildChartFromHistory(history)
    }
  }

  useEffect(() => {
    if (isLocalSim && user?.id) {
      const history = getSimulatorValueHistory(user.id, daysForTimeframe[chartTimeframe])
      buildChartFromHistory(history)
    }
  }, [chartTimeframe, isLocalSim, user?.id])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f1f1f',
          titleColor: '#f5f5f5',
          bodyColor: '#a0a0a0',
          borderColor: '#2a2a2a',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: '#2a2a2a' },
          ticks: { color: '#6b6b6b' },
        },
        y: {
          grid: { color: '#2a2a2a' },
          ticks: {
            color: '#6b6b6b',
            callback: (value: unknown) => '$' + Number(value).toLocaleString(),
          },
        },
      },
    }),
    []
  )

  const totalGainLoss = realizedGains + unrealizedGains
  const returnPercent = initialCash > 0 ? (totalGainLoss / initialCash) * 100 : 0
  const cashPercent = portfolioValue > 0 ? (cashBalance / portfolioValue) * 100 : 100
  const stocksPercent = portfolioValue > 0 ? (investedValue / portfolioValue) * 100 : 0

  const sectorBreakdown = getSectorBreakdown(
    topHoldings.map((h) => ({ symbol: h.symbol, value: h.value }))
  )
  const riskIndicator = getPortfolioRiskScore(
    topHoldings.map((h) => ({ value: h.value })),
    investedValue || 1
  )

  useEffect(() => {
    fetch('/api/fear-greed')
      .then((r) => r.json())
      .then((d) => setFearGreed({ value: d.value ?? 50, label: d.label ?? 'Neutral' }))
      .catch(() => setFearGreed({ value: 50, label: 'Neutral' }))
  }, [])

  if (!userLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold text-dark-text-primary mb-4">Welcome to NestWise</h2>
          <p className="text-dark-text-secondary mb-6">Sign in to view your dashboard and portfolio.</p>
          <Link href="/auth/signin" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark-text-primary mb-8">Dashboard</h1>

      {/* Portfolio Value Card */}
      <div className="card mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-dark-text-secondary text-sm mb-1">Portfolio Value</p>
            <p className="text-4xl font-bold text-dark-text-primary">
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-dark-text-secondary text-sm mb-1">Today</p>
              <p
                className={`text-xl font-semibold ${
                  dailyChange >= 0 ? 'text-dark-accent-green' : 'text-red-500'
                }`}
              >
                {dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(2)}
              </p>
            </div>
            {initialCash > 0 && (
              <div className="text-right">
                <p className="text-dark-text-secondary text-sm mb-1">Total return</p>
                <p
                  className={`text-xl font-semibold ${
                    returnPercent >= 0 ? 'text-dark-accent-green' : 'text-red-500'
                  }`}
                >
                  {returnPercent >= 0 ? '+' : ''}
                  {returnPercent.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chart timeframes */}
        <div className="flex gap-2 mb-4">
          {(['1M', '3M', 'All'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setChartTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                chartTimeframe === tf
                  ? 'bg-dark-accent-green text-white'
                  : 'bg-dark-surface text-dark-text-secondary hover:bg-dark-card border border-dark-border'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {chartData && (
          <div className="h-64 mt-2">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Allocation + Performance */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-4">Allocation</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-dark-text-secondary">Cash</span>
              <span className="text-dark-text-primary font-medium">
                {cashPercent.toFixed(1)}% · ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-3 rounded-full bg-dark-surface overflow-hidden flex">
              <div
                className="bg-dark-accent-green/80 h-full"
                style={{ width: `${stocksPercent}%` }}
              />
              <div
                className="bg-dark-border h-full"
                style={{ width: `${cashPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-text-secondary">Invested</span>
              <span className="text-dark-text-primary font-medium">
                {stocksPercent.toFixed(1)}% · ${investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          {topHoldings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-border">
              <p className="text-dark-text-secondary text-sm mb-2">Top holdings</p>
              <ul className="space-y-1.5">
                {topHoldings.map((h) => (
                  <li key={h.symbol} className="flex justify-between text-sm">
                    <span className="text-dark-text-primary truncate max-w-[140px]">
                      {h.symbol} {h.name && `· ${h.name}`}
                    </span>
                    <span className="text-dark-text-secondary shrink-0">
                      {h.percent.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-4">Gains & losses</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-dark-text-secondary">Unrealized (holdings)</span>
              <span
                className={`font-semibold ${
                  unrealizedGains >= 0 ? 'text-dark-accent-green' : 'text-red-500'
                }`}
              >
                {unrealizedGains >= 0 ? '+' : ''}${unrealizedGains.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dark-text-secondary">Realized (sold)</span>
              <span
                className={`font-semibold ${
                  realizedGains >= 0 ? 'text-dark-accent-green' : 'text-red-500'
                }`}
              >
                {realizedGains >= 0 ? '+' : ''}${realizedGains.toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t border-dark-border flex justify-between items-center">
              <span className="text-dark-text-primary font-medium">Total</span>
              <span
                className={`font-semibold ${
                  totalGainLoss >= 0 ? 'text-dark-accent-green' : 'text-red-500'
                }`}
              >
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk · Sector · Fear & Greed */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3">Risk indicators</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-text-secondary">Portfolio risk</span>
              <span
                className={
                  riskIndicator.label === 'High'
                    ? 'text-red-400 font-medium'
                    : riskIndicator.label === 'Medium'
                    ? 'text-yellow-400 font-medium'
                    : 'text-dark-accent-green font-medium'
                }
              >
                {riskIndicator.label}
              </span>
            </div>
            <div className="h-2 rounded-full bg-dark-surface overflow-hidden">
              <div
                className="h-full bg-dark-accent-green transition-all"
                style={{
                  width: `${(riskIndicator.score / 10) * 100}%`,
                  backgroundColor:
                    riskIndicator.label === 'High'
                      ? 'rgb(248 113 113)'
                      : riskIndicator.label === 'Medium'
                      ? 'rgb(250 204 21)'
                      : 'rgb(16 185 129)',
                }}
              />
            </div>
            <p className="text-xs text-dark-text-muted">
              Top holding: {riskIndicator.concentrationPercent.toFixed(0)}% of invested
            </p>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3">Sector analysis</h3>
          {sectorBreakdown.length === 0 ? (
            <p className="text-dark-text-secondary text-sm">No holdings yet. Sector breakdown will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {sectorBreakdown.map((s) => (
                <li key={s.sector} className="flex justify-between text-sm">
                  <span className="text-dark-text-primary">{s.sector}</span>
                  <span className="text-dark-text-secondary">{s.percent.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3">Market sentiment</h3>
          {fearGreed ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-dark-text-primary">{fearGreed.value}</span>
                <span className="text-dark-text-secondary text-sm">Fear & Greed</span>
              </div>
              <div className="h-2 rounded-full bg-dark-surface overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${fearGreed.value}%`,
                    backgroundColor:
                      fearGreed.value <= 25
                        ? 'rgb(239 68 68)'
                        : fearGreed.value <= 45
                        ? 'rgb(251 146 60)'
                        : fearGreed.value <= 55
                        ? 'rgb(250 204 21)'
                        : fearGreed.value <= 75
                        ? 'rgb(34 197 94)'
                        : 'rgb(16 185 129)',
                  }}
                />
              </div>
              <p className="text-xs text-dark-text-muted mt-1">{fearGreed.label}</p>
            </>
          ) : (
            <p className="text-dark-text-secondary text-sm">Loading…</p>
          )}
        </div>
      </div>

      {/* This week + Achievements */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3">This week</h3>
          <p className="text-dark-text-secondary text-sm">
            {tradesThisWeek} simulated trade{tradesThisWeek !== 1 ? 's' : ''} · {lessonsCompleted} lesson{lessonsCompleted !== 1 ? 's' : ''} completed
          </p>
          <Link href="/learn" className="mt-2 inline-block text-sm text-dark-accent-green hover:underline">
            Continue learning →
          </Link>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3">
            Achievements {unlockedAchievements.length > 0 && (
              <span className="text-dark-text-muted font-normal text-sm">
                {unlockedAchievements.length} / {ACHIEVEMENTS.length}
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {unlockedAchievements.length === 0 ? (
              <p className="text-dark-text-secondary text-sm">Complete trades and lessons to unlock badges.</p>
            ) : (
              unlockedAchievements.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-accent-green/20 text-dark-accent-green text-sm"
                  title={a.description}
                >
                  <span>{a.icon}</span>
                  <span>{a.name}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/portfolio" className="card hover:border-dark-accent-green/50 transition-all duration-300 group">
          <div className="text-3xl mb-3">💼</div>
          <h3 className="text-lg font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
            Portfolio
          </h3>
          <p className="text-dark-text-secondary text-sm">
            Trade stocks and manage your simulated holdings.
          </p>
        </Link>

        <Link href="/explore" className="card hover:border-dark-accent-green/50 transition-all duration-300 group">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
            Explore Stocks
          </h3>
          <p className="text-dark-text-secondary text-sm">
            Search and learn about different companies and stocks.
          </p>
        </Link>

        <Link href="/chat" className="card hover:border-dark-accent-green/50 transition-all duration-300 group">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-lg font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
            Ask AI
          </h3>
          <p className="text-dark-text-secondary text-sm">
            Get educational answers to your investing questions.
          </p>
        </Link>
      </div>
    </div>
  )
}
