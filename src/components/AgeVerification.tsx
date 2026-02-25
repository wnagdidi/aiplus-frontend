'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { createOrGetGuestTokenApi } from '@/api/client/guestApi'
import { getUserProfile } from '@/api/client/feeLoveApi'
import { getLocalStorage, setLocalStorage } from '@/util/localStorage'
import { signIn } from 'next-auth/react'

// 检查环境变量 NEXT_PUBLIC_CLOAK
const isCloakEnabled = process.env.NEXT_PUBLIC_CLOAK === 'true'

export default function AgeVerification() {
  const { data: session } = useSession()
  const [showAgeGate, setShowAgeGate] = useState(false)
  const [ageGateView, setAgeGateView] = useState<'verify' | 'denied'>('verify')

  useEffect(() => {
    // 如果启用了 CLOAK，不显示年龄验证弹框
    if (isCloakEnabled) {
      setShowAgeGate(false)
      return
    }
    // 仅未登录时展示；并且用户点过 Yes 后不再展示
    if (session) {
      setShowAgeGate(false)
      return
    }
    try {
      const verified = localStorage.getItem('AGE_VERIFIED') === 'true'
      setShowAgeGate(!verified)
      setAgeGateView('verify')
    } catch {
      setShowAgeGate(true)
      setAgeGateView('verify')
    }
  }, [session])

  if (!showAgeGate) {
    return null
  }

  return (
    <>
      {/* 蒙层 */}
      <div
        data-state="open"
        className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-black/60 backdrop-blur-sm"
        style={{ pointerEvents: 'auto' }}
        data-aria-hidden="true"
        aria-hidden="true"
      ></div>

      {/* 内容 */}
      {ageGateView === 'verify' ? (
        <div
          role="dialog"
          aria-describedby="age-verify-desc"
          aria-labelledby="age-verify-title"
          data-state="open"
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-pink-500/30 bg-gradient-to-br from-pink-900/95 via-purple-900/95 to-gray-900/95 p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg sm:rounded-lg backdrop-blur-sm"
          tabIndex={-1}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield-alert w-16 h-16 text-pink-400"
                  aria-hidden="true"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  <path d="M12 8v4"></path>
                  <path d="M12 16h.01"></path>
                </svg>
              </div>
            </div>
            <h2
              id="age-verify-title"
              className="tracking-tight text-2xl font-bold text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
            >
              Age Verification Required
            </h2>
          </div>

          <div className="space-y-4 py-4" id="age-verify-desc">
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-6 text-center">
              <p className="text-gray-200 text-base leading-relaxed mb-2">
                This website contains adult content and is intended for adults only.
              </p>
              <p className="text-gray-300 text-base font-semibold">Are you 18 years of age or older?</p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                type="button"
                className="cursor-pointer bg-gradient-to-r from-[#ec4899] to-[#db2777] inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-10 px-4 w-full btn-gradient text-white font-semibold py-6 text-lg"
                onClick={async () => {
                  try {
                    localStorage.setItem('AGE_VERIFIED', 'true')
                    // 触发自定义事件，通知其他组件年龄验证已通过
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('ageVerified'))
                    }
                  } catch {}
                  setShowAgeGate(false)
                  
                  // 年龄验证通过后，如果用户未登录，创建访客用户
                  if (!session) {
                    try {
                      // 检查是否已有访客 session
                      const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
                      if (storedSession?.user?.accessToken && storedSession.user.isGuest) {
                        // 已有访客 session，尝试通过 signIn 创建 NextAuth session
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
                          console.error('Failed to sign in guest user:', error)
                        }
                        return
                      }
                      
                      // 创建或获取访客 token
                      const guestToken = await createOrGetGuestTokenApi()
                      
                      // 先保存 token 到 localStorage
                      const tempSession = {
                        user: {
                          accessToken: guestToken,
                          isGuest: true,
                        },
                      }
                      setLocalStorage('AVOID_AI_SESSION', tempSession)
                      
                      // 调用 /users/profile 接口获取用户信息
                      try {
                        const userProfile = await getUserProfile()
                        
                        // 构建完整的用户对象
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
                        
                        // 保存到 localStorage
                        const guestSession = {
                          user: guestUser,
                        }
                        setLocalStorage('AVOID_AI_SESSION', guestSession)
                        
                        // 通过 signIn 创建 NextAuth session
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
                            console.log('Guest user session created successfully after age verification')
                          }
                        } catch (error) {
                          console.error('Failed to create guest session after age verification:', error)
                        }
                        
                        // 触发事件通知其他组件 session 已更新
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('guestSessionUpdated', { 
                            detail: { session: guestSession } 
                          }))
                        }
                      } catch (profileError) {
                        console.error('Failed to get guest user profile after age verification:', profileError)
                        // 如果获取用户信息失败，至少保留 token 并尝试创建 session
                        try {
                          await signIn('guest-login', {
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
                        } catch (error) {
                          console.error('Failed to create guest token session:', error)
                        }
                      }
                    } catch (error) {
                      console.error('Failed to create guest user after age verification:', error)
                    }
                  }
                }}
              >
                Yes, I am 18 or older
              </button>
              <button
                type="button"
                className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-10 px-4 w-full border-gray-600 text-gray-300 hover:bg-red-900/30 hover:border-red-500/50 hover:text-white py-6 text-lg"
                onClick={() => {
                  setAgeGateView('denied')
                }}
              >
                No, I am under 18
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By clicking &quot;Yes&quot;, you confirm that you are of legal age to view adult content in your jurisdiction.
            </p>
          </div>
        </div>
      ) : (
        <div
          role="dialog"
          aria-describedby="age-denied-desc"
          aria-labelledby="age-denied-title"
          data-state="open"
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-red-500/50 bg-gradient-to-br from-red-900/95 via-gray-900/95 to-gray-900/95 p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg sm:rounded-lg backdrop-blur-sm"
          tabIndex={-1}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-triangle-alert w-16 h-16 text-red-400"
                  aria-hidden="true"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </div>
            </div>
            <h2 id="age-denied-title" className="tracking-tight text-2xl font-bold text-center text-white">
              Access Denied
            </h2>
          </div>
          <div className="space-y-4 py-4" id="age-denied-desc">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-gray-200 text-base leading-relaxed mb-4">
                You must be 18 years or older to access this website.
              </p>
              <p className="text-gray-400 text-sm">
                Please close this window and come back when you meet the age requirement.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-10 px-4 py-2 w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => {
                // window.close 只对脚本打开的窗口生效，这里做降级：回到验证弹窗并保持遮罩
                // try {
                //   window.close()
                // } catch {}
                // setAgeGateView('verify')
                // setShowAgeGate(true)
              }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </>
  )
}
