'use client'
import { useTranslations } from '@/hooks/useTranslations'
import { useRouter } from '@/components/next-intl-progress-bar'
import { isMobile } from '@/util/browser'
import { useEffect, useState } from 'react'
import { pixelParams, useGTM } from '@/context/GTMContext'
import { useSession } from 'next-auth/react'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'

interface PaymentResultProps {
  success: boolean
  amount?: string
  note?: string
  orderNo?: string
  errorMessage?: string
}
export default function PaymentResult({ success, amount, note, orderNo, errorMessage }: PaymentResultProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { refreshActiveSubscription } = useActiveSubscription()
  const tBilling = useTranslations('Billing')
  const [showBackButton, setShowBackButton] = useState(false)
  const { sendEvent, reportEvent } = useGTM()

  const [planId, planName, entry] = (note || '').split('__')

  useEffect(() => {
    const mobile = isMobile()
    setShowBackButton(mobile)

    // iframe context
    if (!mobile) {
      if (success) {
        window.parent.postMessage({ type: 'payment-success', content: 'success' }, '*')
      } else {
        window.parent.postMessage({ type: 'payment-failed', content: 'failed' }, '*')
        //payment_fail
        reportEvent('PaymentFail', {})
      }
    } else if (success) {
      refreshActiveSubscription(3000)
    }
  }, [])

  return (
    <div className="mt-12 flex justify-center flex-col items-center gap-1">
      {success && (
        <>
          <img src="/payment-success.png" alt="payment success" className="h-32" />
          <div className="text-2xl mb-4 font-semibold">{tBilling('payment_success')}</div>
          <div className="text-lg">{tBilling('amount')}</div>
          <div className="text-2xl">${amount}</div>
          {planName && <div className="text-base">{planName}</div>}
        </>
      )}
      {!success && (
        <>
          <img src="/payment-failed.png" alt="payment failed" className="h-24" style={{ marginRight: '-24px' }} />
          <div className="text-2xl mb-4 font-semibold">{tBilling('payment_failed')}</div>
          <div className="text-base px-4 text-center">{errorMessage}</div>
        </>
      )}
    </div>
  )
}
