import clientApiClient from './clientApiClient'
import { ApiResult } from './types'

/**
 * 事件类型枚举
 */
export enum EventType {
  Facebook = 'Facebook',
  Google = 'Google',
  PostHog = 'PostHog',
  GA = 'GA'
}

/**
 * 行为事件请求参数接口
 */
export interface BehaviorEventData {
  eventId: string
  target: EventType
  event: string
  isLogin: boolean
  request: string
  response: string
  succeed: boolean
  sourceUrl: string
  userSource: string
  fbc: string
  fbp: string
  facebookId: string
  gid: string
}

/**
 * 创建行为事件
 * @param eventData 事件数据
 * @returns Promise<ApiResult>
 */
export const createBehaviorEvent = async (eventData: {
  eventId: any
  request: string
  gid: string
  userSource: any
  fbc: any
  facebookId: string
  target: EventType
  sourceUrl: any
  isLogin: boolean
  fbp: any
  response: string
  succeed: boolean
  event: any
  guestId: string | null
}): Promise<any> => {
  return await clientApiClient.post<ApiResult>('/behavior/event/create', eventData)
}
