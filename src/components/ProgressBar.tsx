'use client'
import { useBanner } from '@/context/BannerContext'
import {AppProgressBar} from "@/components/next-intl-progress-bar";

export default function ProgressBar() {
  const { bannerVisible } = useBanner()
  const primaryColor = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#6841ea' : '#6841ea'
  return (
    <AppProgressBar
      key={'ProgressBar-' + bannerVisible}
      height="1px"
      color={bannerVisible ? 'white' : primaryColor}
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}
