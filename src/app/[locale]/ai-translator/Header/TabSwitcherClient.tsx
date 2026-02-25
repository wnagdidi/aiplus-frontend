'use client'

import { useRouter, useSearchParams } from 'next/navigation'
// import MultilingualTranslation from '@/app/[locale]/home/multilingual-translation'

export default function TabSwitcherClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const handleTabChange = (newTab: string) => {
    // const params = new URLSearchParams(searchParams.toString())
    // params.set('tab', newTab)
    // router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div>Tab Switcher (MultilingualTranslation component not available)</div>
    // <MultilingualTranslation getTabType={handleTabChange} />
  )
} 