'use client'
import { useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { getCookie, setCookie } from '@/util/cokkie'
import { updateProfile } from '@/api/client/userApi'
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/util/localStorage'
import { getUserSource, getUrlSource } from '@/util/tracking'
import { getUtmParams } from '@/util/urlParams'
import { createOrGetGuestTokenApi } from '@/api/client/guestApi'
import { getUserProfile } from '@/api/client/feeLoveApi'

// 类型定义
interface TrackingData {
  isFirstVisit: boolean
  // Facebook 追踪
  fbclid: string | null  // Facebook Click ID
  fbc: string | null     // Facebook Cookie
  fbp: string | null     // Facebook Browser ID
  // Google 追踪
  gclid: string | null   // Google Click ID
  // 通用追踪
  utmSource: string      // 流量来源
  userSource: string     // 用户来源
  timestamp: number      // 时间戳
}

interface SessionTracking {
  fbc: string | null
  fbp: string | null
}

interface TrackingInfo {
  fbclid: string | null
  utmSource: string
  gclid: string | null
}

interface PendingUpdate {
  firstName?: string
  lastName?: string
  fbc?: string
  fbp?: string
  utmSource?: string
  utmCampaign?: string
  fbclid?: string
}

// 存储键名常量
const STORAGE_KEYS = {
  TRACKING: 'AVOID_AI_TRACKING',
  SESSION: 'AVOID_AI_SESSION',
  PENDING_UPDATES: 'AVOID_AI_PENDING_UPDATES'
} as const

// 更新配置常量
const UPDATE_CONFIG = {
  MAX_RETRIES: 3,                  // 最大重试次数
  RETRY_DELAY: 1000,              // 重试延迟时间（毫秒）
  MAX_PENDING_ITEMS: 10,          // 待更新队列最大长度
  MAX_AGE: 24 * 60 * 60 * 1000   // 更新项最大存活时间（24小时）
} as const

// 辅助函数
// 从 fbc 提取 fbclid
function extractFbclidFromFbc(fbc: string): string | null {
  const parts = fbc.split('.')
  return parts.length >= 4 ? parts[3] : null
}

// URL 参数获取函数
const getUrlFbclid = (): string | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    return fbclid;
  } catch (error) {
    console.warn('Failed to parse URL parameters');
    return null;
  }
}

const getUrlGclid = (): string | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid');
    return gclid;
  } catch (error) {
    console.warn('Failed to parse URL parameters');
    return null;
  }
}

// Facebook 追踪处理函数
const handleFbclid = () => {
  const urlFbclid = getUrlFbclid()
  const storedTracking = getLocalStorage<TrackingData>(STORAGE_KEYS.TRACKING) || {}

  // 只在有新的 fbclid 且没有存储过这个 fbclid 时处理
  if (urlFbclid && urlFbclid !== storedTracking.fbclid) {
    const now = Date.now()
    const newFbc = `fb.1.${now}.${urlFbclid}`

    // 存储到 localStorage
    setLocalStorage(STORAGE_KEYS.TRACKING, {
      ...storedTracking,
      fbclid: urlFbclid,
      fbc: newFbc,
      timestamp: now
    })

    // 同时设置 cookie
    try {
      setCookie('_fbc', newFbc)
    } catch (error) {
      console.warn('Failed to set Facebook tracking cookies')
    }
  }
}

// 来源追踪处理
const handleSourceTracking = () => {
  const urlSource = getUrlSource()
  const urlGclid = getUrlGclid()
  const storedTracking = getLocalStorage<TrackingData>(STORAGE_KEYS.TRACKING) || {}

  const source = {
    utmSource: urlSource || getCookie('utm_source') || storedTracking?.utmSource || '',
    gclid: urlGclid || getCookie('gclid') || storedTracking?.gclid || null
  }

  if (source.utmSource || source.gclid) {
    try {
      if (source.utmSource) {
        setCookie('utm_source', source.utmSource)
      }
      if (source.gclid) {
        setCookie('gclid', source.gclid)
      }
    } catch (error) {
      console.warn('Failed to set source cookies')
    }

    // 更新存储的追踪数据
    setLocalStorage(STORAGE_KEYS.TRACKING, {
      ...storedTracking,
      ...source
    })
  }

  return source
}

// 会话追踪同步
const syncSessionTracking = (session: any) => {
  if (!session?.user) return {}

  const updates: PendingUpdate = {}
  const storedTracking = getLocalStorage<TrackingData>(STORAGE_KEYS.TRACKING) || {}
  const fbc = storedTracking.fbc
  const fbp = storedTracking.fbp
  const fbclid = storedTracking.fbclid

  // 只在存储中有值时进行同步
  if (fbc && (!session.user.fbc || session.user.fbc !== fbc)) {
    updates.fbc = fbc
  }
  if (fbp && (!session.user.fbp || session.user.fbp !== fbp)) {
    updates.fbp = fbp
  }
  if (fbclid && (!session.user.fbclid || session.user.fbclid !== fbclid)) {
    updates.fbclid = fbclid
  }

  return updates
}

// 数据恢复函数
const restoreTrackingData = () => {
  const storedTracking = getLocalStorage<TrackingData>(STORAGE_KEYS.TRACKING)

  if (storedTracking) {
    try {
      // 不再从 localStorage 恢复到 cookie
      // 恢复来源追踪数据
      if (storedTracking.utmSource && !getCookie('utm_source')) {
        setCookie('utm_source', storedTracking.utmSource)
      }
      if (storedTracking.gclid && !getCookie('gclid')) {
        setCookie('gclid', storedTracking.gclid)
      }
    } catch (error) {
      console.warn('Failed to restore tracking cookies')
    }
  }
}

export default function ClientApiSessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, update: updateSession } : any = useSession()

  // 获取UTM参数（从cookie）
  const getUtmParamsFromCookie = () => {
    const utmSource = getCookie('utm_source')
    const utmCampaign = getCookie('utm_campaign')
    return {
      utmSource: utmSource || undefined,
      utmCampaign: utmCampaign || undefined,
    }
  }

  // 获取fbclid（从localStorage）
  const getFbclidFromStorage = () => {
    const storedTracking = getLocalStorage<TrackingData>(STORAGE_KEYS.TRACKING) || {}
    return storedTracking.fbclid || undefined
  }

  // 处理用户档案更新
  const processProfileUpdate = async (updates: PendingUpdate): Promise<void> => {
    try {
      // 自动从cookie获取UTM参数并添加到更新请求中
      const utmParams = getUtmParamsFromCookie()
      // 自动从localStorage获取fbclid并添加到更新请求中
      const fbclid = getFbclidFromStorage()
      const updatesWithUtm = {
        ...updates,
        ...(utmParams.utmSource && { utmSource: utmParams.utmSource }),
        ...(utmParams.utmCampaign && { utmCampaign: utmParams.utmCampaign }),
        ...(fbclid && { fbclid }),
      }
      await updateProfile(updatesWithUtm)
    } catch (error: any) {
      // 处理特定类型的错误
      if (error.status === 401) {
        // 认证错误，清除队列
        removeLocalStorage(STORAGE_KEYS.PENDING_UPDATES)
        throw error
      }
      if (error.status === 429) {
        // 限流错误，延迟重试
        await new Promise(resolve => setTimeout(resolve, UPDATE_CONFIG.RETRY_DELAY))
        throw error
      }
      throw error
    }
  }

  // 处理待更新队列
  const handlePendingUpdates = async () => {
    const pendingUpdates = getLocalStorage<PendingUpdateItem[]>(STORAGE_KEYS.PENDING_UPDATES) || []
    if (pendingUpdates.length === 0) return

    // 清理过期项目
    const now = Date.now()
    const validUpdates = pendingUpdates.filter(update =>
        now - update.timestamp < UPDATE_CONFIG.MAX_AGE &&
        update.retryCount < UPDATE_CONFIG.MAX_RETRIES
    )

    // 如果没有有效的更新项，清除存储
    if (validUpdates.length === 0) {
      removeLocalStorage(STORAGE_KEYS.PENDING_UPDATES)
      return
    }

    // 处理每个待更新项
    for (const update of validUpdates) {
      try {
        await processProfileUpdate(update)
        // 成功后从队列中移除
        const remainingUpdates = validUpdates.filter(item =>
            JSON.stringify(item) !== JSON.stringify(update)
        )
        setLocalStorage(STORAGE_KEYS.PENDING_UPDATES, remainingUpdates)
      } catch (error) {
        // 更新重试计数
        update.retryCount += 1
        update.timestamp = now
        setLocalStorage(STORAGE_KEYS.PENDING_UPDATES, validUpdates)
        console.error('Failed to process update:', error)
      }
    }
  }

  const getCookkieFBC = () => {
    const fbc = getCookie("_fbc")
    return fbc ? fbc : ''
  }

  const getCookkieFBP = () => {
    const fbp = getCookie("_fbp")
    return fbp ? fbp : ''
  }

  const getCookkieSource = () => {
    const utmSource = getCookie('utm_source')
    return utmSource ? utmSource : ''
  }

  const getCokkieGclid = () => {
    const utmSource = getCookie('gclid')
    return utmSource ? utmSource : ''
  }

  useEffect(() => {
    // 初始化：恢复追踪数据
    restoreTrackingData()

    // 1. 处理 Facebook 追踪
    handleFbclid()

    // 2. 处理来源追踪
    const sourceTracking = handleSourceTracking()

    // 3. 获取并保存所有 UTM 参数到 cookie
    try {
      getUtmParams()
    } catch (error) {
      console.warn('Failed to get UTM params:', error)
    }

    // 4. 处理会话同步和更新
    if (session?.user) {
      const updates = {
        ...syncSessionTracking(session),
        ...((!session.user.utmSource || session.user.utmSource === '') && sourceTracking.utmSource ?
            { utmSource: sourceTracking.utmSource } : {})
      }

      // 如果有更新，执行更新
      if (Object.keys(updates).length > 0) {
        processProfileUpdate(updates).catch(error => {
          console.error('Failed to update profile:', error)
          // 保存到待更新队列
          const pendingUpdates = getLocalStorage<PendingUpdateItem[]>(STORAGE_KEYS.PENDING_UPDATES) || []

          // 检查队列大小
          if (pendingUpdates.length >= UPDATE_CONFIG.MAX_PENDING_ITEMS) {
            console.warn('Pending updates queue is full, removing oldest item')
            pendingUpdates.shift() // 移除最旧的项目
          }

          // 添加新的更新项
          if (!pendingUpdates.some(update => JSON.stringify(update) === JSON.stringify(updates))) {
            pendingUpdates.push({
              ...updates,
              retryCount: 0,
              timestamp: Date.now()
            })
            setLocalStorage(STORAGE_KEYS.PENDING_UPDATES, pendingUpdates)
          }
        })
      }
      console.log('(((((((((((((((((', session)
      // 保存会话
      // 优先保留 localStorage 中可能更新过的 creditsBalance，避免被 /api/auth/session 的旧值覆盖
      try {
        const storedSession = getLocalStorage<any>(STORAGE_KEYS.SESSION)
        const mergedSession = {
          ...session,
          user: {
            ...session.user,
            creditsBalance:
              storedSession?.user?.creditsBalance !== undefined
                ? storedSession.user.creditsBalance
                : session.user.creditsBalance,
          },
        }
        setLocalStorage(STORAGE_KEYS.SESSION, mergedSession)
      } catch (error) {
        console.error('Failed to merge and store session:', error)
        setLocalStorage(STORAGE_KEYS.SESSION, session)
      }

      // 处理待更新队列
      handlePendingUpdates().catch(error => {
        console.error('Error processing pending updates queue:', error)
      })
    } else {
      // 未登录情况下，检查年龄验证是否通过，如果通过则创建访客用户
      ;(async () => {
        try {
          // 检查年龄验证是否通过
          const ageVerified = typeof window !== 'undefined' ? localStorage.getItem('AGE_VERIFIED') === 'true' : false
          if (!ageVerified) {
            // 年龄验证未通过，不创建访客用户
            return
          }
          
          const storedSession = getLocalStorage<any>(STORAGE_KEYS.SESSION)
          // 如果已有访客 token，直接复用
          if (storedSession?.user?.accessToken && storedSession.user.isGuest) {
            // 如果已有访客 session 但没有 NextAuth session，尝试创建
            if (!session) {
              try {
                await signIn('guest-login', {
                  redirect: false,
                  accessToken: storedSession.user.accessToken,
                  id: String(storedSession.user.id || 0),
                  email: storedSession.user.email || '',
                  firstName: storedSession.user.firstName || '',
                  lastName: storedSession.user.lastName || '',
                  name: storedSession.user.name || 'Guest',
                  avatar: storedSession.user.avatar || '',
                  isGuest: 'true',
                  isNew: String(storedSession.user.isNew || false),
                  fbc: storedSession.user.fbc || '',
                  utmSource: storedSession.user.utmSource || '',
                  location: storedSession.user.location || '',
                  subscriptionCycle: storedSession.user.subscriptionCycle || '',
                  subscriptionStatus: storedSession.user.subscriptionStatus || '',
                  nextPaymentTime: storedSession.user.nextPaymentTime || '',
                  paymentCount: String(storedSession.user.paymentCount || 0),
                  planName: storedSession.user.planName || '',
                  planTag: storedSession.user.planTag || '',
                  creditsBalance: String(storedSession.user.creditsBalance || 0),
                  cumulativeConsumption: String(storedSession.user.cumulativeConsumption || 0),
                })
              } catch (error) {
                console.error('Failed to sign in existing guest user:', error)
              }
            }
            return
          }

          // 创建或获取访客 token
          const guestToken = await createOrGetGuestTokenApi()
          console.log('%%%%%%%%%%%%%', guestToken)
          
          // 先保存 token 到 localStorage，这样后续调用 getUserProfile 时会自动携带 token
          const tempSession = {
            user: {
              accessToken: guestToken,
              isGuest: true,
            },
          }
          setLocalStorage(STORAGE_KEYS.SESSION, tempSession)
          
          // 调用 /users/profile 接口获取用户信息（会自动携带 token）
          try {
            const userProfile = await getUserProfile()
            console.log('******************', userProfile)
            
            // 参考 userApi.getLoggedUser() 的逻辑，构建完整的用户对象
            const guestUser = {
              id: userProfile.id,
              email: userProfile.email || '',
              firstName: userProfile.firstName || '',
              lastName: userProfile.lastName || '',
              name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Guest',
              avatar: userProfile.avatar || '',
              accessToken: guestToken,
              isGuest: true,
              isNew: userProfile.isNew,
              fbc: userProfile.fbc,
              utmSource: userProfile.utmSource,
              location: userProfile.location,
              subscriptionCycle: userProfile.subscriptionCycle,
              subscriptionStatus: userProfile.subscriptionStatus,
              nextPaymentTime: userProfile.nextPaymentTime,
              paymentCount: userProfile.paymentCount,
              planName: userProfile.planName,
              planTag: userProfile.planTag,
              creditsBalance: userProfile.creditsBalance || 0,
              cumulativeConsumption: userProfile.cumulativeConsumption,
            }
            
            // 将完整的用户信息同步到 localStorage
            const guestSession = {
              user: guestUser,
            }
            setLocalStorage(STORAGE_KEYS.SESSION, guestSession)
            
            // 通过 signIn 创建 NextAuth session（这样 session 对象就不会是 null）
            try {
              const result = await signIn('guest-login', {
                redirect: false,
                accessToken: guestUser.accessToken,
                id: String(guestUser.id),
                email: guestUser.email,
                firstName: guestUser.firstName,
                lastName: guestUser.lastName,
                name: guestUser.name,
                avatar: guestUser.avatar,
                isGuest: 'true',
                isNew: String(guestUser.isNew || false),
                fbc: guestUser.fbc || '',
                utmSource: guestUser.utmSource || '',
                location: guestUser.location || '',
                subscriptionCycle: guestUser.subscriptionCycle || '',
                subscriptionStatus: guestUser.subscriptionStatus || '',
                nextPaymentTime: guestUser.nextPaymentTime || '',
                paymentCount: String(guestUser.paymentCount || 0),
                planName: guestUser.planName || '',
                planTag: guestUser.planTag || '',
                creditsBalance: String(guestUser.creditsBalance || 0),
                cumulativeConsumption: String(guestUser.cumulativeConsumption || 0),
              })
              
              if (result?.ok) {
                console.log('Guest user session created successfully via signIn')
              } else {
                console.error('Failed to create guest session via signIn:', result?.error)
                // 如果 signIn 失败，尝试使用 updateSession（如果已有 session）
                try {
                  await updateSession(guestUser)
                  console.log('Guest user session updated via updateSession')
                } catch (updateError) {
                  console.error('Failed to update NextAuth session:', updateError)
                }
              }
            } catch (error) {
              console.error('Failed to create/update NextAuth session:', error)
            }
            
            // 触发事件通知其他组件 session 已更新
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('guestSessionUpdated', { 
                detail: { session: guestSession } 
              }))
            }
          } catch (profileError) {
            console.error('Failed to get guest user profile:', profileError)
            // 如果获取用户信息失败，至少保留 token
            setLocalStorage(STORAGE_KEYS.SESSION, tempSession)
            
            // 通过 signIn 创建 NextAuth session（只有 token）
            try {
              const result = await signIn('guest-login', {
                redirect: false,
                accessToken: guestToken,
                id: '0',
                email: '',
                firstName: '',
                lastName: '',
                name: 'Guest',
                avatar: '',
                isGuest: 'true',
                isNew: 'false',
                fbc: '',
                utmSource: '',
                location: '',
                subscriptionCycle: '',
                subscriptionStatus: '',
                nextPaymentTime: '',
                paymentCount: '0',
                planName: '',
                planTag: '',
                creditsBalance: '0',
                cumulativeConsumption: '0',
              })
              
              if (result?.ok) {
                console.log('Guest token session created successfully via signIn')
              } else {
                console.error('Failed to create guest token session via signIn:', result?.error)
              }
            } catch (error) {
              console.error('Failed to create NextAuth session:', error)
            }
            
            // 即使失败也触发事件，通知组件有访客 token
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('guestSessionUpdated', { 
                detail: { session: tempSession } 
              }))
            }
          }
        } catch (error) {
          console.error('Failed to create or get guest token:', error)
          removeLocalStorage(STORAGE_KEYS.SESSION)
        }
      })()
    }
    
    // 监听年龄验证状态变化（当用户点击年龄验证按钮时触发）
    const handleAgeVerificationChange = () => {
      const ageVerified = typeof window !== 'undefined' ? localStorage.getItem('AGE_VERIFIED') === 'true' : false
      if (ageVerified && !session) {
        // 年龄验证通过且未登录，触发访客登录逻辑
        const storedSession = getLocalStorage<any>(STORAGE_KEYS.SESSION)
        if (!storedSession?.user?.accessToken || !storedSession.user.isGuest) {
          // 如果没有访客 session，重新执行访客登录逻辑
          // 这里会触发上面的 useEffect 重新执行，但由于 ageVerified 检查，需要手动触发
          // 实际上，AgeVerification 组件已经处理了访客登录，这里主要是确保同步
        }
      }
    }
    
    // 监听 localStorage 的 AGE_VERIFIED 变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'AGE_VERIFIED' && e.newValue === 'true' && !session) {
        // 年龄验证通过，触发访客登录检查
        handleAgeVerificationChange()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // 也监听同标签页的 localStorage 变化（通过自定义事件）
    const handleCustomAgeVerified = () => {
      if (!session) {
        handleAgeVerificationChange()
      }
    }
    
    window.addEventListener('ageVerified', handleCustomAgeVerified)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('ageVerified', handleCustomAgeVerified)
    }
  }, [session, updateSession])

  return children
}
