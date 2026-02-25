import BillingApi from '@/api/server/billingApi'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getErrorMessage } from '@/api/core/common'
import { getTranslations } from '@/hooks/getTranslations'
import PaymentResult from '@/app/[locale]/checkout/ss/return/paymentResult'
import '../../../reset-layout.css'

export default async function SSCheckoutReturnPage({ searchParams }) {
  const tError = await getTranslations('Error')
  const session = await getServerSession(authOptions)
  const billingApi = new BillingApi(session?.user?.accessToken)
  const amount = searchParams.amount
  const orderNo = searchParams.orderNo
  const note = searchParams.note

  const success = Number(searchParams.order_status) === 1
  const resultMessage = searchParams.result_info

  let errorMessage
  try {
    await billingApi.getStarSaasSessionStatus(searchParams)
  } catch (e) {
    errorMessage = getErrorMessage(tError, e)
  }

  return (
    <PaymentResult
      success={success}
      errorMessage={errorMessage || resultMessage}
      amount={amount}
      note={note}
      orderNo={orderNo}
    />
  )
}
