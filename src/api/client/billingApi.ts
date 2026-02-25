import { ApiResult } from '@/api/core/common'
import clientApiClient from '@/api/client/clientApiClient'
import { Plan, Subscription } from '@/api/core/billing'
import { CreatedSession, StarSaasInfo, StarSaasSession, AirwallexInfo } from '@/api/client/billingApi.interface'

export const createStripeSession = async (planId: number | string): Promise<CreatedSession> => {
  const response = await clientApiClient.get<ApiResult<CreatedSession>>(
    '/subscriptions/stripe/session?plan_id=' + planId,
  )
  return response.data.data!
}

export const createStarSaasSession = async (planId: number | string): Promise<StarSaasSession> => {
  const response = await clientApiClient.get<ApiResult<StarSaasSession>>('/start-saas/checkout/info?plan_id=' + planId)
  return response.data.data!
}

export const getActiveSubscription = async (): Promise<Subscription> => {
  const response = await clientApiClient.get<ApiResult<Subscription>>('/subscriptions/active')
  return response.data.data!
}

export const cancelSubscription = async () => {
  await clientApiClient.get<ApiResult<Subscription>>('/subscribe/a/cancel')
}

export const getPlans = async (): Promise<Plan[]> => {
  const response = await clientApiClient.get<ApiResult<Plan[]>>('/plans')
  return response.data.data!
}

export const createStarSaasInfo = async (planId: number | string): Promise<StarSaasInfo> => {
  const response = await clientApiClient.get<ApiResult<StarSaasInfo>>('/start-saas/authorise/info?plan_id=' + planId)
  return response.data.data!
}

export const starSaasPay = async (starSaaslnfo: StarSaasInfo): Promise<{ code: string }> => {
  const response: any = await clientApiClient.post<ApiResult<StarSaasInfo>>('/start-saas/authorise/pay', starSaaslnfo)
  return response.data
}

export const createAirwallexInfo = async (planId: number | string): Promise<AirwallexInfo> => {
  const response = await clientApiClient.get<ApiResult<AirwallexInfo>>('/subscribe/a/order/payment/intent?planId=' + planId)
  console.log('createAirwallexInfo', response.data.data);
  return response.data.data!
}

export const upgradeAirwallexInfo = async (planId: number | string): Promise<AirwallexInfo> => {
  const response = await clientApiClient.get<ApiResult<AirwallexInfo>>('/subscribe/a/order/upgrade/payment/intent?planId=' + planId)
  console.log('upgradeAirwallexInfo', response.data.data);
  return response.data.data!
}

export const starAirwallexPay = async (starSaaslnfo: StarSaasInfo): Promise<{ code: string }> => {
  const response: any = await clientApiClient.post<ApiResult<StarSaasInfo>>('/start-saas/authorise/pay', starSaaslnfo)
  return response.data
}

export const queryUpgradeOrder = async (orderNo: number | string): Promise<{ code: string }> => {
  const response: any = await clientApiClient.get<ApiResult<StarSaasInfo>>('/subscribe/a/query?orderNo='+ orderNo)
  return response.data
}

// 获取是否需要功能指引
export const getNeedGuide = async (type: string): Promise<any> => {
  const response: any = await clientApiClient.get<any>('/subscriptions/active/guide?type=' + type)
  return response.data
}
