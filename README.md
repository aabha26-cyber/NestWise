# NestWise - Calm investing, clearly explained

A dark-themed, educational investing web app built with Next.js, React, and Tailwind CSS. Learn about investing without pressure—track markets, simulate portfolios, and ask AI questions (educational only, no financial advice).

## Features

- 🔐 **Authentication** - Sign in with email or Google (powered by Clerk)
- 🌑 **Dark Theme** - Beautiful, calm dark mode interface
- 📊 **Dashboard** - View portfolio value with interactive charts
- 🔍 **Stock Explorer** - Search and learn about different stocks
- 💼 **Simulation Portfolio** - Practice with fake money
- 🤖 **AI Chatbot** - Get educational answers (safety-first, no advice)
- 📚 **Learn Page** - Beginner-friendly investing lessons

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** (dark mode)
- **Clerk** (authentication - much simpler than NextAuth!)
- **Chart.js** (for portfolio charts)
- **OpenAI API** (optional, currently uses mock responses)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Copy `.env.local.example` as a template
   - **Required for authentication:**
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
     - `CLERK_SECRET_KEY` - From Clerk dashboard
   - **Optional:**
     - `OPENAI_API_KEY` - For real AI responses (uses mock if not set)
   
   📖 **See [CLERK_SETUP.md](./CLERK_SETUP.md) for detailed Clerk setup instructions (super easy!)**

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Landing page
│   ├── auth/
│   │   ├── signin/             # Sign-in page (Clerk)
│   │   └── signup/             # Sign-up page (Clerk)
│   ├── dashboard/              # Dashboard page
│   ├── explore/                # Stock explorer page
│   ├── portfolio/              # Simulation portfolio page
│   ├── chat/                   # AI chatbot page
│   ├── learn/                  # Educational lessons page
│   └── globals.css             # Global styles with Tailwind
├── components/
│   ├── Navigation.tsx          # Main navigation component
│   ├── AuthButton.tsx          # Sign in/out button (Clerk)
│   └── Providers.tsx           # Clerk provider wrapper
├── lib/
│   └── mockData.ts             # Mock stock data
└── middleware.ts               # Clerk middleware for route protection
```

## Important Disclaimers

⚠️ **This is an educational app only.**

- No real financial advice is provided
- All portfolios use simulated/fake money
- Market data is for educational purposes
- Always consult a qualified financial advisor before making investment decisions

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is for educational purposes only.
