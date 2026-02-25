'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! 👋 So glad you're here. I'm your investing buddy—think of me like a friend who's into this stuff and loves explaining it in plain English. I can help you understand stocks, ETFs, risk, diversification, or whatever's on your mind. No judgment, no boring jargon. (Just so you know: I'm for learning only, not financial advice.) What do you want to dive into?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Try to use OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
      } else {
        // Fallback to mock response if API fails
        const fallbackResponse = generateEducationalResponse(currentInput)
        setMessages((prev) => [...prev, { role: 'assistant', content: fallbackResponse }])
      }
    } catch (error) {
      // Fallback to mock response on error
      console.error('Chat API error:', error)
      const fallbackResponse = generateEducationalResponse(currentInput)
      setMessages((prev) => [...prev, { role: 'assistant', content: fallbackResponse }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Ask AI</h1>
        <p className="text-dark-text-secondary">
          Get educational answers about investing. Always remember: this is not financial advice.
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-400">
          <strong>⚠️ Not financial advice. Educational use only.</strong> This AI provides general 
          educational information to help you learn about investing. Always consult with a qualified 
          financial advisor before making investment decisions.
        </p>
      </div>

      {/* Chat Container */}
      <div className="card h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-dark-accent-green/20 text-dark-text-primary'
                    : 'bg-dark-surface text-dark-text-primary border border-dark-border'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-dark-surface border border-dark-border rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-dark-text-secondary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-dark-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-dark-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stocks, investing, markets..."
            className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-dark-accent-green focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

// Fallback when API is unavailable: answer based on the user's actual question
function generateEducationalResponse(userInput: string): string {
  const lowerInput = userInput.toLowerCase().trim()
  const quoted = userInput.length > 60 ? userInput.slice(0, 57) + '...' : userInput

  // Safety checks - refuse to give advice (friendly tone)
  if (
    lowerInput.includes('should i buy') ||
    lowerInput.includes('should i sell') ||
    lowerInput.includes('tell me to invest') ||
    lowerInput.includes('what stock to buy') ||
    lowerInput.includes('which stock')
  ) {
    return "Hey, I totally get why you'd ask—but I can't tell you what to buy or sell (that'd be financial advice, and I'm here to help you learn, not to advise). What I can do is help you think it through: how people research stocks, what they look at (company financials, industry, risk), and how to make your own call. Want to dig into something like how to read a balance sheet, or what diversification actually means? I've got you."
  }

  // Topic-specific (super friendly, best-friend tone)
  if (lowerInput.includes('stock') || lowerInput.includes('share') || lowerInput.includes('equity')) {
    return (
      'Love that you\'re asking about stocks! Here\'s the deal:\n\n' +
      '**What a stock actually is:** Think of it as a tiny piece of a company. When you own a stock, you own a little slice of that company. If the company does well over time, that slice can become worth more; if not, it can go down. Pretty straightforward.\n\n' +
      "**Why people are into them:** A lot of folks invest in stocks because they believe in the company and want to grow their money alongside it. Just so you know—prices move up and down (that's volatility), so there's always some risk.\n\n" +
      "**The main thing:** Understand what the company does and how it makes money. Past performance doesn't guarantee anything. Want me to break down something like how to read a quote or what market cap means? Just ask!"
    )
  }

  if (lowerInput.includes('etf') || lowerInput.includes('exchange traded fund')) {
    return (
      "Great question! ETFs are one of those things that sound fancy but are actually pretty simple.\n\n" +
      "**What's an ETF?** It's basically a basket that holds a bunch of investments (stocks, bonds, etc.). When you buy one ETF, you're buying a piece of that whole basket in one go. So you get diversification without picking every single stock yourself.\n\n" +
      "**How it works:** They trade like stocks—you can buy and sell during market hours. A lot of them just track an index (like the S&P 500), so they're often low-cost and simple.\n\n" +
      "**Heads up:** Still good to know what's inside the basket, and yeah—all investments carry some risk. Want to go deeper on index funds vs active ETFs, or how to pick one? I'm here!"
    )
  }

  if (lowerInput.includes('bond') || lowerInput.includes('bonds')) {
    return (
      "So glad you asked about bonds! They're different from stocks but super useful to understand.\n\n" +
      "**What's a bond?** Basically you're lending money to a company or the government. They pay you interest and give you your money back at a set time (maturity). So it's more like \"I'm the bank\" than \"I own a piece of the company.\"\n\n" +
      "**The vibe:** Bond prices move with interest rates and how trustworthy the borrower is. Generally they're less wild than stocks but also tend to have lower long-term return potential. There's still risk (interest rate risk, credit risk), but we can dig into that anytime.\n\n" +
      "Want me to explain government vs corporate bonds, or how bond prices and yields work? Just say the word!"
    )
  }

  if (lowerInput.includes('risk') || lowerInput.includes('safe') || lowerInput.includes('volatil')) {
    return (
      "Honestly, one of the smartest things to ask about. Here's the deal:\n\n" +
      "**Risk in plain English:** Every investment has some risk. Usually, the chance for higher returns comes with higher risk. Stocks tend to bounce around more (volatile); bonds are often calmer but with lower return potential. Nothing's \"safe\" in the sense of zero risk—we're just talking about how much bounce you're okay with.\n\n" +
      "**What people do:** Diversify (spread your money around), only invest what you can afford to have at risk, and understand what you own. And hey—past performance really doesn't guarantee future results. I can go deeper on diversification or asset allocation whenever you want!"
    )
  }

  if (lowerInput.includes('diversif') || lowerInput.includes('portfolio') || lowerInput.includes('spread')) {
    return (
      "So glad you're thinking about this! It's one of those concepts that really matters.\n\n" +
      "**Diversification:** Fancy word for \"don't put all your eggs in one basket.\" You spread your money across different stuff—different companies, sectors, maybe countries—so if one thing has a bad year, others might do okay. It doesn't guarantee profit or prevent loss, but it's a way to manage risk.\n\n" +
      "**Your portfolio:** That's just everything you own (stocks, bonds, ETFs, etc.). People usually try to build a mix that fits their goals and how much risk they're cool with.\n\n" +
      "Want to talk about asset allocation or how to think about building a portfolio? I've got you."
    )
  }

  if (lowerInput.includes('dividend')) {
    return (
      "Love that you're asking about dividends! Here's the lowdown:\n\n" +
      "**What they are:** Some companies share their profits with shareholders—those payments are dividends. Not every company does it; some prefer to reinvest the money back into the business.\n\n" +
      "**How it works:** Often paid every quarter. You can take the cash or reinvest it (there's something called a DRIP for that). Dividend yield = annual dividend per share ÷ share price—gives you an idea of how much you're getting back.\n\n" +
      "**One thing to watch:** A really high yield can sometimes be a red flag (market might be worried). And companies can cut dividends. Want to go deeper on yield, payout ratio, or growth vs value investing? Just ask!"
    )
  }

  if (lowerInput.includes('market') || lowerInput.includes('bull') || lowerInput.includes('bear')) {
    return (
      "Great question! So:\n\n" +
      "**Stock market:** It's where people buy and sell shares of companies. Prices go up and down based on supply and demand (and a lot of other stuff, honestly).\n\n" +
      "**Bull market:** When things are going up and everyone's feeling good. **Bear market:** When prices are falling—usually we're talking a drop of 20% or more from a high. They're normal parts of the cycle, even though they feel rough.\n\n" +
      "**Real talk:** Markets can get emotional and timing them is really hard. A lot of people focus on long-term investing instead of trying to guess the swings. Want me to explain more about how markets work or long-term investing? I'm here!"
    )
  }

  if (lowerInput.includes('beginner') || lowerInput.includes('start') || lowerInput.includes('how do i')) {
    return (
      "Hey, love that you're asking! Starting out can feel overwhelming, but you're in the right place.\n\n" +
      "**First steps that actually help:** (1) Get the basics down—what are stocks, bonds, ETFs? (2) Wrap your head around risk (you can lose money, so only invest what you can afford to have at risk). (3) Think about diversification—spreading things out.\n\n" +
      "**No one-size-fits-all:** Your goals, timeline, and risk tolerance are yours. Reading up, using simulators (like the one on this site!), and asking questions like you're doing now is exactly the right move. I can't tell you what to do, but I can explain any concept—P/E ratio, index funds, whatever. What do you want to dive into first?"
    )
  }

  // Default: friendly, acknowledge their question
  return (
    'Hey! You asked something like: "' + quoted + '"\n\n' +
    "I really want to give you a good answer. I can't give specific financial advice, but I can break down concepts so they make sense. For stuff like this, it usually helps to think about: (1) **what** it is—the basics; (2) **how** it works; (3) **what to watch for**—risks and stuff beginners sometimes miss.\n\n" +
    "If you ask me something specific (like \"what is a P/E ratio?\" or \"how do options work?\" or \"growth vs value?\"), I can walk you through it step by step. What do you want to learn about? I've got you."
  )
}
