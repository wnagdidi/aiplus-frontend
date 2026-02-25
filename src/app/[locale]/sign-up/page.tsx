'use client'
import Footer from '@/app/[locale]/home/footer'
import MainAppBar from '@/app/[locale]/appBar'
import {raisedCardContentStyle, raisedCardStyle, standalonePageContentStyle} from '@/app/[locale]/styles'
import {useRouter} from '@/components/next-intl-progress-bar'
import SignupStarter from "@/app/[locale]/auth/signupStarter";
import * as React from "react";
import {defaultLDScript} from "@/app/[locale]/pageLD";
import {EventEntry, useGTM} from '@/context/GTMContext'
import { Card } from '@heroui/react'

export default function SignupPage() {
  const router = useRouter()
  const { sendEvent } = useGTM()

  const handleGotoLogin = () => {
    sendEvent('show_login', { entry: EventEntry.SignupPage })
    router.push('/login')
  }

  return (
    <>
      <MainAppBar />
      <div className="bg-background text-foreground">
        <div className="max-w-7xl mx-auto pt-37 px-4 py-12">
          <div style={standalonePageContentStyle as any}>
            <Card className="p-6 md:p-8">
              <SignupStarter onGotoLogin={handleGotoLogin} onSignup={() => router.push('/')} />
            </Card>
          </div>
        </div>
        <Footer />
      </div>
      {defaultLDScript}
    </>
  )
}
