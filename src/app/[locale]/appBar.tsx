// 声明这是一个客户端组件
'use client'

// 导入必要的依赖
import UserMenu from '@/app/[locale]/userMenu'
import GiftIcon from '@/components/GiftIcon'
import { useRouter } from '@/components/next-intl-progress-bar'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import { useBanner } from '@/context/BannerContext'
import { EventEntry, useGTM } from '@/context/GTMContext'
import { useTranslations } from '@/hooks/useTranslations'
import { Locale } from '@/i18n.config'
import { hoverBackgroundGradient, hoverTextColor } from '@/theme'
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  cn
} from '@heroui/react'
import NextLink from 'next/link'
import { UserIcon, ArrowLeftIcon, SparklesIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import throttle from 'lodash/throttle'
import { useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import { usePathname } from "next/navigation"
import { getLocalStorage } from '@/util/localStorage'
import { usePricingDialog } from '@/context/PricingDialogContext'

// 滚动隐藏组件
function HideOnScroll({ children, alwaysShow }: { children: React.ReactNode; alwaysShow?: boolean }) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }, 100)

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  if (alwaysShow) {
    return <>{children}</>
  }

  return (
    <div className={`transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      {children}
    </div>
  )
}

// 主应用栏组件
export default function MainAppBar({
  alwaysShow,
  isNotBg = true,
  headerClassName
}: {
  alwaysShow?: boolean
  isNotBg?: boolean
  headerClassName?: string
}) {
  // Hooks
  const t = useTranslations('Common') // 国际化
  const { toggleSignupDialog } = useContext(AuthDialogContext) // 认证对话框控制
  const { data: session } = useSession() // 用户会话
  const router = useRouter() // 路由
  const { showBanner, hideBanner, bannerVisible } = useBanner() // Banner控制
  const [scrolled, setScrolled] = useState(false) // 滚动状态
  const [isMenuOpen, setIsMenuOpen] = useState(false) // 移动端菜单状态
  const { sendEvent, reportEvent } = useGTM() // GTM事件
  const locale = useLocale() as Locale // 当前语言
  const tNewDev = useTranslations('NewDev')
  const pathname = usePathname()
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null)
  const { openDialog: openPricingDialog } = usePricingDialog()
  const [guestSession, setGuestSession] = useState<any>(null) // 访客 session

  // Only show mobile bottom nav on specific pages
  const shouldShowMobileBottomNav = (() => {
    const allowed = new Set([
      'feelove',
      'my-ai',
      'feelove-pricing',
      'feelove-disclaimer',
      'feelove-privacy',
      'feelove-terms',
      'feelove-support',
    ])
    const segs = (pathname ?? '').split('?')[0].split('#')[0].split('/').filter(Boolean)
    // Treat home ("/" or "/{locale}") as feelove
    if (segs.length === 0) return true
    // pathname is like /en/feelove or /feelove; locale is the first segment when present
    const maybeRoute = segs[0] === locale ? (segs[1] ?? 'feelove') : segs[0]
    return !!maybeRoute && allowed.has(maybeRoute)
  })()

  // 处理滚动事件（使用节流优化性能）
  const handleScroll = throttle(() => {
    setScrolled(window.scrollY > 30) // 滚动超过30px时触发
  }, 100) // 100ms的节流间隔

  // 添加滚动监听
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll) // 清理监听器
    }
  }, [handleScroll])

  // 检查并同步访客 session
  useEffect(() => {
    const updateGuestSession = () => {
      if (!session) {
        // 未登录时，检查 localStorage 中的访客 session
        try {
          const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
          if (storedSession?.user?.accessToken && storedSession.user.isGuest) {
            setGuestSession(storedSession)
          } else {
            setGuestSession(null)
          }
        } catch (error) {
          console.error('Failed to read guest session from localStorage:', error)
          setGuestSession(null)
        }
      } else {
        // 已登录时，清除访客 session
        setGuestSession(null)
      }
    }

    // 初始检查
    updateGuestSession()

    // 监听访客 session 更新事件
    const handleGuestSessionUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ session: any }>
      if (customEvent.detail?.session) {
        setGuestSession(customEvent.detail.session)
      } else {
        // 如果没有 session，重新检查 localStorage
        updateGuestSession()
      }
    }

    // 监听 localStorage 变化（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'AVOID_AI_SESSION' && !session) {
        updateGuestSession()
      }
    }

    window.addEventListener('guestSessionUpdated', handleGuestSessionUpdated)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('guestSessionUpdated', handleGuestSessionUpdated)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [session])

  // 同步积分（优先取 localStorage 的最新值，其次 session.user.creditsBalance）
  useEffect(() => {
    const updateCredits = () => {
      try {
        const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
        const storedCredits = storedSession?.user?.creditsBalance
        if (storedCredits !== undefined && storedCredits !== null) {
          setCreditsBalance(storedCredits)
          return
        }
      } catch (error) {
        console.error('Failed to read credits from localStorage:', error)
      }

      const sessionCredits = (session as any)?.user?.creditsBalance
      if (sessionCredits !== undefined) {
        setCreditsBalance(sessionCredits as number)
      }
    }

    // 初始加载时更新
    updateCredits()

    // 监听积分更新事件
    const handleCreditsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ credits: number }>
      if (customEvent.detail?.credits !== undefined) {
        setCreditsBalance(customEvent.detail.credits)
      }
    }

    // 监听访客 session 更新事件，同时更新积分
    const handleGuestSessionUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ session: any }>
      if (customEvent.detail?.session?.user?.creditsBalance !== undefined) {
        setCreditsBalance(customEvent.detail.session.user.creditsBalance)
      } else {
        updateCredits()
      }
    }

    window.addEventListener('creditsUpdated', handleCreditsUpdated)
    window.addEventListener('guestSessionUpdated', handleGuestSessionUpdated)

    return () => {
      window.removeEventListener('creditsUpdated', handleCreditsUpdated)
      window.removeEventListener('guestSessionUpdated', handleGuestSessionUpdated)
    }
  }, [session, guestSession])

  // 控制Banner显示/隐藏
  useEffect(() => {
    if (scrolled && !alwaysShow) {
      hideBanner()
    } else {
      showBanner()
    }
  }, [scrolled])

  const getPricePath = () => {
    return locale === 'en' ? '/pricing' : `/${locale}/pricing`
  }

  const getFullPath = (pathname: string) => {
    if (!pathname) {
      return locale === 'en' ? `/` : `/${locale}`
    }
    return locale === 'en' ? `/${pathname}` : `/${locale}/${pathname}`
  }

  const renderPricing = () => {
    return (
      <NextLink
        className={`flex items-center text-[12px] sm:text-sm gap-2.5 rounded px-2 py-1.5 transition-all duration-200 mobile-appbar-ft-11 group ${
          'text-foreground'
        }`}
        style={{
          background: 'transparent'
        }}
        href={getPricePath()}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = hoverBackgroundGradient
          e.currentTarget.style.color = hoverTextColor
          // 同时改变内部图标颜色
          const giftIcon = e.currentTarget.querySelector('.gift-icon') as HTMLElement | null
          if (giftIcon) {
            giftIcon.style.color = hoverTextColor
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = ''
          // 恢复内部图标颜色
          const giftIcon = e.currentTarget.querySelector('.gift-icon') as HTMLElement | null
          if (giftIcon) {
            giftIcon.style.color = ''
          }
        }}
        onClick={async (e) => {
          try {
            sendEvent('add_to_cart', { custom_data: { value: 1, location: 1 } })
            reportEvent('PricePageTab', {})
            // 同页点击时不导航，避免进度条
            if (pathname === getPricePath()) {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          } catch (error) {
            // 埋点异常不阻塞导航
            console.error('Error sending event:', error)
          }
        }}
      >
        <GiftIcon className={`hidden sm:block gift-icon transition-colors duration-200 ${
          'text-foreground'
        }`} />
        {t('pricing').toUpperCase()}
      </NextLink>
    )
  }

  const showBackButton =
    !!pathname && (pathname.includes('/generate') || pathname.includes('/image-generator'))

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      router.push(getFullPath(''))
    }
  }


  return (
    <>
      <HideOnScroll alwaysShow={true}>
        {/* 预览模式Banner和普通Banner - 固定在顶部 */}
        {/* <div className="fixed top-0 left-0 right-0 z-50">
          <PreviewModeBanner />
          <Banner />
        </div> */}

        {/* 导航栏 - 固定在banner下方 */}
        <div
          className={cn(
            'fixed left-0 right-0 z-40 transition-all duration-400 dark ease-out border-b border-pink-500/20 top-0',
            isNotBg ? 'bg-background' : 'bg-background',
            headerClassName
          )}
        >
          <div
            className={`transition-all duration-300 ${
              scrolled 
                ? 'bg-background shadow-lg' 
                : 'bg-transparent'
            }`}
          >
            <div className={`px-2.5 md:px-4`}>
              {/* 桌面端布局 - 仅在 md 及以上屏幕显示 */}
              <div className="hidden md:block">
                <Navbar
                  classNames={{
                    base: "bg-transparent shadow-none",
                    wrapper: "justify-between px-0",
                    content: "gap-4"
                  }}
                  style={{
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none'
                  }}
                  height="60px"
                  maxWidth="full"
                >
                  {/* 左侧返回按钮（仅在特定页面显示） */}
                  <NavbarContent justify="start">
                    {showBackButton && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 px-2 py-1 text-sm text-white cursor-pointer hover:opacity-80"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                    )}
                  </NavbarContent>

                  {/* 右侧菜单区域 */}
                  <NavbarContent className="flex" justify="end">
                    {/* <NavbarItem>
                      <ThemeSwitcher scrolled={scrolled} />
                    </NavbarItem> */}
                    {/* <NavbarItem>
                      <LanguageSwitcher locale={locale} scrolled={scrolled} />
                    </NavbarItem> */}
                    {/* <NavbarItem>
                      {renderPricing()}
                    </NavbarItem> */}
                    <NavbarItem>
                      {(session || guestSession) ? (
                        <div className="flex items-center gap-2">
                          {creditsBalance !== null && (
                            <div className="relative">
                              <button
                                className="flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-2.5 py-1 hover:from-purple-500/30 hover:to-pink-500/30 transition-all cursor-pointer"
                                aria-label="Credits"
                              onClick={() => openPricingDialog(EventEntry.UserMenuUpgradeButton)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-4 h-4 text-yellow-400"
                                  aria-hidden="true"
                                >
                                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                                </svg>
                                <span className="text-sm font-semibold text-white">{creditsBalance}</span>
                                <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">+</span>
                              </button>
                            </div>
                          )}
                          <UserMenu />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* 登录按钮 */}
                          <Button
                            className={`group font-normal text-sm rounded-sm h-[32px] px-[8px] transition-colors duration-200 hover:text-white ${
                              'text-foreground'
                            }`}
                            variant="light"
                            style={{
                              background: 'transparent'
                            }}
                            startContent={
                              <UserIcon className={`w-4 h-4 transition-colors duration-200 ${
                                'text-foreground'
                              }`} />
                            }
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = hoverBackgroundGradient
                              e.currentTarget.style.color = hoverTextColor
                              // 同时改变内部图标颜色
                              const userIcon = e.currentTarget.querySelector('svg') as HTMLElement | null
              if (userIcon) {
                userIcon.style.color = hoverTextColor
              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = ''
                              // 恢复内部图标颜色
                              const userIcon = e.currentTarget.querySelector('svg')
                              if (userIcon) {
                                userIcon.style.color = ''
                              }
                            }}
                            onPress={() => {
                              // 设置本地存储变量
                              localStorage.setItem('loginPosition', '1')
                              toggleSignupDialog(null, EventEntry.HeaderLoginButton)
                            }}
                          >
                            {t('login').toUpperCase()}
                          </Button>

                          {/* 免费试用按钮 */}
                          {/* <Button
                            className="bg-gradient-to-r from-[#914BEC26] to-[#507AF626] text-[#914BEC] font-bold text-sm h-8 px-1 rounded-sm"
                            variant="flat"
                            endContent={<ChevronRightIcon className="w-4 h-4" />}
                            onPress={() => {
                              // 设置本地存储变量
                              localStorage.setItem('loginPosition', '2')
                              toggleSignupDialog(null, EventEntry.HeaderTryForFreeButton)
                            }}
                          >
                            <span className="bg-gradient-to-r from-[#914BEC] to-[#507AF6] bg-clip-text text-transparent">
                              {t('try_for_free').toUpperCase()}
                            </span>
                          </Button> */}
                        </div>
                      )}
                    </NavbarItem>
                  </NavbarContent>
                </Navbar>
              </div>

              {/* 移动端布局 - 仅在 md 以下屏幕显示 */}
              <div className="block md:hidden">
                <div className="flex items-center justify-between gap-2">
                  {showBackButton && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-white cursor-pointer hover:opacity-80"
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                      <span>Back</span>
                    </button>
                  )}
                <Navbar
                  classNames={{
                    base: "bg-transparent shadow-none flex-1",
                    wrapper: "justify-end px-0 gap-0",
                    content: "gap-2"
                  }}
                  style={{
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none'
                  }}
                  height="48px"
                  maxWidth="full"
                  isMenuOpen={isMenuOpen}
                  onMenuOpenChange={setIsMenuOpen}
                >
                  {/* 左侧菜单按钮 */}
                  {/* <NavbarMenuToggle
                    className={'text-foreground'}
                    icon={<Bars3Icon className="w-5 h-5" />}
                  /> */}

                  {/* 移动端菜单 */}
                  {/* <NavbarMenu 
                    className={`bg-background/95 backdrop-saturate-none transition-all duration-700 ease-out ${
                      bannerVisible ? 'top-[105px]' : 'top-[60px]'
                    }`}
                  >
                    <NavbarMenuItem>
                      <NextLink
                        className="w-full text-center py-2"
                        href={getFullPath('')}
                        onClick={(e) => {
                          setIsMenuOpen(false)
                          reportEvent('ClickTabHumanize', {})
                          if (pathname === getFullPath('')) {
                            e.preventDefault()
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                        }}
                      >
                        {tNewDev('tab1_name')}
                      </NextLink>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                      <NextLink
                        className="w-full text-center py-2"
                        href={getFullPath('ai-translator')}
                        onClick={(e) => {
                          setIsMenuOpen(false)
                          reportEvent('ClickTabTranslator', {})
                          if (pathname === getFullPath('ai-translator')) {
                            e.preventDefault()
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                        }}
                      >
                        {tNewDev('tab6_name')}
                      </NextLink>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                      <NextLink
                        className="w-full text-center py-2"
                        href={getFullPath('ai-detector')}
                        onClick={(e) => {
                          setIsMenuOpen(false)
                          reportEvent('ClickTabDetector', {})
                          if (pathname === getFullPath('ai-detector')) {
                            e.preventDefault()
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                        }}
                      >
                        {tNewDev('tab2_name')}
                      </NextLink>
                    </NavbarMenuItem>
                  </NavbarMenu> */}

                  {/* 主题切换器 */}
                  {/* <NavbarItem>
                    <ThemeSwitcher scrolled={scrolled} />
                  </NavbarItem> */}

                  {/* 语言切换器 */}
                  {/* <NavbarItem>
                    <LanguageSwitcher locale={locale} scrolled={scrolled} />
                  </NavbarItem> */}

                  {/* 定价按钮 */}
                  {/* <NavbarItem>
                    {renderPricing()}
                  </NavbarItem> */}

                  {/* 用户菜单/登录按钮 */}
                  <NavbarItem>
                    {(session || guestSession) ? (
                      <div className="flex items-center gap-2">
                        {creditsBalance !== null && (
                          <div className="relative">
                            <button
                              className="flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-2.5 py-1 hover:from-purple-500/30 hover:to-pink-500/30 transition-all cursor-pointer"
                              aria-label="Credits"
                              onClick={() => openPricingDialog(EventEntry.UserMenuUpgradeButton)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4 text-yellow-400"
                                aria-hidden="true"
                              >
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                              </svg>
                              <span className="text-sm font-semibold text-white">{creditsBalance}</span>
                              <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">+</span>
                            </button>
                          </div>
                        )}
                        <UserMenu />
                      </div>
                    ) : (
                      <div className="flex items-center gap-0">
                        {/* 登录按钮 */}
                        <Button
                          className={`px-2 mobile-appbar-ft-11 group transition-colors duration-200 hover:text-white ${
                            'text-foreground'
                          }`}
                          variant="light"
                          size="sm"
                          style={{
                            background: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = hoverBackgroundGradient
                            e.currentTarget.style.color = hoverTextColor
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = ''
                          }}
                          onPress={() => {
                            // 设置本地存储变量
                            localStorage.setItem('loginPosition', '1')
                            toggleSignupDialog(null, EventEntry.HeaderLoginButton)
                          }}
                        >
                          {t('login').toUpperCase()}
                        </Button>
                        {/* 免费试用按钮 */}
                        {/* <Button
                          className="bg-gradient-to-r from-[#914BEC26] to-[#507AF626] text-[#914BEC] font-bold h-8 px-1 rounded-sm"
                          variant="flat"
                          size="sm"
                          onPress={() => toggleSignupDialog(null, EventEntry.HeaderTryForFreeButton)}
                        >
                          <span className="bg-gradient-to-r from-[#914BEC] to-[#507AF6] bg-clip-text text-transparent">
                            {t('try_for_free').toUpperCase()}
                          </span>
                        </Button> */}
                      </div>
                    )}
                  </NavbarItem>
                </Navbar>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HideOnScroll>

      {/* Mobile Bottom Navigation */}
      {shouldShowMobileBottomNav && (
        <div className="md:hidden">
          <nav
            className="fixed inset-x-0 bottom-0 z-40 bg-black/85 backdrop-blur-md border-t border-pink-500/20"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="relative h-16 px-3">
              <div className="flex items-end justify-around h-full pb-2">
                {/* Explore */}
                <button
                  type="button"
                  onClick={() => router.push(getFullPath('feelove'))}
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 text-xs py-2 transition-colors',
                    pathname?.includes('/feelove') ? 'text-white' : 'text-gray-400'
                  )}
                  aria-label="Explore"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                      'w-5 h-5 mb-1',
                      pathname?.includes('/feelove') ? 'text-white' : 'text-gray-400'
                    )}
                    aria-hidden="true"
                  >
                    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  <span>Explore</span>
                </button>

                {/* Generate (center) */}
                <button
                  type="button"
                  onClick={() => router.push(getFullPath('generate'))}
                  className="-mt-8 touch-manipulation"
                  aria-label="Generate"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-1 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-lg shadow-pink-500/50 border-4 border-black transition-all duration-300 active:scale-95 hover:scale-105">
                    <SparklesIcon className="w-7 h-7 text-white" />
                  </div>
                </button>

                {/* Pricing */}
                <button
                  type="button"
                  onClick={() => router.push(getFullPath('feelove-pricing'))}
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 text-xs py-2 transition-colors',
                    pathname?.includes('/feelove-pricing') ? 'text-white' : 'text-gray-400'
                  )}
                  aria-label="Pricing"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                      'w-5 h-5 mb-1',
                      pathname?.includes('/feelove-pricing') ? 'text-white' : 'text-gray-400'
                    )}
                    aria-hidden="true"
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                  </svg>
                  <span>Pricing</span>
                </button>

                {/* My */}
                <button
                  type="button"
                  onClick={() => router.push(getFullPath('my-ai'))}
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 text-xs py-2 transition-colors',
                    pathname?.includes('/my-ai') ? 'text-white' : 'text-gray-400'
                  )}
                >
                  <div className="mb-1 relative">
                  {((session as any)?.user?.avatar || guestSession?.user?.avatar) ? (
                      <img
                      src={(session as any)?.user?.avatar || guestSession?.user?.avatar}
                      alt={(session as any)?.user?.name || guestSession?.user?.name || 'avatar'}
                        className={cn(
                          'w-6 h-6 rounded-full border object-cover',
                          pathname?.includes('/my-ai') ? 'border-pink-500' : 'border-white/20'
                        )}
                      />
                    ) : (
                      <UserCircleIcon
                        className={cn(
                          'h-6 w-6',
                          pathname?.includes('/my-ai') ? 'text-pink-300' : 'text-white/55'
                        )}
                      />
                    )}
                  </div>
                  <span>My</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
