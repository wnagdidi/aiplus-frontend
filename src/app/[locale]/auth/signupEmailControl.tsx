import * as React from 'react'
import SignupEmailForm from '@/app/[locale]/auth/signupEmailForm'
import {useEffect, useState} from 'react'
import SignupEmailVerifyForm from '@/app/[locale]/auth/signupEmailVerifyForm'
import SignupEmailCreateAccountForm from '@/app/[locale]/auth/signupEmailCreateAccountForm'
import {useTranslations} from '@/hooks/useTranslations'
import {checkEmailExistence, sendVerificationCode} from '@/api/client/signupApi'
import CoreApiError from '@/api/core/coreApiError'
import {useGTM} from '@/context/GTMContext'
import {trimLowerCase, validateEmail} from "@/util/string";
import {logError} from "@/api/core/common";

enum SignupStep {
  INPUT_EMAIL,
  VERIFY_EMAIL,
  CREATE_ACCOUNT,
}

interface SignupEmailFormControlProps {
  onBack: () => void
  onSignup: () => void
  disableBack?: boolean
}

export default function SignupEmailControl({ onBack, onSignup, disableBack }: SignupEmailFormControlProps) {
  const tError = useTranslations('Error')
  const [email, setEmail] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [signupStep, setSignupStep] = useState(SignupStep.INPUT_EMAIL)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [sendCodeError, setSendCodeError] = useState<string>()
  const [sendingCode, setSendingCode] = useState(false)
  const { sendEvent } = useGTM()

  const sendCode = async (emailSendTo, callback?: any) => {
    setSendingCode(true)
    setSendCodeError(null)

    if (!validateEmail(emailSendTo)) {
      setSendCodeError(tError('APP_EMAIL_IS_INVALID'))
      setSendingCode(false)
      sendEvent('send_email_sign_up_code_warning', {
        email: emailSendTo,
        error: emailSendTo + ' is not a valid email',
      })
      return
    }

    try {
      const existed = await checkEmailExistence(encodeURIComponent(emailSendTo))
      if (existed) {
        setSendCodeError(tError('APP_EMAIL_IS_EXISTED'))
        sendEvent('send_email_sign_up_code_warning', { email: emailSendTo, error: tError('APP_EMAIL_IS_EXISTED') })
      } else {
        await sendVerificationCode({ email: emailSendTo })
        setResendDisabled(true)
        setResendTimer(60)
        callback && callback()
        sendEvent('send_email_sign_up_code_success', { email: emailSendTo })
      }
    } catch (e) {
      const errorMessage = e instanceof CoreApiError ? tError(e.code, e.context()) : e.message
      setSendCodeError(errorMessage)
      sendEvent('send_email_sign_up_code_failed', { email: emailSendTo, error: errorMessage })
      logError(errorMessage, { emailSendTo }, e)
    } finally {
      setSendingCode(false)
    }
  }

  const onEmailInput = async (email: string) => {
    setEmail(email)
    sendEvent('send_email_sign_up_code', { email: trimLowerCase(email) })
    await sendCode(trimLowerCase(email), () => setSignupStep(SignupStep.VERIFY_EMAIL))
  }

  const onEmailVerify = (token: string) => {
    setToken(token)
    setSignupStep(SignupStep.CREATE_ACCOUNT)
    sendEvent('verify_email_sign_up_code', { email: trimLowerCase(email) })
  }

  const onVerifyBack = () => {
    setSignupStep(SignupStep.INPUT_EMAIL)
  }

  const onCreate = () => {
    onSignup()
  }

  const handleResendCode = () => {
    sendEvent('resend_email_sign_up_code', { email: trimLowerCase(email) })
    sendCode(trimLowerCase(email))
  }

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setResendDisabled(false)
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendTimer])

  return (
    <div className="text-center flex flex-col items-center relative py-6">
      {signupStep === SignupStep.INPUT_EMAIL ? (
        <SignupEmailForm
          onBack={onBack}
          onSendCode={onEmailInput}
          disableBack={disableBack}
          sendCodeError={sendCodeError}
          onChange={() => setSendCodeError(null)}
          sendingCode={sendingCode}
          resendDisabled={resendDisabled}
          resendTimer={resendTimer}
        />
      ) : signupStep === SignupStep.VERIFY_EMAIL ? (
        <SignupEmailVerifyForm
          email={email!}
          onBack={onVerifyBack}
          onVerify={onEmailVerify}
          resendDisabled={resendDisabled}
          resendTimer={resendTimer}
          sendingCode={sendingCode}
          onResendCode={handleResendCode}
          disableBack={disableBack}
        />
      ) : (
        <SignupEmailCreateAccountForm email={email!} token={token!} onCreate={onCreate} />
      )}
    </div>
  )
}
