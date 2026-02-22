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
      content: "Hi! I'm here to help you learn about investing. I can explain concepts, discuss different investment types, and help you understand how markets work. Remember, I provide educational information only—not financial advice. What would you like to learn about?",
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

// Simulated AI response generator (replace with OpenAI API in production)
function generateEducationalResponse(userInput: string): string {
  const lowerInput = userInput.toLowerCase()

  // Safety checks - refuse to give advice
  if (
    lowerInput.includes('should i buy') ||
    lowerInput.includes('should i sell') ||
    lowerInput.includes('tell me to invest') ||
    lowerInput.includes('what stock to buy')
  ) {
    return "I can't provide specific buy or sell recommendations. That would be financial advice, which I don't provide. However, I can help you understand how to research stocks, what factors people typically consider, and how to think about investment decisions. What aspect of stock research would you like to learn about?"
  }

  // Educational responses
  if (lowerInput.includes('stock') || lowerInput.includes('share')) {
    return "A stock represents ownership in a company. When you own a stock, you own a small piece of that company. If the company does well, the value of your stock might increase. If it doesn't, the value might decrease. Some people invest in stocks because they believe the company will grow over time. It's important to remember that stock prices can be volatile and there's always risk involved. Would you like to learn more about any specific aspect of stocks?"
  }

  if (lowerInput.includes('etf') || lowerInput.includes('exchange traded fund')) {
    return "An ETF (Exchange-Traded Fund) is like a basket that holds many different stocks or other investments. When you buy an ETF, you're buying a small piece of that entire basket. This can help with diversification because you're spreading your investment across many companies rather than just one. Some people prefer ETFs because they can be simpler than picking individual stocks. However, it's still important to understand what's inside the ETF and that all investments carry risk."
  }

  if (lowerInput.includes('risk') || lowerInput.includes('safe')) {
    return "All investments carry some level of risk. Generally, the potential for higher returns comes with higher risk. Stocks can be volatile—their prices go up and down. Some people consider bonds to be less risky than stocks, but they typically offer lower potential returns. Diversification (spreading investments across different types of assets) is one strategy some people use to manage risk. It's important to only invest money you can afford to lose and to understand that past performance doesn't guarantee future results."
  }

  if (lowerInput.includes('diversif') || lowerInput.includes('portfolio')) {
    return "Diversification means spreading your investments across different types of assets, industries, or companies. The idea is that if one investment performs poorly, others might perform better, which can help reduce overall risk. Some people think of it as 'not putting all your eggs in one basket.' However, diversification doesn't guarantee profits or protect against all losses. It's one strategy to consider, but it's important to do your own research and understand what you're investing in."
  }

  // Default educational response
  return "That's a great question! I'd be happy to help you learn about that. One thing to think about is that investing involves risk, and it's important to do your own research. Some people find it helpful to start by learning the basics, like understanding what stocks and bonds are, how markets work, and the concept of risk versus reward. What specific aspect would you like to explore further? Remember, I'm here for education, not to give specific investment advice."
}
