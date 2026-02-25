'use client'  // 声明这是一个客户端组件

// 导入必要的依赖
import * as React from 'react'
import {useEffect} from 'react'  // React副作用钩子
import {useSession} from "next-auth/react"  // Next.js认证钩子
import {usePricingDialog} from '@/context/PricingDialogContext'  // 定价对话框上下文
// 移除硬编码背景色，改用语义化主题色
import PlanSelector from '@/app/[locale]/pricing/planSelector'  // 计划选择器组件
import {Plan} from '@/api/core/billing'  // 计划类型定义
import {useGTM} from '@/context/GTMContext'  // Google Tag Manager上下文
import {getLocalStorage} from '@/util/localStorage'  // 本地存储工具
import {createCheckout} from '@/api/client/feeLoveApi'  // 创建结账接口
import {useRouter, useParams} from 'next/navigation'  // Next.js路由钩子
import {ResultCode} from '@/api/core/common'  // API结果码

// 定义追踪数据接口
interface TrackingData {
    fbclid: string | null       // Facebook点击ID
    fbc: string | null          // Facebook浏览器Cookie
    gclid: string | null        // Google点击ID
    utmSource: string          // 流量来源
    timestamp: number          // 时间戳
}

// 存储键常量
const STORAGE_KEYS = {
    TRACKING: 'AVOID_AI_TRACKING',    // 追踪数据存储键
    SESSION: 'AVOID_AI_SESSION',      // 会话数据存储键
}

// 获取存储的来源参数
const getStoredUtmSource = () => {
    const storedTracking = getLocalStorage<TrackingData>(STORAGE_KEYS.TRACKING) || {} as TrackingData;
    return storedTracking.utmSource || '';
}

// 定价区域组件
export default function PricingSection(props: any) {
  // 使用必要的hooks和上下文
  const { openDialogWithPlanToBuy } = usePricingDialog()  // 定价对话框控制
  const { sendEvent } = useGTM()  // GTM事件发送
  const { data: session }:any = useSession()  // 用户会话数据
  const router = useRouter()  // 路由控制
  const params = useParams<{ locale: string }>()  // 获取locale参数

  // 组件加载时发送查看商品事件
  useEffect(()=> {
    localStorage.setItem('loginPosition', "7");
    sendEvent('view_item',{
      custom_data: {
        value: 1,                     // 事件价值
      }
    })
  },[])  // 空依赖数组，仅在组件挂载时执行一次

  // 如果没有计划数据，返回空
  if (!props.plans) {
    return null
  }

  // 处理购买按钮点击
  const handleBuy = async (plan: Plan, isCanBuy?: boolean, isUpgrade?: boolean) => {
    console.log('home/pricing handleBuy called with plan:', plan, 'isCanBuy:', isCanBuy, 'isUpgrade:', isUpgrade)

    // 检查是否有 session（登录用户或访客用户都会通过 signIn 创建 session）
    if (!session) {
      openDialogWithPlanToBuy(plan, isCanBuy)
      return
    }
    
    try {
      // 调用创建结账接口
      const type = plan?.tags[0] || 'type'
      const result = await createCheckout('credit_pack', plan.id)
      console.log('Checkout created:', result)
      
      // 检查返回结果，如果返回的是数组，取第一个元素
      const checkoutResult = Array.isArray(result) ? result[0] : result
      
      // 检查code是否为SUCCESS
      if (checkoutResult?.code === ResultCode.SUCCESS && checkoutResult?.data?.sessionId) {
        const sessionId = checkoutResult.data.sessionId
        const locale = params.locale || 'en'
        // 跳转到结账页面，携带session_id参数
        router.push(`/${locale}/feelove-checkout?session_id=${sessionId}`)
      } else if (result?.sessionId) {
        // 如果返回的直接是data对象（包含sessionId）
        const sessionId = result.sessionId
        const locale = params.locale || 'en'
        // 跳转到结账页面，携带session_id参数
        router.push(`/${locale}/feelove-checkout?session_id=${sessionId}`)
      } else {
        console.error('Checkout creation failed or missing sessionId:', result)
        // TODO: 显示错误提示
      }
    } catch (error) {
      console.error('Failed to create checkout:', error)
      // TODO: 处理错误，例如显示错误提示
    }
    
    // openDialogWithPlanToBuy(plan, isCanBuy)  // 打开购买对话框
  }

  // 渲染定价区域
  return (
    <div className="pb-3 pt-2 relative flex flex-col items-center text-foreground">
      <div
        id="pricing"
        className="w-full max-w-7xl md:px-4 mx-auto"
      >
        {/* 渲染计划选择器组件 */}
        <PlanSelector plans={props.plans} onBuy={handleBuy} creatingOrder={false} />
      </div>
    </div>
  )
}
