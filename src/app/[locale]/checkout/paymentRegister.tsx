'use client' // 声明这是一个客户端组件

// 导入必要的依赖
import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import { isMobile } from '@/util/browser' // 移动设备检测工具
import { CircularProgress, Grid, Typography } from '@mui/material'
import { createStarSaasInfo, starSaasPay } from '@/api/client/billingApi' // StarSaas支付相关API
import { getErrorMessage, logError } from '@/api/core/common' // 错误处理工具
import { StarSaasInfo } from '@/api/client/billingApi.interface' // StarSaas信息接口
import { useTranslations } from 'next-intl' // 国际化hook
import PayInfo from './payInfo' // 支付信息组件
import PayWay, { CardInfo } from './payWay' // 支付方式组件
import { useSession } from 'next-auth/react' // 会话管理
import PaymentResult from './ss/return/paymentResult' // 支付结果组件
import { pixelParams, useGTM } from '@/context/GTMContext' // GTM事件追踪
import { Plan } from '@/api/core/billing' // 计划类型定义
import { getPlans } from '@/api/client/billingApi' // 获取计划列表API

// 支付注册组件属性接口
interface PaymentRegisterProps {
  plan?: Plan // 选择的计划
  planId?: number // 计划ID
  planName?: string // 计划名称
  entry?: string // 事件入口
  onComplete?: () => void // 完成回调
}

// 支付注册组件
export default function PaymentRegister({ plan, planId, planName, entry, onComplete }: PaymentRegisterProps) {
  // 状态管理
  const [mobile, setMobile] = useState(false) // 是否移动设备
  const [loading, setLoading] = useState(true) // 加载状态
  const [paymentSession, setPaymentSession] = useState<StarSaasInfo>() // 支付会话信息
  const [errorMessage, setErrorMessage] = useState() // 错误信息
  const [payState, setPayState] = useState('') // 支付状态
  const [plans, setPlans] = useState<Plan[]>() // 所有计划列表

  // Hooks
  const tError = useTranslations('Error') // 错误信息国际化
  const { data: session } = useSession() // 用户会话
  const { sendEvent, reportEvent } = useGTM() // GTM事件发送器

  // 初始化支付会话
  useEffect(() => {
    setMobile(isMobile()) // 检测是否移动设备
    if (!planId) {
      return
    }

    // 获取所有计划列表
    async function fetchPlans() {
      try {
        const plansData = await getPlans()
        setPlans(plansData)
      } catch (e) {
        console.error('Error fetching plans:', e)
      }
    }

    // 准备支付会话
    async function preparePaymentSession() {
      try {
        if (!planId) {
          return
        }
        // 创建StarSaas支付信息
        setPaymentSession(await createStarSaasInfo(planId))
        setTimeout(() => {
          setLoading(false)
        }, 100)
      } catch (e) {
        // 错误处理
        const error = getErrorMessage(tError, e)
        setErrorMessage(error)
        logError('Error creating star sass session: ' + error, { planId }, e)
        setLoading(false)
      }
    }

    fetchPlans() // 获取所有计划
    preparePaymentSession() // 准备支付会话
  }, [planId])

  // 构建支付备注信息
  const note = useMemo(() => `${planId}__${planName}__${entry}`, [planId, planName, entry])

  // 处理支付
  const handlePay = async (cardInfo: CardInfo, setFormErrorMessage?: (key: string, mes: string) => void) => {
    // 发送添加支付信息事件
    sendEvent('add_payment_info', {
      custom_data: {
        value: paymentSession?.amount,
        currency: 'USD',
        contents: plans, // 发送完整的商品列表
        content_ids: [planId],
      },
    })
    reportEvent('AddPaymentInfo', {
      content_ids: [planId],
      // contents: planName,
      currency: 'USD',
      value: paymentSession?.amount,
      contents: plans, // 发送完整的商品列表
      orderNo: paymentSession?.order_no,
    })

    // 处理信用卡过期日期
    const expirationDate = cardInfo.exexpirationDate.split('/')

    // 准备支付数据
    const data = {
      ...paymentSession,
      card: cardInfo.card.replace(/\s*/g, ''), // 移除卡号中的空格
      expiration_month: expirationDate[0],
      expiration_year: '20' + expirationDate[1],
      security_code: cardInfo.securityCode,
      first_name: cardInfo.firstName,
      last_name: cardInfo.lastName,
      items: note,
    }

    // 验证必要字段
    if (
      !data.card ||
      !data.expiration_month ||
      !data.expiration_year ||
      !data.security_code ||
      !data.first_name ||
      !data.last_name
    )
      return

    try {
      setLoading(true)
      // 发起支付请求
      const res = await starSaasPay(data)
      if ((res.code = 'SUCCESS')) {
        setPayState('SUCCESS')
        onComplete && onComplete()
        // 发送购买成功事件
        sendEvent('purchase', {
          custom_data: {
            currency: paymentSession?.currency,
            value: paymentSession?.amount,
            num_items: 1,
            contents: plans, // 发送完整的商品列表
            content_ids: [planId],
            content_type: 'product',
            transaction_id: paymentSession?.order_no,
          },
        })
        reportEvent('Purchase', {
          currency: paymentSession?.currency,
          value: paymentSession?.amount,
          content_ids: [planId],
          content_type: 'product',
          num_items: 1,
          plan,
          plans, // 添加完整的商品列表
          orderNo: paymentSession?.order_no,
        })
      }
      setLoading(false)
    } catch (e) {
      // 错误处理
      const error = getErrorMessage(tError, e)
      setErrorMessage(error)
      logError('Error creating star sass session: ' + error, { planId }, e)
      setLoading(false)
      setPayState('FAILED')
      onComplete && onComplete()
    }
  }

  return (
    <Box
      sx={
        !mobile
          ? {
              width: '950px',
              transition: 'all 0.2s',
            }
          : {}
      }
    >
      {/* 支付表单 */}
      {!payState &&
        (!loading ? (
          <Grid
            container
            spacing={8}
            sx={
              isMobile()
                ? {
                    paddingTop: '0px',
                  }
                : {
                    paddingTop: '30px',
                  }
            }
          >
            {/* 支付信息区域 */}
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              sx={
                isMobile()
                  ? {
                      paddingTop: '64px !important',
                    }
                  : {}
              }
            >
              <PayInfo paymentSession={paymentSession} />
            </Grid>
            {/* 支付方式区域 */}
            <Grid item xs={12} sm={12} md={6}>
              <PayWay email={session?.user?.email} onPay={handlePay} />
            </Grid>
          </Grid>
        ) : (
          // 加载状态
          <Box
            sx={
              !mobile
                ? {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                : {
                    minWidth: '300px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
            }
          >
            <CircularProgress />
          </Box>
        ))}
      {/* 错误信息显示 */}
      {errorMessage && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1">{errorMessage}</Typography>
        </Box>
      )}
      {/* 支付结果显示 */}
      {payState && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <PaymentResult success={payState == 'SUCCESS'} amount={paymentSession?.amount} />
        </Box>
      )}
    </Box>
  )
}
