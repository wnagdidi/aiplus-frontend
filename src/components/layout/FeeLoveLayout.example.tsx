/**
 * 示例：展示如何在 FeeLoveLayout 及其子组件中使用 Context
 * 
 * 重要说明：
 * FeeLoveLayout 完全可以使用 layout.tsx 中提供的所有 Context，
 * 因为它是在 layout.tsx 的 {children} 中被渲染的
 */

'use client'

import { ReactNode, useState, createContext, useContext } from 'react'
import Sidebar from './Sidebar'
import MainAppBar from '@/app/[locale]/appBar'
import { cn } from '@heroui/react'

// ========== 可以使用的 Context Hooks ==========
// import { useSession } from 'next-auth/react'  // 用户会话信息
// import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'  // 订阅信息
// import { useSnackbar } from '@/context/SnackbarContext'  // 消息提示
// import { useBanner } from '@/context/BannerContext'  // Banner 控制
// import { useGTM } from '@/context/GTMContext'  // Google Tag Manager
// import { useContext as useAuthDialog } from '@/context/AuthDialogContext'  // 登录/注册对话框
// import { useContext as usePricingDialog } from '@/context/PricingDialogContext'  // 定价对话框
// import { useTranslations } from '@/hooks/useTranslations'  // 国际化

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within FeeLoveLayout')
  }
  return context
}

interface FeeLoveLayoutProps {
  children: ReactNode
  className?: string
}

export default function FeeLoveLayout({ children, className }: FeeLoveLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // ✅ 可以在这里使用所有 Context，例如：
  // const { data: session } = useSession()
  // const { subscription, isPaid, isFree } = useActiveSubscription()
  // const { showSnackbar } = useSnackbar()

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="min-h-screen bg-background">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div 
          className={cn(
            'transition-all duration-300',
            isCollapsed ? 'md:ml-16' : 'md:ml-64'
          )}
        >
          {/* Header */}
          <div className="sticky top-0 z-20">
            {/* MainAppBar 内部已经使用了 useSession 等 Context */}
            <MainAppBar alwaysShow={true} isNotBg={false} />
          </div>

          {/* Content */}
          <main className={cn('p-4 md:p-6', className)}>
            {/* children 中的所有组件都可以使用 Context */}
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

/**
 * 组件层级关系：
 * 
 * layout.tsx (根布局，提供所有 Context Providers)
 *   └─ {children} (所有页面内容)
 *        └─ FeeLoveLayout (只是一个布局包装组件)
 *             ├─ Sidebar
 *             ├─ MainAppBar (可以使用 useSession, useActiveSubscription 等)
 *             └─ {children} (页面内容，可以使用所有 Context)
 */
