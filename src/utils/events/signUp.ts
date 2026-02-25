import { Session } from 'next-auth'
import { enrichEventDataWithGuestInfo } from '@/services/eventInfo'
import { sendServeEvent } from '@/api/client/event'
import { createBehaviorEvent, EventType } from '@/api/client/behaviorEvent'
import { getStoredTracking } from '@/util/tracking'
import ReactGA from 'react-ga4'
import { googleTagMap } from '@/context/GTMContext'
import { sha256 } from '@/util/crypto'
import { sendToAnalytics } from './analytics'
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

/**
 * 处理注册事件
 * @param session 用户会话信息
 * @param data 事件数据
 * data中有custom_data(从事件上报开始就一直不变)、fbc、fbp、user_source、eventId、external_id
 * @returns 处理后的事件数据
 */
export const handleSignUpEvent = async (session: Session | null, data: any): Promise<any> => {
  try {
    // 获取访客信息并更新事件数据
    data = await enrichEventDataWithGuestInfo(data)

    // 处理用户数据
    const processedData = processUserDataForPlatforms(data)

    // 设置事件名称
    data.event = 'CompleteRegistration'
    // 如果fbc不为空，执行Facebook上报逻辑
    console.log('🔵 [FB埋点] signUp - 检查条件:', {
      hasFbc: !!data.fbc,
      fbc: data.fbc,
      hasPixelId: !!process.env.NEXT_PUBLIC_PIXEL_ID,
      pixelId: process.env.NEXT_PUBLIC_PIXEL_ID,
      event: data.event
    })
    if (data.fbc && process.env.NEXT_PUBLIC_PIXEL_ID) {
      console.log('🟢 [FB埋点] signUp - 准备发送事件:', {
        event: data.event,
        eventId: data.eventId,
        fbc: data.fbc,
        fbp: data.fbp,
        facebookUserData: processedData.facebookUserData,
        pixelId: process.env.NEXT_PUBLIC_PIXEL_ID
      })
      // 通过pixel上报事件
      await import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          const fbqData = {
            eventID: data.eventId,
            ...processedData.facebookUserData, // 使用处理后的Facebook数据
          }
          console.log('🟢 [FB埋点] signUp - 调用 fbq:', {
            method: 'track',
            event: data.event,
            data: fbqData,
            options: { eventID: data.eventId }
          })
          ReactPixel.fbq(
            'track',
            data.event,
            fbqData,
            { eventID: data.eventId },
          )
          console.log('🟢 [FB埋点] signUp - fbq 调用完成')
        })
        .catch((error) => {
          console.error('🔴 [FB埋点] signUp - fbq 调用失败:', error)
        })

      // 创建用户行为
      await createBehaviorEvent({
        eventId: data.eventId,
        target: EventType.Facebook,
        event: data.event,
        isLogin: true,
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
        guestId: localStorage.getItem('GUEST_ID'),
      })

      // 通知后端上报Facebook
      await sendServeEvent({
        ...data,
        isLogin: true,
        event: data.event,
        sourceUrl: data.sourceUrl,
        user_data: processedData.rawUserData, // 服务端使用原始数据
        guestId: localStorage.getItem('GUEST_ID'),
      })
    }
    // 如果fbc为空但gid不为空，执行Google上报逻辑
    else if (data.gid) {
      // 创建用户行为
      await createBehaviorEvent({
        eventId: data.eventId,
        target: EventType.Google,
        event: data.event,
        isLogin: true,
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
        guestId: localStorage.getItem('GUEST_ID'),
      })

      // 初始化Google Analytics
      const gtagData = {
        send_to: [process.env.NEXT_PUBLIC_GOOGLE_SIGNUP_TAG, process.env.NEXT_PUBLIC_GOOGLE_GA4_ID],
        value: 1,
        currency: 'USD',
        method: data.custom_data.method,
      }

      // 发送Google事件
      ReactGA.gtag('event', 'conversion', gtagData)
      console.log('发送gg事件=========>', gtagData)
    }
    let toGG
    if (data.gid) {
      toGG = true
    }
    // 在所有处理完成后，发送到 GA 和 PostHog
    await sendToAnalytics(session, data.event, data, processedData, toGG)

    return data
  } catch (error) {
    console.error('Failed to handle sign up event:', error)
    return data
  }
}
