'use client'
import { useEffect } from 'react'
import { getSession, signIn, useSession } from 'next-auth/react'
import CoreApiError from '@/api/core/coreApiError'
import { useSnackbar } from '@/context/SnackbarContext'
import { useTranslations } from '@/hooks/useTranslations'
import { LoginType, useGTM } from '@/context/GTMContext'
import { isMetaApp } from '@/util/browser'
import { logInfo, logError } from '@/api/core/common'

export default function FacebookLoader() {
  const tError = useTranslations('Error')
  const { data: session } = useSession()
  const { showSnackbar } = useSnackbar()
  const { sendEvent } = useGTM()

  const handleAutoLogin = async (accessToken: string) => {
    try {
      // 首先获取 Facebook 用户信息
      const userResponse = await window.FB.api('/me', {
        fields: 'email,name',
        access_token: accessToken,
      })

      const result = await signIn('login-facebook-access-token', { redirect: false, accessToken })
      if (result?.ok) {
        sendLoginOrSignUpEvent()
      } else {
        showSnackbar(result?.error, 'error')
      }
    } catch (e) {
      const errorMessage = e instanceof CoreApiError ? tError(e.code, e.context()) : e.message
      showSnackbar(errorMessage, 'error')
      logError(errorMessage, { accessToken }, e)
    }
  }

  const sendLoginOrSignUpEvent = async () => {
    const latestSession = await getSession()
    // 在这里发送注册事件的
    // sendEvent('sign_up')
    sendEvent(latestSession?.user?.isNew ? 'sign_up' : 'login', {
      type: LoginType.Facebook,
      custom_data: {
        value: 1,
        method: 'Facebook',
      },
      email: latestSession?.user?.email || '',
      first_name: latestSession?.user?.firstName || '',
      last_name: latestSession?.user?.lastName || '',
    })
  }

  const checkLoginStatus = () => {
    if (session) {
      return
    }
    if (!isMetaApp()) {
      return
    }

    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        logInfo('FB.getLoginStatus: already logged in', response)
        handleAutoLogin(response.authResponse.accessToken)
      } else {
        logInfo('FB.getLoginStatus: not logged', response)
      }
    })
  }

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FB_CLIENT_ID) {
      return
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FB_CLIENT_ID,
        cookie: true,
        xfbml: true,
        version: process.env.NEXT_PUBLIC_FB_API_VERSION,
      })

      window.FB.AppEvents.logPageView()
      checkLoginStatus()
    }
    ;(function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {
        return
      }
      js = d.createElement(s)
      js.id = id
      js.src =
        'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0&appId=' + process.env.NEXT_PUBLIC_FB_CLIENT_ID
      fjs.parentNode.insertBefore(js, fjs)
    })(document, 'script', 'facebook-jssdk')
  }, [])
  return <></>
}
