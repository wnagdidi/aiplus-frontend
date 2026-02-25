import dynamic from 'next/dynamic'

const PaymentRegisterAirwallexDynamic = dynamic(() => import('./paymentRegisterAirwallex'), {
  loading: () => <p>Loading...</p>,
})

export default function Page() {
  return (
    <div>
      <PaymentRegisterAirwallexDynamic />
    </div>
  )
}
