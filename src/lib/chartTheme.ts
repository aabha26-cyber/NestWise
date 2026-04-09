'use client'

function isLightMode() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('light')
}

export function getChartTheme() {
  const light = isLightMode()
  return {
    tooltip: {
      backgroundColor: light ? '#fff' : '#1f1f1f',
      titleColor: light ? '#0f172a' : '#f5f5f5',
      bodyColor: light ? '#475569' : '#a0a0a0',
      borderColor: light ? '#e2e8f0' : '#2a2a2a',
      borderWidth: 1,
    },
    grid: light ? '#e2e8f0' : '#2a2a2a',
    ticks: light ? '#64748b' : '#6b6b6b',
  }
}
