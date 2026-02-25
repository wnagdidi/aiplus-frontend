'use client'
import { useTranslations } from '@/hooks/useTranslations'
import { useContext, useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { useSnackbar } from '@/context/SnackbarContext'
import CoreApiError from '@/api/core/coreApiError'
import { getSession, signIn } from 'next-auth/react'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import { SignInOptions } from 'next-auth/src/react/types'
import { LoginType, useGTM } from '@/context/GTMContext'
// Inline Facebook SVG icon to avoid extra dependency
import { isMetaApp, isMobile } from '@/util/browser'
import { logError, logInfo } from '@/api/core/common'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { AnalyticsEventType } from '@/utils/events/analytics'

interface FacebookAuthButtonProps {
  label: string
  onAuth?: () => void
  onClick?: () => void
  sx?: any
  roundedIcon?: boolean
  signInOptions?: SignInOptions
  showArrow?: boolean
  invertedIcon?: boolean
}
export default function FacebookAuthButton(props: FacebookAuthButtonProps) {
  const FacebookSvg = ({ className, fill }: { className?: string; fill?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill={fill || 'currentColor'} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  )
  const t = useTranslations('Auth')
  const tError = useTranslations('Error')
  const [authorizing, setAuthorizing] = useState(false)
  const { closeDialog } = useContext(AuthDialogContext)
  const { showSnackbar } = useSnackbar()
  const { sendEvent, reportEvent } = useGTM()
  const [isMeta, setIsMeta] = useState(false)

  const handleLoginSuccess = async (params: any) => {
    setAuthorizing(true)
    try {
      const result = await signIn('login-facebook-access-token', {
        ...props.signInOptions,
        ...params,
      })
      const latestSession = await getSession()
      if (result?.ok) {
        if (!latestSession?.user?.isNew) {
          reportEvent('LoginSuccess', {
            type: LoginType.Facebook,
            custom_data: {
              currency: 'USD',
              value: 1,
              login_channel: 2,
              trigger_point:localStorage.getItem('loginPosition')
            },
          })
        }
        props.onAuth && props.onAuth()
        closeDialog()
        sendLoginOrSignUpEvent()
      } else {
        reportEvent(AnalyticsEventType.LOGIN_FAILED, {
          type: LoginType.Facebook,
          custom_data: {
            currency: 'USD',
            value: 1,
            login_channel: 2,
            trigger_point:localStorage.getItem('loginPosition')
          },
        })
        showSnackbar(result?.error, 'error')
      }
    } catch (e) {
      const errorMessage = e instanceof CoreApiError ? tError(e.code, e.context()) : e.message
      showSnackbar(errorMessage, 'error')
      logError(errorMessage, params, e)
    } finally {
      setAuthorizing(false)
    }
  }

  const sendLoginOrSignUpEvent = async () => {
    const latestSession = await getSession()
    console.log(latestSession)
    sendEvent(latestSession?.user?.isNew ? 'sign_up' : 'login', {
      type: LoginType.Facebook,
      custom_data: {
        value: 1,
        method: 'Facebook',
      },
    })
  }

  const onFacebookLogin = (response) => {
    logInfo('onFacebookLogin', { response })
  }

  const onFacebookAuthorize = () => {
    setAuthorizing(true)
    if (isMobile()) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/facebook/oauth/callback`
      const url = `https://m.facebook.com/${process.env.NEXT_PUBLIC_FB_API_VERSION}/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FB_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=email,public_profile&response_type=code`
      window.location.href = url
      return
    }

    try {
      if (!window.FB || !window.FB.login) {
        showSnackbar('Loading Facebook...please retry later', 'info')
        setAuthorizing(false)
        return
      }
      window.FB.getLoginStatus((loginStatusResponse) => {
        if (loginStatusResponse.status === 'connected') {
          handleLoginSuccess({
            accessToken: loginStatusResponse.authResponse.accessToken,
          })
        } else {
          window.FB.login(
            (response) => {
              if (response.authResponse) {
                handleLoginSuccess({
                  accessToken: response.authResponse.accessToken,
                })
              } else {
                setAuthorizing(false)
              }
            },
            { scope: 'email,public_profile' },
          )
        }
      })
    } catch (e) {
      if (e instanceof CoreApiError) {
        showSnackbar(tError(e.code, e.context()), 'error')
      } else {
        showSnackbar(e.message, 'error')
      }
      logError('onGoogleAuthorize', {}, e)
      setAuthorizing(false)
    }
  }

  useEffect(() => {
    setIsMeta(isMetaApp())
  }, [])

  if (!process.env.NEXT_PUBLIC_FB_CLIENT_ID) {
    return
  }

  return (
    <Button
      color="primary"
      size="lg"
      endContent={<ChevronRightIcon className="w-4 h-4" />}
      isLoading={authorizing}
      className="icon-transition-x icon-small relative rounded-sm"
      onPress={onFacebookAuthorize}
    >
      {props.label}
      <span className="absolute top-1 left-1">
        <FacebookSvg className="w-[40px] h-[40px]" fill={props.invertedIcon ? '#1877F2' : '#ffffff'} />
      </span>
    </Button>
  )
}
