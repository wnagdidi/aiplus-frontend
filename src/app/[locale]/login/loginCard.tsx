'use client'
import { Card } from '@heroui/react'
import {raisedCardContentStyle, raisedCardStyle} from '@/app/[locale]/styles'
import LoginStarter from '@/app/[locale]/auth/loginStarter'
import {useRouter} from '@/components/next-intl-progress-bar'
import {EventEntry, useGTM} from '@/context/GTMContext'

export default function LoginCard() {
  const router = useRouter()
  const { sendEvent } = useGTM()

  const handleGotoSignup = () => {
    sendEvent('show_sign_up', { entry: EventEntry.LoginPage })
    router.push('/sign-up')
  }

  return (
    <Card className="p-6 md:p-8">
      <LoginStarter
        signInOptions={{ redirect: false }}
        onSuccess={() => router.push('/')}
        onGotoForgotPassword={() => router.push('/forgot-password')}
        onGotoSignup={handleGotoSignup}
      />
    </Card>
  )
}
