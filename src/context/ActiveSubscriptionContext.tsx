"use client"
import { Context, createContext, useContext, useEffect, useState } from "react"
import { Subscription } from "@/api/core/billing"
import { getActiveSubscription } from "@/api/client/billingApi"
import { useSnackbar } from "@/context/SnackbarContext"
import CoreApiError from "@/api/core/coreApiError"
import { useTranslations } from "@/hooks/useTranslations"
import { useSession } from "next-auth/react"

export const ActiveSubscriptionContext: Context<{
  isLoading: boolean
  subscription: Subscription | undefined
  isUnlimited: boolean
  isWordsPerRequestUnlimited: boolean
  isPaid: boolean
  isFree: boolean
  isOneTime: boolean
  refreshActiveSubscription: (delay?: number) => Promise<void>
}> = createContext({
  isLoading: true,
  subscription: undefined,
  isUnlimited: false,
  isWordsPerRequestUnlimited: false,
  isPaid: false,
  isFree: false,
  isOneTime: false,
  refreshActiveSubscription: async () => {},
})

export const ActiveSubscriptionProvider = ({
  subscription: initialValue,
  children,
}: any) => {
  const tError = useTranslations("Error")
  const [subscription, setSubscription] = useState<Subscription>(initialValue)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { showSnackbar } = useSnackbar()
  const { data: session } = useSession()

  const isUnlimited = subscription?.wordsLimitTotal === 0
  const isWordsPerRequestUnlimited = subscription?.wordsLimitOneTimes === 0
  const isPaid = (subscription && !subscription.isFree && subscription.status === 'ACTIVE') || false
  const isFree = subscription?.isFree || false
  const isOneTime = !isFree && subscription?.plan?.months === 0
  //console.log("subscription", subscription)
  const refreshActiveSubscription = async (delay: number = 0) => {
    if (!session) {
      return
    }
    try {
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
      const activeSubscription = await getActiveSubscription()
      setSubscription(activeSubscription)
    } catch (e) {
      if (e instanceof CoreApiError) {
        showSnackbar(tError(e.code, e.context()), "error")
      } else {
        showSnackbar(e.message, "error")
      }
    }
  }

  useEffect(() => {
    if (subscription || !session) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
      refreshActiveSubscription()
    }
  }, [subscription, session])

  return (
    <ActiveSubscriptionContext.Provider
      value={{
        isLoading,
        subscription,
        isUnlimited,
        isWordsPerRequestUnlimited,
        isPaid,
        isFree,
        isOneTime,
        refreshActiveSubscription,
      }}
    >
      {children}
    </ActiveSubscriptionContext.Provider>
  )
}

export const useActiveSubscription = () => {
  return useContext(ActiveSubscriptionContext)
}
