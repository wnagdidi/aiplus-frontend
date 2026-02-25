import axios from 'axios'
import {onResponseFulfilled, onResponseRejected} from '@/api/core/common'
import { getCookie } from '@/util/cokkie'

const clientApiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    // Authorization: 'a4bd09294586469fabde6f5d8b84ff14'
  },
})

clientApiClient.interceptors.request.use(
  async (config) => {
    const sessionStr = typeof localStorage !== 'undefined' ? localStorage.getItem('AVOID_AI_SESSION') : null
    if (sessionStr) {
      const session = JSON.parse(sessionStr)
      if (session?.user?.accessToken) {
        config.headers.Authorization = session.user.accessToken
        // config.headers.fbc = getCookie("_fbc")
        // config.headers.fbp = getCookie("_fbp")
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

clientApiClient.interceptors.response.use(onResponseFulfilled, onResponseRejected)

export default clientApiClient
