import Link from 'next/link'

const lessons = [
  {
    id: 1,
    title: 'What is a Stock?',
    icon: '📈',
    content: `A stock represents ownership in a company. When you buy a stock, you're buying a small piece of that company. If the company does well and becomes more valuable, your stock might increase in value too. If the company struggles, your stock might decrease in value.

Stocks are traded on stock exchanges, and their prices change throughout the day based on supply and demand. It's important to remember that stock prices can be volatile and there's always risk involved.`,
  },
  {
    id: 2,
    title: 'ETFs Explained',
    icon: '📦',
    content: `An ETF (Exchange-Traded Fund) is like a basket that holds many different stocks, bonds, or other investments. When you buy an ETF, you're buying a small piece of that entire basket.

ETFs can help with diversification because you're spreading your investment across many companies or assets rather than just one. They're traded like stocks on exchanges, but they give you exposure to a whole collection of investments. Some people find ETFs simpler than picking individual stocks.`,
  },
  {
    id: 3,
    title: 'Risk vs Reward',
    icon: '⚖️',
    content: `All investments carry some level of risk. Generally, the potential for higher returns comes with higher risk. Stocks can be volatile—their prices go up and down, sometimes significantly.

Bonds are often considered less risky than stocks, but they typically offer lower potential returns. It's important to understand your own risk tolerance—how comfortable you are with the possibility of losing money. Only invest money you can afford to lose, and remember that past performance doesn't guarantee future results.`,
  },
  {
    id: 4,
    title: 'Diversification',
    icon: '🎯',
    content: `Diversification means spreading your investments across different types of assets, industries, or companies. The idea is that if one investment performs poorly, others might perform better, which can help reduce overall risk.

Think of it as "not putting all your eggs in one basket." However, diversification doesn't guarantee profits or protect against all losses. It's one strategy to consider, but it's important to do your own research and understand what you're investing in.`,
  },
  {
    id: 5,
    title: 'Market Basics',
    icon: '🏛️',
    content: `Stock markets are places where stocks are bought and sold. The price of a stock is determined by supply and demand—if more people want to buy a stock than sell it, the price goes up. If more people want to sell than buy, the price goes down.

Markets can be influenced by many factors: company performance, economic news, investor sentiment, and more. It's normal for markets to go up and down over time.`,
  },
  {
    id: 6,
    title: 'Getting Started',
    icon: '🚀',
    content: `If you're new to investing, start by learning the basics. Understand what you're investing in, do your research, and never invest more than you can afford to lose.

Consider starting with a small amount and learning as you go. Many people find it helpful to use simulation tools (like this app!) to practice before investing real money. Remember, there's no rush—take your time to learn and understand.`,
  },
]

export default function Learn() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-dark-text-primary mb-4">Learn the Basics</h1>
        <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
          Simple, beginner-friendly explanations to help you understand investing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="card hover:border-dark-accent-green/50 transition-all duration-300">
            <div className="text-4xl mb-4">{lesson.icon}</div>
            <h2 className="text-xl font-semibold text-dark-text-primary mb-4">{lesson.title}</h2>
            <p className="text-dark-text-secondary leading-relaxed whitespace-pre-line">
              {lesson.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/chat" className="btn-primary inline-block">
          Have Questions? Ask AI
        </Link>
      </div>

      <div className="mt-12 p-6 bg-dark-surface/50 border border-dark-border rounded-lg">
        <p className="text-sm text-dark-text-muted text-center">
          <strong className="text-dark-text-secondary">Remember:</strong> This content is for 
          educational purposes only and does not constitute financial advice. Always consult with 
          a qualified financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  )
}
