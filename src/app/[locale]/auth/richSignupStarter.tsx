"use client"
import { Button } from '@heroui/react'
import {useTranslations} from '@/hooks/useTranslations'
import CheckIcon from '@/components/CheckIcon'
import Link from 'next/link'
import * as React from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import SignupAgreement from '@/app/[locale]/auth/signupAgreement'
import GoogleAuthButton from '@/app/[locale]/auth/googleAuthButton'
import {primaryColor} from '@/theme'
import { isMobile } from '@/util/browser'
import {useGTM} from '@/context/GTMContext'
import FacebookAuthButton from '@/app/[locale]/auth/facebookAuthButton'

export const signUpButtonStyle = {
  background: '#F1F1F1',
  borderRadius: 8,
  color: '#666666',
  fontWeight: 500,
  border: 'none',
  '&:hover': {
    background: '#F1F1F1AA',
    color: primaryColor,
    border: 'none',
  },
}

interface RichSignupStarterProps {
  onGotoEmailSignup: () => void
  onGotoLogin: () => void
  onSignup: () => void
}

export default function RichSignupStarter({ onGotoEmailSignup, onSignup, onGotoLogin }: RichSignupStarterProps) {
  const t = useTranslations('Auth')
  const fullScreen = isMobile()
  const { sendEvent } = useGTM()

  const signUpGetGroups = [
    [t('sign_up_get_words', { words: process.env.NEXT_PUBLIC_SITE_FREE_PLAN_WORDS_COUNT }), t('sign_up_get_ai_writing')],
    [t('sign_up_get_bypass'), t('sign_up_get_humanization')],
    [t('sign_up_get_plagiarism_free'), t('sign_up_get_watermark_removal')],
    [t('sign_up_get_penalties_avoid'), t('sign_up_get_i18n_support')],
  ]

  return (
    <div className={`text-center flex-1 flex flex-col items-center relative mb-2 ${fullScreen ? 'pt-7 pb-4' : 'py-5'}`}>
      <h2 className="mt-4 font-bold text-2xl">{t('sign_up_title_get_words', { words: process.env.NEXT_PUBLIC_SITE_FREE_PLAN_WORDS_COUNT })}</h2>
      <p className="mt-1 text-xs text-[#666666]">{t('no_cc_required')}</p>
      <div className="mt-4 flex flex-col items-center gap-2 mx-2">
        {signUpGetGroups.map((texts) => (
          <div key={texts + ''} className={`${fullScreen ? 'inline-flex w-min flex-wrap gap-1' : 'flex justify-between items-center'}`}>
            {texts.map((text) => (
              <div key={text} className="flex w-[200px]">
                <CheckIcon />
                <span className="ml-1 text-xs text-[#46A654]">{text}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 w-[318px]">
        <GoogleAuthButton
          label={t('sign_up_with_google')}
          signInOptions={{ redirect: false }}
          roundedIcon
          onAuth={onSignup}
          onClick={() => sendEvent('begin_google_sign_up')}
        />
        <FacebookAuthButton
          label={t('sign_in_with_fb')}
          signInOptions={{ redirect: false }}
          onAuth={onSignup}
          onClick={() => sendEvent('begin_facebook_sign_up')}
          showArrow
          invertedIcon
        />
        <Button onPress={onGotoEmailSignup} size="lg" endContent={<ChevronRightIcon className="w-4 h-4" />} className="icon-transition-x icon-small bg-[#F1F1F1] text-[#666666] font-medium border-0 hover:bg-[#F1F1F1AA] hover:text-[#6841ea] rounded-sm">
          {t('sign_up_with_email')}
        </Button>
      </div>

      <div className="mt-6 flex gap-1 items-center">
        <span className="text-sm">{t('already_have_an_account')}</span>
        <a onClick={onGotoLogin} href="#" className="text-sm">{t('sign_in_here')}</a>
      </div>
      <div className="mt-1">
        <SignupAgreement />
      </div>
    </div>
  )
}
