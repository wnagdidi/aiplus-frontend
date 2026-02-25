import { ApiResult } from '@/api/core/common'
import { Plan, Subscription } from '@/api/core/billing'
import AuthorizedApi from '@/api/server/AuthorizedApi'
import { objectToQueryString } from '@/util/api'

export default class BillingApi extends AuthorizedApi {
  constructor(accessToken: string) {
    super(accessToken)
  }

  async getPlans(): Promise<Plan[]> {
    const baseUrl = process.env.CORE_API_BASE_URL
    if (!baseUrl) {
      // Fallback to axios client if baseURL missing
      const response = await this.apiClient.get<ApiResult<Plan[]>>('/plans')
      return response.data.data!
    }

    const plans = await fetchPlansCached(baseUrl, this.accessToken)
    return plans
  }

  async getActiveSubscription(): Promise<Subscription> {
    const response = await this.apiClient.get<ApiResult<Subscription>>(
      '/subscriptions/active',
      this.authConfig()
    )
    return response.data.data!
  }

  async getStripeSessionStatus(sessionId: string): Promise<string> {
    const response = await this.apiClient.get<ApiResult<string>>(
      '/subscriptions/stripe/session/status?session_id=' + sessionId,
      this.authConfig(),
    )
    return response.data.data!
  }

  async getStarSaasSessionStatus(params: any): Promise<string> {
    const response = await this.apiClient.get<ApiResult<string>>(
      '/start-saas/checkout/callback?' + objectToQueryString(params),
      this.authConfig(),
    )
    return response.data.data!
  }


}

// Simple in-memory cache with 60s TTL shared across SSR invocations in the same process
const plansCache = new Map<string, { data: Plan[]; ts: number }>()
const TTL_MS = 60 * 1000

async function fetchPlansCached(baseUrl: string, accessToken?: string): Promise<Plan[]> {
  const key = `${baseUrl}|${accessToken || ''}`
  const cached = plansCache.get(key)
  const now = Date.now()
  if (cached && now - cached.ts < TTL_MS) {
    return cached.data
  }

  const res = await fetch(`${baseUrl}/plans`, {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: accessToken } : {}),
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return []
  }

  const json: ApiResult<Plan[]> = await res.json().catch(() => ({ data: [] } as any))
  const data = json?.data ?? []
  plansCache.set(key, { data, ts: now })
  return data
}
