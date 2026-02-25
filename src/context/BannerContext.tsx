'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { isInIframe } from '@/util/browser'

export const BannerContext = createContext({
  needToShowBanner: false,
  bannerVisible: false,
  ackBanner: () => {},
  hideBanner: () => {},
  showBanner: () => {},
})

export const BannerContextProvider = ({ children }: any) => {
  // 使用 mounted 状态避免 SSR/CSR 不匹配
  const [mounted, setMounted] = useState(false)
  const [needToShowBanner, setNeedToShowBanner] = useState<boolean>(false)
  const [bannerVisible, setBannerVisible] = useState<boolean>(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // 仅在客户端挂载后设置状态
  useEffect(() => {
    setMounted(true)
    const ack = localStorage.getItem('ACK_BANNER')
    const shouldShow = !ack && !isInIframe()
    setNeedToShowBanner(shouldShow)
    setBannerVisible(shouldShow)
    setIsInitialized(true)
  }, [])

  const ackBanner = () => {
    localStorage.setItem('ACK_BANNER', 'ack')
    setNeedToShowBanner(false)
    setBannerVisible(false)
  }

  const hideBanner = () => {
    if (!needToShowBanner) {
      return
    }
    setBannerVisible(false)
  }

  const showBanner = () => {
    if (!needToShowBanner) {
      return
    }
    setBannerVisible(true)
  }

  return (
    <BannerContext.Provider
      value={{
        needToShowBanner,
        bannerVisible,
        ackBanner,
        hideBanner,
        showBanner,
      }}
    >
      {children}
    </BannerContext.Provider>
  )
}

export const useBanner = () => {
  return useContext(BannerContext)
}
