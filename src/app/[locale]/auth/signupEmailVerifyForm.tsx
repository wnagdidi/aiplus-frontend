import { Button, Input } from '@heroui/react'
import * as React from 'react'
import {useState} from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import SignupAgreement from '@/app/[locale]/auth/signupAgreement'
import BackButton from '@/app/[locale]/auth/backButton'
import {verifyCode} from '@/api/client/signupApi'
import CoreApiError from '@/api/core/coreApiError'
import {trimLowerCase} from "@/util/string";
import {useGTM} from "@/context/GTMContext";

interface SignupEmailVerifyFormProps {
  email: string
  onBack: () => void
  onVerify: (token: string) => void
  disableBack?: boolean
  onResendCode: () => void
  sendingCode: boolean
  resendDisabled: boolean
  resendTimer: number
}
export default function SignupEmailVerifyForm({
  email,
  onBack,
  onVerify,
  onResendCode,
  sendingCode,
  resendDisabled,
  resendTimer,
  disableBack,
}: SignupEmailVerifyFormProps) {
  const t = useTranslations('Auth')
  const tError = useTranslations('Error')
  const [error, setError] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)
  const { sendEvent } = useGTM()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const verificationCode = data.get('code') as string

    setVerifying(true)
    try {
      const token = await verifyCode({ email: trimLowerCase(email), verificationCode })
      if (token?.code === 'VERIFICATION_CODE_ERROR') {
        const errorMessage = token.message
        setError(errorMessage)
      }else {
        onVerify(token?.data)
      }
    } catch (e: any) {
      const errorMessage = e.message
      setError(errorMessage)
      sendEvent('verify_email_sign_up_code_failed', { email: trimLowerCase(email), error: errorMessage })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <>
      {!disableBack && <BackButton onBack={onBack} />}
      <h2 className="mt-6 text-2xl font-semibold">{t('sign_up_email_verify_title')}</h2>
      <p className="mt-1 max-w-[360px]">{t('sign_up_email_verify_subtitle', { email })}</p>
      <div className="mt-4 max-w-[360px] w-full">
        {error && (
          <div className="mb-1 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>
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
          <Button type="submit" fullWidth color="primary" size="lg" className="mt-2" isLoading={verifying}>
            {t('verify')}
          </Button>
        </form>
      </div>
      <div className="mt-2 flex gap-1 items-center">
        <span className="text-sm">{t('did_not_get_code')}</span>
        <Button onPress={onResendCode} isDisabled={resendDisabled || sendingCode} size="sm" variant="light">
          {sendingCode ? 'resending' : t('resend_code')}
        </Button>
        {resendDisabled && (
          <span className="text-sm text-black/40">{`${resendTimer}s`}</span>
        )}
      </div>
      <div className="mt-5">
        <SignupAgreement />
      </div>
    </>
  )
}
