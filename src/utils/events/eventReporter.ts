import posthog from 'posthog-js'
import ReactGA from 'react-ga4'
import { createBehaviorEvent, EventType } from '@/api/client/behaviorEvent'
import { Session } from 'next-auth'
import { enrichEventDataWithGuestInfo, enrichEventDataWithUserInfo } from '@/services/eventInfo'
import {
  ANALYTICS_EVENTS_GUEST_WHITELIST,
  ANALYTICS_EVENTS_USER_WHITELIST,
  GAEventType,
} from '@/utils/events/analytics'
import { v4 as uuidv4 } from 'uuid'
import * as process from "process";

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

interface EventData {
  eventId: string
  sourceUrl?: string
  userType?: string
  userSource?: string
  fbc?: string
  fbp?: string
  gid?: string
  [key: string]: any
}

/**
 * 上报事件到 PostHog
 * @param eventName 事件名称
 * @param eventData 事件数据
 * @param session   用户会话信息（可选）
 */
const reportEventToPostHog = (eventName: string, eventData: EventData, session?: Session | null) => {
  if (process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
    eventData.eventId = uuidv4() + '-' + new Date().getTime()
    eventData.isLogin = !!session
    try {
      console.log('发送PostHog事件=========>', eventName)
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, { api_host: process.env.NEXT_PUBLIC_POSTHOG_API_HOST });
      const guestId = localStorage.getItem('GUEST_ID') || uuidv4() + '-' + new Date().getTime()

      if (!session) {//未登录
        posthog.identify(guestId);

      } else {
        posthog.identify(eventData?.id);
        // 设置用户属性
        posthog.people.set({
          email: eventData?.email,
        });
      }

      posthog.capture(eventName, eventData)

      if (eventName==='InitiateCheckout') {
        eventName = 'BeginCheckout'
      }
      if (eventName==='CompleteRegistration') {
        eventName = 'SignUp'
      }

      createBehaviorEvent({
        eventId: eventData.eventId,
        target: EventType.PostHog,
        event: eventName,
        isLogin: !!session,
        request: JSON.stringify({ eventData }),
        response: JSON.stringify({}),
        succeed: true,
        sourceUrl: eventData.sourceUrl || '',
        userSource: eventData.userSource || '',
        fbc: eventData.fbc || '',
        fbp: eventData.fbp || '',
        facebookId: '',
        gid: eventData.gid || '',
        guestId: guestId,
      })
    } catch (error) {
      console.error('上报PostHog事件失败:', error)
    }
  }
}

/**
 * 上报事件到 Google Analytics (GA4)
 * @param eventName 事件名称
 * @param eventData 事件数据
 * @param session   用户会话信息（可选）
 */
const reportEventToGA = (eventName: string, eventData: EventData, session?: Session | null) => {
  // GA参数为空，直接返回
  if (!process.env.NEXT_PUBLIC_GOOGLE_GA4_ID) {
    return
  }
  eventData.eventId = uuidv4() + '-' + new Date().getTime()
  if (
      eventData.gid &&
      (eventName == 'CompleteRegistration' ||
          eventName == 'InitiateCheckout' ||
          eventName == 'Purchase' ||
          eventName == 'AddPaymentInfo' ||
          eventName == 'AddToCart')
  ) {
    return
  }
  try {
    const gtagData = {
      send_to: process.env.NEXT_PUBLIC_GOOGLE_GA4_ID,
      value: eventData?.custom_data?.value || 1,
      currency: eventData?.custom_data?.currency || 'USD',
      transaction_id: eventData?.custom_data?.transaction_id || '',
      method: eventData?.custom_data?.method || '',
      location: eventData?.custom_data?.location || '',
      reason: eventData?.custom_data?.reason || '',
      requestID: eventData?.custom_data?.requestID || '',
      trigger_point: eventData?.custom_data?.trigger_point || '',
      login_channel: eventData?.custom_data?.login_channel || '',
      sourceUrl: eventData?.sourceUrl || '',
      isLogin: !!session,
      items: [
        {
          item_id: eventData?.eventData?.plan?.id?.toString() || '',
          item_name: eventData?.eventData?.plan?.name || '',
          quantity: 1,
        },
      ],
    }

    const mappedEventName = GAEventType[eventName]
    console.log('发送GA事件=========>', mappedEventName)
    ReactGA.gtag('event', mappedEventName, gtagData)
    if (eventName==='InitiateCheckout') {
      eventName = 'BeginCheckout'
    }
    if (eventName==='CompleteRegistration') {
      eventName = 'SignUp'
    }
    createBehaviorEvent({
      eventId: eventData.eventId,
      target: EventType.GA,
      event: eventName,
      isLogin: !!session,
      request: JSON.stringify({ eventData }),
      response: JSON.stringify({}),
      succeed: true,
      sourceUrl: eventData.sourceUrl || '',
      userSource: eventData.userSource || '',
      fbc: eventData.fbc || '',
      fbp: eventData.fbp || '',
      facebookId: '',
      gid: eventData.gid || '',
      guestId: localStorage.getItem('GUEST_ID') || uuidv4() + '-' + new Date().getTime(),
    })
  } catch (error) {
    console.error('上报GA事件失败:', error)
  }
}

/**
 * 处理用户数据，为不同平台生成所需格式（进行哈希处理）
 * @param rawData 原始数据
 */
function processUserDataForPlatforms(rawData: any) {
  const email = rawData?.email || rawData?.custom_data?.email || ''
  const firstName = rawData?.first_name || rawData?.custom_data?.first_name || ''
  const lastName = rawData?.last_name || rawData?.custom_data?.last_name || ''

  // PostHog和GA4直接使用原始数据
  return {
    email,
    first_name: firstName,
    last_name: lastName,
  }
}

/**
 * 统一提交事件到 GA 和 PostHog（除了Facebook的七个事件在隔壁处理）
 * 在提交之前，通过后端接口获取最新的事件数据，并进行哈希处理，
 * 最后将全部数据合并后，调用 GA 与 PostHog 的上报接口
 * @param eventName 事件名称
 * @param eventData 原始事件数据（上报信息以此为基础）
 * @param session   用户会话信息（可选）
 * @returns 合并后的最终事件数据
 */
export const reportEvent2 = async (eventName: string, eventData, session?: Session | null) => {
  try {
    // 检查事件是否在白名单中
    if (!ANALYTICS_EVENTS_GUEST_WHITELIST.has(eventName) && !ANALYTICS_EVENTS_USER_WHITELIST.has(eventName)) {
      console.warn(`Event "${eventName}" is not in the analytics events whitelist`)
      return
    }
    eventData.eventId = uuidv4() + '-' + new Date().getTime()
    let enrichedData: EventData
    if (ANALYTICS_EVENTS_USER_WHITELIST.has(eventName) && !!session) {
      enrichedData = await enrichEventDataWithUserInfo(eventData)
      // 对用户相关数据进行哈希处理
      const processedData = processUserDataForPlatforms(enrichedData)

      // 合并后生成最终的事件数据。这里将原始用户数据、以及（可选）哈希后的数据一起传入上报接口
      const finalEventData: EventData = {
        ...enrichedData,
        // 将用户原始数据直接合并到事件数据中（方便GA和PostHog读取）
        ...processedData,
      }
      // 将最终数据依次传入PostHog和GA的上报接口
      reportEventToPostHog(eventName, finalEventData, session)
      reportEventToGA(eventName, finalEventData, session)
    } else if (ANALYTICS_EVENTS_GUEST_WHITELIST.has(eventName) && !session) {
      enrichedData = await enrichEventDataWithGuestInfo(eventData)
      // 对用户相关数据进行哈希处理
      const processedData = processUserDataForPlatforms(enrichedData)

      // 合并后生成最终的事件数据。这里将原始用户数据、以及（可选）哈希后的数据一起传入上报接口
      const finalEventData: EventData = {
        ...enrichedData,
        // 将用户原始数据直接合并到事件数据中（方便GA和PostHog读取）
        ...processedData,
      }
      // 将最终数据依次传入PostHog和GA的上报接口
      reportEventToPostHog(eventName, finalEventData, session)
      reportEventToGA(eventName, finalEventData, session)
    } else {
      console.warn(`Event "${eventName}" does not match any known whitelist`)
      return
    }

    return
  } catch (error) {
    console.error('reportEvent错误:', error)
    throw error
  }
}
