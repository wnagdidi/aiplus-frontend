import { ApiResult } from '@/api/core/common'
import clientApiClient from '@/api/client/clientApiClient'

// 创建或获取访客用户的 token
export const createOrGetGuestTokenApi = async (): Promise<string> => {
  const response = await clientApiClient.post<ApiResult<string>>('/user/guest/create-or-get')
  return response.data.data!
}
