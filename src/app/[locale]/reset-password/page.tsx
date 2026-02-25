import Footer from '@/app/[locale]/home/footer'
import MainAppBar from '@/app/[locale]/appBar'
import ResetPasswordForm from '@/app/[locale]/reset-password/resetPasswordForm'
import { Card } from '@heroui/react'

export default async function ForgotPassword() {
  return (
    <>
      <MainAppBar />
      <div className="bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 md:p-8">
              <ResetPasswordForm />
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
