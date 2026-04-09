'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('nestwise_splash_shown') === '1') return

    setVisible(true)
    sessionStorage.setItem('nestwise_splash_shown', '1')

    const fadeTimer = setTimeout(() => setFadeOut(true), 1600)
    const hideTimer = setTimeout(() => setVisible(false), 2200)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-dark-bg transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ willChange: 'opacity' }}
      aria-hidden
    >
      <div className="relative flex flex-col items-center gap-4">
        {/* Glowing backdrop */}
        <div className="absolute w-40 h-40 rounded-full bg-dark-accent-green/20 blur-3xl animate-pulse" />

        {/* Coin */}
        <div className="nestwise-coin relative w-24 h-24 sm:w-28 sm:h-28">
          <div className="nestwise-coin-inner">
            {/* Front face */}
            <div className="nestwise-coin-face nestwise-coin-front">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(88,204,2,0.5)" strokeWidth="3" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(88,204,2,0.25)" strokeWidth="1.5" />
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
            {/* Back face */}
            <div className="nestwise-coin-face nestwise-coin-back">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(88,204,2,0.5)" strokeWidth="3" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(88,204,2,0.25)" strokeWidth="1.5" />
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

        {/* Name */}
        <p className="text-dark-accent-green font-extrabold text-lg sm:text-xl tracking-wide nestwise-splash-text">
          NestWise
        </p>
      </div>
    </div>
  )
}
