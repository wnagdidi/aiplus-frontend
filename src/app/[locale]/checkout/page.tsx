'use client'
import Footer from '@/app/[locale]/home/footer'
import MainAppBar from '@/app/[locale]/appBar'
import {raisedCardContentStyle, raisedCardStyle, standalonePageContentStyle} from '@/app/[locale]/styles'
import BackButton from '@/app/[locale]/auth/backButton'
import {useRouter} from '@/components/next-intl-progress-bar'
import {defaultLDScript} from "@/app/[locale]/pageLD";
import { Card } from '@heroui/react'


export default function CheckoutPage() {
  const router = useRouter()

  return (
    <>
      <MainAppBar />
      <div className="bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div style={standalonePageContentStyle as any}>
            <BackButton onBack={() => router.push('/pricing')} />
            <Card className="p-6 md:p-8" />
          </div>
        </div>
        <Footer />
      </div>
      {defaultLDScript}
    </>
  )
}
