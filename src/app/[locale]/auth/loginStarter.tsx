'use client'
import { useTranslations } from '@/hooks/useTranslations'
import * as React from 'react'
import { useState } from 'react'
import { Button, Divider, Input } from '@heroui/react'
import { signIn } from 'next-auth/react'
import GoogleAuthButton from '@/app/[locale]/auth/googleAuthButton'
type SignInOptions = any
import { LoginType, useGTM } from '@/context/GTMContext'
import FacebookAuthButton from '@/app/[locale]/auth/facebookAuthButton'
import HiddenInFacebook from '@/components/hiddenInFacebook'
import { sha256 } from '@/util/crypto'
import { AnalyticsEventType } from '@/utils/events/analytics'

interface LoginStarterProps {
  signInOptions: SignInOptions
  onSuccess: () => void
  onGotoSignup: () => void
  onGotoForgotPassword: () => void
}
export default function LoginStarter({
  signInOptions,
  onSuccess,
  onGotoSignup,
  onGotoForgotPassword,
}: LoginStarterProps) {
  const t = useTranslations('Auth')
  const tError = useTranslations('Error')
  const [logining, setLogining] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const [showPassword, setShowPassWord] = useState(false)
  const { sendEvent, reportEvent } = useGTM()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError(null)
    setLogining(true)
    const data = new FormData(event.currentTarget)
    const result = await signIn('login-username', {
      ...signInOptions,
      username: data.get('email'),
      password: data.get('password'),
    })
    if (result?.ok) {
      reportEvent('LoginSuccess', {
        type: LoginType.Email,
        custom_data: {
          currency: 'USD',
          value: 1,
          login_channel: 3,
          email: data.get('email'),
          trigger_point: localStorage.getItem('loginPosition')
        },
      })
      setLogining(false)
      onSuccess()
    } else {
      reportEvent(AnalyticsEventType.LOGIN_FAILED, {
        type: LoginType.Email,
        custom_data: {
          currency: 'USD',
          value: 1,
          login_channel: 3,
          email: data.get('email'),
          trigger_point: localStorage.getItem('loginPosition')
        },
      })
      setLoginError(result?.error)
      setLogining(false)
      // sendEvent('login_fail', { type: LoginType.Email,
      //   custom_data: {
      //     currency: 'USD',
      //     value: 1,
      //     type: 'email',
      //     email:data.get('email')
      //   }
      // })
    }
  }

  return (
    <div className="text-center flex flex-col items-center">
      <h2 className="text-2xl font-bold text-white">{t('sign_in_title')}</h2>
      <div className="mt-8 flex flex-col gap-3 w-[318px]">
        <GoogleAuthButton
          label={t('sign_in_with_google')}
          signInOptions={signInOptions}
          onAuth={onSuccess}
          onClick={() => sendEvent('begin_google_login')}
        />
        <FacebookAuthButton
          label={t('sign_in_with_fb')}
          signInOptions={signInOptions}
          onAuth={onSuccess}
          onClick={() => sendEvent('begin_facebook_login')}
        />
        <HiddenInFacebook>
          <div className="flex items-center gap-2 my-1">
            <Divider className="flex-1" />
            <span className="text-default-500 text-sm">{t('or')}</span>
            <Divider className="flex-1" />
          </div>
        </HiddenInFacebook>
        <div className="max-w-[360px]">
          {loginError && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-left">{tError(loginError)}</div>
          )}
          <form onSubmit={handleSubmit}>
            <Input
              isRequired
              fullWidth
              id="email"
              label={t('email')}
              name="email"
              autoComplete="email"
              radius="sm"
              className="mb-4"
              classNames={{ inputWrapper: 'rounded-sm' }}
            />
            <Input
              isRequired
              fullWidth
              id="password"
              label={t('password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              radius="sm"
              className="mb-2"
              classNames={{ inputWrapper: 'rounded-sm' }}
            />
            <div className="my-1 text-left">
              <a onClick={() => onGotoForgotPassword()} href="#" className="text-xs text-primary">
                {t('forgot_password')}
              </a>
            </div>
            <Button type="submit" color="primary" size="lg" className="w-full mt-2 rounded-sm" isLoading={logining}>
              {t('sign_in')}
            </Button>
          </form>
        </div>
      </div>
      <div className="mt-4 flex gap-1 items-center">
        <span className="text-sm">{t('did_not_have_an_account')}</span>
        <a href="#" onClick={() => onGotoSignup()} className="text-sm text-[rgb(0,107,214)]">
          {t('sign_up_here')}
        </a>
      </div>
    </div>
  )
}
