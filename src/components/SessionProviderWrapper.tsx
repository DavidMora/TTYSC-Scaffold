'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

export function SessionProviderWrapper({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus={true} refetchWhenOffline={false}>
      {children}
    </SessionProvider>
  )
}
