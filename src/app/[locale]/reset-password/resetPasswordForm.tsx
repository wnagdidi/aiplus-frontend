'use client'
import { resetPassword } from '@/api/client/signupApi'
import CoreApiError from '@/api/core/coreApiError'
import PasswordWithConfirmFormItems from '@/components/PasswordWithConfirm'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { Button } from '@heroui/react'
import { useTranslations } from '@/hooks/useTranslations'
import { useRouter } from '@/components/next-intl-progress-bar'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import { EventEntry } from '@/context/GTMContext'

export default function ResetPasswordForm() {
  const t = useTranslations('Auth')
  const tError = useTranslations('Error')
  const [error, setError] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState(null)
  const [email, setEmail] = useState(null)
  const [token, setToken] = useState(null)
  const { showSnackbar } = useSnackbar()
  const router = useRouter()
  const { toggleLoginDialog, toggleSignupDialog } = useContext(AuthDialogContext)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (passwordErrors?.password || passwordErrors?.confirmPassword) {
      return
    }
    if (!email || !token) {
      setError('Invalid state')
    }
    const data = new FormData(event.currentTarget)
    const password = data.get('password') as string
    setResetting(true)
    try {
      await resetPassword({ email: email.trim().toLowerCase(), token, newPassword: password })
      showSnackbar(t('reset_password_success'))
      router.push('/')
      toggleSignupDialog(null, EventEntry.ResetPasswordForm)
    } catch (e: any) {
      if (e instanceof CoreApiError) {
        setError(tError(e.code, e.context()))
      } else {
        setError(e.message)
      }
    } finally {
      setResetting(false)
    }
  }

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const params = {}
    for (const [key, value] of urlParams.entries()) {
      params[key] = value
    }
    setEmail(params.email)
    setToken(params.token)
  }, [])

  return (
    <>
      <div className="text-center text-xl font-semibold">{t('reset_password_title')}</div>
      <div className="mt-2 text-left max-w-[360px]">
        {error && (
          <div className="mb-1 bg-danger-50 text-danger-600 px-3 py-2 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <PasswordWithConfirmFormItems passwordLabel={t('new_password')} onErrors={setPasswordErrors} />
          <Button isLoading={resetting} type="submit" size="lg" className="w-full mt-2" color="primary">
            {t('submit')}
          </Button>
        </form>
      </div>
    </>
  )
}
