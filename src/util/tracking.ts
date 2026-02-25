// 用户来源类型定义
export type UserSource = 'facebook' | 'gg' | 'Others' | 'homepage';

// 追踪数据接口
export interface TrackingData {
  isFirstVisit: boolean;
  fbclid: string | null;
  fbc: string | null;
  fbp: string | null;
  gclid: string | null;
  utmSource: string;
  userSource: UserSource;
  timestamp: number;
}

// 存储相关常量
export const STORAGE_KEYS = {
  TRACKING: 'AVOID_AI_TRACKING',
} as const;

/**
 * 获取标准化的用户来源
 * @param value - 原始来源值，如果为空则表示用户从主页进入
 * @returns 标准化的用户来源
 */
export const getUserSource = (value: string): UserSource => {
  // 如果没有utm_source，说明用户从主页进入
  if (!value) {
    return "homepage"
  }
  
  const normalizedValue = value.toLowerCase()
  if(['fb', 'facebook'].includes(normalizedValue)) {
    return "facebook"
  } else if(['gg', 'google'].includes(normalizedValue)) {
    return "gg"
  } else {
    return "Others"
  }
}

/**
 * 处理 Facebook Browser ID
 * @param cookieFbp - 从cookie中获取的fbp值
 * @returns 处理后的fbp值
 */
export const handleFbp = (cookieFbp: string): string => {
  if (typeof window === 'undefined') return '';
  
  const stored = getStoredTracking();
  if (stored?.fbp) {
    return stored.fbp;
  }
  
  if (cookieFbp) {
    const tracking = getStoredTracking() || {
      isFirstVisit: true,
      fbclid: null,
      fbc: null,
      fbp: null,
      gclid: null,
      utmSource: '',
      userSource: 'Others' as UserSource,
      timestamp: Date.now()
    };
    
    tracking.fbp = cookieFbp;
    saveTracking(tracking);
    return cookieFbp;
  }
  
  return '';
}

/**
 * 从URL获取参数
 * @param param - 参数名
 * @returns 参数值
 */
export const getUrlSource = (param: string): string => {
  if (typeof window === 'undefined') return '';
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || '';
}

/**
 * 从localStorage获取存储的追踪数据
 * @returns 追踪数据或null
 */
export const getStoredTracking = (): TrackingData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRACKING);
    if (!stored) return null;
    return JSON.parse(stored) as TrackingData;
  } catch (error) {
    console.warn('Failed to parse stored tracking data', error);
    return null;
  }
}

/**
 * 保存追踪数据到localStorage
 * @param data - 要保存的追踪数据
 */
export const saveTracking = (data: TrackingData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save tracking data', error);
  }
}

/**
 * 从URL获取Facebook点击ID
 * @returns fbclid参数值
 */
export const getUrlFbclid = (): string => {
  if (typeof window === 'undefined') return '';
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid');
  return fbclid || '';
}

/**
 * 从URL获取来源参数
 * @returns utm_source参数值
 */
export const getUrlUtmSource = (): string => {
  if (typeof window === 'undefined') return '';
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('utm_source') || '';
}

/**
 * 从localStorage获取存储的来源
 * @returns 存储的来源值
 */
export const getStoredUtmSource = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('utm_source') || '';
}

/**
 * 保存来源到localStorage
 * @param source - 要存储的来源值
 */
export const saveUtmSource = (source: string): void => {
  if (typeof window === 'undefined') return;
  if (source) {
    localStorage.setItem('utm_source', source);
  }
}
