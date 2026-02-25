'use client' // 声明这是一个客户端组件

// 导入必要的依赖
import PlanSelector from '@/app/[locale]/pricing/planSelector' // 计划选择器组件
import { Plan } from '@/api/core/billing' // 计划类型定义
import { getPlans } from '@/api/client/billingApi' // 获取计划列表API
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useTranslations } from '@/hooks/useTranslations' // 国际化hook
import { getSession, useSession } from 'next-auth/react' // 会话管理
import UnifiedAuthStarter from '@/app/[locale]/auth/unifiedAuthStarter' // 统一认证启动器
import BackButton from '@/app/[locale]/auth/backButton' // 返回按钮组件
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext' // 活动订阅上下文
import MainButton from '@/components/MainButton' // 主按钮组件
import { raisedCardContentStyle, raisedCardStyle } from '@/app/[locale]/styles' // 卡片样式
import { EventEntry, pixelParams, useGTM } from '@/context/GTMContext' // GTM事件追踪
import { createStripeSession } from '@/api/client/billingApi' // Stripe会话创建API
import CoreApiError from '@/api/core/coreApiError' // 核心API错误类型
import { useSnackbar } from '@/context/SnackbarContext' // 提示消息上下文
import { logError } from '@/api/core/common' // 错误日志
import { PaymentProvider } from '@/app/[locale]/checkout/types' // 支付提供商类型
import BindEmailControl from '@/app/[locale]/pricing/bindEmailControl' // 邮箱绑定控制组件
import { usePreviewMode } from '@/context/PreviewModeContext' // 预览模式上下文
import { upgradeAirwallexInfo, queryUpgradeOrder } from '@/api/client/billingApi'
import {isMobile} from "@/util/browser";
import dynamic from "next/dynamic";
import { AnalyticsEventType } from '@/utils/events/analytics'
import { Spinner, Card, CardBody } from '@heroui/react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { createCheckout } from '@/api/client/feeLoveApi'
import { useRouter, useParams } from 'next/navigation'
import { ResultCode } from '@/api/core/common'

// 环境变量和常量定义
const isPaymentBeingMaintained = process.env.NEXT_PUBLIC_PAYMENT_IS_BEING_MAINTAINED === 'true' // 支付系统是否在维护
const maintainInfoForFree =
    'System Upgrade in Progress: Payments cannot be processed at this time.' +
    ' As a token of appreciation for your support, we are offering you 3,000 free words until the system upgrade is complete. Thank you for your continued support of AvoidAI.' // 免费用户维护信息
const maintainInfoDefault =
    'System Upgrade in Progress: Payments cannot be processed at this time.Thank you for your continued support of AvoidAI.' // 默认维护信息
const paymentProvider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER // 支付提供商

// 结账步骤枚举
enum CheckoutStep {
  CHOOSE_PLAN, // 选择计划
  LOGIN, // 登录
  BIND_EMAIL, // 绑定邮箱
  CHECKOUT, // 结账
  CHECKOUT_RESULT, // 结账结果
}

// 计划控制包装器组件
function PlanControlWrapper({ children, wrapped }: { children: React.ReactNode; wrapped?: boolean }) {
  if (!wrapped) {
    return children
  }
  return (
      <Card className="shadow-lg">
        <CardBody className="p-6">{children}</CardBody>
      </Card>
  )
}

// 嵌入式计划控制组件属性接口
interface EmbeddedPlanControlProps {
  isOpen: boolean // 是否打开
  plans: Plan[] // 计划列表
  compact?: boolean // 是否紧凑模式
  onClose?: () => void // 关闭回调
  planToBuy?: Plan // 要购买的计划
  planToBuyCanBuy?: boolean // 计划是否可以购买
  setPlanToBuy: (plan?: Plan, isCanBuy?: boolean) => void // 设置要购买的计划
  wrappedByCard?: boolean // 是否被卡片包装
  entry: EventEntry // 事件入口
}

const PaymentRegisterAirwallexDynamic = dynamic(() => import('../../[locale]/checkout/paymentRegisterAirwallex'), {
  // 统一占位尺寸，避免加载阶段内容宽度过小导致弹窗抖动
  loading: () => (
    <div className="w-full max-w-[950px] mx-auto flex items-center justify-center py-10">
      <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
    </div>
  ),
})

// 嵌入式计划控制组件
export default function EmbeddedPlanControl({
                                              isOpen,
                                              plans,
                                              compact,
                                              planToBuy,
                                              planToBuyCanBuy,
                                              setPlanToBuy,
                                              onClose,
                                              wrappedByCard,
                                              entry,
                                            }: EmbeddedPlanControlProps) {
  // Hooks
  const t = useTranslations('Billing') // 账单相关翻译
  const tCommon = useTranslations('Common') // 账单相关翻译
  const tError = useTranslations('Error') // 错误信息翻译
  const router = useRouter() // 路由控制
  const params = useParams<{ locale: string }>() // 获取locale参数
  const [step, setStep] = useState(CheckoutStep.CHOOSE_PLAN) // 当前步骤，默认显示计划选择
  const { data: session } = useSession() // 用户会话
  const { refreshActiveSubscription, isFree } = useActiveSubscription() // 活动订阅
  const { sendEvent, reportEvent } = useGTM() // GTM事件发送器
  const [clientSecret, setClientSecret] = useState<string>() // Stripe客户端密钥
  const [orderNo, setOrderNo] = useState<string>('') // 添加orderNo状态
  const [creatingOrder, setCreatingOrder] = useState(false) // 是否正在创建订单
  const { showSnackbar } = useSnackbar() // 提示消息控制
  const { isPreview } = usePreviewMode() // 是否预览模式
  const [isUpgrade, setUpgradeOrder] = useState(false) // 是否正在创建订单
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false)
  const [isDirectUpgrade, setIsDirectUpgrade] = useState(false)
  const [showPlanInfoDialog, setShowPlanInfoDialog] = useState(false)
  const [pollingCount, setPollingCount] = useState(0)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [upgradeData, setUpgradeData] = useState<any>(null)
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false)
  const [fetchOrderStatus, setFetchOrderStatus] = useState(false)

  // simple fullScreen detection (replacement for useMediaQuery(theme.breakpoints.down('sm')))
  const [fullScreen, setFullScreen] = useState(false)
  useEffect(() => {
    const handler = () => setFullScreen(window.innerWidth < 640)
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // 处理成功回调
  const handleSuccess = () => {
    // 多次刷新订阅状态以确保更新
    refreshActiveSubscription()
    refreshActiveSubscription(6000)
    refreshActiveSubscription(9000)
    setStep(CheckoutStep.CHECKOUT_RESULT)
  }

  // 处理登录成功
  const handleLoginSuccess = async () => {
    // 登录成功后，重新获取session并继续购买流程
    const latestSession = await getSession()
    if (latestSession && planToBuy) {
      handleToBuy(planToBuy, planToBuyCanBuy)
    }
  }

  // 处理邮箱绑定成功
  const handleBindEmailSuccess = () => {
    handleToBuy(planToBuy)
  }

  // 计算总价
  const getTotal = (type: string, price: number) => {
    if (type == 'monthly') {
      return Number((price * 1).toFixed(2))
    } else if (type == 'quarterly') {
      return Number((price * 3).toFixed(2))
    } else if (type == 'yearly') {
      return Number((price * 12).toFixed(2))
    } else {
      return Number((price * 1).toFixed(2))
    }
  }
  const { isPaid, subscription } = useActiveSubscription()
  // 处理购买操作 - 修改为直接跳转到结账页面
  const handleToBuy = async (plan: Plan, isCanBuy?: boolean, isUpgrade?: boolean) => {
    console.log('embeddedPlanControl handleToBuy called with plan:', plan, 'isCanBuy:', isCanBuy, 'isUpgrade:', isUpgrade)
    
    try {
      // 调用创建结账接口，与 /feelove-pricing 页面保持一致
      const type = plan?.tags[0] || 'type'
      const result = await createCheckout('credit_pack', plan.id)
      console.log('Checkout created:', result)
      
      // 检查返回结果，如果返回的是数组，取第一个元素
      const checkoutResult = Array.isArray(result) ? result[0] : result
      
      // 检查code是否为SUCCESS
      if (checkoutResult?.code === ResultCode.SUCCESS && checkoutResult?.data?.sessionId) {
        const sessionId = checkoutResult.data.sessionId
        const locale = params?.locale || 'en'
        // 关闭弹窗
        if (onClose) {
          onClose()
        }
        // 跳转到结账页面，携带session_id参数
        router.push(`/${locale}/feelove-checkout?session_id=${sessionId}`)
      } else if (result?.sessionId) {
        // 如果返回的直接是data对象（包含sessionId）
        const sessionId = result.sessionId
        const locale = params?.locale || 'en'
        // 关闭弹窗
        if (onClose) {
          onClose()
        }
        // 跳转到结账页面，携带session_id参数
        router.push(`/${locale}/feelove-checkout?session_id=${sessionId}`)
      } else {
        console.error('Checkout creation failed or missing sessionId:', result)
        showSnackbar(tError('checkout_failed') || 'Failed to create checkout', 'error')
      }
    } catch (error) {
      console.error('Failed to create checkout:', error)
      showSnackbar(tError('checkout_failed') || 'Failed to create checkout', 'error')
    }
  }

  // 处理返回操作
  const handleBack = () => {
    sendEvent('cancel_checkout', { step })
    setPlanToBuy()
    setStep(CheckoutStep.CHOOSE_PLAN)
  }

  // 监听planToBuy变化 - 仅在已登录且弹窗打开时处理
  useEffect(() => {
    console.log('EmbeddedPlanControl planToBuy changed:', planToBuy, 'planToBuyCanBuy:', planToBuyCanBuy, 'isOpen:', isOpen, 'session:', !!session)
    // 只有在弹窗已打开、有planToBuy、且用户已登录时才处理
    if (isOpen && planToBuy && session) {
      // 添加短暂延迟，确保所有状态都已更新
      const timeoutId = setTimeout(() => {
        // 当有planToBuy时，直接进入购买流程
        // 如果 planToBuyCanBuy 是 undefined，默认设为 true（因为用户点击了购买按钮）
        const isCanBuy = planToBuyCanBuy !== undefined ? planToBuyCanBuy : true
        console.log('Calling handleToBuy with plan:', planToBuy, 'isCanBuy:', isCanBuy)
        handleToBuy(planToBuy, isCanBuy)
      }, 0)
      
      return () => clearTimeout(timeoutId)
    }
  }, [planToBuy, planToBuyCanBuy, isOpen, session])

  // 监听 orderNo 变化，当有新的 orderNo 时开始轮询
  useEffect(() => {
    if (orderNo) {
      console.log('orderNo changed, starting polling:', orderNo)
      startPolling()
    }
  }, [orderNo])

  // 是否显示结账界面
  const isShowCheckout =
      (step === CheckoutStep.CHECKOUT || step === CheckoutStep.CHECKOUT_RESULT) &&
      (!isPaymentBeingMaintained || isPreview)
  // 是否显示维护信息
  const isShowCheckoutMaintainInfo =
      (step === CheckoutStep.CHECKOUT || step === CheckoutStep.CHECKOUT_RESULT) && isPaymentBeingMaintained && !isPreview

  // 计算内边距
  const pt =
      step !== CheckoutStep.CHECKOUT_RESULT && !fullScreen ? (paymentProvider === PaymentProvider.STAR_SAAS ? 4 : 10) : 2

  // 开始轮询
  const startPolling = () => {
    console.log('Starting polling with orderNo:', orderNo)
    if (!orderNo) {
      console.error('No orderNo available for polling')
      showSnackbar(tError('invalid_order'), 'error')
      return
    }

    setIsPolling(true)
    const interval = setInterval(async () => {
      try {
        console.log('Polling with orderNo:', orderNo)
        const response = await queryUpgradeOrder(orderNo)
        console.log('Polling response:', response)
        setPollingCount(prev => prev + 1)

        if (response.code === 'SUCCESS') {
          handleSuccess()
          clearInterval(interval)
          setPollingInterval(null)
          setIsPolling(false)
          setFetchOrderStatus(true)
          showSnackbar(t('payment_success'), 'success')
        } else if (pollingCount >= 12) {
          clearInterval(interval)
          setPollingInterval(null)
          setIsPolling(false)
          showSnackbar(t('subscription_checking'), 'error')
        }
      } catch (error) {
        console.error('Polling error:', error)
        clearInterval(interval)
        setPollingInterval(null)
        setIsPolling(false)
        showSnackbar(tError('polling_error'), 'error')
      }
    }, 5000)

    setPollingInterval(interval)
  }

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  // 处理升级确认
  const handleUpgradeConfirm = async () => {
    try {
      if (!planToBuy?.id) {
        showSnackbar(tError('invalid_plan'), 'error')
        return
      }
      setIsUpgradeLoading(true)
      const data = await upgradeAirwallexInfo(planToBuy.id)
      handleSuccess()

      // 检查返回的数据结构
      if (data && data.orderNo) {
        setOrderNo(data.orderNo)
        setUpgradeData(data)
        setShowUpgradeConfirm(false)
        setShowPlanInfoDialog(true)
        setStep(CheckoutStep.CHECKOUT_RESULT)
      } else {
        showSnackbar(tError('invalid_order'), 'error')
      }
    } catch (error) {
      showSnackbar(tError('upgrade_failed'), 'error')
    } finally {
      setIsUpgradeLoading(false)
    }
  }

  // 根据不同步骤渲染不同内容
  console.log('EmbeddedPlanControl rendering, current step:', step, 'planToBuy:', planToBuy)
  
  // 如果没有 planToBuy 或者步骤是 CHOOSE_PLAN，显示计划选择器
  if (!planToBuy || (step === CheckoutStep.CHOOSE_PLAN && !planToBuy)) {
    return (
      <PlanSelector
        isOpen={isOpen}
        plans={plans}
        planToBuy={planToBuy}
        creatingOrder={creatingOrder}
        onBuy={handleToBuy}
        compact={compact}
      />
    )
  }
  
  return (
        <PlanControlWrapper wrapped={wrappedByCard}>
          <div className={`relative ${pt === 4 ? 'pt-4' : pt === 10 ? 'pt-10' : 'pt-2'}`}>
            {/* 返回按钮 */}
            {/* {step !== CheckoutStep.CHECKOUT_RESULT && (
                <BackButton onBack={handleBack} />
            )} */}
            {/* 登录组件 */}
            {step === CheckoutStep.LOGIN && <UnifiedAuthStarter onSuccess={handleLoginSuccess} disableBack signup />}
            {/* 邮箱绑定组件 */}
            {step === CheckoutStep.BIND_EMAIL && <BindEmailControl onSuccess={handleBindEmailSuccess} />}
            {/* 升级确认弹窗 */}
            {isShowCheckout && showUpgradeConfirm && isDirectUpgrade && (
                <div className={`${!isMobile() ? 'w-[950px] transition-all duration-200' : ''}`}>
                <div className="mt-12 flex justify-center flex-col items-center gap-1">
                      <>
                        <h2 className="text-2xl font-semibold mb-4">
                          {tCommon('upgrade_account')}
                        </h2>
                        {planToBuy?.name && (
                            <p className="text-lg">
                              {planToBuy?.name}
                            </p>
                        )}
                        <h3 className="text-2xl font-semibold">
                          {getTotal(planToBuy?.tags[0],planToBuy?.upgradePriceOneMonth)}/{t(planToBuy?.tags[0])}{planToBuy?.tags[0] !== 'lifetime'?', '+t('billed')+ ' '+ t(planToBuy?.tags[0]).toLowerCase():''}
                        </h3>

                      </>
                      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                        <button
                            type="button"
                            disabled={isUpgradeLoading}
                            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-[rgba(59,126,255,0.5)] shadow-sm px-6 py-2 bg-white text-base font-medium text-[#3B7EFF] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            onClick={() => {
                                setStep(CheckoutStep.CHOOSE_PLAN);
                                setShowUpgradeConfirm(false);
                            }}
                        >
                            {tCommon('not_now')}
                        </button>
                        <button
                            type="button"
                            disabled={isUpgradeLoading}
                            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            onClick={handleUpgradeConfirm}
                        >
                            {isUpgradeLoading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {tCommon('upgrade_now')}
                                </div>
                            ) : (
                                tCommon('upgrade_now')
                            )}
                        </button>
                      </div>
                </div>
                </div>
            )}

            {/* 结账表单 */}
            {isShowCheckout && !isDirectUpgrade && (
                <PaymentRegisterAirwallexDynamic
                    planId={planToBuy?.id}
                    planName={planToBuy?.name}
                    plan={planToBuy}
                    entry={entry}
                    isUpgrade={isUpgrade}
                    upgradeData={upgradeData}
                    onComplete={handleSuccess}
                />
            )}

            {/* 维护信息 */}
            {isShowCheckoutMaintainInfo && (
                <>
                  <ExclamationCircleIcon className="w-9 h-9 mb-2" />
                  <p className="max-w-[500px]">
                    {isFree ? maintainInfoForFree : maintainInfoDefault}
                  </p>
                </>
            )}
            {/* 结账结果 */}
            {step === CheckoutStep.CHECKOUT_RESULT && (
                <div className="mt-3 mb-2 text-center">
                  {showPlanInfoDialog && (

                      <div
                          className={`${!isMobile() ? 'w-[950px] transition-all duration-200 pb-5' : ''}`}
                      >
                        <div className="mt-12 flex justify-center flex-col items-center gap-1">
                          <>
                            {isPolling ? <h2 className="text-2xl font-semibold mb-4">
                              {t('subscription_confirming')}
                            </h2> : fetchOrderStatus ? <img src="/payment-success.png" alt="payment success" className="h-32" />:t('subscription_checking')}

                            {fetchOrderStatus && <h2 className="text-2xl font-semibold mb-4">
                              {t('payment_success')}
                            </h2>}

                            {planToBuy?.name && (
                                <p className="text-lg">
                                  {t('product')}: {planToBuy?.name}
                                </p>
                            )}
                            <h3 className="text-2xl font-semibold">
                              {t('subscription')}: {getTotal(planToBuy?.tags[0],planToBuy?.upgradePriceOneMonth)}/{t(planToBuy?.tags[0])}{planToBuy?.tags[0] !== 'lifetime'?', '+t('billed')+ ' '+ t(planToBuy?.tags[0]).toLowerCase():''}
                            </h3>
                          </>
                          {isPolling && (
                              <div className="flex flex-col items-center gap-2">
                                <Spinner size="sm" />
                              </div>
                          )}
                        </div>
                      </div>

                  )}
                  <MainButton onClick={() => onClose && onClose()} variant="contained" disableElevation>
                    {t('back_to_website')}
                  </MainButton>
                </div>
            )}
          </div>
        </PlanControlWrapper>
    )
}
