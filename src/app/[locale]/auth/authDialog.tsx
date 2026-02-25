'use client'
import {useContext} from 'react'
import {AuthDialogContext, DialogType} from '@/context/AuthDialogContext'
import RichSignupDialog from '@/app/[locale]/auth/richSignupDialog'
import SignupDialog from '@/app/[locale]/auth/signupDialog'
import LoginDialog from '@/app/[locale]/auth/loginDialog'
import ForgotPasswordDialog from '@/app/[locale]/auth/forgotPasswordDialog'

export default function AuthDialog() {
  const { type } = useContext(AuthDialogContext)
  switch (type) {
    case DialogType.RICH_SIGNUP:
      return <RichSignupDialog />
    case DialogType.SIGNUP:
      return <SignupDialog />
    case DialogType.LOGIN:
      return <LoginDialog />
    case DialogType.FORGOT_PASSWORD:
      return <ForgotPasswordDialog />
  }
}
