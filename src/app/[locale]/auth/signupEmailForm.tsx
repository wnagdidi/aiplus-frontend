import { Button, Input } from '@heroui/react'
import * as React from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import SignupAgreement from '@/app/[locale]/auth/signupAgreement'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import BackButton from '@/app/[locale]/auth/backButton'
import { FormEvent, useState } from 'react'

interface SignupEmailFormProps {
  onBack: () => void
  onSendCode: (email: string) => void
  onChange?: () => void
  sendCodeError?: string
  sendingCode: boolean
  resendDisabled: boolean
  resendTimer: number
  disableBack?: boolean
}
export default function SignupEmailForm({
  onBack,
  sendCodeError,
  sendingCode,
  disableBack,
  resendDisabled,
  resendTimer,
  onSendCode,
  onChange,
}: SignupEmailFormProps) {
  const t = useTranslations('Auth')

  const [errMsg, setErrMsg] = useState("")

  const handleInput = (e:any) => {
    const value = e.target.value
    const patten = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if(!patten.test(value)) {
      setErrMsg("email error")
      return
    }
    setErrMsg("")
    onChange && onChange()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = data.get('email') as string
    onSendCode(email)
  }

  return (
    <>
      {!disableBack && <BackButton onBack={onBack} />}
      <h2 className="mt-6 text-2xl font-semibold">{t('sign_up_email_title')}</h2>
      <p className="mt-1 text-sm">{t('sign_up_email_subtitle')}</p>
      <div className="mt-4 max-w-[360px] w-full">
        {sendCodeError && (
          <div className="mb-1 p-2 bg-red-100 text-red-700 rounded text-sm">
            {sendCodeError}
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
            onInput={handleInput}
            isInvalid={errMsg !== ''}
            errorMessage={errMsg}
            classNames={{
              inputWrapper: "rounded-sm",  // 自定义圆角大小
            }}
          />
          <Button
            type="submit"
            fullWidth
            className="icon-transition-x icon-small mt-4 rounded-sm"
            endContent={sendingCode ? null : <ChevronRightIcon className="w-4 h-4" />}
            isLoading={sendingCode}
            size="lg"
            color="primary"
            isDisabled={resendDisabled}
          >
            {resendDisabled ? `${resendTimer}s` : t('continue')}
          </Button>
        </form>
      </div>
      <div className="mt-6">
        <SignupAgreement />
      </div>
    </>
  )
}
