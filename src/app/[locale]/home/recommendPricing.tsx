'use client'
import { useContext, useEffect } from 'react'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { EventEntry, useGTM } from '@/context/GTMContext'
import { AuthDialogContext } from '@/context/AuthDialogContext'

export default function RecommendPricing() {
  const { subscription } = useActiveSubscription()
  const { openDialog: openPricingDialog, isOpen: isPricingDialogOpen } = usePricingDialog()
  const { isOpen: isAuthDialogOpen } = useContext(AuthDialogContext)
  const { reportEvent } = useGTM()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthDialogOpen || isPricingDialogOpen) {
        return
      }
      if (!subscription || subscription.isFree) {
        reportEvent('PricingPopUp', {})
        openPricingDialog(EventEntry.RecommendPricingTimer)
      }
    }, 3 * 60 * 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return null
}
