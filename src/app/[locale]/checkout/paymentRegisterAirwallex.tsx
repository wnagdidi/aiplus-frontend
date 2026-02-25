'use client' // 声明这是一个客户端组件

// 导入必要的依赖
import { useEffect, useMemo, useState, useRef } from 'react'
import { isMobile } from '@/util/browser' // 移动设备检测工具
import {createAirwallexInfo, upgradeAirwallexInfo} from '@/api/client/billingApi' // StarSaas支付相关API
import { getErrorMessage, logError } from '@/api/core/common' // 错误处理工具
import { AirwallexInfo } from '@/api/client/billingApi.interface' // StarSaas信息接口
import { useTranslations } from 'next-intl' // 国际化hook
import PayInfo from './payInfo' // 支付信息组件
import { useSession } from 'next-auth/react' // 会话管理
import PaymentResult from './ss/return/paymentResult' // 支付结果组件
import { pixelParams, useGTM } from '@/context/GTMContext' // GTM事件追踪
import { Plan } from '@/api/core/billing' // 计划类型定义
import { getPlans } from '@/api/client/billingApi' // 获取计划列表API
import { init, createElement } from '@airwallex/components-sdk';
import _ from 'lodash'
import { wordsCounter } from '@/util/humanize' // 新的支付

// 支付注册组件属性接口
interface PaymentRegisterProps {
  plan?: Plan // 选择的计划
  planId?: number // 计划ID
  planName?: string // 计划名称
  entry?: string // 事件入口
  isUpgrade?:false
  onComplete?: () => void // 完成回调
  onClose?: () => void // 关闭回调
}

// 支付注册组件
export default function PaymentRegisterAirwallex({ plan, planId, planName, entry, isUpgrade, onComplete, onClose }: PaymentRegisterProps) {
  // 状态管理
  const [mobile, setMobile] = useState(false) // 是否移动设备
  const [loading, setLoading] = useState(true) // 加载状态
  const [paymentSession, setPaymentSession] = useState<AirwallexInfo>() // 支付会话信息
  const [errorMessage, setErrorMessage] = useState<string | undefined>() // 错误信息
  const [payState, setPayState] = useState('') // 支付状态
  const [plans, setPlans] = useState<Plan[]>() // 所有计划列表
  const [isSendSuccess, setIsSendSuccess] = useState(false) // 加载状态
  const elementRef = useRef<any>(null) // 保存支付元素的引用
  const airwallexPayId = useRef('')

  // Hooks
  const tError = useTranslations('Error') // 错误信息国际化
  const { data: session } = useSession() // 用户会话
  const { sendEvent, reportEvent } = useGTM() // GTM事件发送器

  // 清理函数
  const cleanup = () => {
    if (elementRef.current) {
      try {
        elementRef.current.destroy()
        elementRef.current = null
        console.log('Payment element destroyed')
      } catch (error) {
        console.error('Error destroying payment element:', error)
      }
    }
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  // 监听关闭回调
  useEffect(() => {
    if (onClose) {
      const originalOnClose = onClose
      onClose = () => {
        cleanup()
        originalOnClose()
      }
    }
  }, [onClose])

  // 初始化支付会话
  useEffect(() => {
    setMobile(isMobile()) // 检测是否移动设备
    if (!planId) {
      return
    }

    airwallexPayId.current = `airwallexPay-${_.uniqueId()}`

    // 获取所有计划列表
    async function fetchPlans() {
      try {
        const plansData = await getPlans()
        setPlans(plansData)
        return plansData // 返回计划数据以便后续使用
      } catch (e) {
        console.error('Error fetching plans:', e)
        return [] // 返回空数组作为默认值
      }
    }

    // 准备支付会话
    async function preparePaymentSession() {
      try {
        if (!planId) {
          return
        }
        // 创建irwallex支付信息
        let data = {}
        if (isUpgrade) {
          data = await upgradeAirwallexInfo(planId)
        } else {
          data = await createAirwallexInfo(planId)
        }

        // 检查数据是否为空
        if (!data || Object.keys(data).length === 0) {
          throw new Error('Payment is some thing wrong,please contact our customer service!')
        }

        console.log('prepare payment data:', data)
        setPaymentSession(data as any)
        return data // 返回数据以便后续使用
      } catch (e) {
        // 错误处理
        const error = getErrorMessage(tError, e)
        setErrorMessage(error)
        logError('Error creating star sass session: ' + error, { planId }, e)
        setLoading(false)
        throw e
      }
    }

    // 初始化新的支付
    async function initPay() {
      const options = {
        env: process.env.NEXT_PUBLIC_PAYMENT_AIRWALLEX_CONFIGURE,
        origin: window.location.origin
      };
      await init(options)
    }

    // 初始化新的支付
    async function createAirwallexPay(paymentData: AirwallexInfo, plansData: Plan[]) {
      const paymentInfo: any = {
        intent_id: paymentData?.intentsId,
        client_secret: paymentData?.clientSecret,
        mode: paymentData?.mode,
        currency: paymentData?.currency,
        recurringOptions: {
          next_triggered_by: paymentData?.nextTriggeredBy,
          currency: paymentData?.currency
        }
      }

      // 根据返回参数是否不为空设置
      if (paymentData?.merchantTriggerTeason) {
        paymentInfo.recurringOptions.merchant_trigger_reason = paymentData?.merchantTriggerTeason
      }
      console.log('paymentParams:', paymentInfo)

      // 先清理之前的元素
      cleanup()

      // 创建新元素
      const element = await createElement('dropIn', paymentInfo);
      elementRef.current = element // 保存引用

      // 等待DOM元素渲染完成
      await new Promise<void>((resolve) => {
        const checkElement = () => {
          const airwallexPayElement = document.getElementById(airwallexPayId.current)
          if (airwallexPayElement) {
            resolve()
          } else {
            setTimeout(checkElement, 100)
          }
        }
        checkElement()
      })

      element.mount(airwallexPayId.current)
      element.on('success', (e: any) => {
        if (!isSendSuccess) {
          console.log('Payment successful', e)
          console.log(plansData)
          // 发送添加支付信息事件
          sendEvent('add_payment_info', {
            custom_data: {
              value: paymentData?.amount,
              currency: 'USD',
            },
            eventData: {
              plan: plan
            }
          })

          // 发送购买成功事件
          sendEvent('purchase', {
            custom_data: {
              currency: paymentData?.currency,
              value: paymentData?.amount,
              contents: [plan],
              content_type: 'product',
              transaction_id: paymentData?.orderNo,
              orderId: paymentData?.orderNo,
            },
            eventData: {
              plan: plan
            }
          })
          setIsSendSuccess(true)
        }
        setPayState('SUCCESS')
        onComplete && onComplete()
      });

      element.on('error', (e: any) => {
        console.log('Payment fail', e)
        console.log(plansData)
        // 发送添加支付信息事件
        sendEvent('add_payment_info', {
          custom_data: {
            value: paymentData?.amount,
            currency: 'USD',
          },
          eventData:{
            plan:plan
          }
        })
        reportEvent('PaymentFail', {
          custom_data: {
            value: paymentData?.amount,
            currency: 'USD',
          },
          eventData:{
            plan:plan
          }
        })
        onComplete && onComplete()
      });
    }

    // 获取支付数据
    async function fetchData() {
      try {
        // 先获取计划数据
        const plansData = await fetchPlans()
        // 再获取支付数据
        const paymentData = await preparePaymentSession()
        await initPay()
        setLoading(false)
        if (paymentData) {
          // 将计划数据传递给createAirwallexPay方法
          await createAirwallexPay(paymentData as any, plansData)
        }
      } catch (error) {
        console.error('Error in fetchData:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [planId])

  // 构建支付页面

  return (
    // 固定非移动端的容器宽度，防止父级弹窗在加载中因内容宽度变化而抖动
    <div className={!mobile ? 'w-[950px] transition-all duration-200' : ''}>
      {/* 支付表单 */}
      {!payState &&
        (!loading ? (
          <div className={`grid grid-cols-12 gap-8 ${isMobile() ? 'pt-0' : 'pt-[30px]'} px-6`}>
            {/* 支付信息区域 */}
            <div className={`col-span-12 md:col-span-6 ${isMobile() ? 'pt-16' : ''}`}>
              {paymentSession?<PayInfo paymentSession={paymentSession} />:''}
            </div>
            {/* 支付方式区域 */}
            <div className="col-span-12 md:col-span-6">
              <div id={airwallexPayId.current}></div>
            </div>
          </div>
        ) : (
          // 加载状态（与上方 loading 占位宽度保持一致）
          <div className={`flex justify-center items-center ${!mobile ? 'w-[950px] min-h-[160px]' : 'min-w-[300px]'} mx-auto`}>
            <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
          </div>
        ))}
      {/* 错误信息显示 */}
      {errorMessage && (
        <div className="flex justify-center items-center">
          <span className="text-[#924aeb]">{errorMessage}</span>
        </div>
      )}
      {/* 支付结果显示 */}
      {payState && (
        <div className="w-full h-full flex justify-center items-center">
          <PaymentResult success={payState == 'SUCCESS'} amount={paymentSession?.amount} />
        </div>
      )}
    </div>
  )
}
