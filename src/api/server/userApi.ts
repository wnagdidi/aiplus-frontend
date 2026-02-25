import serverApiClient from '@/api/server/serverApiClient'
import { ApiResult } from '@/api/core/common'
import AuthorizedApi from '@/api/server/AuthorizedApi'
import { User, UserProfile } from '@/api/server/userApi.interface'

export default class UserApi extends AuthorizedApi {
  constructor(accessToken: string) {
    super(accessToken)
  }

  async getLoggedUser(isNew?: boolean): Promise<User> {
    const response:any = await serverApiClient.get<ApiResult<UserProfile>>('/users/profile', this.authConfig())
    return {
      ...response.data.data!,
      name: response.data.data!.firstName + ' ' + response.data.data!.lastName,
      accessToken: this.accessToken,
      isNew,
      utmSource: response.data.data!.utmSource,
      fbc: response.data.data!.fbc,
      cumulativeConsumption: response.data.data!.cumulativeConsumption,
      location: response.data.data!.location,
      subscriptionCycle: response.data.data!.subscriptionCycle,
      subscriptionStatus: response.data.data!.subscriptionStatus,
      nextPaymentTime: response.data.data!.nextPaymentTime,
      paymentCount: response.data.data!.paymentCount,
      planName: response.data.data!.planName,
      planTag:response.data.data!.planTag,
      creditsBalance: response.data.data!.creditsBalance || 0
    }
  }

  async logout() {
    return serverApiClient.post<ApiResult<any>>('/users/logout', null, this.authConfig())
  }
}
