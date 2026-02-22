export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  description: string
  whyInvest: string
}

export const mockStocks: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 185.50,
    change: 2.30,
    changePercent: 1.25,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company is known for its iPhone, Mac, iPad, and Apple Watch products.',
    whyInvest: 'Many people invest in Apple because it\'s a well-established technology company with strong brand loyalty, consistent innovation, and a diverse product ecosystem. The company generates significant revenue from services like the App Store and iCloud, providing recurring income beyond hardware sales.',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.80,
    change: -1.20,
    changePercent: -0.83,
    description: 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.',
    whyInvest: 'Alphabet is attractive to investors because of its dominant position in online search and advertising. The company also has significant investments in cloud computing, artificial intelligence, and autonomous vehicles, which could drive future growth.',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.90,
    change: 3.50,
    changePercent: 0.93,
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates through Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments.',
    whyInvest: 'Microsoft appeals to investors due to its strong presence in enterprise software, cloud computing (Azure), and productivity tools (Office 365). The company has successfully transitioned to a subscription-based model, providing predictable recurring revenue.',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 245.20,
    change: -5.80,
    changePercent: -2.31,
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
    whyInvest: 'Some investors are drawn to Tesla because of its leadership in electric vehicles and renewable energy. The company has a strong brand and is working on expanding its manufacturing capacity globally. However, it\'s important to note that the stock can be volatile.',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 152.30,
    change: 1.10,
    changePercent: 0.73,
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally. The company operates through three segments: North America, International, and Amazon Web Services (AWS).',
    whyInvest: 'Amazon attracts investors because of its dominant e-commerce platform and its highly profitable cloud computing division (AWS). The company has a vast logistics network and continues to expand into new markets and services.',
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 485.60,
    change: 8.20,
    changePercent: 1.72,
    description: 'Meta Platforms, Inc. engages in the development of products that help people connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.',
    whyInvest: 'Some investors consider Meta because of its large user base across Facebook, Instagram, and WhatsApp. The company is also investing heavily in virtual and augmented reality technologies, which could represent future growth opportunities.',
  },
]

export function searchStocks(query: string): Stock[] {
  if (!query.trim()) return mockStocks
  
  const lowerQuery = query.toLowerCase()
  return mockStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
  )
}

export function getStockBySymbol(symbol: string): Stock | undefined {
  return mockStocks.find((stock) => stock.symbol.toUpperCase() === symbol.toUpperCase())
}
