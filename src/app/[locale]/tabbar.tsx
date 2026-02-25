'use client'
import React, { Suspense } from 'react'
import HumanizeControl from '@/app/[locale]/humanize/humanizeControl'
import { useGTM } from '@/context/GTMContext' // 导入Google Tag Manager上下文
import { useTranslations } from '@/hooks/useTranslations'
import { Locale } from '@/i18n.config'
import { AnalyticsEventType } from '@/utils/events/analytics'
import { useLocale } from 'next-intl'
import { hoverBackgroundGradient } from '@/theme'
import { useRouter } from 'next/navigation'

export default function HumanizeWrapper(props: any) {
  const { currentTab, hiddenTab = false, eagerAI = false } = props
  const tNewDev = useTranslations('NewDev')
  const locale = useLocale() as Locale
  const { sendEvent, reportEvent } = useGTM() // 获取GTM事件发送函数
  const router = useRouter()

  const getRootPath = () => {
    return locale === 'en' ? '/' : `/${locale}`
  }

  const getAIPath = () => {
    return locale === 'en' ? '/ai-detector' : `/${locale}/ai-detector`
  }

  return (
    <div className="code-wrapper">
      {!hiddenTab && (
        <div className="filter flex justify-center mt-8">
          <div className="content inline-flex items-center p-[5px] rounded-[20px] bg-[rgb(247,250,255)] border border-[rgba(55,83,117,0.1)] gap-2">
            <a
              className={`h-[30px] px-5 rounded-[15px] flex items-center justify-center cursor-pointer transition-colors duration-200 ${
                currentTab === 0
                  ? 'bg-gradient-to-r from-[#00d3fe] to-[#006ffd] text-white'
                  : 'text-[#375375]'
              }`}
              style={{
                background: currentTab === 0 ? hoverBackgroundGradient : 'transparent'
              }}
            onMouseEnter={(e) => {
                if (currentTab === 0) {
                  // 已选中按钮的 hover 效果：灰色背景，白色文字
                  e.currentTarget.style.background = '#e5e7eb'
                  e.currentTarget.style.color = '#fff'
                } else {
                  // 未选中按钮的 hover 效果：蓝色渐变背景，白色文字
                  e.currentTarget.style.background = hoverBackgroundGradient
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseLeave={(e) => {
                if (currentTab === 0) {
                  // 恢复已选中按钮的默认样式：蓝色渐变背景，白色文字
                  e.currentTarget.style.background = hoverBackgroundGradient
                  e.currentTarget.style.color = '#fff'
                } else {
                  // 恢复未选中按钮的默认样式：透明背景，深色文字
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#375375'
                }
              }}
              href={getRootPath()}
            >
              {tNewDev('tab1_name')}
            </a>
            <a
              className={`h-[30px] px-5 rounded-[15px] flex items-center justify-center cursor-pointer transition-colors duration-200 ${
                currentTab === 1
                  ? 'bg-gradient-to-r from-[#00d3fe] to-[#006ffd] text-white'
                  : 'text-[#375375]'
              }`}
              style={{
                background: currentTab === 1 ? hoverBackgroundGradient : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (currentTab === 1) {
                  // 已选中按钮的 hover 效果：灰色背景，白色文字
                  e.currentTarget.style.background = '#e5e7eb'
                  e.currentTarget.style.color = '#fff'
                } else {
                  // 未选中按钮的 hover 效果：蓝色渐变背景，白色文字
                  e.currentTarget.style.background = hoverBackgroundGradient
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseLeave={(e) => {
                if (currentTab === 1) {
                  // 恢复已选中按钮的默认样式：蓝色渐变背景，白色文字
                  e.currentTarget.style.background = hoverBackgroundGradient
                  e.currentTarget.style.color = '#fff'
                } else {
                  // 恢复未选中按钮的默认样式：透明背景，深色文字
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#375375'
                }
              }}
              href={getAIPath()}
              onClick={(e) => {
                e.preventDefault()
                try {
                  reportEvent(AnalyticsEventType.SWITCH_TAB_DETECTOR, {
                    custom_data: {
                      currency: 'USD',
                      value: 1,
                    },
                  })
                  // 使用 Next.js 路由进行 SPA 导航，避免页面重新加载
                  router.push(getAIPath())
                } catch (error) {
                  console.error('Error sending event:', error)
                  router.push(getAIPath())
                }
              }}
            >
              {tNewDev('tab2_name')}
            </a>
          </div>
        </div>
      )}

      {currentTab === 0 ? (
        <HumanizeControl />
      ) : (
        eagerAI ? (
          <AIControlEager />
        ) : (
          <Suspense fallback={<ToolSkeleton />}>
            <AIControlLazy />
          </Suspense>
        )
      )}
      {/* <MultilingualTranslation /> */}
    </div>
  )
}

const ToolSkeleton = () => (
  <div className="mt-6 max-w-screen-2xl mx-auto">
    <div className="rounded-xl border border-[rgba(55,83,117,0.1)] bg-white/60 backdrop-blur-sm">
      <div className="h-[560px] sm:h-[620px] w-full animate-pulse">
        <div className="h-full w-full bg-[rgba(55,83,117,0.06)]" />
      </div>
    </div>
  </div>
)

const AIControlLazy = React.lazy(() => import('@/app/[locale]/ai-detector/aiControl'))
import AIControlEager from '@/app/[locale]/ai-detector/aiControl'
