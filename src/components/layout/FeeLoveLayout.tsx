'use client'

import { ReactNode, useState, createContext, useContext, Dispatch, SetStateAction, useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import MainAppBar from '@/app/[locale]/appBar'
import Footer from '@/app/[locale]/home/footer'
import { cn } from '@heroui/react'
import { useSession } from 'next-auth/react'
import { getUserProfile } from '@/api/client/feeLoveApi'
import { getLocalStorage } from '@/util/localStorage'

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

interface CreditsContextType {
  creditsBalance: number | null
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)
const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within FeeLoveLayout')
  }
  return context
}

export const useCredits = () => {
  const context = useContext(CreditsContext)
  if (!context) {
    throw new Error('useCredits must be used within FeeLoveLayout')
  }
  return context
}

interface FeeLoveLayoutProps {
  children: ReactNode
  className?: string
}

export default function FeeLoveLayout({ children, className }: FeeLoveLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { data: session } = useSession()
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null)
  const fetchingRef = useRef(false) // 防止重复调用
  const lastUserIdRef = useRef<string | null>(null) // 记录上次获取积分的用户ID

  const backgroundGradient = {
    background: '#1e1e2e',
    backgroundImage: 'linear-gradient(to bottom right in oklab, #000 0%, color-mix(in oklab, lab(24.9401% 45.2703 -51.2728) 20%,transparent) 50%, color-mix(in oklab, lab(29.4367% 49.3962 3.35757) 20%,transparent) 100%)'
  }

  // 获取用户最新积分并更新 appBar（支持登录用户和访客用户）
  useEffect(() => {
    const fetchAndUpdateCredits = async () => {
      // 检查是否有用户（登录用户或访客用户）
      let currentUser: any = null
      let currentUserId: string | null = null
      
      if (session?.user) {
        // 登录用户
        currentUser = session.user
        currentUserId = (session as any)?.user?.id || (session as any)?.user?.email || null
      } else {
        // 检查访客用户
        try {
          const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
          if (storedSession?.user?.accessToken && storedSession.user.isGuest) {
            currentUser = storedSession.user
            currentUserId = storedSession.user.id || storedSession.user.email || 'guest'
          }
        } catch (error) {
          console.error('Failed to read guest session:', error)
        }
      }

      // 如果没有用户，重置积分
      if (!currentUser) {
        lastUserIdRef.current = null
        fetchingRef.current = false
        setCreditsBalance(null)
        return
      }

      // 如果正在获取中，或者用户ID没有变化，则跳过
      if (fetchingRef.current || lastUserIdRef.current === currentUserId) {
        // 但如果 localStorage 中已有积分，先使用它
        if (currentUser.creditsBalance !== undefined && currentUser.creditsBalance !== null) {
          setCreditsBalance(currentUser.creditsBalance)
        }
        return
      }

      // 标记为正在获取
      fetchingRef.current = true
      lastUserIdRef.current = currentUserId

      try {
        const profileData = await getUserProfile()
        if (profileData?.creditsBalance !== undefined) {
          const newCredits = profileData.creditsBalance
          
          // 更新 state，供子组件使用
          setCreditsBalance(newCredits)
          
          // 更新 localStorage 中的积分
          try {
            const sessionData = getLocalStorage<any>('AVOID_AI_SESSION')
            if (sessionData && sessionData.user) {
              sessionData.user.creditsBalance = newCredits
              localStorage.setItem('AVOID_AI_SESSION', JSON.stringify(sessionData))
            }
          } catch (error) {
            console.error('Failed to update credits in localStorage:', error)
          }

          // 触发自定义事件，通知 appBar 更新积分
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: { credits: newCredits } }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile for credits:', error)
        // 获取失败时，尝试使用 localStorage 中的积分
        if (currentUser.creditsBalance !== undefined && currentUser.creditsBalance !== null) {
          setCreditsBalance(currentUser.creditsBalance)
        }
        // 获取失败时重置，允许重试
        lastUserIdRef.current = null
      } finally {
        // 重置获取状态
        fetchingRef.current = false
      }
    }

    fetchAndUpdateCredits()

    // 监听访客 session 更新事件
    const handleGuestSessionUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ session: any }>
      if (customEvent.detail?.session?.user?.creditsBalance !== undefined) {
        setCreditsBalance(customEvent.detail.session.user.creditsBalance)
        // 重置 lastUserIdRef，允许重新获取
        lastUserIdRef.current = null
      }
      // 触发重新获取
      fetchAndUpdateCredits()
    }

    window.addEventListener('guestSessionUpdated', handleGuestSessionUpdated)

    return () => {
      window.removeEventListener('guestSessionUpdated', handleGuestSessionUpdated)
    }
  }, [session])

  // 监听积分更新事件（从其他地方更新时同步）
  useEffect(() => {
    const handleCreditsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ credits: number }>
      if (customEvent.detail?.credits !== undefined) {
        setCreditsBalance(customEvent.detail.credits)
      }
    }

    window.addEventListener('creditsUpdated', handleCreditsUpdated)

    return () => {
      window.removeEventListener('creditsUpdated', handleCreditsUpdated)
    }
  }, [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <CreditsContext.Provider value={{ creditsBalance }}>
        <div className="min-h-screen dark pt-[48px] md:pt-[60px]">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div
          className={cn('transition-all duration-300', isCollapsed ? 'md:ml-16' : 'md:ml-64')}
        >
          {/* Header */}
          <MainAppBar
            alwaysShow={true}
            isNotBg={false}
            headerClassName={
              isCollapsed
                ? 'md:left-16 md:w-[calc(100%-4rem)]'
                : 'md:left-64 md:w-[calc(100%-16rem)]'
            }
          />

          {/* Content */}
          <main className="w-full" style={{ minHeight: 'calc(100vh)', ...backgroundGradient }}>
            <div className="flex min-h-[calc(100vh)] flex-col">
              <div className={cn('flex-1', className)}>
                {children}
              </div>
            </div>
            <Footer />
          </main>
        </div>
      </div>
      </CreditsContext.Provider>
    </SidebarContext.Provider>
  )
}
