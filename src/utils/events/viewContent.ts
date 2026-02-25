// 导入获取完整URL的工具函数
import { getFullUrl } from '../../util/urlParams'
// 导入next-auth的Session类型
import { Session } from 'next-auth'
import { getCookie } from '@/util/cokkie'
import { createBehaviorEvent, EventType } from '@/api/client/behaviorEvent'
import { sendServeEvent } from '@/api/client/event'
import ReactGA from 'react-ga4'
import { googleTagMap } from '@/context/GTMContext'
import { sendToAnalytics } from './analytics'
import { v4 as uuidv4 } from 'uuid'
import process from 'process'

/**
 * ViewContent事件数据接口
 * @interface ViewContentData
 * @property {string} [source_url] - 可选的来源URL
 * @property {any} [key: string] - 允许添加任意其他属性
 */
export interface ViewContentData {
  source_url?: string
  [key: string]: any
}

/**
 * 尝试从cookie中获取_fbp值
 * @param maxAttempts 最大尝试次数
 * @param interval 尝试间隔（毫秒）
 * @returns Promise<string | null>
 */
async function getFbpFromCookie(maxAttempts: number = 10, interval: number = 1000): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const fbp = getCookie('_fbp')
    if (fbp) {
      return fbp
    }
    // 等待指定时间后再次尝试
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
  return null
}

/**
 * 尝试从cookie中获取_fbp值
 * @param maxAttempts 最大尝试次数
 * @param interval 尝试间隔（毫秒）
 * @returns Promise<string | null>
 */
async function getFbcFromCookie(maxAttempts: number = 10, interval: number = 1000): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const fbc = getCookie('_fbc')
    if (fbc) {
      return fbc
    }
    // 等待指定时间后再次尝试
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
  return null
}

/**
 * 处理访客首页访问的事件数据
 * @param session 用户会话信息，用于判断是否为访客（未登录用户）
 * @param data 原始事件数据，默认为空对象:
 * data中有custom_data(从事件上报开始就一直不变)、user_data(client_ip_address、client_user_agent、city、external_id、fbp、fbc、fb_login_id)、fbc、fbp、user_source、eventId、external_id
 * @returns 处理后的事件数据，如果是访客访问首页则添加source_url
 */
export const handleViewItemEvent = async (session: Session | null, data: any) => {
  // 判断是否为访客、是否为首页
  const isGuest = !session
  const isHomePage =
    typeof window !== 'undefined' && (window.location.pathname === '/' || /^\/[^/]+\/?$/.test(window.location.pathname))

  const eventName = 'ViewContent'
  data.event = eventName

  const processedData = {}

  // 如果是访客且在访问首页
  if (isGuest && isHomePage) {
    console.log('访客访问了首页')

    // 异步持续获取URL，直到成功获取到URL为止
    let currentUrl = ''
    while (!currentUrl) {
      currentUrl = getFullUrl()
      if (!currentUrl) {
        console.log('Failed to get current URL. Retrying...')
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 等待1秒后重试
      }
    }

    // 解析URL对象
    const urlObj = new URL(currentUrl)
    // 获取所有参数
    const params = new URLSearchParams(urlObj.search)
    // 判断是否有fbclid参数（Facebook点击ID）
    const hasFbclid = params.has('fbclid')
    let guestId = localStorage.getItem('GUEST_ID')
    // 1%概率生成独特的访客ID
    if (Math.random() < 0.01) {
      guestId = guestId ? guestId : '你好，我是一只可爱滴访客ID捏：' + uuidv4() + '-' + new Date().getTime()
    }
    guestId = guestId ? guestId : uuidv4() + '-' + new Date().getTime()
    localStorage.setItem('GUEST_ID', <string>guestId)

    data.succeed = true
    data.isLogin = false
    data.userSource = 'direct'
    data.guestId = guestId
    data.sourceUrl = currentUrl
    data.guestId = guestId
    data.target = ''
    data.event = 'ViewContent'

    // 判断是否有参数
    if (urlObj.search) {
      // 解析utm_source
      const utmSource = params.get('utm_source')

      if (hasFbclid && process.env.NEXT_PUBLIC_PIXEL_ID) {
        data.userSource = utmSource ? utmSource : 'fb'
        console.log('🟢 [FB埋点] viewContent - 准备发送事件:', {
          event: data.event,
          eventId: data.eventId,
          hasFbclid,
          utmSource,
          userSource: data.userSource,
          pixelId: process.env.NEXT_PUBLIC_PIXEL_ID
        })
        // 通过pixel上报事件
        await import('react-facebook-pixel')
          .then((x) => x.default)
          .then((ReactPixel) => {
            const fbqData = { eventID: data.eventId }
            console.log('🟢 [FB埋点] viewContent - 调用 fbq:', {
              method: 'track',
              event: data.event,
              data: fbqData
            })
            ReactPixel.fbq('track', data.event, fbqData)
            console.log('🟢 [FB埋点] viewContent - fbq 调用完成')
          })
          .catch((error) => {
            console.error('🔴 [FB埋点] viewContent - fbq 调用失败:', error)
          })
        // 尝试获取fbp，一定要在pixel的fbq上报之后再获取fbp！！！！！！！！！！！！！！！！！！！！！！！！！！！
        const fbp = await getFbpFromCookie()
        const fbc = await getFbcFromCookie()
        if (fbp && fbc) {
          console.log('fbp obtained:', fbp)
          data.fbp = fbp
          data.fbc = fbc
        }

        data.target = EventType.Facebook
        data.request = JSON.stringify(data)

        // 通知后端上报Facebook
        sendServeEvent({
          ...data,
          isLogin: false,
          event: 'ViewContent',
          sourceUrl: currentUrl,
        })
      } else if (params.has('gclid')) {
        const gclid = params.get('gclid')
        if (gclid) {
          data.userSource = utmSource ? utmSource : 'gg'
          data.gid = gclid
          data.target = EventType.Google
        }
      }
    }
    // 只有开启了FB广告或者开启了GA才推送日志
    if ((process.env.NEXT_PUBLIC_PIXEL_ID || process.env.NEXT_PUBLIC_GOOGLE_GA4_ID) && data.target!='') {
      createBehaviorEvent({
        eventId: data.eventId,
        target: data.target,
        event: data.event,
        isLogin: data.isLogin,
        request: data.request ? data.request : JSON.stringify({}),
        response: JSON.stringify({}),
        succeed: data.succeed,
        sourceUrl: currentUrl,
        userSource: data.userSource,
        fbc: data.fbc,
        fbp: data.fbp,
        facebookId: data.facebookId,
        gid: data.gid,
        guestId: data.guestId,
      })
    }

    // 在所有处理完成后，发送到 GA 和 PostHog
    //await sendToAnalytics(session, eventName, data, processedData)
  }
}
