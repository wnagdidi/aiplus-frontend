/**
 * URL参数处理工具函数
 */
import { setCookie } from './cokkie'

// UTM参数时间戳存储的key
const UTM_PARAMS_TIMESTAMP_KEY = 'UTM_PARAMS_TIMESTAMP'

/**
 * 获取当前URL对象
 * @param url - 可选的URL字符串，如果不提供则使用当前窗口URL
 * @returns URL对象
 */
function getUrlObject(url?: string): URL {
  if (typeof window === 'undefined') {
    throw new Error('URL functions must be used in browser environment')
  }
  return new URL(url || window.location.href)
}

/**
 * 获取指定参数值
 * @param param - 参数名
 * @param url - 可选的URL字符串
 * @returns 参数值，如果不存在则返回null
 */
export function getParam(param: string, url?: string): string | null {
  const urlObj = getUrlObject(url)
  return urlObj.searchParams.get(param)
}

/**
 * 获取所有参数的键值对
 * @param url - 可选的URL字符串
 * @returns 包含所有参数的对象
 */
export function getAllParams(url?: string): Record<string, string> {
  const urlObj = getUrlObject(url)
  const params: Record<string, string> = {}
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

/**
 * 检查是否存在指定参数
 * @param param - 参数名
 * @param url - 可选的URL字符串
 * @returns 是否存在
 */
export function hasParam(param: string, url?: string): boolean {
  const urlObj = getUrlObject(url)
  return urlObj.searchParams.has(param)
}

/**
 * 获取URL的路径部分
 * @param url - 可选的URL字符串
 * @returns URL路径
 */
export function getPath(url?: string): string {
  const urlObj = getUrlObject(url)
  return urlObj.pathname
}

/**
 * 获取URL的域名
 * @param url - 可选的URL字符串
 * @returns 域名
 */
export function getDomain(url?: string): string {
  const urlObj = getUrlObject(url)
  return urlObj.hostname
}

/**
 * 获取完整的URL字符串
 * @param url - 可选的URL字符串
 * @returns 完整URL
 */
export function getFullUrl(url?: string): string {
  const urlObj = getUrlObject(url)
  return urlObj.toString()
}

/**
 * 添加或更新参数
 * @param param - 参数名
 * @param value - 参数值
 * @param url - 可选的URL字符串
 * @returns 更新后的URL字符串
 */
export function setParam(param: string, value: string, url?: string): string {
  const urlObj = getUrlObject(url)
  urlObj.searchParams.set(param, value)
  return urlObj.toString()
}

/**
 * 删除指定参数
 * @param param - 参数名
 * @param url - 可选的URL字符串
 * @returns 更新后的URL字符串
 */
export function deleteParam(param: string, url?: string): string {
  const urlObj = getUrlObject(url)
  urlObj.searchParams.delete(param)
  return urlObj.toString()
}

/**
 * 获取UTM参数
 * @param url - 可选的URL字符串
 * @returns UTM参数对象
 */
export function getUtmParams(url?: string): Record<string, string | null> {
  const params = {
    source: getParam('utm_source', url),
    medium: getParam('utm_medium', url),
    campaign: getParam('utm_campaign', url),
    term: getParam('utm_term', url),
    content: getParam('utm_content', url),
    fbclid: getParam('fbclid', url),
  }

  // 如果有UTM参数，将其保存到cookie中，有效期7天，并记录时间戳到localStorage
  if (typeof window !== 'undefined') {
    try {
      // 格式化时间为年月日时分秒 (YYYY-MM-DD HH:mm:ss)
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      
      const timestampData: Record<string, string> = {}
      let hasNewParams = false

      if (params.source) {
        setCookie('utm_source', params.source, 7)
        timestampData.utm_source = timestamp
        hasNewParams = true
      }
      if (params.medium) {
        setCookie('utm_medium', params.medium, 7)
        timestampData.utm_medium = timestamp
        hasNewParams = true
      }
      if (params.campaign) {
        setCookie('utm_campaign', params.campaign, 7)
        timestampData.utm_campaign = timestamp
        hasNewParams = true
      }
      if (params.term) {
        setCookie('utm_term', params.term, 7)
        timestampData.utm_term = timestamp
        hasNewParams = true
      }
      if (params.content) {
        setCookie('utm_content', params.content, 7)
        timestampData.utm_content = timestamp
        hasNewParams = true
      }
      if (params.fbclid) {
        setCookie('fbclid', params.fbclid, 7)
        timestampData.fbclid = timestamp
        hasNewParams = true
      }

      // 如果有新的UTM参数存入cookie，更新localStorage中的时间戳记录
      if (hasNewParams) {
        try {
          const existingData = localStorage.getItem(UTM_PARAMS_TIMESTAMP_KEY)
          const existingTimestamps = existingData ? JSON.parse(existingData) : {}
          const updatedTimestamps = { ...existingTimestamps, ...timestampData }
          localStorage.setItem(UTM_PARAMS_TIMESTAMP_KEY, JSON.stringify(updatedTimestamps))
        } catch (storageError) {
          console.warn('Failed to save UTM params timestamp to localStorage:', storageError)
        }
      }
    } catch (error) {
      console.warn('Failed to set UTM params to cookie:', error)
    }
  }

  return params
}

/**
 * 获取社交媒体追踪参数
 * @param url - 可选的URL字符串
 * @returns 社交媒体追踪参数对象
 */
export function getSocialParams(url?: string): Record<string, string | null> {
  return {
    fbclid: getParam('fbclid', url),
    gclid: getParam('gclid', url),
  }
}

// 使用示例：
/*
// 获取参数
const source = getParam('utm_source');

// 获取所有参数
const allParams = getAllParams();

// 获取完整的URL
const fullUrl = getFullUrl();

// 设置参数
const newUrl = setParam('page', '2');

// 获取UTM参数
const utmParams = getUtmParams();

// 获取社交媒体追踪参数
const socialParams = getSocialParams();
*/
