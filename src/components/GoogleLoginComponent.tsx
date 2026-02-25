'use client'
import { useRef } from 'react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useSnackbar } from '@/context/SnackbarContext'
import { signIn, useSession, getSession } from 'next-auth/react'
import CoreApiError from '@/api/core/coreApiError'
import {useTranslations} from '@/hooks/useTranslations'
import { LoginType, useGTM } from '@/context/GTMContext'
import {logError} from "@/api/core/common";

const GoogleLoginComponent = () => {
  const t = useTranslations('Auth')
  const tError = useTranslations('Error')
  const { data: session } = useSession()
  const { showSnackbar } = useSnackbar()
  const init = useRef(false)
  const { sendEvent } = useGTM()

  const handleLoginSuccess = async (tokenResponse) => {
    try {
      const result = await signIn('login-google-one-tap', { redirect: false, credential: tokenResponse.credential })
      if (result.ok) {
        sendLoginOrSignUpEvent()
        showSnackbar(t('sign_in_success'))
      } else {
        showSnackbar(result.error, 'error')
      }
    } catch (e) {
      if (e instanceof CoreApiError) {
        showSnackbar(tError(e.code, e.context()), 'error')
      } else {
        showSnackbar(e.message, 'error')
      }
    }
  }

  const sendLoginOrSignUpEvent = async () => {
    const latestSession = await getSession()
    // 在这里发送注册事件的
    // sendEvent('sign_up')
    sendEvent(latestSession?.user?.isNew ? 'sign_up' : 'login', {
      type: LoginType.GoogleOneTap,
      custom_data: {
        value: 1,
      },
      email: latestSession?.user?.email || '',
      first_name: latestSession?.user?.firstName || '',
      last_name: latestSession?.user?.lastName || ''
     })
  }

  const handleLoginFailure = (error) => {
    showSnackbar('Login failed: ' + error, 'error')
    logError(error.message, {}, error)
  }

  if (session) {
    init.current = true
    return
  }

  if (init.current) {
    return
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID}>
      <div id="google-login-button" className="hidden">
        <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginFailure} useOneTap />
      </div>
    </GoogleOAuthProvider>
  )
}

export default GoogleLoginComponent
