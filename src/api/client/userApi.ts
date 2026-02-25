import { ApiResult } from '@/api/core/common'
import clientApiClient from '@/api/client/clientApiClient'

interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  fbc?: string
  fbp?: string
  utmSource?: string
  utmCampaign?: string
  fbclid?: string
}
export const updateProfile = async (request: UpdateProfileRequest): Promise<string> => {
  const response = await clientApiClient.post<ApiResult<string>>('/users/profile/update', request)
  return response.data.data!
}

interface SendSupportEmailRequest {
  firstName?: string
  lastName?: string
  email?: string
  content: string
}
export const sendSupportEmail = async (request: SendSupportEmailRequest): Promise<void> => {
  const response = await clientApiClient.post<ApiResult<void>>('contact-us', request)
  return response.data.data!
}

let inflightPromise: Promise<boolean> | null = null
const CACHE_KEY = 'VISIT_PERMISSION_CACHE'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function readCache(): boolean | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { value, ts } = JSON.parse(raw)
    if (Date.now() - ts < CACHE_TTL_MS) return !!value
    return null
  } catch {
    return null
  }
}

function writeCache(value: boolean) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ value, ts: Date.now() }))
  } catch {}
}

export const isUserCanVisitApi = async (): Promise<boolean> => {
  const cached = typeof window !== 'undefined' ? readCache() : null
  if (cached !== null) return cached

  if (inflightPromise) return inflightPromise

  inflightPromise = clientApiClient
    .get<ApiResult<boolean>>('/user/guest/isVisit')
    .then((response) => {
      const value = response.data.data!
      if (typeof window !== 'undefined') writeCache(value)
      return value
    })
    .finally(() => {
      inflightPromise = null
    })

  return inflightPromise
}
