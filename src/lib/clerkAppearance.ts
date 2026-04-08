'use client'

import { dark } from '@clerk/themes'

const vars = {
  colorPrimary: '#58cc02',
  colorText: '#f8fafc',
  colorTextSecondary: '#cbd5e1',
  colorBackground: '#1e293b',
  colorInputBackground: '#0f172a',
  colorInputText: '#f8fafc',
  borderRadius: '0.75rem',
} as const

/** Shared Clerk UI — dark base + NestWise green (readable forms, no broken overrides). */
export const nestWiseClerkAppearance = {
  baseTheme: dark,
  variables: { ...vars },
  /** UserProfile reads this key from ClerkProvider — avoids a duplicate `appearance` merge on the component. */
  userProfile: {
    baseTheme: dark,
    variables: { ...vars },
  },
}
