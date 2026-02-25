import articleServerClient from '@/api/server/articleServerClient'
import serverApiClient from '@/api/server/serverApiClient'

export default class AuthorizedApi {
  apiClient = serverApiClient
  articleClient = articleServerClient

  constructor(protected accessToken: string) {}

  authConfig() {
    return { headers: { Authorization: this.accessToken } }
  }
}
