'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { getOrCreatePortfolio, getTransactions, type Transaction } from '@/lib/portfolio'
import { format } from 'date-fns'

export default function TransactionsPage() {
  const { user, isLoaded: userLoaded } = useUser()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!userLoaded || !user) return
    loadTransactions()
  }, [userLoaded, user])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      if (!user?.id) return

      const portfolio = await getOrCreatePortfolio(user.id)
      const txns = await getTransactions(portfolio.id, 100)
      setTransactions(txns)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userLoaded || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <p className="text-dark-text-secondary">Please sign in to view transactions.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-dark-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark-text-primary mb-8">Transaction History</h1>

      <div className="card">
        {transactions.length === 0 ? (
          <p className="text-dark-text-secondary text-center py-12">
            No transactions yet. Start buying stocks to see your transaction history.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-dark-text-secondary font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-dark-text-secondary font-semibold">Symbol</th>
                  <th className="text-left py-3 px-4 text-dark-text-secondary font-semibold">Type</th>
                  <th className="text-right py-3 px-4 text-dark-text-secondary font-semibold">Shares</th>
                  <th className="text-right py-3 px-4 text-dark-text-secondary font-semibold">Price</th>
                  <th className="text-right py-3 px-4 text-dark-text-secondary font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50">
                    <td className="py-3 px-4 text-dark-text-primary">
                      {format(new Date(txn.created_at), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-dark-text-primary">{txn.symbol}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          txn.type === 'buy'
                            ? 'bg-dark-accent-green/20 text-dark-accent-green'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {txn.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-dark-text-primary">
                      {txn.shares.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-right text-dark-text-primary">
                      ${txn.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-dark-text-primary">
                      ${txn.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
