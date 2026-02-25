import { Session } from 'next-auth'
import { createBehaviorEvent, EventType } from '@/api/client/behaviorEvent'
import { sendServeEvent } from '@/api/client/event'
import ReactGA from 'react-ga4'
import { enrichEventDataWithGuestInfo } from '@/services/eventInfo'
import { sendToAnalytics } from './analytics'
import { v4 as uuidv4 } from 'uuid'
import process from 'process'

/**
 * 处理开始试用事件
 * @param session 用户会话信息
 * @param data 事件数据
 * data中有custom_data(从事件上报开始就一直不变)、fbc、fbp、user_source、eventId、external_id
 * @returns 处理后的事件数据
 */
export const handleTranslatorEvent = async (session: Session | null, data: any) => {
  try {
    // const isUser = !!session
    // if (isUser) {
    //   return
    // }

    // 获取访客信息并更新事件数据
    data = await enrichEventDataWithGuestInfo(data)

    // 设置事件名称
    data.event = data.type

    // 如果fbc不为空，执行Facebook上报逻辑
    if (data.fbc && process.env.NEXT_PUBLIC_PIXEL_ID) {
      console.log('🟢 [FB埋点] translator - 准备发送事件:', {
        event: data.event,
        eventId: data.eventId,
        fbc: data.fbc,
        fbp: data.fbp,
        pixelId: process.env.NEXT_PUBLIC_PIXEL_ID
      })
      // 通过pixel上报事件
      await import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          const fbqData = { eventID: data.eventId }
          console.log('🟢 [FB埋点] translator - 调用 fbq:', {
            method: 'track',
            event: data.event,
            data: fbqData
          })
          ReactPixel.fbq('track', data.event, fbqData)
          console.log('🟢 [FB埋点] translator - fbq 调用完成')
        })
        .catch((error) => {
          console.error('🔴 [FB埋点] translator - fbq 调用失败:', error)
        })
      // 创建用户行为
      await createBehaviorEvent({
        eventId: data.eventId,
        target: EventType.Facebook,
        event: data.event,
        isLogin: !!session,
        request: JSON.stringify(data),
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

      // 通知后端上报Facebook
      await sendServeEvent({
        ...data,
        isLogin: !!session,
        event: data.event,
        sourceUrl: data.sourceUrl,
        guestId: localStorage.getItem('GUEST_ID') || uuidv4() + '-' + new Date().getTime(),
      })
    } else {
      console.warn('⚠️ [FB埋点] translator - 跳过发送:', {
        reason: !data.fbc ? '缺少 fbc' : '缺少 NEXT_PUBLIC_PIXEL_ID',
        event: data.event
      })
    }
    const processedData = {}
    // 在所有处理完成后，发送到 GA 和 PostHog

    await sendToAnalytics(session, data.event, data, processedData)
    // debugger;
    // TranslateSeccess: "translate_seccess",
    return data
  } catch (error) {
    console.error(error)
    return data
  }
}
