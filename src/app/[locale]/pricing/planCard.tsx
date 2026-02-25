'use client'
import { useTranslations } from '@/hooks/useTranslations'
import { Tooltip } from '@heroui/react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { Plan, PlanDuration } from '@/api/core/billing'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { EventEntry, useGTM } from '@/context/GTMContext'


interface PlanCardProps {
  selected?: boolean
  allPlans: Plan[]
  plan: Plan
  onBuy: (plan: Plan,isCanBuy: boolean,isUpgrade: boolean) => void
  compact?: boolean
  planToBuy?: Plan
  creatingOrder: boolean
  cardIndex?: number
  bestValue?: boolean
}
export default function PlanCard({ allPlans, plan, onBuy, planToBuy, creatingOrder, selected, compact, cardIndex = 0, bestValue = false }: PlanCardProps) {
  const tCommon = useTranslations('Common')
  const t = useTranslations('Billing')
  const { sendEvent, reportEvent } = useGTM()
  // 获取最近一次打开来源
  const { lastOpenEntry } = usePricingDialog()
  // 是否是推荐弹窗触发的
  const isTimerTriggered = lastOpenEntry === EventEntry.RecommendPricingTimer
  // theme colors migrated to Tailwind/HeroUI
  const { isPaid, subscription } = useActiveSubscription()
  // Removed isCurrent check to allow re-purchasing
  const isLifetime = plan?.tags[0] === PlanDuration.Lifetime
  const isMonthly = plan?.tags[0] === PlanDuration.Monthly
  // Removed isDowngrade check to allow re-purchasing

  const getTotal = (money?: number, type?: string) => {
    if(!money) return
    if(type == 'lifetime') {
      return money
    } else if(type == 'monthly') {
      return money
    } else if(type == 'quarterly') {
      return money * 3
    } else if(type == 'yearly') {
      return money * 12
    }
  }
  // Removed isDowngrade function to allow re-purchasing

  const handleBuyFn = () => {
    if(isTimerTriggered) {
      reportEvent('BeginCheckoutPassive', {})
    }else {
      reportEvent('BeginCheckoutActive', {})
    }
    
    sendEvent('begin_checkout', {
      custom_data: {
        content_ids: plan.id,
        contents: allPlans,
        currency: 'USD',
        num_items: 1,
        value: plan?.realFullPrice || 1,                     // 事件价值
      }
    })

    return onBuy(plan, true, true) // Allow purchasing without restrictions
  }
  // console.log(isDowngrade())
  // console.log(subscription)
  const isUnlimited = plan?.wordsLimitOneMonth === 0
  const isWordsPerRequestUnlimited = plan?.wordsLimitOneTimes === 0
  const isCreatingOrderForCurrent = creatingOrder && planToBuy?.id === plan.id
  const isCreatingOrderForOther = creatingOrder && planToBuy?.id !== plan.id

  // 计算 credits、videos、images
  // 假设 wordsLimitOneMonth 就是 credits，或者需要从 plan 的其他字段获取
  const credits = plan.wordsLimitOneMonth || 0
  const videos = Math.floor(credits / 20)
  const images = Math.floor(credits / 5)
  
  // 计算价格
  const price = isPaid ? (plan.upgradePriceOneMonth || plan.realPriceOneMonth) : plan.realPriceOneMonth
  const originPrice = plan.originPriceOneMonth * (isMonthly ? 1 : (isLifetime ? 1 : plan.months))
  const perVideoCost = videos > 0 ? (price / videos).toFixed(2) : '0.00'
  const savings = originPrice - price

  // 根据 plan 属性判断高亮状态（save 最大优先黄色，其余 popular 为紫色）
  const isBestValue = bestValue === true
  const isPopular = !isBestValue && plan.popular === true
  const isHighlighted = isPopular || isBestValue

  // 获取卡片样式类（黄色优先于紫色）
  const getCardClasses = (index: number) => {
    if (isBestValue) {
      return "relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-br from-yellow-950/50 via-amber-900/30 to-orange-950/30 md:from-yellow-950/40 md:via-amber-900/20 border-2 border-yellow-500/60 shadow-lg shadow-yellow-500/20 p-3 md:p-5 flex flex-col h-full"
    } else if (isPopular) {
      return "relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-br from-purple-950/50 via-pink-900/30 to-purple-950/30 md:from-purple-950/40 md:via-pink-900/20 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 p-3 md:p-5 flex flex-col h-full"
    } else {
      return "relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 hover:border-gray-600/60 p-3 md:p-5 flex flex-col h-full"
    }
  }

  // 获取 credits 容器样式（黄色优先）
  const getCreditsBoxClasses = (index: number) => {
    if (isBestValue) {
      return "rounded-lg md:rounded-xl py-2 md:py-3 px-3 md:px-4 mb-2 md:mb-4 bg-gradient-to-br from-yellow-500/15 md:from-yellow-500/20 to-orange-500/10 border border-yellow-500/30"
    } else if (isPopular) {
      return "rounded-lg md:rounded-xl py-2 md:py-3 px-3 md:px-4 mb-2 md:mb-4 bg-gradient-to-br from-purple-500/15 md:from-purple-500/20 to-pink-500/10 border border-purple-500/30"
    } else {
      return "rounded-lg md:rounded-xl py-2 md:py-3 px-3 md:px-4 mb-2 md:mb-4 bg-gray-800/60 border border-gray-700/50"
    }
  }

  // 获取 credits 文字颜色（黄色优先）
  const getCreditsColor = (index: number) => {
    if (isBestValue) return "text-yellow-400"
    if (isPopular) return "text-purple-400"
    return "text-pink-400"
  }

  // 获取按钮样式（黄色优先）
  const getButtonClasses = (index: number) => {
    if (isBestValue) {
      return "cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-xs md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-yellow-500 to-orange-500 md:from-yellow-500 md:via-amber-500 md:to-orange-500 hover:from-yellow-400 hover:to-orange-400 md:hover:from-yellow-400 md:hover:via-amber-400 md:hover:to-orange-400 px-3 md:px-8 w-full font-semibold md:font-bold rounded-lg md:rounded-xl transition-all duration-300 h-9 md:h-12 text-black md:shadow-lg md:shadow-yellow-500/30 mt-auto"
    } else if (isPopular) {
      return "cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-xs md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-purple-500 to-pink-500 md:from-purple-500 md:via-pink-500 md:to-rose-500 hover:from-purple-400 hover:to-pink-400 md:hover:from-purple-400 md:hover:via-pink-400 md:hover:to-rose-400 px-3 md:px-8 w-full font-semibold md:font-bold rounded-lg md:rounded-xl transition-all duration-300 h-9 md:h-12 text-white md:shadow-lg md:shadow-purple-500/30 mt-auto"
    } else {
      return "cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-xs md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-3 md:px-8 w-full font-semibold md:font-bold rounded-lg md:rounded-xl transition-all duration-300 h-9 md:h-12 bg-gray-700 hover:bg-gray-600 text-white mt-auto"
    }
  }

  // 获取折扣标签样式（黄色优先）
  const getDiscountBadgeClasses = (index: number) => {
    if (isBestValue) {
      return "bg-yellow-500/30 md:bg-yellow-500/20 text-yellow-300 px-1.5 md:px-2 py-0.5 rounded md:rounded-full text-[9px] md:text-[10px] font-bold"
    } else if (isPopular) {
      return "bg-purple-500/30 md:bg-purple-500/20 text-purple-300 px-1.5 md:px-2 py-0.5 rounded md:rounded-full text-[9px] md:text-[10px] font-bold"
    } else if (cardIndex === 2) {
      return "bg-green-500/20 text-green-400 px-1.5 md:px-2 py-0.5 rounded md:rounded-full text-[9px] md:text-[10px] font-bold"
    } else {
      return "bg-purple-500/20 text-purple-300 px-1.5 md:px-2 py-0.5 rounded md:rounded-full text-[9px] md:text-[10px] font-bold"
    }
  }

  // 获取 SAVE 标签样式（黄色优先）
  const getSaveBadgeClasses = (index: number) => {
    if (isBestValue) {
      return "inline-flex items-center gap-1 px-3 py-1.5 rounded-full mb-4 text-xs font-bold bg-yellow-500/20 text-yellow-300"
    } else if (isPopular) {
      return "inline-flex items-center gap-1 px-3 py-1.5 rounded-full mb-4 text-xs font-bold bg-purple-500/20 text-purple-300"
    } else if (cardIndex === 2) {
      return "inline-flex items-center gap-1 px-3 py-1.5 rounded-full mb-4 text-xs font-bold bg-green-500/15 text-green-400"
    } else {
      return "inline-flex items-center gap-1 px-3 py-1.5 rounded-full mb-4 text-xs font-bold bg-purple-500/20 text-purple-300"
    }
  }

  return (
    <div className={getCardClasses(cardIndex)}>
      {/* Top gradient bar for highlighted cards */}
      {isHighlighted && (
        <div className={cn(
          "absolute top-0 left-0 w-full h-0.5 md:h-1",
          isPopular ? "bg-gradient-to-r from-purple-500 to-pink-500 md:from-purple-500 md:via-pink-500 md:to-rose-500" : "bg-gradient-to-r from-yellow-500 to-orange-500 md:from-yellow-500 md:via-amber-500 md:to-orange-500"
        )}></div>
      )}

      {/* Blur background effect for highlighted cards */}
      {isHighlighted && (
        <div className={cn(
          "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl",
          isPopular ? "bg-purple-500/5" : "bg-yellow-500/5"
        )}></div>
      )}

      {/* Popular/Best Value Badge - Top Center */}
      {isHighlighted && (
        <div className="absolute -top-px left-1/2 transform -translate-x-1/2 z-10">
          <div className={cn(
            "text-white px-2 md:px-4 py-0.5 md:py-1.5 rounded-b-lg md:rounded-b-xl text-[9px] md:text-xs font-bold tracking-wide md:shadow-lg",
            isBestValue ? "bg-gradient-to-r from-yellow-500 to-orange-500 md:from-yellow-500 md:via-amber-500 md:to-orange-500" : "bg-gradient-to-r from-purple-500 to-pink-500 md:from-purple-500 md:via-pink-500 md:to-rose-500"
          )}>
            {isBestValue ? "Best Value" : (plan.badge || "Popular")}
          </div>
        </div>
      )}

      {/* Discount Badge - Top Right */}
      {plan.discount > 0 && (
        <div className={cn(
          "absolute right-1 z-10",
          isHighlighted ? "top-6" : "top-1"
        )}>
          <div className={getDiscountBadgeClasses(cardIndex)}>
            {/* Show icon only on desktop */}
            <span className="hidden md:inline-flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                <path d="M16 7h6v6"></path>
                <path d="m22 7-8.5 8.5-5-5L2 17"></path>
              </svg>
            </span>
            <span>{`-${(plan.discount * 100).toFixed(0)}%`}</span>
            <span className="hidden md:inline"> OFF</span>
          </div>
        </div>
      )}

      <div className={cn("text-center flex flex-col flex-1", isHighlighted ? "pt-3 md:pt-4" : "pt-1 md:pt-2")}>
        {/* Credits Display */}
        <div className={getCreditsBoxClasses(cardIndex)}>
          <div className={cn("text-xl md:text-3xl font-black", getCreditsColor(cardIndex))}>
            {credits.toLocaleString()}
          </div>
          <div className={cn("text-[9px] md:text-xs font-medium", getCreditsColor(cardIndex), "opacity-70")}>
            credits
          </div>
        </div>

        {/* Videos/Images Count */}
        <div className="hidden md:flex items-center justify-center gap-2 mb-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-film w-3.5 h-3.5" aria-hidden="true">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M7 3v18"></path>
              <path d="M3 7.5h4"></path>
              <path d="M3 12h18"></path>
              <path d="M3 16.5h4"></path>
              <path d="M17 3v18"></path>
              <path d="M17 7.5h4"></path>
              <path d="M17 16.5h4"></path>
            </svg>
            <span className="text-white font-semibold">{videos}</span> videos
          </span>
          <span className="text-gray-600">or</span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image w-3.5 h-3.5" aria-hidden="true">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
            <span className="text-white font-semibold">{images}</span> images
          </span>
        </div>
        {/* Mobile: Simple text without icons */}
        <div className="md:hidden text-[10px] text-gray-400 mb-2">
          {videos} videos or {images} imgs
        </div>

        {/* Price Display */}
        <div className="mb-2 md:mb-4">
          {plan.discount > 0 && originPrice > price && (
            <div className="text-[10px] md:text-sm text-gray-500 line-through mb-0.5 md:mb-1">
              ${Math.floor(originPrice)}<span className="hidden md:inline">.{(Math.round((originPrice % 1) * 100)).toString().padStart(2, '0')}</span>
            </div>
          )}
          <div className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-1">
            ${Math.floor(price)}<span className="text-sm md:text-2xl">.{(Math.round((price % 1) * 100)).toString().padStart(2, '0')}</span>
          </div>
          {videos > 0 && (
            <div className="hidden md:block text-xs text-gray-500">
              ${perVideoCost}/video
            </div>
          )}
        </div>

        {/* Savings Badge - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex mb-4 min-h-[32px] items-center justify-center">
          {savings > 0 && (
            <div className={cn(getSaveBadgeClasses(cardIndex), "px-3 py-1.5 text-xs")}>
              SAVE ${savings.toFixed(0)}
            </div>
          )}
        </div>

        {/* Button */}
        {plan.name.toLowerCase() !== 'free' && (
          <button
            onClick={handleBuyFn}
            disabled={isCreatingOrderForCurrent}
            className={cn(
              getButtonClasses(cardIndex),
              isCreatingOrderForCurrent && "opacity-50 cursor-not-allowed"
            )}
          >
            {isCreatingOrderForCurrent ? (
              <span>Loading...</span>
            ) : isPaid ? (
              <span className="flex items-center gap-1 md:gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap w-3.5 h-3.5 md:w-4 md:h-4 hidden md:block" aria-hidden="true">
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
                <span className="hidden sm:inline">{tCommon('upgrade_now')}</span>
                <span className="sm:hidden">Upgrade</span>
                {plan.upgradePriceOneMonth && (
                  <Tooltip content={<div className="text-sm">{t('upgrade_enjoy')}<br/>{t('upgrade_tips',{upgradeTotalPrice:'$'+plan.upgradePriceOneMonth,realTotalPrice:'$'+plan.realPriceOneMonth})}</div>}>
                    <InformationCircleIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </Tooltip>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 md:gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap w-3.5 h-3.5 md:w-4 md:h-4 hidden md:block" aria-hidden="true">
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
                <span>Get {videos} Videos</span>
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
