import { ApiResult } from '@/api/core/common'
import AuthorizedApi from '@/api/server/AuthorizedApi'
import { objectToQueryString } from '@/util/api'

export default class BlogApi extends AuthorizedApi {
  constructor(props: any) {
    super(props)
  }

  async getCategoryList(lang?: string): Promise<any> {
    const response = await this.articleClient.get<ApiResult<any>>('/cms/article/category-list', {
      headers: { 'language-code': lang },
    })
    return response.data.data!
  }

  async getBlogList(params: any, lang?: string): Promise<any> {
    const response = await this.articleClient.get<ApiResult<any>>('/cms/article/list?' + objectToQueryString(params), {
      headers: { 'language-code': lang },
    })
    return response.data!
  }

  async getBlogDetail(id: string, lang?: string): Promise<any> {
    const key = `${id}|${lang || ''}`
    const cached = blogDetailCache.get(key)
    const now = Date.now()
    if (cached && now - cached.ts < BLOG_TTL_MS) {
      return cached.data
    }
    const response = await this.articleClient.get<ApiResult<any>>('/cms/article/detail?id=' + id, {
      headers: { 'language-code': lang },
    })
    const data = response.data!
    blogDetailCache.set(key, { data, ts: now })
    return data
  }
  
  async getBlogData(cate_id?: string | number, page?: string | number, lang?: string): Promise<any> {
    const key = `${cate_id || ''}|${page || ''}|${lang || ''}`
    const cached = blogDataCache.get(key)
    const now = Date.now()
    if (cached && now - cached.ts < BLOG_TTL_MS) {
      return cached.data
    }
    const params = new URLSearchParams()
    if (cate_id !== undefined && cate_id !== null && cate_id !== '') {
      params.set('cate_id', String(cate_id))
    }
    if (page !== undefined && page !== null && page !== '') {
      params.set('page', String(page))
    }
    const qs = params.toString()
    const url = '/cms/article/category' + (qs ? `?${qs}` : '')
    const response = await this.articleClient.get<ApiResult<any>>(url, {
      headers: { 'language-code': lang },
    })
    const data = response.data!
    blogDataCache.set(key, { data, ts: now })
    return data
  }
}

// In-memory cache for blog detail to avoid duplicate SSR requests (e.g., metadata + page)
const blogDetailCache = new Map<string, { data: any; ts: number }>()
const blogDataCache = new Map<string, { data: any; ts: number }>()
const BLOG_TTL_MS = 60 * 1000
