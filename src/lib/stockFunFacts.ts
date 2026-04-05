/** Kid-friendly fun facts — educational, not trading advice. */

const GENERIC = [
  'Many big companies started small — learning what a business does is step one before thinking about the stock.',
  'A stock is a tiny slice of ownership in a company. If the company does well over time, that slice can be worth more — but it can also go down.',
  'The price you see jumps around because buyers and sellers agree on trades all day long.',
]

const BY_SYMBOL: Record<string, string[]> = {
  AAPL: ['Apple is famous for the iPhone, but it also makes money from services like the App Store and cloud storage.'],
  MSFT: ['Microsoft makes Windows and Xbox, and also sells tools that businesses use in the cloud.'],
  GOOGL: ['Google’s parent company earns a lot from ads when people search the web.'],
  AMZN: ['Amazon started as an online bookstore and grew into a huge store *and* a cloud-computing powerhouse.'],
  TSLA: ['Tesla is best known for electric cars and invests a lot in batteries and self-driving tech.'],
  NVDA: ['Nvidia designs chips that power video games and also train many AI models.'],
  DIS: ['Disney owns theme parks, movies, and streaming — lots of ways to earn from stories people love.'],
  KO: ['Coca-Cola sells drinks in almost every country — a classic example of a “consumer” brand.'],
  SPY: ['SPY is an ETF: one purchase can spread money across many big US companies at once.'],
  QQQ: ['QQQ tracks tech-heavy Nasdaq stocks — useful to learn how “growth” companies move together.'],
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function getFunFact(symbol: string, name: string): string {
  const sym = symbol.toUpperCase()
  const list = BY_SYMBOL[sym]
  if (list?.length) {
    return list[hash(sym + name) % list.length]
  }
  return GENERIC[hash(sym) % GENERIC.length]
}
