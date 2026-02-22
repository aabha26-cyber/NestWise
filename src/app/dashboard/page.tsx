'use client'

import { useEffect, useState } from 'react'
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

export default function Dashboard() {
  const { user, isLoaded: userLoaded } = useUser()
  const [loading, setLoading] = useState(true)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [cashBalance, setCashBalance] = useState(0)
  const [dailyChange, setDailyChange] = useState(0)
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    if (!userLoaded) return
    if (!user) {
      setLoading(false)
      return
    }
    loadDashboard()
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000)
    return () => clearInterval(interval)
  }, [userLoaded, user])

  const loadDashboard = async () => {
    try {
      if (!user?.id) return

      const portfolio = await getOrCreatePortfolio(user.id)
      setCashBalance(portfolio.cash_balance)

      // Get holdings and calculate portfolio value
      const holdings = await getHoldings(portfolio.id)
      
      if (holdings.length > 0) {
        const symbols = holdings.map(h => h.symbol)
        const stocks = await getMultipleStocks(symbols)
        const stockMap = new Map(stocks.map(s => [s.symbol, s]))

        const totalValue = holdings.reduce((sum, holding) => {
          const stock = stockMap.get(holding.symbol)
          return sum + (stock?.price || 0) * holding.shares
        }, 0)

        setPortfolioValue(totalValue + portfolio.cash_balance)
      } else {
        setPortfolioValue(portfolio.cash_balance)
      }

      // Load portfolio history for chart
      const history = await getPortfolioHistory(portfolio.id, 30)
      if (history.length > 0) {
        const previousValue = history.length > 1 ? history[history.length - 2].total_value : portfolio.cash_balance
        const currentValue = portfolioValue || portfolio.cash_balance
        setDailyChange(currentValue - previousValue)

        setChartData({
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
        })
      } else {
        // Generate initial chart data
        const initialValue = portfolio.cash_balance
        setChartData({
          labels: Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            return format(date, 'MMM d')
          }),
          datasets: [
            {
              label: 'Portfolio Value',
              data: Array(30).fill(initialValue),
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
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
        grid: {
          color: '#2a2a2a',
        },
        ticks: {
          color: '#6b6b6b',
        },
      },
      y: {
        grid: {
          color: '#2a2a2a',
        },
        ticks: {
          color: '#6b6b6b',
          callback: function (value: any) {
            return '$' + value.toLocaleString()
          },
        },
      },
    },
  }

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-dark-text-secondary text-sm mb-1">Portfolio Value</p>
            <p className="text-4xl font-bold text-dark-text-primary">
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-dark-text-secondary text-sm mb-1">Today</p>
            <p
              className={`text-2xl font-semibold ${
                dailyChange >= 0 ? 'text-dark-accent-green' : 'text-red-500'
              }`}
            >
              {dailyChange >= 0 ? '+' : ''}
              ${dailyChange.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Chart */}
        {chartData && (
          <div className="h-64 mt-6">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
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

        <Link href="/learn" className="card hover:border-dark-accent-green/50 transition-all duration-300 group">
          <div className="text-3xl mb-3">📖</div>
          <h3 className="text-lg font-semibold text-dark-text-primary mb-2 group-hover:text-dark-accent-green transition-colors">
            Learn Basics
          </h3>
          <p className="text-dark-text-secondary text-sm">
            Start with the fundamentals of investing.
          </p>
        </Link>
      </div>
    </div>
  )
}
