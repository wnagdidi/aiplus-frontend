'use client'
import {useState} from 'react'
import LoginStarter from '@/app/[locale]/auth/loginStarter'
import SignupStarter from '@/app/[locale]/auth/signupStarter'
import ForgotPasswordStarter from '@/app/[locale]/auth/forgotPasswordStarter'

enum AuthType {
  LOGIN,
  SIGNUP,
  FORGOT_PASSWORD,
}

interface UnifiedAuthStarterProps {
  signup?: boolean
  onSuccess: () => void
  disableBack?: boolean
}
export default function UnifiedAuthStarter({ signup, onSuccess, disableBack }: UnifiedAuthStarterProps) {
  const [authType, setAuthType] = useState((signup && AuthType.SIGNUP) || AuthType.LOGIN)

  if (authType === AuthType.LOGIN) {
    return (
      <LoginStarter
        signInOptions={{ redirect: false }}
        onSuccess={onSuccess}
        onGotoSignup={() => setAuthType(AuthType.SIGNUP)}
        onGotoForgotPassword={() => setAuthType(AuthType.FORGOT_PASSWORD)}
      />
    )
  }

  if (authType === AuthType.SIGNUP) {
    return <SignupStarter onGotoLogin={() => setAuthType(AuthType.LOGIN)} onSignup={onSuccess} disableBack={disableBack} />
  }

  if (authType === AuthType.FORGOT_PASSWORD) {
    return <ForgotPasswordStarter onGotoLogin={() => setAuthType(AuthType.LOGIN)} />
  }
}
