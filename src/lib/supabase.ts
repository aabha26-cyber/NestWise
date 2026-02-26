import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Support both NEXT_PUBLIC_* (client/server) and non-prefixed (server-only) for flexibility
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types (always exported for use with local simulator types)
export interface Portfolio {
  id: string
  user_id: string
  cash_balance: number
  created_at: string
  updated_at: string
}

export interface Holding {
  id: string
  portfolio_id: string
  symbol: string
  shares: number
  average_cost: number | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  portfolio_id: string
  symbol: string
  type: 'buy' | 'sell'
  shares: number
  price: number
  total_amount: number
  created_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  symbol: string
  created_at: string
}

export interface PortfolioHistory {
  id: string
  portfolio_id: string
  total_value: number
  recorded_at: string
}
