export interface Resource {
  title: string
  url: string
  type: 'article' | 'video'
  source: string
  description?: string
}

export interface Lesson {
  id: string
  title: string
  icon: string
  content: string
  articles?: Resource[]
  videos?: Resource[]
}

export interface CourseModule {
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  icon: string
  modules: CourseModule[]
}

export const courses: Course[] = [
  {
    id: 'basics',
    title: 'Investing Basics',
    description: 'Understand stocks, markets, and how investing works.',
    icon: '📈',
    modules: [
      {
        title: 'Core Concepts',
        lessons: [
          {
            id: 'what-is-stock',
            title: 'What is a Stock?',
            icon: '📈',
            content: `A stock represents ownership in a company. When you buy a stock, you're buying a small piece of that company. If the company does well and becomes more valuable, your stock might increase in value too. If the company struggles, your stock might decrease in value.

Stocks are traded on stock exchanges, and their prices change throughout the day based on supply and demand. It's important to remember that stock prices can be volatile and there's always risk involved.`,
            articles: [
              { title: 'What Is a Stock?', url: 'https://www.investopedia.com/terms/s/stock.asp', type: 'article', source: 'Investopedia', description: 'Clear definition and types of stocks' },
              { title: 'Stocks: An Introduction', url: 'https://www.sec.gov/investor/pubs/begin.htm', type: 'article', source: 'SEC', description: 'Official SEC guide for beginners' },
            ],
            videos: [
              { title: 'What is a Stock?', url: 'https://www.youtube.com/watch?v=4FhJk_XQq7M', type: 'video', source: 'The Plain Bagel', description: 'Beginner-friendly explanation' },
              { title: 'How Does the Stock Market Work?', url: 'https://www.youtube.com/watch?v=p7HKvqRI_Bo', type: 'video', source: 'Investopedia', description: 'Overview of how markets work' },
            ],
          },
          {
            id: 'market-basics',
            title: 'Market Basics',
            icon: '🏛️',
            content: `Stock markets are places where stocks are bought and sold. The price of a stock is determined by supply and demand—if more people want to buy a stock than sell it, the price goes up. If more people want to sell than buy, the price goes down.

Markets can be influenced by many factors: company performance, economic news, investor sentiment, and more. It's normal for markets to go up and down over time.`,
            articles: [
              { title: 'Stock Market Basics', url: 'https://www.investopedia.com/terms/s/stockmarket.asp', type: 'article', source: 'Investopedia' },
              { title: 'How to Read a Stock Chart', url: 'https://www.investopedia.com/articles/technical/02/041702.asp', type: 'article', source: 'Investopedia' },
            ],
            videos: [
              { title: 'Stock Market for Beginners', url: 'https://www.youtube.com/watch?v=Tu8zR0Z0Hc0', type: 'video', source: 'Khan Academy' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'etfs-bonds',
    title: 'ETFs & Bonds',
    description: 'Learn about funds and fixed income.',
    icon: '📦',
    modules: [
      {
        title: 'Funds and Fixed Income',
        lessons: [
          {
            id: 'etfs',
            title: 'ETFs Explained',
            icon: '📦',
            content: `An ETF (Exchange-Traded Fund) is like a basket that holds many different stocks, bonds, or other investments. When you buy an ETF, you're buying a small piece of that entire basket.

ETFs can help with diversification because you're spreading your investment across many companies or assets rather than just one. They're traded like stocks on exchanges, but they give you exposure to a whole collection of investments. Some people find ETFs simpler than picking individual stocks.`,
            articles: [
              { title: 'What Is an ETF?', url: 'https://www.investopedia.com/terms/e/etf.asp', type: 'article', source: 'Investopedia' },
              { title: 'ETFs vs Mutual Funds', url: 'https://www.nerdwallet.com/article/investing/etfs-vs-mutual-funds', type: 'article', source: 'NerdWallet' },
            ],
            videos: [
              { title: 'Index Funds vs ETFs', url: 'https://www.youtube.com/watch?v=QhBv2BJPLew', type: 'video', source: 'The Plain Bagel' },
              { title: 'What is an ETF?', url: 'https://www.youtube.com/watch?v=0F0EQKqnp2c', type: 'video', source: 'Charles Schwab' },
            ],
          },
          {
            id: 'bonds',
            title: 'What Are Bonds?',
            icon: '📄',
            content: `A bond is a loan you make to a company or government. In return, they pay you interest over time and return the principal when the bond matures. Bonds are often considered less risky than stocks but typically offer lower potential returns.

Bonds can add stability to a portfolio and are used by many investors for income and diversification.`,
            articles: [
              { title: 'What Is a Bond?', url: 'https://www.investopedia.com/terms/b/bond.asp', type: 'article', source: 'Investopedia' },
              { title: 'Bonds for Beginners', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products', type: 'article', source: 'SEC Investor.gov' },
            ],
            videos: [
              { title: 'Bonds Explained', url: 'https://www.youtube.com/watch?v=5-M_L7nYDQ8', type: 'video', source: 'Khan Academy' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'risk-diversification',
    title: 'Risk & Diversification',
    description: 'Manage risk and build a balanced portfolio.',
    icon: '🎯',
    modules: [
      {
        title: 'Risk and Portfolio',
        lessons: [
          {
            id: 'risk-reward',
            title: 'Risk vs Reward',
            icon: '⚖️',
            content: `All investments carry some level of risk. Generally, the potential for higher returns comes with higher risk. Stocks can be volatile—their prices go up and down, sometimes significantly.

Bonds are often considered less risky than stocks, but they typically offer lower potential returns. It's important to understand your own risk tolerance—how comfortable you are with the possibility of losing money. Only invest money you can afford to lose, and remember that past performance doesn't guarantee future results.`,
            articles: [
              { title: 'Risk and Return', url: 'https://www.investopedia.com/terms/r/riskreturntradeoff.asp', type: 'article', source: 'Investopedia' },
              { title: 'Understanding Risk', url: 'https://www.investor.gov/introduction-investing/investing-basics/understanding-risk', type: 'article', source: 'SEC Investor.gov' },
            ],
            videos: [
              { title: 'Risk and Return', url: 'https://www.youtube.com/watch?v=4NpY2bS0A2M', type: 'video', source: 'Khan Academy' },
              { title: 'How Much Risk Should You Take?', url: 'https://www.youtube.com/watch?v=GJqPwQ0y2_4', type: 'video', source: 'Ben Felix' },
            ],
          },
          {
            id: 'diversification',
            title: 'Diversification',
            icon: '🎯',
            content: `Diversification means spreading your investments across different types of assets, industries, or companies. The idea is that if one investment performs poorly, others might perform better, which can help reduce overall risk.

Think of it as "not putting all your eggs in one basket." However, diversification doesn't guarantee profits or protect against all losses. It's one strategy to consider, but it's important to do your own research and understand what you're investing in.`,
            articles: [
              { title: 'Diversification', url: 'https://www.investopedia.com/terms/d/diversification.asp', type: 'article', source: 'Investopedia' },
              { title: 'Asset Allocation', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/asset-allocation', type: 'article', source: 'SEC Investor.gov' },
            ],
            videos: [
              { title: 'Diversification Explained', url: 'https://www.youtube.com/watch?v=0WBWPs7C8-c', type: 'video', source: 'The Plain Bagel' },
              { title: 'Why Diversification Matters', url: 'https://www.youtube.com/watch?v=FZ5cOHsFq_s', type: 'video', source: 'Ben Felix' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Practical steps for new investors.',
    icon: '🚀',
    modules: [
      {
        title: 'First Steps',
        lessons: [
          {
            id: 'getting-started',
            title: 'Getting Started',
            icon: '🚀',
            content: `If you're new to investing, start by learning the basics. Understand what you're investing in, do your research, and never invest more than you can afford to lose.

Consider starting with a small amount and learning as you go. Many people find it helpful to use simulation tools (like this app!) to practice before investing real money. Remember, there's no rush—take your time to learn and understand.`,
            articles: [
              { title: 'Getting Started', url: 'https://www.investor.gov/introduction-investing/getting-started', type: 'article', source: 'SEC Investor.gov' },
              { title: 'Investing 101', url: 'https://www.nerdwallet.com/article/investing/investing-101', type: 'article', source: 'NerdWallet' },
            ],
            videos: [
              { title: 'Investing for Beginners', url: 'https://www.youtube.com/watch?v=uKhXo8B1TcM', type: 'video', source: 'The Plain Bagel' },
              { title: 'How to Start Investing', url: 'https://www.youtube.com/watch?v=O5dT4R_O2-k', type: 'video', source: 'Patrick Boyle' },
            ],
          },
        ],
      },
    ],
  },
]
