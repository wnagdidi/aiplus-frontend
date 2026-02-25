import { ApiResult } from '@/api/core/common'
import clientApiClient from '@/api/client/clientApiClient'

/**
 * 用户追踪信息响应数据
 */
export interface UserInfoData {
  // 事件基本信息
  id: number          // 事件表ID
  ip: string          // IP信息
  userAgent: string   // 浏览器信息
  location: string    // 位置信息
  
  // 用户基本信息
  email: string       // 用户邮箱
  firstName: string   // 用户姓
  lastName: string    // 用户名
  
  // 来源信息
  sourceUrl: string   // 源头URL
  userSource: string  // 用户来源
  
  // Facebook追踪信息
  fbc: string        // Facebook广告追踪标识
  fbp: string        // Facebook浏览器追踪标识
  facebookId: string // Facebook用户登录ID
  
  // Google追踪信息
  gid: string        // Google广告追踪标识
}

/**
 * 用户追踪信息接口响应
 */
export interface UserInfoResponse {
  code: number      // 响应码
  message: string   // 响应信息
  data: UserInfoData
  requestId: string // 请求ID
}

/**
 * 查询用户追踪信息
 * @description 在触发七个基本事件时调用（view_item, start_trial, sign_up, add_to_cart, begin_checkout, add_payment_info, purchase）
 * @returns 用户追踪信息响应
 */
export const retrieveUserInfo = async (): Promise<UserInfoResponse> => {
  // GET请求，无需参数
  const response = await clientApiClient.get<ApiResult<UserInfoResponse>>('/behavior/event/user/info/retreive')
  return response.data.data!
}
