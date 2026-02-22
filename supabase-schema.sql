-- Supabase Database Schema for NestWise
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Portfolios table (one per user)
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
  cash_balance DECIMAL(15, 2) DEFAULT 10000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holdings table (stocks owned by users)
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  shares DECIMAL(10, 4) NOT NULL,
  average_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(portfolio_id, symbol)
);

-- Transactions table (buy/sell history)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  shares DECIMAL(10, 4) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlists table (stocks users want to watch)
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Portfolio history table (for tracking portfolio value over time)
CREATE TABLE IF NOT EXISTS portfolio_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  total_value DECIMAL(15, 2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_portfolio_id ON portfolio_history(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_recorded_at ON portfolio_history(recorded_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own portfolio" ON portfolios
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own portfolio" ON portfolios
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own portfolio" ON portfolios
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own holdings" ON holdings
  FOR SELECT USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true))
  );

CREATE POLICY "Users can manage own holdings" ON holdings
  FOR ALL USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true))
  );

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true))
  );

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true))
  );

CREATE POLICY "Users can view own watchlist" ON watchlists
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage own watchlist" ON watchlists
  FOR ALL USING (auth.uid()::text = user_id OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own portfolio history" ON portfolio_history
  FOR SELECT USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true))
  );

CREATE POLICY "Users can insert own portfolio history" ON portfolio_history
  FOR INSERT WITH CHECK (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true))
  );
