# NestWise — Project Context

## Product Summary

**NestWise** is an educational investing platform that teaches beginners how the stock market works through hands-on simulation, structured courses, and an AI chat assistant. Users trade with virtual money, track real market prices, and learn at their own pace — with zero financial risk.

**Tagline:** *Calm investing, clearly explained.*

**Inspiration:** Modern investing apps like Wealthsimple, but purely educational — no real accounts, no real money, no financial advice.

---

## Big Vision

NestWise aims to be the go-to learning platform for anyone curious about investing but intimidated by the complexity. The vision:

1. **Remove the fear barrier** — Let people practice investing with fake money before they ever risk a dollar. No sign-ups to brokerages, no KYC, no deposits.
2. **Learn by doing** — Structured courses paired with a real-time stock simulator create a feedback loop: learn a concept, then immediately try it.
3. **AI as a study buddy** — An always-available AI chat that explains concepts in plain English, names real tickers, and helps users think through investment ideas — like a knowledgeable friend, not a textbook.
4. **One-click starter portfolios** — Curated investment suggestions (Conservative / Balanced / Growth) let total beginners get started in seconds, then learn why those picks work.
5. **Gamification** — Achievements, progress tracking, and portfolio analytics keep users engaged and motivated to keep learning.

---

## Feature List

| Feature | Description |
|---|---|
| **Stock Market Simulator** | Trade real stocks/ETFs with virtual cash. Choose starting balance ($10k / $25k / $100k or custom). Buy/sell by shares or dollar amount. |
| **Real-Time Prices** | Live stock data from Yahoo Finance API (5-min cache). Search by company name or ticker symbol globally. |
| **Portfolio Dashboard** | Portfolio value chart (1M/3M/All), allocation breakdown, top holdings, unrealized/realized gains, daily change, total return %. |
| **Risk Indicators** | Concentration risk score (1–10), sector analysis breakdown, Fear & Greed market sentiment index. |
| **Investment Suggestions** | 3 curated portfolios (Conservative: VOO/BND/JNJ, Balanced: SPY/AAPL/JPM, Growth: QQQ/NVDA/MSFT). One-click invest with confirmation. |
| **Stock Explorer** | Search & browse stocks worldwide. Detailed view with AI-generated company overview, description, and watchlist toggle. |
| **Watchlist** | Save stocks to watch with optional personal notes ("Why I'm watching"). Quick-buy/sell links. |
| **Ask AI (Chat)** | GPT-4o-mini powered chat with friendly, specific responses. Names real tickers and explains sectors. Fallback mock responses when API key missing. |
| **Learn (Courses)** | 4 structured courses: Investing Basics, ETFs & Bonds, Risk & Diversification, Getting Started. Each lesson has curated articles (Investopedia, SEC) and videos (Khan Academy, The Plain Bagel). |
| **Progress Tracking** | Lesson completion tracking with progress bar. Per-user, stored in localStorage. |
| **Achievements** | 8 badges: First Trade, First Stock, Diversified (5+ stocks), Basics Complete, Course Graduate, Watchlist Pro, Week Active, In the Green. |
| **Recurring Deposits** | Set weekly/monthly auto-deposits to simulator cash (applied on visit). |
| **Transaction History** | Full buy/sell log with dates, prices, shares, and totals. |
| **Portfolio Analytics** | Dedicated analytics page for deeper portfolio insights. |
| **CSV Export** | Export portfolio holdings + transaction history as CSV. |
| **Dark/Light Theme** | Toggle between dark (default) and light mode. Persisted in localStorage. |
| **Auth (Clerk)** | Sign in / sign up via Clerk. All pages accessible without auth; portfolio features require sign-in. |
| **Disclaimer System** | Educational disclaimers on every relevant page. AI chat includes "not financial advice" banner. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, React 18) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 3.4 (custom dark theme tokens) |
| **Auth** | Clerk (`@clerk/nextjs` v5) |
| **Database** | Supabase (PostgreSQL) — optional; app works fully with localStorage simulator |
| **AI** | OpenAI GPT-4o-mini (chat + stock overviews) — optional; fallback responses built in |
| **Market Data** | Yahoo Finance API (free, no key required) |
| **Charts** | Chart.js + react-chartjs-2 (portfolio value line charts) |
| **Sentiment** | Alternative.me Fear & Greed Index API |
| **Date Utils** | date-fns |

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── page.tsx            # Landing page (hero, chat widget, simulator promo)
│   ├── dashboard/          # Portfolio dashboard with charts + analytics
│   ├── portfolio/          # Stock simulator (buy/sell/search/reset)
│   │   ├── analytics/      # Portfolio analytics sub-page
│   │   └── transactions/   # Transaction history sub-page
│   ├── explore/            # Stock search + detail view with AI overview
│   ├── watchlist/          # Watchlist management
│   ├── chat/               # Full AI chat page
│   ├── learn/              # Structured courses with lessons
│   ├── suggestions/        # Curated investment options (1-click invest)
│   ├── auth/               # Sign-in, sign-up, error pages
│   ├── api/
│   │   ├── chat/           # OpenAI chat endpoint
│   │   ├── stocks/         # Yahoo Finance proxy (single + batch + search)
│   │   ├── stock-overview/ # AI-generated stock overview
│   │   ├── portfolio/      # Supabase portfolio CRUD + init + reset
│   │   └── fear-greed/     # Market sentiment proxy
│   ├── layout.tsx          # Root layout (Clerk + Navigation)
│   ├── globals.css         # Tailwind + custom dark theme
│   ├── error.tsx           # Error boundary
│   ├── global-error.tsx    # Global error boundary
│   └── not-found.tsx       # 404 page
├── components/
│   ├── Navigation.tsx      # Top nav bar with theme toggle + auth button
│   ├── Providers.tsx       # ClerkProvider wrapper
│   └── AuthButton.tsx      # Sign in/out button
├── lib/
│   ├── stockApi.ts         # Yahoo Finance client (cache, search, batch)
│   ├── simulatorStorage.ts # localStorage-based simulator (holdings, cash, tx, snapshots)
│   ├── portfolio.ts        # Supabase portfolio operations
│   ├── watchlist.ts        # Supabase watchlist operations
│   ├── supabase.ts         # Supabase client + DB type definitions
│   ├── courses.ts          # Course/lesson content data
│   ├── learnProgress.ts    # Lesson completion tracking (localStorage)
│   ├── achievements.ts     # Achievement/badge system (localStorage)
│   ├── sectors.ts          # Symbol-to-sector mapping + risk scoring
│   ├── watchlistNotes.ts   # Watchlist notes (localStorage)
│   └── mockData.ts         # Fallback mock stock data
└── middleware.ts           # Clerk auth middleware (public/protected routes)
```

---

## Data Storage Strategy

The app has a **dual storage** approach:

1. **Local Simulator (default)** — All portfolio data (cash, holdings, transactions, value history, achievements, learn progress, watchlist notes) is stored in `localStorage` keyed by Clerk user ID. This works without any backend setup.

2. **Supabase (optional)** — When Supabase env vars are set, portfolio and watchlist data can persist to PostgreSQL. The app checks for Supabase availability and gracefully falls back to localStorage.

---

## Database Schema (Supabase)

5 tables with Row Level Security:

- **portfolios** — One per user. Fields: `user_id`, `cash_balance`.
- **holdings** — Stocks owned. Fields: `portfolio_id`, `symbol`, `shares`, `average_cost`. Unique on (portfolio_id, symbol).
- **transactions** — Buy/sell history. Fields: `portfolio_id`, `symbol`, `type`, `shares`, `price`, `total_amount`.
- **watchlists** — Watched stocks. Fields: `user_id`, `symbol`. Unique on (user_id, symbol).
- **portfolio_history** — Value snapshots for charting. Fields: `portfolio_id`, `total_value`, `recorded_at`.

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk auth (publishable key) |
| `CLERK_SECRET_KEY` | Yes | Clerk auth (secret key) |
| `OPENAI_API_KEY` | No | AI chat + stock overviews. Fallback responses if missing. |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL. If missing, uses localStorage. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key. If missing, uses localStorage. |

---

## Git History

| Commit | Description |
|---|---|
| `2d4a8a7` | Initial commit: NestWise investing app |
| `8d6c640` | Fix build, simulator, Ask AI, and Clerk middleware |
| `fb3898b` | Added ask AI bot, risk indicators and graphs |

---

## How to Run

```bash
cp .env.local.example .env.local   # Add Clerk keys (required), OpenAI + Supabase (optional)
npm install
npm run dev                         # Runs on http://localhost:8080
```

---

## Key Design Decisions

1. **No real money, ever** — This is a simulator. Every page reinforces this with disclaimers.
2. **Works offline from backends** — Clerk is the only hard requirement. Supabase and OpenAI are optional with graceful fallbacks.
3. **Client-first architecture** — Most logic runs client-side. API routes exist primarily as proxies (Yahoo Finance CORS) and AI endpoints.
4. **Friendly AI tone** — The chatbot acts like a knowledgeable friend, not a financial advisor. It names real stocks and tickers to be actually useful for simulator users.
5. **Dark theme default** — Finance app aesthetic with a custom Tailwind dark palette. Light mode available via toggle.
