import axios from 'axios'

const strapiApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'bearer ' + process.env.STRAPI_API_TOKEN,
  },
})

strapiApiClient.interceptors.request.use(
  async (config) => {
    console.log('Axios strapi api:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params,
    })
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default strapiApiClient
