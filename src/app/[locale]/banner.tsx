'use client'
import * as React from 'react'
import { Button } from '@heroui/react'
import {useTranslations} from '@/hooks/useTranslations'
import {usePricingDialog} from '@/context/PricingDialogContext'
import { ClockIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useGTM } from '@/context/GTMContext'
import {primaryColor} from '@/theme'
import {useBanner} from "@/context/BannerContext";
import {useRouter} from '@/components/next-intl-progress-bar'
import { useLocale } from 'next-intl'
import { usePathname } from "next/navigation";

export default function Banner() {
  const t = useTranslations('Common')
  const { openDialog: openPricingDialog } = usePricingDialog()
  const { bannerVisible, ackBanner } = useBanner()
  const router = useRouter()
  const { sendEvent } = useGTM() // GTM事件
  const locale = useLocale() as Locale
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false)
  const [endDate, setEndDate] = React.useState('')
  const [isVisible, setIsVisible] = React.useState(false)

  // 仅在客户端生成动态文本，避免 SSR/CSR 文本不一致
  React.useEffect(() => {
    setMounted(true)
    setEndDate(getEndDate())
    
    // 延迟显示动画，确保组件已挂载
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const getPricePath = () => {
    return locale === 'en' ? '/pricing' : `/${locale}/pricing`
  }

  const getFullPath = (pathname: string) => {
    if (!pathname) {
      return locale === 'en' ? `/` : `/${locale}`
    }
    return locale === 'en' ? `/${pathname}` : `/${locale}/${pathname}`
  }

  if (!bannerVisible) {
    return null
  }

  // 在服务端渲染时显示占位内容，避免布局抖动
  if (!mounted) {
    return (
      <div className="relative text-center bg-gradient-to-r from-[rgb(72,127,247)] to-[rgb(150,72,235)] pt-3 pb-2 pl-2 pr-7 text-white opacity-0">
        <div className="inline-flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-1">
            <ClockIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-[13px] sm:text-[14px] leading-[13px] md:leading-4">{t('banner_caption')}</span>
              <span className="font-bold text-[13px] sm:text-[14px] leading-[13px] md:leading-4">
                {t('banner_countdown', { date: 'Loading...' })}
              </span>
            </div>
          </div>
          <div className="hidden sm:block w-px h-5 bg-white"/>
          <span className="text-[14px] sm:text-[16px] md:text-[20px]">New Year Sales :</span>
          <span className="text-[16px] sm:text-[18px] md:text-[24px] -ml-0 md:-ml-1">{t('banner_discount', { percent: '80%' })}</span>
          <a
            href="#"
            className="banner-btn-item"
            onClick={(e) => e.preventDefault()}
          >
            {t('save_now')}
            <ChevronRightIcon className="w-4 h-4 inline ml-1" />
          </a>
        </div>
        <button onClick={ackBanner} aria-label="close" className="absolute right-2 top-3 text-white">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const handleRoute = () => {
    router.push('/pricing')
  }

  return (
    <div className={`relative text-center bg-gradient-to-r from-[rgb(72,127,247)] to-[rgb(150,72,235)] pt-3 pb-2 pl-2 pr-7 text-white transition-all duration-700 ease-out ${
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 -translate-y-2'
    }`}>
      <div className="inline-flex items-center gap-2 flex-wrap">
        <div className="hidden sm:flex items-center gap-1">
          <ClockIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
          <div className="flex flex-col items-start">
            <span className="font-bold text-[13px] sm:text-[14px] leading-[13px] md:leading-4">{t('banner_caption')}</span>
            <span className="font-bold text-[13px] sm:text-[14px] leading-[13px] md:leading-4" suppressHydrationWarning>
              {t('banner_countdown', { date: endDate })}
            </span>
          </div>
        </div>
        <div className="hidden sm:block w-px h-5 bg-white"/>
        <span className="text-[14px] sm:text-[16px] md:text-[20px]">New Year Sales :</span>
        <span className="text-[16px] sm:text-[18px] md:text-[24px] -ml-0 md:-ml-1">{t('banner_discount', { percent: '80%' })}</span>
        {/* <Button
          onClick={handleRoute}
          variant="contained"
          disableElevation
          size="small"
          endIcon={<EastIcon />}
          className="icon-transition-x icon-small"
          sx={{
            ml: { xs: 0, sm: 2, md: 4 },
            backgroundColor: 'white',
            color: primaryColor,
            borderRadius: '24px',
            fontWeight: 'bold',
            lineHeight: '0.875rem',
            '&:hover': { backgroundColor: '#f5f5f5', color: primaryColor },
          }}
        >
          {t('save_now')}
        </Button> */}
        <a
          href="#"
          className="banner-btn-item"
          onClick={async (e) => {
            try {
              e.preventDefault()
              // 先发送事件
              await sendEvent('add_to_cart', {
                custom_data: {
                  value: 1,
                  location: 6
                },
              })
              // 然后进行页面跳转
              window.location.href = getPricePath()
            } catch (error) {
              console.error('Error sending event:', error)
              // 即使事件发送失败也继续跳转
              window.location.href = getPricePath()
            }
          }}
        >
          {t('save_now')}
          <ChevronRightIcon className="w-4 h-4 inline ml-1" />
        </a>
      </div>
      <button onClick={ackBanner} aria-label="close" className="absolute right-2 top-3 text-white">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

function getEndDate(daysToAdd = 3) {
  const date = new Date()
  date.setDate(date.getDate() + daysToAdd)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
  const month = monthNames[date.getMonth()]
  const day = date.getDate()
  const daySuffix = getDaySuffix(day)

  return `${month} ${day}${daySuffix}`
}

function getDaySuffix(day) {
  if (day >= 11 && day <= 13) {
    return 'th'
  }
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
