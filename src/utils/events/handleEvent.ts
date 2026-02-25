import { Session } from 'next-auth'
import { enrichEventDataWithUserInfo } from '@/services/eventInfo'
import { sendServeEvent } from '@/api/client/event'
import { createBehaviorEvent, EventType } from '@/api/client/behaviorEvent'
import ReactPixel from 'react-facebook-pixel'
import ReactGA from 'react-ga4'
import { googleTagMap } from '@/context/GTMContext'
import { sha256 } from '@/util/crypto'
import { sendToAnalytics } from './analytics'
import { v4 as uuidv4 } from 'uuid'
import * as process from "process";

/**
 * 处理用户数据，为不同平台生成所需格式
 */
function processUserDataForPlatforms(rawData: any) {
  const email = rawData?.email || rawData?.custom_data?.email || ''
  const firstName = rawData?.first_name || rawData?.custom_data?.first_name || ''
  const lastName = rawData?.last_name || rawData?.custom_data?.last_name || ''

  // Facebook需要的哈希数据
  const facebookUserData = {
    em: sha256(email.toLowerCase()),
    fn: sha256(firstName.toLowerCase()),
    ln: sha256(lastName.toLowerCase()),
  }

  // Google Ads需要的哈希数据
  const googleAdsUserData = {
    email: sha256(email.toLowerCase()),
    first_name: sha256(firstName.toLowerCase()),
    last_name: sha256(lastName.toLowerCase()),
  }

  // PostHog和GA4使用的原始数据
  const rawUserData = {
    email,
    first_name: firstName,
    last_name: lastName,
  }

  return {
    facebookUserData,
    googleAdsUserData,
    rawUserData,
  }
}
// 发送给GG
export const GGEventTag: Record<string, string> = {
  AddPaymentInfo: process.env.NEXT_PUBLIC_GOOGLE_ADD_PAYMENT_INFO_TAG,
  AddToCart: process.env.NEXT_PUBLIC_GOOGLE_ADD_TO_CART_TAG,
  CompleteRegistration: process.env.NEXT_PUBLIC_GOOGLE_COMPLETE_REGISTRATION_TAG,
  InitiateCheckout: process.env.NEXT_PUBLIC_GOOGLE_INITIATE_CHECKOUT_TAG,
  Purchase: process.env.NEXT_PUBLIC_GOOGLE_PURCHASE_TAG,
}

/**
 * 通用事件处理函数
 * @param session 用户会话信息
 * @param data 事件数据
 * @param eventName 事件名称
 * @returns 处理后的事件数据
 */
export const handleEvent = async (session: Session | null, data: any, eventName: string): Promise<any> => {
  try {
    const isGuest = !session
    if (isGuest) {
      return
    }

    // 获取用户信息并更新事件数据
    data = await enrichEventDataWithUserInfo(data)
    console.log('data:')
    console.log(data)
    // 处理用户数据
    const processedData = processUserDataForPlatforms(data)

    data.event = eventName

    // 如果fbc不为空，执行Facebook上报逻辑
    console.log('🔵 [FB埋点] handleEvent - 检查条件:', {
      hasFbc: !!data.fbc,
      fbc: data.fbc,
      hasPixelId: !!process.env.NEXT_PUBLIC_PIXEL_ID,
      pixelId: process.env.NEXT_PUBLIC_PIXEL_ID,
      event: data.event
    })
    if (data.fbc && process.env.NEXT_PUBLIC_PIXEL_ID) {
      console.log('🟢 [FB埋点] handleEvent - 准备发送事件:', {
        data: data.custom_data,
        event: data.event,
        eventId: data.eventId,
        fbc: data.fbc,
        fbp: data.fbp,
        facebookUserData: processedData.facebookUserData,
        pixelId: process.env.NEXT_PUBLIC_PIXEL_ID
      })
      await import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          const fbqData = {
            eventID: data.eventId,
            ...processedData.facebookUserData, // 使用处理后的Facebook数据
          }
          console.log('🟢 [FB埋点] handleEvent - 调用 fbq:', {
            method: 'track',
            event: data.event,
            data: fbqData,
            options: { eventID: data.eventId }
          })
          console.log('🟢 [FB埋点] handleEvent - fbq 调用开始------------》', fbqData)
          ReactPixel.fbq(
            'track',
            data.event,
            fbqData,
            { eventID: data.eventId },
          )
          console.log('🟢 [FB埋点] handleEvent - fbq 调用完成')
        })
        .catch((error) => {
          console.error('🔴 [FB埋点] handleEvent - fbq 调用失败:', error)
        })
      await createBehaviorEvent({
        eventId: data.eventId,
        target: EventType.Facebook,
        event: data.event,
        isLogin: !!session,
        request: JSON.stringify({
          ...data,
          user_data: processedData.facebookUserData, // 日志使用原始数据
        }),
        response: JSON.stringify({}),
        succeed: true,
        sourceUrl: data.sourceUrl,
        userSource: data.userSource,
        fbc: data.fbc,
        fbp: data.fbp,
        facebookId: '',
        gid: '',
        guestId: localStorage.getItem('GUEST_ID') || uuidv4() + '-' + new Date().getTime(),
      })
      // 发送服务端事件
      let plansForFb = []
      if (data?.custom_data?.contents) {
        data?.custom_data?.contents.forEach((item, index) => {
          let tmp = {
            productId: item.id,
            itemPrice: item.realPriceOneMonth,
            title: item.name,
            description: item.description,
            brand: process.env.NEXT_PUBLIC_BRAND_NAME
          }
          plansForFb.push(tmp);
        })
        data.custom_data.contents = plansForFb
      }
      await sendServeEvent({
        ...data,
        isLogin: !!session,
        eventName: eventName,
        eventSourceUrl: data?.user_data?.source_url,
        user_data: processedData.rawUserData, // 服务端使用原始数据
        guestId: localStorage.getItem('GUEST_ID') || uuidv4() + '-' + new Date().getTime(),
      })
    } else if (data.gid && process.env.NEXT_PUBLIC_GOOGLE_ANALYSIS_ID) {
      // 创建用户行为
      await createBehaviorEvent({
        eventId: data.eventId,
        target: EventType.Google,
        event: data.event,
        isLogin: !!session,
        request: JSON.stringify({
          ...data,
          user_data: processedData.googleAdsUserData, // 日志使用原始数据
        }),
        response: JSON.stringify({}),
        succeed: true,
        sourceUrl: data.sourceUrl,
        userSource: data.userSource,
        fbc: '',
        fbp: '',
        facebookId: '',
        gid: data.gid,
        guestId: localStorage.getItem('GUEST_ID') || uuidv4() + '-' + new Date().getTime(),
      })

      const gtagData = {
        send_to: [GGEventTag[eventName], process.env.NEXT_PUBLIC_GOOGLE_GA4_ID],
        value: data?.custom_data?.value || 1,
        currency: data?.custom_data?.currency || 'USD',
        transaction_id: data?.custom_data?.transaction_id || '',
        items: [{
          item_id: data?.eventData?.plan?.id?.toString() || '',
          item_name: data?.eventData?.plan?.name || '',
          quantity: 1,
        }],
      }

      console.log('发送gg事件=========>', eventName, eventName)

      // 发送Google事件
      ReactGA.gtag('event', 'conversion', gtagData)
    }
    let toGG
    if (data.gid) {
      toGG = true
    }
    // 在所有处理完成后，发送到 GA 和 PostHog
    await sendToAnalytics(session, eventName, data, processedData, toGG)

    return data
  } catch (error) {
    console.error('Failed to handle event:', error)
    return data
  }
}
