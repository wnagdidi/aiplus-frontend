"use client"
import { Button, Divider } from '@heroui/react'
import {useTranslations} from '@/hooks/useTranslations'
import * as React from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import SignupAgreement from '@/app/[locale]/auth/signupAgreement'
import GoogleAuthButton from '@/app/[locale]/auth/googleAuthButton'
import {useGTM} from '@/context/GTMContext'
import {signUpButtonStyle} from '@/app/[locale]/auth/richSignupStarter'
import FacebookAuthButton from '@/app/[locale]/auth/facebookAuthButton'
import HiddenInFacebook from "@/components/hiddenInFacebook";

interface SignupStarterControlProps {
  onGotoEmailSignup: () => void
  onGotoLogin: () => void
  onSignup: () => void
}

export default function SignupStarterControl({ onGotoEmailSignup, onGotoLogin, onSignup }: SignupStarterControlProps) {
  const t = useTranslations('Auth')
  const { sendEvent } = useGTM()

  const handleGoogleSignup = () => {
    onSignup()
  }

  return (
    <div className="text-center flex flex-col items-center">
      <h2 className="font-bold text-2xl text-[#375375]">{t('sign_up_title')}</h2>
      <div className="mt-8 flex flex-col gap-3 w-full max-w-[560px]">
        <GoogleAuthButton
          label={t('sign_in_with_google')}
          signInOptions={{ redirect: false }}
          onAuth={handleGoogleSignup}
          onClick={() => sendEvent('begin_google_sign_up')}
        />
        <FacebookAuthButton
          label={t('sign_in_with_fb')}
          signInOptions={{ redirect: false }}
          onAuth={handleGoogleSignup}
          onClick={() => sendEvent('begin_facebook_sign_up')}
        />
        <HiddenInFacebook>
          <div className="flex items-center gap-2 my-1">
            <Divider className="flex-1" />
            <span className="text-default-500 text-sm">{t('or')}</span>
            <Divider className="flex-1" />
          </div>
        </HiddenInFacebook>
        <Button onPress={onGotoEmailSignup} size="lg" endContent={<ChevronRightIcon className="w-4 h-4" />} className="icon-transition-x icon-small bg-[#F1F1F1] text-[#666] font-medium border-0 hover:bg-[#F1F1F1AA] rounded-sm">
          {t('sign_up_with_email')}
        </Button>
      </div>

      <div className="mt-8 flex gap-1 items-center">
        <span className="text-sm">{t('already_have_an_account')}</span>
        <a onClick={() => onGotoLogin()} href="#" className="text-sm text-[rgb(0,107,214)]">{t('sign_in_here')}</a>
      </div>
      <div className="mt-10">
        <SignupAgreement />
      </div>
    </div>
  )
}
