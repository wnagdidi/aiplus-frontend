import posthog from 'posthog-js'
import ReactGA from 'react-ga4'
import { createBehaviorEvent, EventType } from '@/api/client/behaviorEvent'
// 导入next-auth的Session类型
import { Session } from 'next-auth'
import { v4 as uuidv4 } from 'uuid'
import * as process from "process";
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'

// 添加 PostHog 类型定义
declare global {
  interface Window {
    posthog: {
      identify: (id: string) => void;
      capture: (eventName: string, properties?: Record<string, any>) => void;
      people: {
        set: (properties: Record<string, any>) => void;
      };
    };
  }
}

// 定义支持的事件类型
export enum AnalyticsEventType {
  VIEW_CONTENT = 'ViewContent',
  START_TRIAL = 'StartTrial',
  ADD_PAYMENT_INFO = 'AddPaymentInfo',
  ADD_TO_CART = 'AddToCart',
  COMPLETE_REGISTRATION = 'CompleteRegistration',
  INITIATE_CHECKOUT = 'InitiateCheckout',
  PURCHASE = 'Purchase',

  CLICK_HUMANIZE = 'ClickHumanize',
  CLICK_SAMPLE = 'ClickSample',
  CLICK_LOGIN = 'ClickLogin',
  LOGIN_SUCCESS = 'LoginSuccess',
  LOGIN_FAILED = 'LoginFailed',
  CLICK_HUMANIZE_MORE = 'ClickHumanizeMore',
  HUMANIZE_MORE_SUCCESS = 'HumanizeMoreSuccess',
  HUMANIZE_FAILED = 'HumanizeFailed',
  CLICK_COPY = 'ClickCopy',
  CLICK_RATE = 'ClickRate',
  HUMANIZE_SUCCESS = 'HumanizeSuccess',
  CLICK_REGISTER = 'ClickRegister',
  PAYMENT_FAIL = 'PaymentFail',

  MAIL_REGISTER_FAILED = 'MailRegisterFailed',

  CLICK_DETECTOR = 'ClickDetector',
  DETECTOR_FAILED = 'DetectorFailed',
  DETECTOR_SUCCESS = 'DetectorSuccess',
  SWITCH_TAB_DETECTOR = 'SwitchTabDetector',

  TRANSLATE_SUCCESS = 'translate_success',
  TRANSLATE_FAIL = 'translate_fail',
  TRANSLATE_CLICK_COPY= 'translate_click_copy',
  TRANSLATE_CLICK_RATE = 'translate_click_rate',
  TRANSLATE_CLICK_HUMANIZE = 'translate_click_humanize',
  TRANSLATE_CLICK_MODEL = 'translate_click_model',
  TRANSLATE_CLICK_FORM_LANGUAGE = 'translate_click_from_language',
  TRANSLATE_CLICK_TARGET = 'translate_click_target',
  TRANSLATE_CLICK_TYPE = 'translate_click_type',
  TRANSLATE_CLICK_AUTO = 'translate_click_auto',

  MORE_SETTING = 'MoreSetting',
  HUMANZIE_MODE = 'HumanzieMode',
  PRICE_PAGE_TAB = 'PricePageTab',
  PRICE_PAGE_UPGRADE = 'PricePageUpgrade',
  PRICING_POP_UP = 'PricingPopUp',
  BEGIN_CHECKOUT_ACTIVE = 'BeginCheckoutActive',
  BEGIN_CHECKOUT_PASSIVE = 'BeginCheckoutPassive',
  CLICK_TAB_HUMANIZE = 'ClickTabHumanize',
  CLICK_TAB_TRANSLATOR = 'ClickTabTranslator',
  CLICK_TAB_DETECTOR = 'ClickTabDetector'
}

// 定义访客事件白名单
export const ANALYTICS_EVENTS_GUEST_WHITELIST = new Set<string>([
  AnalyticsEventType.VIEW_CONTENT,
  AnalyticsEventType.START_TRIAL,
  AnalyticsEventType.CLICK_SAMPLE,
  AnalyticsEventType.CLICK_LOGIN,
  AnalyticsEventType.LOGIN_SUCCESS,
  AnalyticsEventType.LOGIN_FAILED,
  AnalyticsEventType.CLICK_REGISTER,
  AnalyticsEventType.MAIL_REGISTER_FAILED,
  AnalyticsEventType.CLICK_DETECTOR,
  AnalyticsEventType.DETECTOR_FAILED,
  AnalyticsEventType.DETECTOR_SUCCESS,
  AnalyticsEventType.SWITCH_TAB_DETECTOR,
  AnalyticsEventType.HUMANIZE_FAILED,
  AnalyticsEventType.TRANSLATE_SUCCESS,
  AnalyticsEventType.TRANSLATE_FAIL,
  AnalyticsEventType.TRANSLATE_CLICK_COPY,
  AnalyticsEventType.TRANSLATE_CLICK_RATE,
  AnalyticsEventType.TRANSLATE_CLICK_HUMANIZE,
  AnalyticsEventType.TRANSLATE_CLICK_MODEL,
  AnalyticsEventType.TRANSLATE_CLICK_FORM_LANGUAGE,
  AnalyticsEventType.TRANSLATE_CLICK_TARGET,
  AnalyticsEventType.TRANSLATE_CLICK_TYPE,
  AnalyticsEventType.TRANSLATE_CLICK_AUTO,
  AnalyticsEventType.MORE_SETTING,
  AnalyticsEventType.HUMANZIE_MODE,
  AnalyticsEventType.PRICE_PAGE_TAB,
  AnalyticsEventType.PRICING_POP_UP,
  AnalyticsEventType.CLICK_TAB_HUMANIZE,
  AnalyticsEventType.CLICK_TAB_TRANSLATOR,
  AnalyticsEventType.CLICK_TAB_DETECTOR
])

// 定义用户事件白名单
export const ANALYTICS_EVENTS_USER_WHITELIST = new Set<string>([
  AnalyticsEventType.VIEW_CONTENT,
  AnalyticsEventType.CLICK_HUMANIZE,
  AnalyticsEventType.ADD_PAYMENT_INFO,
  AnalyticsEventType.ADD_TO_CART,
  AnalyticsEventType.COMPLETE_REGISTRATION,
  AnalyticsEventType.INITIATE_CHECKOUT,
  AnalyticsEventType.PURCHASE,
  AnalyticsEventType.LOGIN_SUCCESS,
  AnalyticsEventType.CLICK_HUMANIZE_MORE,
  AnalyticsEventType.HUMANIZE_MORE_SUCCESS,
  AnalyticsEventType.CLICK_COPY,
  AnalyticsEventType.CLICK_RATE,
  AnalyticsEventType.HUMANIZE_SUCCESS,
  AnalyticsEventType.PAYMENT_FAIL,
  AnalyticsEventType.CLICK_DETECTOR,
  AnalyticsEventType.DETECTOR_FAILED,
  AnalyticsEventType.DETECTOR_SUCCESS,
  AnalyticsEventType.SWITCH_TAB_DETECTOR,
  AnalyticsEventType.HUMANIZE_FAILED,
  AnalyticsEventType.CLICK_SAMPLE,
  AnalyticsEventType.TRANSLATE_SUCCESS,
  AnalyticsEventType.TRANSLATE_FAIL,
  AnalyticsEventType.TRANSLATE_CLICK_COPY,
  AnalyticsEventType.TRANSLATE_CLICK_RATE,
  AnalyticsEventType.TRANSLATE_CLICK_HUMANIZE,
  AnalyticsEventType.TRANSLATE_CLICK_MODEL,
  AnalyticsEventType.TRANSLATE_CLICK_FORM_LANGUAGE,
  AnalyticsEventType.TRANSLATE_CLICK_TARGET,
  AnalyticsEventType.TRANSLATE_CLICK_TYPE,
  AnalyticsEventType.TRANSLATE_CLICK_AUTO,
  AnalyticsEventType.MORE_SETTING,
  AnalyticsEventType.HUMANZIE_MODE,
  AnalyticsEventType.PRICE_PAGE_TAB,
  AnalyticsEventType.PRICE_PAGE_UPGRADE,
  AnalyticsEventType.PRICING_POP_UP,
  AnalyticsEventType.BEGIN_CHECKOUT_ACTIVE,
  AnalyticsEventType.BEGIN_CHECKOUT_PASSIVE,
  AnalyticsEventType.CLICK_TAB_HUMANIZE,
  AnalyticsEventType.CLICK_TAB_TRANSLATOR,
  AnalyticsEventType.CLICK_TAB_DETECTOR
])

// 发送给GA前要如此映射
export const GAEventType: Record<string, string> = {
  ViewContent: 'view_content',
  StartTrial: 'start_trial',
  AddPaymentInfo: 'add_payment_info',
  AddToCart: 'add_to_cart',
  CompleteRegistration: 'sign_up',
  InitiateCheckout: 'begin_checkout',
  Purchase: 'purchase',
  ClickHumanize: 'click_humanize',
  ClickSample: 'click_sample',
  ClickLogin: 'click_login',
  LoginSuccess: 'login_success',
  LoginFailed: 'login_failed',
  ClickHumanizeMore: 'click_humanizemore',
  HumanizeMoreSuccess: 'humanizemore_success',
  ClickCopy: 'click_copy',
  ClickRate: 'click_rate',
  HumanizeSuccess: 'humanize_success',
  ClickRegister: 'click_register',
  PaymentFail: 'payment_fail',
  MailRegisterFailed: 'mail_register_failed',
  ClickDetector: 'click_detector',
  DetectorFailed: 'detector_failed',
  DetectorSuccess: 'detector_success',
  SwitchTabDetector: 'switch_tab_detector',
  HumanizeFailed: 'humanize_failed',

  translate_success: "translate_success", // 翻译成功
  translate_fail: 'translate_fail', // 翻译失败
  translate_click_copy: 'translate_click_copy', // 点击复制
  translate_click_rate: 'translate_click_rate', // 点击评分
  translate_click_humanize: 'translate_click_humanize', // 点击人性化
  translate_click_model: 'translate_click_model', // 点击专业类型
  translate_click_from_language: 'translate_click_from_language', // 点击源语言
  translate_click_target: 'translate_click_target', // 点击目标语言
  translate_click_type: 'translate_click_type', // 切换翻译type， text/document
  translate_click_auto: 'translate_click_auto', // 点击自动检测

  MoreSetting: 'more setting',
  HumanzieMode: 'humanzie_mode',
  PricePageTab: 'access the price page-tab',
  PricePageUpgrade: 'access the price page-upgrade',
  PricingPopUp: 'Pricing Pop-up Window',
  BeginCheckoutActive: 'begin_checkout-active',
  BeginCheckoutPassive: 'begin_checkout-passive',
  ClickTabHumanize: 'click_tab_humanize',
  ClickTabTranslator: 'click_tab_translator',
  ClickTabDetector: 'click_tab_detector'
}

/**
 * 为 Facebook 的前4个事件（ViewContent、StartTrial、SignUp、AddToCart）发送事件到 GA 和 PostHog
 * @param session
 * @param eventName 原始事件名称
 * @param data 事件数据
 * @param processedData 处理后的用户数据
 * @param toGG
 */
export const sendToAnalytics = async (session: Session, eventName: string, data: any, processedData: any, toGG = false) => {
  //没有配置GA参数，直接返回
  if (!process.env.NEXT_PUBLIC_GOOGLE_GA4_ID) {
    return
  }
  // 如果事件名称不在映射表中，直接返回
  // 检查事件是否在白名单中
  if (!ANALYTICS_EVENTS_GUEST_WHITELIST.has(eventName) && !ANALYTICS_EVENTS_USER_WHITELIST.has(eventName)) {
    console.warn(`Event "${eventName}" is not in the analytics events whitelist`)
    return
  }
  // 获取映射后的事件名称
  const mappedEventName = GAEventType[eventName]

  let postOwnServerEvent = data.event
  if (data.event === 'InitiateCheckout') {
    postOwnServerEvent = 'BeginCheckout'
  }
  if (data.event === 'CompleteRegistration') {
    postOwnServerEvent = 'SignUp'
  }

  // 构建事件数据
  const eventData = {
    eventId: data.eventId,
    ...data?.custom_data,
    ...processedData.rawUserData, // 使用原始用户数据
    userType: data?.userType || 'ANONYMITY',
    plan: data?.custom_data?.plan || {},
    isLogin: !!session
  }

  console.log(eventData, 'eventData')

  eventData.eventId = uuidv4() + '-' + new Date().getTime()
  // 发送到 PostHog
  if (process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
    try {
      console.log('发送posthog事件=========>', mappedEventName)
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, { api_host: process.env.NEXT_PUBLIC_POSTHOG_API_HOST });
      const guestId = localStorage.getItem('GUEST_ID') || uuidv4() + '-' + new Date().getTime()
      if (!session) {//未登录
        posthog.identify(guestId);
      }else {
        posthog.identify(data?.id);
        // 设置用户属性
        posthog.people.set({
          email: data?.email,
        });
      }
      posthog.capture(mappedEventName, eventData)
      await createBehaviorEvent({
        eventId: data.eventId,
        target: EventType.PostHog,
        event: postOwnServerEvent,
        isLogin: !!session,
        request: JSON.stringify({ eventData }),
        response: JSON.stringify({}),
        succeed: true,
        sourceUrl: data.sourceUrl,
        userSource: data.userSource,
        fbc: data.fbc,
        fbp: data.fbp,
        facebookId: '',
        gid: data.gid,
        guestId: guestId,
      })
    } catch (error) {
      console.error('Failed to send event to PostHog:', error)
    }
  }
  if (
    toGG &&
    (eventName == 'CompleteRegistration' ||
      eventName == 'InitiateCheckout' ||
      eventName == 'Purchase' ||
      eventName == 'AddPaymentInfo' ||
      eventName == 'AddToCart')
  ) {
    return
  }
  eventData.eventId = uuidv4() + '-' + new Date().getTime()
  // 发送到 GA4
  try {
    const gtagData = {
      send_to: process.env.NEXT_PUBLIC_GOOGLE_GA4_ID,
      value: data.custom_data.value,
      currency: data?.custom_data?.currency || 'USD',
      method:data?.custom_data?.method || '',
      location:data?.custom_data?.location || '',
      isLogin: !!session,
      ...data.custom_data,
    }
    console.log('发送ga事件=========>', mappedEventName)
    ReactGA.gtag('event', mappedEventName, gtagData)
    await createBehaviorEvent({
      eventId: data.eventId,
      target: EventType.GA,
      event: postOwnServerEvent,
      isLogin: !!session,
      request: JSON.stringify({ eventData }),
      response: JSON.stringify({}),
      succeed: true,
      sourceUrl: data.sourceUrl,
      userSource: data.userSource,
      fbc: data.fbc,
      fbp: data.fbp,
      facebookId: '',
      gid: data.gid,
      guestId: localStorage.getItem('GUEST_ID') || uuidv4() + '-' + new Date().getTime(),
    })
  } catch (error) {
    console.error('Failed to send event to GA:', error)
  }
}
