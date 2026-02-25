'use client'

import { ReactNode, useState, createContext, useContext, Dispatch, SetStateAction } from 'react'
import Sidebar from './Sidebar'
import MainAppBar from '@/app/[locale]/appBar'
import Footer from '@/app/[locale]/home/footer'
import { cn } from '@heroui/react'

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

  const backgroundGradient = {
    background: '#1e1e2e',
    backgroundImage: 'linear-gradient(to bottom right in oklab, #000 0%, color-mix(in oklab, lab(24.9401% 45.2703 -51.2728) 20%,transparent) 50%, color-mix(in oklab, lab(29.4367% 49.3962 3.35757) 20%,transparent) 100%)'
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
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
    </SidebarContext.Provider>
  )
}
