'use client'

import React from 'react'
import { HeroUIProvider } from '@heroui/react'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  )
}


