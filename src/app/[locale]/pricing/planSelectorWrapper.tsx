'use client'
import { useState } from 'react'
import { Plan } from '@/api/core/billing'
import { usePricingDialog } from '@/context/PricingDialogContext'
import PlanSelector from '@/app/[locale]/pricing/planSelector'

// 客户端组件包装器
export default function PlanSelectorWrapper({ plans }: { plans: Plan[] }) {
  const { openDialogWithPlanToBuy } = usePricingDialog()
  const [creatingOrder, setCreatingOrder] = useState(false)

  const handleBuy = (plan: Plan, isCanBuy?: boolean, isUpgrade?: boolean) => {
    console.log('pricing/page handleBuy called with plan:', plan, 'isCanBuy:', isCanBuy, 'isUpgrade:', isUpgrade)
    openDialogWithPlanToBuy(plan, isCanBuy)
  }

  return (
    <PlanSelector 
      isOpen={false} 
      plans={plans} 
      onBuy={handleBuy}
      creatingOrder={creatingOrder}
    />
  )
}
