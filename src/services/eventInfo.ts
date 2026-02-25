import { ApiResult } from '@/api/core/common'
import clientApiClient from '@/api/client/clientApiClient'
import { v4 as uuidv4 } from 'uuid'

/**
 * 访客追踪信息响应数据
 */
export interface GuestInfoResponse {
  // 事件基本信息
  id: number // 事件表ID
  ip: string // IP信息
  userAgent: string // 浏览器信息
  location: string // 位置信息

  // 来源信息
  sourceUrl: string // 源头URL
  userSource: string // 用户来源

  // 追踪信息
  fbc: string // Facebook广告追踪标识
  fbp: string // Facebook浏览器追踪标识
  gid: string // Google广告追踪标识
}

/**
 * 用户信息响应数据
 */
export interface UserInfoResponse {
  // 事件基本信息
  id: number // 事件表ID
  ip: string // IP信息
  userAgent: string // 浏览器信息
  location: string // 位置信息
  email: string // 用户邮箱
  firstName: string // 用户姓
  lastName: string // 用户名
  sourceUrl: string // 源头URL
  userSource: string // 用户来源
  fbc: string // Facebook广告追踪标识
  fbp: string // Facebook浏览器追踪标识
  facebookId: string // Facebook用户登录ID
  gid: string // Google广告追踪标识
}

/**
 * 查询访客追踪信息
 * @returns 访客追踪信息响应
 */
export const retrieveGuestInfo = async (guestId: string | null): Promise<GuestInfoResponse> => {
  // GET请求，需要传入guestId参数
  const response = await clientApiClient.get<ApiResult<GuestInfoResponse>>(
    `/behavior/event/guest/info/retrieve?guestId=${guestId}`,
  )
  return response.data.data!
}

/**
 * 查询用户信息
 * @returns 用户信息响应
 */
export const retrieveUserInfo = async (): Promise<UserInfoResponse> => {
  // GET请求，无需参数
  const response = await clientApiClient.get<ApiResult<UserInfoResponse>>('/users/profile')
  return response.data.data!
}

/**
 * 使用访客信息丰富事件数据
 * @param eventData 原始事件数据
 * @returns 添加了访客信息的事件数据，包含 id、ip、userAgent、location、sourceUrl、userSource、fbc、fbp、gid 等字段
 */
export const enrichEventDataWithGuestInfo = async (eventData: any): Promise<any> => {
  try {
    const guestId = localStorage.getItem('GUEST_ID') || uuidv4() + '-' + new Date().getTime()

    // 获取访客信息
    const guestInfoResponse = await retrieveGuestInfo(guestId)

    // 将所有访客信息字段赋值到第一层
    const enrichedData = {
      ...eventData,
      id: guestInfoResponse.id,
      ip: guestInfoResponse.ip,
      userAgent: guestInfoResponse.userAgent,
      location: guestInfoResponse.location,
      email: guestInfoResponse.email,
      first_name: guestInfoResponse.firstName,
      last_name: guestInfoResponse.lastName,
      sourceUrl: window.location.href,
      userSource: guestInfoResponse.userSource || 'OldUser',
      fbc: guestInfoResponse.fbc,
      fbp: guestInfoResponse.fbp,
      gid: guestInfoResponse.gid,
    }

    console.log('Enriched event data:', enrichedData)
    return enrichedData
  } catch (error) {
    console.error('Error enriching event data with guest info:', error)
    return eventData
  }
}

/**
 * 使用用户信息丰富事件数据
 * @param eventData 原始事件数据
 * @returns 添加了用户信息的事件数据，包含 id、ip、userAgent、location、email、firstName、lastName、sourceUrl、userSource、fbc、fbp、facebookId、gid 等字段
 */
export const enrichEventDataWithUserInfo = async (eventData: any): Promise<any> => {
  try {
    // 获取用户信息
    const userInfoResponse = await retrieveUserInfo()

    // 如果获取不到用户信息，则直接返回原始事件数据
    if (!userInfoResponse) {
      console.warn('User info not found, returning original event data.')
      return eventData
    }

    // 将所有用户信息字段赋值到第一层
    const enrichedData = {
      ...eventData,
      id: userInfoResponse.id,
      ip: userInfoResponse.ip,
      userAgent: userInfoResponse.userAgent,
      location: userInfoResponse.location,
      email: userInfoResponse.email,
      first_name: userInfoResponse.firstName,
      last_name: userInfoResponse.lastName,
      sourceUrl: window.location.href,
      userSource: userInfoResponse.userSource || 'OldUser',
      fbc: userInfoResponse.fbc,
      fbp: userInfoResponse.fbp,
      facebookId: userInfoResponse.facebookId,
      gid: userInfoResponse.gid,
    }

    console.log('Enriched event data with user info:', enrichedData)
    return enrichedData
  } catch (error) {
    console.error('Error enriching event data with user info:', error)
    return eventData
  }
}
