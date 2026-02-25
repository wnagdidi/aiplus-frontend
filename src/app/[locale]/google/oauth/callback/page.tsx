'use client'
import { Spinner } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { isMetaApp, isMobile } from '@/util/browser'
import { getSession, signIn } from 'next-auth/react'
import CoreApiError from '@/api/core/coreApiError'
import { useTranslations } from '@/hooks/useTranslations'
import { useRouter } from '@/components/next-intl-progress-bar'
import { LoginType, useGTM } from '@/context/GTMContext'

const DEFAULT_MESSAGE = 'Connecting to Google...'

export default function GoogleAuthCallBack() {
  const sentMessage = useRef(false)
  const tError = useTranslations('Error')
  const router = useRouter()
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const { sendEvent } = useGTM()

  const sendLoginOrSignUpEvent = async () => {
    const latestSession = await getSession()
    sendEvent(latestSession?.user?.isNew ? 'sign_up' : 'login', {
      type: LoginType.Google,
      custom_data: {
        value: 1,
        method: 'Google',
      },
    })
  }

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const params = {}
    for (const [key, value] of urlParams.entries()) {
      params[key] = value
    }

    if (sentMessage.current) {
      return
    }
    sentMessage.current = true

    const loginGoogleByCode = async () => {
      try {
        const result = await signIn('login-google-auth-code', { redirect: false, ...params })
        if (result?.ok) {
          await sendLoginOrSignUpEvent()
          router.push('/')
        } else {
          setMessage(result?.error)
        }
      } catch (e) {
        if (e instanceof CoreApiError) {
          setMessage(tError(e.code, e.context()))
        } else {
          setMessage(e.message)
        }
      }
    }

    if (params.code) {
      if (isMetaApp() || !window.opener || isMobile()) {
        loginGoogleByCode()
      } else {
        setTimeout(() => {
          window.close()
        }, 500)
        window.opener.postMessage(
          {
            type: 'google_login',
            params,
          },
          window.location.origin,
        )
      }
    } else {
      if (isMetaApp() || !window.opener || isMobile()) {
        setMessage(params.error || 'Login failed')
      } else {
        window.opener.postMessage(
          {
            type: 'google_login_error',
            error: params.error || 'Login failed',
          },
          window.location.origin,
        )
      }
    }
  }, [])

  return (
    <div className="max-w-xs mx-auto mt-8 pt-8 flex flex-col items-center">
      <div className="flex items-center gap-2">
        <span className="text-base">{message}</span>
        {message === DEFAULT_MESSAGE && <Spinner size="sm" />}
      </div>
    </div>
  )
}
