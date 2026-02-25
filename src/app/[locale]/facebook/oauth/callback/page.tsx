'use client'
import { Spinner } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { getSession, signIn } from 'next-auth/react'
import CoreApiError from '@/api/core/coreApiError'
import { useTranslations } from '@/hooks/useTranslations'
import { useRouter } from '@/components/next-intl-progress-bar'
import { LoginType, useGTM } from '@/context/GTMContext'
import {getErrorMessage, logError} from "@/api/core/common";

const DEFAULT_MESSAGE = 'Connecting to Facebook...'

export default function FacebookAuthCallBack() {
  const sentMessage = useRef(false)
  const tError = useTranslations('Error')
  const router = useRouter()
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const { sendEvent } = useGTM()

  const sendLoginOrSignUpEvent = async () => {
    const latestSession = await getSession()
    sendEvent(latestSession?.user?.isNew ? 'sign_up' : 'login', { type: LoginType.Facebook,
      custom_data: {
        value: 1,
      }
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

    const loginFacebookByCode = async () => {
      try {
        const result = await signIn('login-facebook-auth-code', { redirect: false, ...params })
        if (result?.ok) {
          await sendLoginOrSignUpEvent()
          router.push('/')
        } else {
          setMessage(result?.error)
        }
      } catch (e) {
        const error = getErrorMessage(tError, e)
        setMessage(error)
        logError(error, { params }, e)
      }
    }

    if (params.code) {
      loginFacebookByCode()
    } else {
      logError('unknown oauth redirect params', { params }, new Error())
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
