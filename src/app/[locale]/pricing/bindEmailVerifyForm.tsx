import * as React from 'react'
import { useState } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { verifyBindEmailCode } from '@/api/client/signupApi'
import { trimLowerCase } from '@/util/string'
import { useGTM } from '@/context/GTMContext'
import { getErrorMessage, logError } from '@/api/core/common'
import { useSession } from 'next-auth/react'
import { Input, Button } from '@heroui/react'

interface BindEmailVerifyFormProps {
  email: string
  onBack: () => void
  onVerify: () => void
  onResendCode: () => void
  sendingCode: boolean
  resendDisabled: boolean
  resendTimer: number
}
export default function BindEmailVerifyForm({
  email,
  onVerify,
  onResendCode,
  sendingCode,
  resendDisabled,
  resendTimer,
}: BindEmailVerifyFormProps) {
  const { update } = useSession()
  const t = useTranslations('Auth')
  const tError = useTranslations('Error')
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const { sendEvent } = useGTM()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const emailToVerify = trimLowerCase(email)
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const verificationCode = data.get('code') as string

    setVerifying(true)
    try {
      await verifyBindEmailCode({ email: emailToVerify, verificationCode })
      await update({ email: emailToVerify })
      sendEvent('verify_email_bind_code', { email: emailToVerify })
      onVerify()
    } catch (e) {
      const errorMessage = getErrorMessage(tError, e)
      setError(errorMessage)
      sendEvent('verify_email_bind_code_failed', { email: emailToVerify, error: errorMessage })
      logError('Error verify code for binding email: ' + errorMessage, { email }, e)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <>
      <h5 className="text-xl font-semibold">{t('sign_up_email_verify_title')}</h5>
      <p className="text-sm mt-1 max-w-[360px]">{t('sign_up_email_verify_subtitle', { email })}</p>
      <div style={{ marginTop: 16, maxWidth: 360, width: '100%' }}>
        {error && (
          <div className="mb-1 p-2 bg-red-100 text-red-700 rounded text-sm flex items-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            isRequired
            fullWidth
            id="code"
            label={t('enter_code')}
            name="code"
            autoComplete="one-time-code"
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            isLoading={verifying}
            size="lg"
            color="primary"
            className="mt-2"
          >
            {t('verify')}
          </Button>
        </form>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <span className="text-sm">{t('did_not_get_code')}</span>
        <Button onPress={onResendCode} isDisabled={resendDisabled || sendingCode} size="sm" className="shadow-none">
          {sendingCode ? 'resending' : t('resend_code')}
        </Button>
        {resendDisabled && (
          <span className="text-sm text-black/60">{`${resendTimer}s`}</span>
        )}
      </div>
    </>
  )
}
