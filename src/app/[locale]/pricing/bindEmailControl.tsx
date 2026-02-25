import { useEffect, useState } from 'react'
import { checkEmailExistence, sendBindEmailVerificationCode } from '@/api/client/signupApi'
import { useGTM } from '@/context/GTMContext'
import { getErrorMessage, logError } from '@/api/core/common'
import { useTranslations } from '@/hooks/useTranslations'
import { trimLowerCase, validateEmail } from '@/util/string'
import BindEmailForm from '@/app/[locale]/pricing/bindEmailForm'
import BindEmailVerifyForm from '@/app/[locale]/pricing/bindEmailVerifyForm'
import { useSnackbar } from '@/context/SnackbarContext'

enum BindStep {
  INPUT_EMAIL,
  VERIFY_EMAIL,
}

interface BindEmailFormControlProps {
  onSuccess: () => void
}

export default function BindEmailControl({ onSuccess }: BindEmailFormControlProps) {
  const tError = useTranslations('Error')
  const [email, setEmail] = useState<string | null>(null)
  const [signupStep, setSignupStep] = useState(BindStep.INPUT_EMAIL)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [sendCodeError, setSendCodeError] = useState<string>()
  const [sendingCode, setSendingCode] = useState(false)
  const { sendEvent } = useGTM()
  const { showSnackbar } = useSnackbar()

  const sendCode = async (emailSendTo: string, callback?: any) => {
    setSendingCode(true)
    setSendCodeError(null)

    if (!validateEmail(emailSendTo)) {
      setSendCodeError(tError('APP_EMAIL_IS_INVALID'))
      setSendingCode(false)
      sendEvent('send_email_bind_code_warning', {
        email: emailSendTo,
        error: emailSendTo + ' is not a valid email',
      })
      return
    }

    try {
      const existed = await checkEmailExistence(encodeURIComponent(emailSendTo))
      if (existed) {
        setSendCodeError(tError('APP_EMAIL_IS_EXISTED'))
        sendEvent('send_email_bind_code_warning', { email: emailSendTo, error: tError('APP_EMAIL_IS_EXISTED') })
      } else {
        sendEvent('send_email_bind_code', { email: emailSendTo })
        await sendBindEmailVerificationCode({ email: emailSendTo })
        setResendDisabled(true)
        setResendTimer(60)
        callback && callback()
        sendEvent('send_email_bind_code_success', { email: emailSendTo })
      }
    } catch (e) {
      const errorMessage = getErrorMessage(tError, e)
      setSendCodeError(errorMessage)
      sendEvent('send_email_bind_code_failed', { email: emailSendTo, error: errorMessage })
      logError('Error send code for binding email: ' + errorMessage, { emailSendTo }, e)
    } finally {
      setSendingCode(false)
    }
  }

  const onEmailInput = async (email: string) => {
    setEmail(email)
    await sendCode(trimLowerCase(email), () => setSignupStep(BindStep.VERIFY_EMAIL))
  }

  const handleEmailVerified = () => {
    showSnackbar('Verification completed', 'success')
    onSuccess()
  }

  const onVerifyBack = () => {
    setSignupStep(BindStep.INPUT_EMAIL)
  }

  const handleResendCode = () => {
    sendEvent('resend_email_bind_code', { email: trimLowerCase(email) })
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
    <div
      style={{
        textAlign: 'center',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        alignItems: 'center',
        position: 'relative',
        paddingTop: '24px',
        paddingBottom: '24px',
      }}
    >
      {signupStep === BindStep.INPUT_EMAIL && (
        <BindEmailForm
          onSendCode={onEmailInput}
          sendCodeError={sendCodeError}
          onChange={() => setSendCodeError(null)}
          sendingCode={sendingCode}
          resendDisabled={resendDisabled}
          resendTimer={resendTimer}
        />
      )}
      {signupStep === BindStep.VERIFY_EMAIL && (
        <BindEmailVerifyForm
          email={email!}
          onBack={onVerifyBack}
          onVerify={handleEmailVerified}
          resendDisabled={resendDisabled}
          resendTimer={resendTimer}
          sendingCode={sendingCode}
          onResendCode={handleResendCode}
        />
      )}
    </div>
  )
}
