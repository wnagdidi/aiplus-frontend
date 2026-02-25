'use client'
import { useTranslations } from '@/hooks/useTranslations'
import * as React from 'react'
import { useState } from 'react'
import { Button, Input } from '@heroui/react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import {forgotPassword} from '@/api/client/signupApi'
import CoreApiError from '@/api/core/coreApiError'
import {ResultCode} from "@/api/core/common";
import {useSnackbar} from "@/context/SnackbarContext";

interface ForgotPasswordStarterProps {
  onGotoLogin: () => void
}
export default function ForgotPasswordStarter({ onGotoLogin }: ForgotPasswordStarterProps) {
  const t = useTranslations('Auth')
  const tError = useTranslations('Error')
  const [error, setError] = useState<string>(null)
  const [sending, setSending] = useState(false)
  const { showSnackbar } = useSnackbar()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSending(true)
    setError(null)
    const data = new FormData(event.currentTarget)
    const email = data.get('email') as string

    try {
      await forgotPassword({ email: email.trim().toLowerCase() })
      showSnackbar(t('email_sent'))
    } catch (e) {
      if (e instanceof CoreApiError) {
        if (e.code === ResultCode.USER_NOT_EXISTS) {
          setError(tError('EMAIL_IS_NOT_EXISTED'))
        } else {
          setError(tError(e.code, e.context()))
        }
      } else {
        setError(e.message)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold">{t('forgot_password_title')}</h2>
      <p className="mt-1 max-w-[360px] text-left mx-auto text-sm text-foreground-500">
        {t('forgot_password_subtitle')}
      </p>
      <div className="mt-4 max-w-[360px] mx-auto">
        {error && (
          <div className="mb-2 p-2 rounded bg-red-100 text-red-700 text-sm text-left">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            isRequired
            fullWidth
            id="email"
            label={t('email')}
            name="email"
            autoComplete="email"
            autoFocus
            className="mb-2"
          />
          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={sending}
          >
            {t('submit')}
          </Button>
        </form>
      </div>
      <div className="mt-2 mb-1">
        <Button
          className="icon-transition-x"
          onPress={() => onGotoLogin()}
          size="lg"
          variant="light"
          startContent={<ArrowLeftIcon className="w-5 h-5" />}
        >
          {t('back_to_sign_in')}
        </Button>
      </div>
    </div>
  )
}
