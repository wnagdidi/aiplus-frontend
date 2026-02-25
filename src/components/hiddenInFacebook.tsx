'use client'
import { useEffect, useState } from 'react'
import { isMetaApp } from '@/util/browser'

export default function HiddenInFacebook({ children }: any) {
  const [isMeta, setIsMeta] = useState(false)

  useEffect(() => {
    setIsMeta(isMetaApp())
  }, [])

  if (isMeta) {
    return null
  }

  return children
}
