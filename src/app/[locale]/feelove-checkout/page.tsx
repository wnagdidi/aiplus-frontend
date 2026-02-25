'use client'

import Footer from '@/app/[locale]/home/footer'
import MainAppBar from '@/app/[locale]/appBar'
import { Card, CardBody, Spinner } from '@heroui/react'
import { ArrowLeftIcon, ClockIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@heroui/react'
import { useGTM } from '@/context/GTMContext'
import { defaultLDScript } from '@/app/[locale]/pageLD'
import { getCheckoutDetail, getPaymentMethods, getPaymentIntent } from '@/api/client/feeLoveApi'
import { getPlans } from '@/api/client/billingApi'
import { Plan } from '@/api/core/billing'

interface PaymentMethod {
  id: string
  name: string
  icon: string
  description?: string
  recommended?: boolean
  color: string
  paymentMethodCode: string
  paymentMethodName: string
}

const paymentMethods: PaymentMethod[] = []

// 获取支付方式图标路径
const getPaymentIcon = (method: PaymentMethod): string | null => {
  // 添加空值检查
  if (!method || (!(method as any).paymentMethodName && !method.id)) {
    return null
  }
  
  // 确保转换为字符串后再调用 toLowerCase
  const name = String((method as any).paymentMethodName || '').toLowerCase()
  const id = String(method.id || '').toLowerCase()
  
  // 国际主流支付平台不需要显示 icon
  if (name.includes('国际主流支付平台') || name.includes('international') || name.includes('主流支付')) {
    return null
  }
  
  // 根据名称或ID匹配对应的 SVG 文件
  if (name.includes('cash app') || name.includes('cashapp') || id.includes('cashapp') || id.includes('cash')) {
    return '/feelove/pay/cashapp.svg'
  }
  if (name.includes('paypal') || id.includes('paypal')) {
    return '/feelove/pay/paypal-icon.svg'
  }
  if (name.includes('google pay') || id.includes('googlepay') || id.includes('google')) {
    return '/feelove/pay/google-pay-icon.svg'
  }
  if (name.includes('apple pay') || id.includes('applepay') || id.includes('apple')) {
    return '/feelove/pay/apple-pay-icon.svg'
  }
  if (name.includes('usdt') || name.includes('加密货币') || id.includes('usdt') || id.includes('crypto')) {
    return '/feelove/pay/usdt.svg'
  }
  
  return null
}

// 获取支付方式图标容器背景色
const getPaymentIconBgColor = (method: PaymentMethod): string => {
  // 添加空值检查
  if (!method || (!(method as any).paymentMethodName && !method.id)) {
    return 'bg-white/5'
  }
  
  // 确保转换为字符串后再调用 toLowerCase
  const name = String((method as any).paymentMethodName || '').toLowerCase()
  const id = String(method.id || '').toLowerCase()
  
  // 根据名称或ID匹配对应的背景色
  if (name.includes('cash app') || name.includes('cashapp') || id.includes('cashapp') || id.includes('cash')) {
    return 'bg-[#0bd83b]' // Cash App - 亮绿色
  }
  if (name.includes('paypal') || id.includes('paypal')) {
    return 'bg-[#0b76bd]' // PayPal - 深蓝色
  }
  if (name.includes('google pay') || id.includes('googlepay') || id.includes('google')) {
    return 'bg-white' // Google Pay - 白色
  }
  if (name.includes('apple pay') || id.includes('applepay') || id.includes('apple')) {
    return 'bg-black' // Apple Pay - 黑色
  }
  if (name.includes('usdt') || name.includes('加密货币') || id.includes('usdt') || id.includes('crypto')) {
    return 'bg-[#2fa581]' // Tether/USDT - 青绿色
  }
  
  return 'bg-white/5' // 默认背景色
}

export default function FeeLoveCheckoutPage() {
  const { sendEvent } = useGTM()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30分钟倒计时，默认1800秒
  const [selectedPayment, setSelectedPayment] = useState<string>('stripe')
  const [loading, setLoading] = useState(false)
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true)
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [paymentMethodsList, setPaymentMethodsList] = useState<PaymentMethod[]>(paymentMethods)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string>('')
  const [paymentTimer, setPaymentTimer] = useState(30 * 60) // 30分钟倒计时
  const [selectedPaymentName, setSelectedPaymentName] = useState<string>('')
  const [processingPayment, setProcessingPayment] = useState<string | null>(null) // 正在处理的支付方式ID
  const [sessionTimedOut, setSessionTimedOut] = useState(false) // 会话超时状态
  const [allPlans, setAllPlans] = useState<Plan[]>([]) // 所有计划列表

  // Mock data - should be fetched from API based on session_id
  const creditPack = {
    credits: checkoutData?.credit || 140,
    price: checkoutData?.originalAmount || 29.99,
    currency: checkoutData?.currency || 'USD',
    description: checkoutData?.planTips || 'Perfect for getting started'
  }

  // 获取所有计划列表
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await getPlans()
        setAllPlans(plans)
      } catch (error) {
        console.error('Failed to get plans:', error)
      }
    }

    fetchPlans()
  }, [])

  // 获取支付方式列表
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setPaymentMethodsLoading(true)
      try {
        const methods = await getPaymentMethods(sessionId || undefined)
        console.log('Payment methods:', methods)
        // 如果返回的是数组，直接使用；如果是对象，可能需要转换
        if (Array.isArray(methods)) {
          setPaymentMethodsList(methods)
        } else if (methods?.items && Array.isArray(methods.items)) {
          setPaymentMethodsList(methods.items)
        } else if (methods?.data && Array.isArray(methods.data)) {
          setPaymentMethodsList(methods.data)
        }
        // 如果返回的数据中有默认选中的支付方式，设置它
        if (methods?.default || methods?.defaultMethod) {
          setSelectedPayment(methods.default || methods.defaultMethod)
        }
      } catch (error) {
        console.error('Failed to get payment methods:', error)
        // 如果获取失败，使用默认的静态数据
        setPaymentMethodsList(paymentMethods)
      } finally {
        setPaymentMethodsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [sessionId])

  // 获取结账详情
  useEffect(() => {
    const fetchCheckoutDetail = async () => {
      if (!sessionId) {
        return
      }

      setLoading(true)
      try {
        const detail = await getCheckoutDetail(sessionId)
        setCheckoutData(detail.session)
      } catch (error) {
        console.error('Failed to get checkout detail:', error)
        // TODO: 处理错误，例如显示错误提示或跳转回定价页面
      } finally {
        setLoading(false)
      }
    }

    fetchCheckoutDetail()
  }, [sessionId])

  // 初始化倒计时，从 localStorage 恢复或创建新的
  useEffect(() => {
    const STORAGE_KEY = `checkout_timer_${sessionId || 'default'}`
    const TIMER_DURATION = 30 * 60 // 30分钟

    // 检查是否有已存储的开始时间
    const storedStartTime = localStorage.getItem(STORAGE_KEY)
    let remainingTime = TIMER_DURATION

    if (storedStartTime) {
      // 计算剩余时间
      const startTime = parseInt(storedStartTime, 10)
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      remainingTime = Math.max(0, TIMER_DURATION - elapsed)
    } else {
      // 创建新的开始时间
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    }

    setTimeLeft(remainingTime)

    // 如果已经超时，直接显示超时页面
    if (remainingTime <= 0) {
      setSessionTimedOut(true)
      return
    }

    // 开始倒计时
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // 清除 localStorage
          localStorage.removeItem(STORAGE_KEY)
          // 如果还没有选择支付方式，显示超时页面
          if (!showPaymentModal) {
            setSessionTimedOut(true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionId, showPaymentModal])

  // 支付弹窗倒计时
  useEffect(() => {
    if (!showPaymentModal) return

    const timer = setInterval(() => {
      setPaymentTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showPaymentModal])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handlePaymentSelect = async (methodId: string) => {
    // 如果正在处理其他支付方式，禁止点击
    if (processingPayment) {
      return
    }

    setSelectedPayment(methodId)
    setProcessingPayment(methodId) // 设置正在处理的支付方式
    
    // 获取支付方式名称
    const method = paymentMethodsList.find(m => m.paymentMethodCode === methodId)
    console.log('Selected payment method:', method)
    setSelectedPaymentName(method?.paymentMethodName || methodId)
    
    // 获取 planId，可能来自 checkoutData 的不同字段
    const planId = checkoutData?.planId
    
    if (!planId) {
      console.error('PlanId not found in checkout data')
      setProcessingPayment(null) // 重置处理状态
      // TODO: 显示错误提示
      return
    }

    // 获取 checkout_id，可能来自 checkoutData 或 sessionId
    const checkoutId = checkoutData?.checkoutId || checkoutData?.checkout_id || sessionId

    if (!checkoutId) {
      console.error('CheckoutId not found')
      setProcessingPayment(null) // 重置处理状态
      // TODO: 显示错误提示
      return
    }

    try {
      // 调用获取支付意图接口
      const paymentIntent = await getPaymentIntent(planId, methodId, checkoutId)
      console.log('Payment intent:', paymentIntent)
      
      // 检查返回结果，如果返回的是数组，取第一个元素
      const result = Array.isArray(paymentIntent) ? paymentIntent[0] : paymentIntent
      
      // 获取支付 URL，支持多种数据结构
      const url = result?.data?.url || result?.url || paymentIntent?.data?.url || paymentIntent?.url
      
      if (url) {
        setPaymentUrl(url)
        setShowPaymentModal(true)
        setPaymentTimer(30 * 60) // 重置倒计时为30分钟
        setProcessingPayment(null) // 重置处理状态，因为已经打开弹窗
        // 清除倒计时存储，因为用户已经选择了支付方式
        const STORAGE_KEY = `checkout_timer_${sessionId || 'default'}`
        localStorage.removeItem(STORAGE_KEY)
        
        
        sendEvent('add_payment_info', {
          custom_data: {
            content_ids: [planId],
            contents: allPlans,
            currency: checkoutData?.currency || 'USD',
            value: checkoutData?.originalAmount || 1, // 事件价值
          }
        })
      } else {
        console.error('Payment URL not found in response')
        setProcessingPayment(null) // 重置处理状态
        // TODO: 显示错误提示
      }
    } catch (error) {
      console.error('Failed to get payment intent:', error)
      setProcessingPayment(null) // 重置处理状态
      // TODO: 处理错误，例如显示错误提示
    }
  }

  const handleBackToPricing = () => {
    // 清除倒计时存储
    const STORAGE_KEY = `checkout_timer_${sessionId || 'default'}`
    localStorage.removeItem(STORAGE_KEY)
    router.push('/feelove-pricing')
  }

  const handleStartNewCheckout = () => {
    // 清除倒计时存储
    const STORAGE_KEY = `checkout_timer_${sessionId || 'default'}`
    localStorage.removeItem(STORAGE_KEY)
    router.push('/feelove-pricing')
  }

  const backgroundGradient = {
    background: '#1e1e2e',
    backgroundImage: 'linear-gradient(to bottom right in oklab, #000 0%, color-mix(in oklab, lab(24.9401% 45.2703 -51.2728) 20%,transparent) 50%, color-mix(in oklab, lab(29.4367% 49.3962 3.35757) 20%,transparent) 100%)'
  }

  // 如果会话超时，显示超时页面
  if (sessionTimedOut) {
    return (
      <div className="text-foreground min-h-screen dark flex items-center justify-center p-4" style={backgroundGradient}>
        <div className="max-w-md w-full text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/50">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <span className="text-red-500 text-2xl font-bold">!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white mb-4">Session Timed Out</h1>

          {/* Description */}
          <div className="space-y-2 mb-8">
            <p className="text-white/80 text-base">
              For security reasons, your checkout session has expired.
            </p>
            <p className="text-white/80 text-base">
              Please restart the process to ensure the best price.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartNewCheckout}
            className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-white/90 transition-colors"
          >
            Start New Checkout
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* <MainAppBar /> */}
      <div 
        className="text-foreground min-h-screen dark"
        style={{...backgroundGradient}}
      >
        {/* Back to Pricing Button - Fixed to left */}
        <div className="absolute top-5 left-4 md:left-6 lg:left-12 z-20">
          <button
            onClick={handleBackToPricing}
            className="cursor-pointer flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Pricing</span>
          </button>
        </div>
        
        <div className="relative flex flex-col items-center z-10 min-h-screen p-4 py-8 sm:p-6 pt-16 md:pt-18">

          {/* Main Card */}
          <Card className="bg-content1 border border-default-200 w-full max-w-lg">
            <CardBody className="p-6 md:p-8">
              {/* Credit Pack Section */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-default-200">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 bg-purple-500/20 rounded-md mb-3">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                      Credit Pack
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {creditPack.credits} Credits
                  </h1>
                  <p className="text-foreground/60 text-sm">
                    {creditPack.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    ${creditPack.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-foreground/50 uppercase tracking-wide">
                    {creditPack.currency} Total
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">
                    Payment Method
                  </h2>
                  <div className="flex items-center gap-2 text-foreground/60">
                    <ClockIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
                  </div>
                </div>

              {/* Payment Methods List */}
              <div className="space-y-2">
                {paymentMethodsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : (
                  paymentMethodsList.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentSelect(method.paymentMethodCode)}
                    disabled={!!processingPayment}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-lg border transition-all',
                      processingPayment
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer',
                      selectedPayment === method.id
                        ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                        : 'bg-default-50 border-default-200 hover:bg-default-100 hover:border-default-300'
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getPaymentIcon(method) ? (
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                          getPaymentIconBgColor(method)
                        )}>
                          <img 
                            src={getPaymentIcon(method)!} 
                            alt={method.name}
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                      ) : null}
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-foreground font-medium text-sm">{method.name}</span>
                          {method.recommended && (
                            <span className="px-2 py-0.5 bg-purple-500/30 rounded text-[10px] font-semibold text-purple-600 dark:text-purple-200 uppercase tracking-wide">
                              Recommended
                            </span>
                          )}
                        </div>
                        {method.description && (
                          <p className="text-[16px] text-white mt-0.5">{method.paymentMethodName}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRightIcon className={cn(
                      'h-5 w-5 transition-colors flex-shrink-0 ml-2',
                      selectedPayment === method.id ? 'text-purple-500' : 'text-foreground/40'
                    )} />
                  </button>
                  ))
                )}
                
                {/* Processing Indicator */}
                {processingPayment && (
                  <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#4A2C4A] border border-[#8A4A8A]">
                    <Spinner size="sm" color="white" />
                    <span className="text-white text-sm font-medium">Processing secure payment...</span>
                  </div>
                )}
              </div>
            </div>

              {/* Security Indicators */}
              <div className="flex items-center justify-center gap-6 pt-6 border-t border-default-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-foreground/60 font-medium">SSL SECURE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-foreground/60 font-medium">ENCRYPTED</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-foreground/60 font-medium">INSTANT ACCESS</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-foreground/50 mb-4">
              <a href="/terms-and-conditions" className="hover:text-foreground/80 transition-colors">
                Terms of Service
              </a>
              <span className="text-foreground/30">•</span>
              <a href="/privacy-policy" className="hover:text-foreground/80 transition-colors">
                Privacy Policy
              </a>
              <span className="text-foreground/30">•</span>
              <a href="/refund-policy" className="hover:text-foreground/80 transition-colors">
                Refund Policy
              </a>
            </div>
            <p className="text-xs text-foreground/40">
              Need help? <a href="/contact-us" className="text-foreground/60 hover:text-foreground/80 transition-colors">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
      {defaultLDScript}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div 
          className="fixed inset-0 z-[2147483647]"
          style={{ zIndex: 2147483647 }}
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black"
            style={{ zIndex: 2147483646 }}
            onClick={() => setShowPaymentModal(false)}
          />
          
          {/* Modal Content */}
          <div 
            className="fixed inset-0 flex flex-col bg-[#0A0A10]"
            style={{ zIndex: 2147483647 }}
          >
            <div className="w-full h-full flex flex-col bg-[#0A0A10] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#13131F] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
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
                      className="text-emerald-400"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {selectedPaymentName} Secure Checkout
                    </h2>
                    <p className="text-xs text-zinc-500">Complete your payment securely</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Timer */}
                  {/* <div className="text-red-500 text-sm font-medium">
                    Time: {formatTime(paymentTimer)}
                  </div> */}
                  {/* Close Button */}
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                  >
                    <XMarkIcon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Iframe Content */}
              <div className="relative flex-1 overflow-hidden bg-[#0A0A10]">
                <iframe
                  src={paymentUrl}
                  className="w-full h-full border-0 opacity-100 transition-opacity duration-300"
                  allow="payment"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                />
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/10 bg-[#0A0A10] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-emerald-500/80"
                  >
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                  <span>256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Monitoring payment...
                  </span>
                  <p className="text-xs text-zinc-600">Secured by {selectedPaymentName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
