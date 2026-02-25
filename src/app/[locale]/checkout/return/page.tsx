import Footer from '@/app/[locale]/home/footer'
import MainAppBar from '@/app/[locale]/appBar'
import {raisedCardContentStyle, raisedCardStyle, standalonePageContentStyle} from '@/app/[locale]/styles'
import { Card } from '@heroui/react'
import BillingApi from '@/api/server/billingApi'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/app/api/auth/[...nextauth]/route'
import {redirect} from 'next/navigation'

// @Deprecated
export default async function CheckoutReturnPage({ searchParams }) {
  const session = await getServerSession(authOptions)
  const billingApi = new BillingApi(session?.user?.accessToken)
  const result = await billingApi.getStripeSessionStatus(searchParams.session_id)

  if (result === 'open') {
    redirect(`/checkout?plan_id=${searchParam.plan_id}`)
    return null
  }

  if (result === 'complete') {
    return (
      <>
        <MainAppBar />
        <div className="bg-background text-foreground">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div style={standalonePageContentStyle as any}>
              <Card className="p-6 md:p-8">
                <section id="success">
                  <p>
                    We appreciate your business! A confirmation email will be sent to {session?.user?.email}.
                    If you have any questions, please email <a href="mailto:orders@example.com">orders@example.com</a>.
                  </p>
                </section>
              </Card>
            </div>
          </div>
          <Footer />
        </div>
      </>
    )
  }
  return <div>unknown status: {result}</div>
}
