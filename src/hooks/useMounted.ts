'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true only after the component has mounted on the client.
 * Use this to gate any render that differs between SSR and CSR
 * (Clerk auth state, localStorage, Math.random, etc.) so React's
 * initial hydration pass always matches the server-rendered HTML.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return mounted
}
