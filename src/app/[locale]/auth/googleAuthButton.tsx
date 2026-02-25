'use client'
import { useTranslations } from '@/hooks/useTranslations'
import { useContext, useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import GoogleIcon from '@/components/GoogleIcon'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { useSnackbar } from '@/context/SnackbarContext'
import { getGoogleOauthUrl } from '@/api/client/signupApi'
import CoreApiError from '@/api/core/coreApiError'
import { getSession, signIn } from 'next-auth/react'
import { AuthDialogContext } from '@/context/AuthDialogContext'
type SignInOptions = any
import { LoginType, useGTM } from '@/context/GTMContext'
import { isMetaApp, isMobile } from '@/util/browser'
import { AnalyticsEventType } from '@/utils/events/analytics'

interface GoogleAuthButtonProps {
  label: string
  onAuth?: () => void
  onClick?: () => void
  sx?: any
  roundedIcon?: boolean
  signInOptions?: SignInOptions
}
export default function GoogleAuthButton(props: GoogleAuthButtonProps) {
  const t = useTranslations('Auth')
  const tError = useTranslations('Error')
  const [googleAuthorizing, setGoogleAuthorizing] = useState(false)
  const { closeDialog } = useContext(AuthDialogContext)
  const { showSnackbar } = useSnackbar()
  const { sendEvent, reportEvent } = useGTM()
  const [isMeta, setIsMeta] = useState(false)

  const handleLoginSuccess = async (params: any) => {
    setGoogleAuthorizing(true)
    try {
      const result = await signIn('login-google-auth-code', { ...(props.signInOptions as any), ...params })
      if (result?.ok) {
        const latestSession = await getSession()
        if (!(latestSession as any)?.user?.isNew) {
          reportEvent('LoginSuccess', {
            type: LoginType.Google,
            custom_data: {
              currency: 'USD',
              value: 1,
              login_channel: 1,
              trigger_point:String(localStorage.getItem('loginPosition') ?? '')
            },
          })
        }
        props.onAuth && props.onAuth()
        closeDialog()
        sendLoginOrSignUpEvent()
      } else {
        reportEvent(AnalyticsEventType.LOGIN_FAILED, {
          type: LoginType.Google,
          custom_data: {
            currency: 'USD',
            value: 1,
            login_channel: 1,
            trigger_point: String(localStorage.getItem('loginPosition') ?? '')
          },
        })
        showSnackbar(result?.error, 'error')
      }
    } catch (e: any) {
      if (e instanceof CoreApiError) {
        showSnackbar(tError(e.code, e.context()), 'error')
      } else {
        showSnackbar(e.message, 'error')
      }
    } finally {
      setGoogleAuthorizing(false)
    }
  }

  const sendLoginOrSignUpEvent = async () => {
    const latestSession = await getSession()
    console.log(latestSession)
    sendEvent(((latestSession as any)?.user?.isNew) ? 'sign_up' : 'login', {
      type: LoginType.Google,
      custom_data: {
        value: 1,
        method: 'Google',
      },
    })
  }

  const onGoogleAuthorize = async () => {
    try {
      setGoogleAuthorizing(true)
      const googleOauthUrl = await getGoogleOauthUrl()
      if (isMetaApp() || !window.open) {
        closeDialog()
        window.location.href = '/redirect?r=' + encodeURIComponent(googleOauthUrl)
        // router.push('/redirect?r=' + encodeURIComponent(googleOauthUrl))
      } else if (isMobile()) {
        window.location.href = googleOauthUrl
      } else {
        const newWindow = window.open(
          'about:blank',
          '',
          'width=500,height=700,top=100,left=200,scrollbars=yes,resizable=1',
        )
        if (newWindow) newWindow.location.href = googleOauthUrl
        // window.open(googleOauthUrl, '_blank', 'width=500,height=700,top=100,left=200')
      }
      props.onClick && props.onClick()
    } catch (e: any) {
      if (e instanceof CoreApiError) {
        showSnackbar(tError(e.code, e.context()), 'error')
      } else {
        showSnackbar(e.message, 'error')
      }
      setGoogleAuthorizing(false)
    } finally {
      setGoogleAuthorizing(false)
    }
  }

  useEffect(() => {
    setIsMeta(isMetaApp())
    const handleMessage = (event: any) => {
      if (event.origin === window.location.origin) {
        if (event.data.type === 'google_login') {
          handleLoginSuccess(event.data.params)
        } else if (event.data.type === 'google_login_error') {
          showSnackbar(event.data.error, 'error')
        }
      }
    }

    window?.addEventListener('message', handleMessage)

    return () => {
      window?.removeEventListener('message', handleMessage)
    }
  }, [])

  if (isMeta) {
    return null
  }

  return (
    <Button
      color="primary"
      size="lg"
      endContent={<ChevronRightIcon className="w-4 h-4" />}
      isLoading={googleAuthorizing}
      className="icon-transition-x icon-small relative rounded-sm"
      onPress={onGoogleAuthorize}
    >
      {props.label}
      <span className="absolute top-1 left-1">
        <GoogleIcon sx={props.roundedIcon && { borderRadius: '50%' }} fontSize="large" />
      </span>
    </Button>
  )
}
