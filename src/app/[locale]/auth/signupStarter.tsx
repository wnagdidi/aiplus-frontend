'use client'
import {useState} from 'react'
import SignupEmailControl from '@/app/[locale]/auth/signupEmailControl'
import SignupStarterControl from '@/app/[locale]/auth/signupStarterControl'
import {useGTM} from '@/context/GTMContext'

interface SignupStarterProps {
  onGotoLogin: () => void
  onSignup: () => void
  disableBack?: boolean
}
export default function SignupStarter({ onGotoLogin, onSignup, disableBack }: SignupStarterProps) {
  const [isEmailSignup, setIsEmailSignup] = useState(false)
  const { sendEvent } = useGTM()

  const handleGotoEmailSignup = () => {
    sendEvent('begin_email_sign_up')
    setIsEmailSignup(true)
  }

  if (isEmailSignup) {
    return <SignupEmailControl onBack={() => setIsEmailSignup(false)} onSignup={onSignup} disableBack={disableBack} />
  } else {
    return <SignupStarterControl onGotoEmailSignup={handleGotoEmailSignup} onGotoLogin={onGotoLogin} onSignup={onSignup} />
  }
}
