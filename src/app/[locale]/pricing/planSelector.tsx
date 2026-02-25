'use client'
import {useTranslations} from '@/hooks/useTranslations'
import DurationSelector from '@/app/[locale]/pricing/durationSelector'
import * as React from 'react'
import {useState, useMemo} from 'react'
import {Plan, PlanDuration} from '@/api/core/billing'
import PlanCard from '@/app/[locale]/pricing/planCard'
import PaymentMethodsControl from '@/app/[locale]/pricing/paymentMethodsControl'
import PaymentMethodsStrip from '@/app/[locale]/pricing/paymentMethodsStrip'
import sortBy from 'lodash/sortBy'
import ContactIcon from '@/components/ContactIcon'
import { Button } from '@heroui/react'
import { useRouter } from "@/components/next-intl-progress-bar"
import { usePathname } from "next/navigation"
import { Locale } from '@/i18n.config'
import { useLocale } from 'next-intl'
import { CheckIcon } from '@heroicons/react/24/outline'
import { getPaymentMethods } from '@/api/client/feeLoveApi'


interface PlanSelectorProps {
  plans: Plan[]
  onBuy: (plan: Plan,isCanBuy: boolean,isUpgrade?: boolean) => void
  compact?: boolean
  planToBuy?: Plan
  creatingOrder: boolean
}

const priceTitleStyle = {
  fontFamily: 'Source Han Sans SC',
  fontWeight: '900',
  fontSize: '40px',
  textAlign: 'center',
  background: 'linear-gradient(90deg, #9E53FF 35.28%, #507AF6 64.55%)',
  backgroundClip: 'text',
  color: 'transparent'
}

export default function PlanSelector({plans: allPlans, planToBuy, creatingOrder, onBuy, compact }: PlanSelectorProps) {
  const t = useTranslations('Billing')
  const router = useRouter()
  const [duration, setDuration] = useState(PlanDuration.Yearly)
  const [paymentMethodsList, setPaymentMethodsList] = useState<any[]>([])
  const pathname = usePathname()
  const locale = useLocale() as Locale // 当前语言
  const getFullPath = (pathname: string) => {
    if (!pathname) {
      return locale === 'en' ? `/` : `/${locale}`
    }
    return locale === 'en' ? `/${pathname}` : `/${locale}/${pathname}`
  }

  // 是否为 pricing 页面（用于决定标题语义标签）
  const isPricingPage = pathname === (locale === 'en' ? '/pricing' : `/${locale}/pricing`)
  const TitleTag: any = isPricingPage ? 'h1' : 'p'

  if (!allPlans) {
      return []
  }

  const plans = allPlans.filter((plan) => plan.tags.includes(duration) && plan.originPriceOneMonth > 0)
  const recommendedPlan = plans[0]
  // if (fullScreen) {
  //   plans[1] = plans[2]
  //   plans[2] = plans[0]
  //   plans[0] = recommendedPlan
  // }

  const handleDurationChange = (newDuration: PlanDuration) => {
    setDuration(newDuration)
  }
  const durations = useMemo(() => {
    const result = allPlans.reduce<string[]>((result, plan) => {
      const duration = plan.tags[0]
      if (plan.realPriceOneMonth > 0 && Object.values(PlanDuration).includes(duration as PlanDuration) && !result.includes(duration)) {
        result.push(duration)
      }
      return result
    }, [])
    return sortBy(result, (o: string) => o).sort((a, b) => a > b ? 1 : 0)
  }, [allPlans])

  // 计算最大折扣
  const maxDiscount = useMemo(() => {
    if (!allPlans || allPlans.length === 0) return 0
    return Math.max(...allPlans.map(plan => plan.discount * 100))
  }, [allPlans])

  // 计算每个 plan 的节省金额，并标记最高的为 bestValue（用于黄色高亮）
  const savingsList = useMemo(() => {
    if (!allPlans || allPlans.length === 0) return []
    const calcSavings = (plan: Plan) => {
      const duration = plan.tags[0]
      const isLifetime = duration === PlanDuration.Lifetime
      const isMonthly = duration === PlanDuration.Monthly
      const months = isMonthly || isLifetime ? 1 : plan.months || 1
      const origin = plan.originPriceOneMonth * months
      const price = plan.realPriceOneMonth
      return Math.max(origin - price, 0)
    }
    return allPlans.map(calcSavings)
  }, [allPlans])

  const maxSavings = savingsList.length ? Math.max(...savingsList) : 0
  const maxSavingsIndex = savingsList.findIndex(s => s === maxSavings && maxSavings > 0)

  React.useEffect(() => {
    let mounted = true
    const fetchPaymentMethods = async () => {
      try {
        const methods = await getPaymentMethods()
        let list: any[] = []
        if (Array.isArray(methods)) list = methods
        else if (methods?.items && Array.isArray(methods.items)) list = methods.items
        else if (methods?.data && Array.isArray(methods.data)) list = methods.data
        if (mounted) setPaymentMethodsList(list)
      } catch (e) {
        // ignore: fall back to built-in icons list in UI
        if (mounted) setPaymentMethodsList([])
      }
    }
    fetchPaymentMethods()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <>
      {/* Header Section - Different styles for dialog vs page */}
      {compact ? (
        // Dialog mode (compact)
        <div className="text-center my-4">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Choose Your Plan</h2>
          <p className="text-gray-400 mb-10">Subscription plans or flexible credit packs • Your creativity, your way</p>
          
          {/* Credit Conversion Info */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-blue-300">
              <span className="font-semibold">🎬 1 video = 20 credits</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-300">
              <span className="font-semibold">🖼️ 1 image = 5 credits</span>
            </div>
          </div>

          {/* Save More Button */}
          {maxDiscount > 0 && (
            <div className="mt-6 flex justify-center">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gift w-4 h-4 text-pink-400" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>
                <span className="text-sm font-medium text-pink-300">Buy more, save more - up to {maxDiscount.toFixed(0)}% off</span>
              </button>
            </div>
          )}

          {/* Payment methods strip */}
          <PaymentMethodsStrip methods={paymentMethodsList} />
        </div>
      ) : (
        // Page mode (full)
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Choose Your <span className="block bg-linear-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Pleasure Plan</span>
          </h1>
          <p className="hidden sm:block text-xl text-gray-300 max-w-3xl mx-auto">Unlock the full potential of AI-powered video generation. From curious beginners to professional creators.</p>
          
          {/* Benefits List */}
          {/* <div className="hidden sm:flex items-center justify-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span className="text-white/80">No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span className="text-white/80">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span className="text-white/80">Instant access</span>
            </div>
          </div> */}

          {/* Credit Conversion Info */}
          <div className="mt-6 py-2 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-blue-300">
              <span className="font-semibold">🎬 1 video = 20 credits</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-300">
              <span className="font-semibold">🖼️ 1 image = 5 credits</span>
            </div>
          </div>

          {/* Save More Button */}
          {maxDiscount > 0 && (
            <div className="mt-4 flex justify-center">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gift w-4 h-4 text-pink-400" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>
                <span className="text-sm font-medium text-pink-300">Buy more, save more - up to {maxDiscount.toFixed(0)}% off</span>
              </button>
            </div>
          )}

          {/* Payment methods strip */}
          <PaymentMethodsStrip methods={paymentMethodsList} />
        </div>
      )}
      {/* <div className="text-center mt-3">
        <DurationSelector isOpen={isOpen} duration={duration} durations={durations} onChange={handleDurationChange} />
      </div> */}
      <div className="cardBox mt-8 mb-4 w-full text-center">
        <div className="max-w-[1400px] mx-auto px-2 md:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5 max-w-5xl mx-auto items-stretch">
            {allPlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                allPlans={allPlans}
                plan={plan}
                onBuy={onBuy}
                planToBuy={planToBuy}
                creatingOrder={creatingOrder}
                selected={recommendedPlan ? plan.id === recommendedPlan.id : false}
                compact={compact}
                cardIndex={index}
                bestValue={index === maxSavingsIndex}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Features Section - Hidden in compact (dialog) mode */}
      {/* {!compact && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span>Credits Never Expire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span>Instant Delivery</span>
          </div>
        </div>
      )} */}
      
      {/* <PaymentMethodsControl /> */}
      
      {/* <div className="contactWrapper w-full text-center mt-10">
        <div className="contactBox w-full sm:w-auto inline-flex px-5 py-[15px] bg-[#1D1623] rounded-[10px] flex-col sm:flex-row items-center justify-between gap-2 sm:gap-10">
          <div>
            <div className="text-base text-[#9F39FC] font-semibold text-left">{t('contact_us_title')}</div>
            <div className="text-sm text-white font-normal mt-1">{t('contact_us_content')}</div>
          </div>
          <Button 
            onClick={() => router.push("/contact-us")} 
            startContent={<ContactIcon className="text-white" />}
            className="rounded-sm min-w-[160px] h-9 text-[15px] font-medium text-white bg-gradient-to-r from-[#00d3fe] to-[#006ffd] hover:from-[#00b9e4] hover:to-[#005ae0] shadow-[0_2px_10px_0_#00395924] transition-colors duration-200"
          >
            {t('contact_us_button')}
          </Button>
        </div>
      </div> */}
    </>
  )
}
