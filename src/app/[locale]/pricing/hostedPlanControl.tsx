'use client'
import {Plan} from '@/api/core/billing'
import {useRouter} from '@/components/next-intl-progress-bar'
import EmbeddedPlanControl from '@/app/[locale]/pricing/embeddedPlanControl'
import {useState} from 'react'
import {EventEntry, useGTM} from '@/context/GTMContext'

interface HostedPlanControlProps {
  plans: Plan[]
  compact?: boolean
}
export default function HostedPlanControl({ plans, compact }: HostedPlanControlProps) {
  const router = useRouter()
  const [planToBuy, setPlanToBuy] = useState<Plan>()
  const { sendEvent } = useGTM()

  const handleSetPlanToBuy = (plan: Plan) => {
    setPlanToBuy(plan)
  }

  return (
    <EmbeddedPlanControl
      plans={plans}
      planToBuy={planToBuy}
      setPlanToBuy={handleSetPlanToBuy}
      onClose={() => router.push('/')}
      compact={compact}
      wrappedByCard
      entry={EventEntry.PricingPage}
    />
  )
}
