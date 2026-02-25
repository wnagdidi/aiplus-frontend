import { v4 as uuidv4 } from "uuid"

export const getOrCreateUUID = () => {
  let id = localStorage.getItem("APP_UUID")
  if (!id) {
    id = uuidv4()
    localStorage.setItem("APP_UUID", id)
  }
  return id
}

export const isMetaApp = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return /FB|FBAN|FBAV|Instagram/.test(userAgent)
}

export const isMobile = () => 
{
  // 使用异步
  if (typeof window !== 'undefined') {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    return /Mobi|Android/i.test(userAgent)
    // return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent);
  }
}

export const isInIframe = () => {
  try {
    return window.self !== window.top || !!window.frameElement
  } catch (e) {
    console.error(e)
    return false
  }
}

//获取元素距离浏览器底部的距离
export function getDistanceFromBottom(element?: Element | null) {
  if (!element) return 0
  const rect = element.getBoundingClientRect()
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight
  return windowHeight - rect.bottom
}
