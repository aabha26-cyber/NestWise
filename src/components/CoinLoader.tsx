'use client'

export default function CoinLoader({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="nestwise-coin relative w-12 h-12">
        <div className="nestwise-coin-inner" style={{ animation: 'nestwise-coin-spin 1.2s linear infinite' }}>
          <div className="nestwise-coin-face nestwise-coin-front">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(88,204,2,0.5)" strokeWidth="3" />
              <text
                x="50"
                y="58"
                textAnchor="middle"
                fontSize="48"
                fontWeight="800"
                fill="#58cc02"
                fontFamily="system-ui, sans-serif"
              >
                $
              </text>
            </svg>
          </div>
          <div className="nestwise-coin-face nestwise-coin-back">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(88,204,2,0.5)" strokeWidth="3" />
              <text
                x="50"
                y="56"
                textAnchor="middle"
                fontSize="26"
                fontWeight="800"
                fill="#58cc02"
                fontFamily="system-ui, sans-serif"
              >
                NW
              </text>
            </svg>
          </div>
        </div>
      </div>
      {text && <p className="text-dark-text-secondary text-sm">{text}</p>}
    </div>
  )
}
