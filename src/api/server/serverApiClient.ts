import axios from 'axios'
import http from 'http'
import https from 'https'
import { v4 as uuidv4 } from 'uuid'
import { onResponseFulfilled, onResponseRejected } from '@/api/core/common'
import { getCookie } from '@/util/cokkie'

const serverApiClient = axios.create({
  baseURL: process.env.CORE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
})

serverApiClient.interceptors.request.use(
  async (config) => {
    const requestId = uuidv4()
    console.log(new Date(), 'INFO', requestId, config.method, config.url)
    config.headers['X-Request-ID'] = requestId
    config.metadata = { requestId }
    // config.headers.fbc = getCookie("_fbc")
    // config.headers.fbp = getCookie("_fbp")
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 自定义响应拦截器
serverApiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        return Promise.resolve({ data: [] })
    }
)

export default serverApiClient
