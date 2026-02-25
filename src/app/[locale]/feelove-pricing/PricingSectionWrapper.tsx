'use client'

import PricingSection from '@/app/[locale]/home/pricing'
import { useEffect } from 'react'
import { useGTM } from '@/context/GTMContext'
import { Plan } from '@/api/core/billing'

interface PricingSectionWrapperProps {
  plans: Plan[]
}

/**
 * 客户端包装组件，用于在服务端页面中使用 PricingSection
 * 
 * 注意：PricingSection 本身已经是客户端组件，并且已经使用了 useGTM
 * 这个包装组件的主要目的是：
 * 1. 明确标识这是一个客户端组件边界
 * 2. 如果将来需要在页面级别添加额外的 GTM 事件，可以在这里添加
 * 
 * 如果不需要额外的页面级别事件，也可以直接使用 PricingSection
 */
export default function PricingSectionWrapper({ plans }: PricingSectionWrapperProps) {
  // PricingSection 已经是一个客户端组件，并且已经发送了 view_item 事件
  // 如果需要添加页面级别的额外 GTM 事件，可以在这里添加
  // 例如：
  const { sendEvent } = useGTM()
  useEffect(() => {
    sendEvent('add_to_cart', {
      custom_data: {
        content_ids: [],
        content_type: 'product',
        contents: plans,
        currency: 'USD',             // 货币单位
        value: 1,                     // 事件价值
      }
    })
  }, [])

  return <PricingSection plans={plans} />
}
