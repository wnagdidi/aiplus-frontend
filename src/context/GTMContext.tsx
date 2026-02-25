'use client'
import { Context, createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'
import { Session } from 'next-auth/src'
import { Plan, PlanDuration } from '@/api/core/billing'
import { sha256 } from '@/util/crypto'
import { trimLowerCase } from '@/util/string'
import { v4 as uuidv4 } from 'uuid'
import { handleViewItemEvent } from '@/utils/events/viewContent'
import { handleStartTrialEvent } from '@/utils/events/startTrial'
import { handleSignUpEvent } from '@/utils/events/signUp'
import {
  handleAddToCartEvent,
  handleBeginCheckoutEvent,
  handleAddPaymentInfoEvent,
  handlePurchaseEvent,
} from '@/utils/events/purchase'
import { reportEvent2 } from '@/utils/events/eventReporter'
import ReactGA from "react-ga4";
import * as process from "process";
import { handleTranslatorEvent } from '@/utils/events/translator'

export enum EventEntry {
  CompareCTA = 'CompareCTA',
  ReasonsCTA = 'ReasonsCTA',
  CustomersCTA = 'CustomersCTA',
  StepsCTA = 'StepsCTA',
  DetectorsCTA = 'DetectorsCTA',
  GeneralRecommendCTA = 'GeneralRecommendCTA',
  HeaderLoginButton = 'HeaderLoginButton',
  HeaderTryForFreeButton = 'HeaderTryForFreeButton',
  Banner = 'Banner',
  HeaderUpgradeButton = 'HeaderUpgradeButton',
  LoginDialog = 'LoginDialog',
  SignupDialog = 'SignupDialog',
  RichSignupDialog = 'RichSignupDialog',
  LoginPage = 'LoginPage',
  SignupPage = 'SignupPage',
  HumanizePasteButton = 'HumanizePasteButton',
  ResetPasswordForm = 'ResetPasswordForm',
  ProfileChoosePlanButton = 'ProfileChoosePlanButton',
  UserMenuUpgradeButton = 'UserMenuUpgradeButton',
  RecommendPricingTimer = 'RecommendPricingTimer',
  HomePricingSection = 'HomePricingSection',
  PricingPage = 'PricingPage',
  PricingDialog = 'PricingDialog',
  HumanizeHitWordLimitUpgradeButton = 'HumanizeHitWordLimitUpgradeButton',
  HumanizeExceedWordLimitPerRequestUpgradeButton = 'HumanizeExceedWordLimitPerRequestUpgradeButton',
  Humanize2ndFreeTry = 'Humanize2ndFreeTry',
  HumanizeExceedWordsLimit = 'HumanizeExceedWordsLimit',
  Humanize2ndFreeTrySample = 'Humanize2ndFreeTrySample',
  HumanizeCustomContentWithoutLogin = 'HumanizeCustomContentWithoutLogin',
  HumanizeMonthlyUsageGetMoreButton = 'HumanizeMonthlyUsageGetMoreButton',
  HumanizeParametersSelect = 'HumanizeParametersSelect',

  LoginPositionTryFree = 'LoginPositionTryFree',
  LoginPositionGetFree = 'LoginPositionGetFree',
  LoginPositionMiddleButton = 'LoginPositionMiddleButton',
  LoginPositionPageBottom = 'LoginPositionPageBottom',
  LoginPositionDetectorBottom = 'LoginPositionDetectorBottom',
  LoginPositionPrice = 'LoginPositionPrice',
}

export enum LoginType {
  Email = 'Email',
  Google = 'Google',
  Facebook = 'Facebook',
  GoogleOneTap = 'GoogleOneTap',
}

export enum EventEnvironentType {
  Frontend = 'frontend',
  Backend = 'backend',
  Both = 'both',
}

const fbPixelId: any = process.env.NEXT_PUBLIC_PIXEL_ID

export const GTMContext: Context<{
  sendEvent: (eventName: string, data?: any) => Promise<void>
  reportEvent: (eventName: string, eventData: any) => Promise<void>
}> = createContext({
  sendEvent: (eventName: string, data: any) => {},
  reportEvent: async (eventName: string, eventData: any) => {},
})

export const GTMProvider = ({ children }: any) => {
  const { subscription } = useActiveSubscription()
  const { data: session }: { data: Session | null } = useSession()

  // const pathName = usePathname()
  //   console.log(pathName)

  const facebookEventMap: {
    [propName: string]: string
  } = {
    view_item: 'ViewContent',
    start_trial: 'StartTrial',
    sign_up: 'CompleteRegistration',
    add_to_cart: 'AddToCart',
    begin_checkout: 'InitiateCheckout',
    add_payment_info: 'AddPaymentInfo',
    purchase: 'Purchase',
  }

  const googleEventMap: {
    [propName: string]: string
  } = {
    view_item: 'ViewContent',
    start_trial: 'StartTrial',
    sign_up: 'CompleteRegistration',
    add_to_cart: 'AddToCart',
    begin_checkout: 'InitiateCheckout',
    add_payment_info: 'AddPaymentInfo',
    purchase: 'Purchase',
  }



  const sendEvent = async (eventName: string, data?: any) => {
    const defaultEventName = facebookEventMap[eventName]
    const defaultGoogleEventName = googleEventMap[eventName]
    const eventId = uuidv4() + '-' + new Date().getTime()
    // TODO: fbc获取有问题需要修复
    const externalId = (session?.user?.fbc ? session?.user?.fbc : '') + '-' + uuidv4() + '-' + new Date().getTime()

    // 新的内容---------------------------------

    data = {
      ...data,
      eventId: eventId,
      externalId: externalId,
    }

    // 初始化Facebook Pixel
    try {
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PIXEL_ID) {
        const ReactPixel = await import('react-facebook-pixel').then((x) => x.default)
        const fbPixelId = process.env.NEXT_PUBLIC_PIXEL_ID || ''
        console.log('GTMContext: Initializing Facebook Pixel with ID:', fbPixelId);

        if (!window.fbq) {
          ReactPixel.init(fbPixelId, undefined, {
            autoConfig: true,
            cookie: true,
            debug: true
          })
          console.log('GTMContext: Facebook Pixel initialized successfully')
        } else {
          console.log('GTMContext: Facebook Pixel already initialized')
        }

        // 确保 fbq 函数存在
        /*if (typeof window.fbq === 'function') {
          console.log('GTMContext: Sending event:', eventName, 'with data:', data);
          ReactPixel.fbq('track', eventName, data);
          console.log('GTMContext: Event sent successfully');
        } else {
          console.error('GTMContext: fbq function not found');
        }*/
      }
    } catch (error) {
      console.error('GTMContext: Failed to initialize Facebook Pixel:', error)
    }
    // 初始化GA
    if (process.env.NEXT_PUBLIC_GOOGLE_ANALYSIS_ID) {
      if (process.env.NEXT_PUBLIC_ENVIRONMENT_MOD === 'test') {
        ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYSIS_ID, { debug: true })
      }else {
        ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYSIS_ID)
      }
    }

    switch (eventName) {
      case 'view_item':
        // 处理访客首页访问
        await handleViewItemEvent(session, data)
        break
      case 'start_trial':
        // 处理开始试用事件
        await handleStartTrialEvent(session, data)
        break
      case 'sign_up':
        // 完成注册
        await handleSignUpEvent(session, data)
        break
      case 'add_to_cart':
        // 添加到购物车
        await handleAddToCartEvent(session, data)
        break
      case 'begin_checkout':
        // 开始结账
        await handleBeginCheckoutEvent(session, data)
        break
      case 'add_payment_info':
        // 添加支付信息
        await handleAddPaymentInfoEvent(session, data)
        break
      case 'purchase':
        // 完成购买
        await handlePurchaseEvent(session, data)
        break
      case 'translator': 
        // 翻译
        await handleTranslatorEvent(session, data)
        break;
    }
  }

  const reportEvent = async (eventName: string, eventData: any) => {
    // 初始化GA
    if (process.env.NEXT_PUBLIC_GOOGLE_GA4_ID) {
      if (process.env.NEXT_PUBLIC_ENVIRONMENT_MOD === 'test') {
        ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_GA4_ID, { debug: true })
      }else {
        ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_GA4_ID)
      }
    }
    await reportEvent2(eventName, eventData, session)
  }

  return (
    <GTMContext.Provider
      value={{
        sendEvent,
        reportEvent,
      }}
    >
      {children}
    </GTMContext.Provider>
  )
}

export const useGTM = () => {
  return useContext(GTMContext)
}

export const pixelParams = (plan?: Plan, session?: Session, orderNo?: string) => {
  const isLifetime = plan?.tags?.[0] === PlanDuration.Lifetime
  const totalPrice =
    plan &&
    (isLifetime ? plan?.realPriceOneMonth : plan.totalPrice ? plan.totalPrice : plan?.realPriceOneMonth * plan?.months)
  return {
    eventModel: {
      currency: 'USD',
      value: totalPrice,
      contents: [
        {
          id: plan?.id,
          quantity: 1,
          item_price: totalPrice,
        },
      ],
      num_items: plan && 1,
      content_type: plan && 'product',
      content_ids: plan && [plan.id],
      transaction_id: orderNo,
      user_data: session && {
        em: sha256(trimLowerCase(session?.user?.email)),
        fn: sha256(trimLowerCase(session?.user?.name)),
        ln: sha256(trimLowerCase(session?.user?.firstName)),
      },
    },
  }
}
