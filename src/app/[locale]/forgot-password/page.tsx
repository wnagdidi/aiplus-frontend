'use client'
import Footer from '@/app/[locale]/home/footer'
import MainAppBar from '@/app/[locale]/appBar'
import {useRouter} from '@/components/next-intl-progress-bar'
import ForgotPasswordStarter from '@/app/[locale]/auth/forgotPasswordStarter'
import {defaultLDScript} from "@/app/[locale]/pageLD";
import { Card } from '@heroui/react'

export default function LoginPage() {
  const router = useRouter()

  return (
    <>
      <MainAppBar />
      <div className="bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 md:p-8">
              <ForgotPasswordStarter onGotoLogin={() => router.push('/login')} />
            </Card>
          </div>
        </div>
        <Footer />
      </div>
      {defaultLDScript}
    </>
  )
}
