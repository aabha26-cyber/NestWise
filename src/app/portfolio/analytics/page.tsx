'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { getOrCreatePortfolio, getHoldings, getPortfolioHistory } from '@/lib/portfolio'
import { getMultipleStocks, type StockData } from '@/lib/stockApi'
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

export default function AnalyticsPage() {
  const { user, isLoaded: userLoaded } = useUser()
  const [loading, setLoading] = useState(true)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [totalGainLoss, setTotalGainLoss] = useState(0)
  const [bestPerformer, setBestPerformer] = useState<{ symbol: string; gain: number } | null>(null)
  const [worstPerformer, setWorstPerformer] = useState<{ symbol: string; loss: number } | null>(null)
  const [historyData, setHistoryData] = useState<any>(null)

  useEffect(() => {
    if (!userLoaded || !user) return
    loadAnalytics()
  }, [userLoaded, user])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      if (!user?.id) return

      const portfolio = await getOrCreatePortfolio(user.id)
      const holdings = await getHoldings(portfolio.id)
      
      // Get current stock prices
      const symbols = holdings.map(h => h.symbol)
      const stocks = await getMultipleStocks(symbols)
      const stockMap = new Map(stocks.map(s => [s.symbol, s]))

      // Calculate portfolio value and gains/losses
      let totalValue = 0
      let totalCost = 0
      const performers: Array<{ symbol: string; gain: number; percent: number }> = []

      holdings.forEach(holding => {
        const stock = stockMap.get(holding.symbol)
        if (!stock) return

        const currentValue = stock.price * holding.shares
        const costBasis = (holding.average_cost || 0) * holding.shares
        const gain = currentValue - costBasis
        const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0

        totalValue += currentValue
        totalCost += costBasis

        if (costBasis > 0) {
          performers.push({ symbol: holding.symbol, gain, percent: gainPercent })
        }
      })

      setPortfolioValue(totalValue)
      setTotalGainLoss(totalValue - totalCost)

      // Find best and worst performers
      if (performers.length > 0) {
        const sorted = [...performers].sort((a, b) => b.gain - a.gain)
        setBestPerformer({ symbol: sorted[0].symbol, gain: sorted[0].gain })
        setWorstPerformer({ symbol: sorted[sorted.length - 1].symbol, loss: sorted[sorted.length - 1].gain })
      }

      // Load portfolio history
      const history = await getPortfolioHistory(portfolio.id, 30)
      if (history.length > 0) {
        const chartData = {
          labels: history.map(h => format(new Date(h.recorded_at), 'MMM d')),
          datasets: [
            {
              label: 'Portfolio Value',
              data: history.map(h => h.total_value),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
            },
          ],
        }
        setHistoryData(chartData)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userLoaded || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <p className="text-dark-text-secondary">Please sign in to view analytics.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const chartOptions = {
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
          callback: function (value: any) {
            return '$' + value.toLocaleString()
          },
        },
      },
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark-text-primary mb-8">Portfolio Analytics</h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-dark-text-secondary text-sm mb-1">Total Value</p>
          <p className="text-2xl font-bold text-dark-text-primary">
            ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card">
          <p className="text-dark-text-secondary text-sm mb-1">Total Gain/Loss</p>
          <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-dark-accent-green' : 'text-red-500'}`}>
            {totalGainLoss >= 0 ? '+' : ''}
            ${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        {bestPerformer && (
          <div className="card">
            <p className="text-dark-text-secondary text-sm mb-1">Best Performer</p>
            <p className="text-xl font-bold text-dark-accent-green">{bestPerformer.symbol}</p>
            <p className="text-sm text-dark-accent-green">
              +${bestPerformer.gain.toFixed(2)}
            </p>
          </div>
        )}
        {worstPerformer && (
          <div className="card">
            <p className="text-dark-text-secondary text-sm mb-1">Worst Performer</p>
            <p className="text-xl font-bold text-red-500">{worstPerformer.symbol}</p>
            <p className="text-sm text-red-500">
              {worstPerformer.loss >= 0 ? '+' : ''}${worstPerformer.loss.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Portfolio History Chart */}
      {historyData && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-dark-text-primary mb-6">30-Day Portfolio Value</h2>
          <div className="h-64">
            <Line data={historyData} options={chartOptions} />
          </div>
        </div>
      )}

      {!historyData && (
        <div className="card text-center py-12">
          <p className="text-dark-text-secondary">
            Portfolio history will appear here as you make transactions.
          </p>
        </div>
      )}
    </div>
  )
}
