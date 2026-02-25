'use client'
import * as React from 'react'
import {useState} from 'react'
import PaymentMethodsDialog from '@/app/[locale]/pricing/paymentMethodsDialog'
import {useTranslations} from '@/hooks/useTranslations'

// temp solution should do rebranding
export default function PaymentMethodsAvoidAI() {
  const t = useTranslations('Billing')
  const [isPaymentMethodsDialog, setIsPaymentMethodsDialog] = useState(false)

  return (
    <>
      <div style={{ alignItems: 'center', marginTop: 8, display: 'flex', gap: 4 }}>
        <span className="text-sm text-gray-600">
          {t('secure_payment') + ':'}
        </span>
        <div className="flex items-center gap-4 gap-y-3 flex-wrap justify-center svg-list">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="52.499996185302734"
              height="30"
              fill="none"
              viewBox="49.000003814697266 6.25 52.499996185302734 17.500133514404297"
              className="payment-method-logo"
            >
              <path
                fill="var(--paymentMethodLogoColor, #1434CB)"
                d="M74.998 6.642l-3.534 16.972h-4.29l3.533-16.972h4.29zm17.794 10.967l2.272-6.398 1.262 6.398h-3.534zm4.796 6.005h3.912L98.093 6.642h-3.66c-.758 0-1.515.522-1.767 1.305l-6.31 15.667h4.417l.883-2.48h5.427l.505 2.48zM86.482 18c0-4.439-5.931-4.7-5.931-6.658.126-.914.883-1.436 1.766-1.436 1.389-.13 2.903.13 4.165.783l.757-3.656a10.455 10.455 0 00-3.912-.783c-4.165 0-7.194 2.35-7.194 5.614 0 2.48 2.146 3.786 3.66 4.57 1.64.783 2.272 1.305 2.146 2.088 0 1.176-1.262 1.698-2.524 1.698-1.515 0-3.03-.392-4.417-1.045l-.758 3.656c1.515.653 3.155.914 4.67.914 4.67.13 7.572-2.22 7.572-5.745zM68.94 6.642l-6.815 16.972h-4.543l-3.408-13.578c0-.653-.505-1.175-1.01-1.436-1.261-.653-2.65-1.175-4.164-1.436l.126-.522h7.194c1.01 0 1.767.783 1.893 1.697l1.767 9.792 4.543-11.49h4.417z"
              ></path>
              <title>Visa</title>
            </svg>
          </span>
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36.20991516113281"
              height="30"
              fill="none"
              viewBox="11.30409049987793 3.751418113708496 36.20991516113281 22.549583435058594"
              className="payment-method-logo"
            >
              <path fill="var(--paymentMethodLogoColor, #FF5F00)" d="M34.474 6.158H24.61v17.727h9.864V6.159z"></path>
              <path
                fill="var(--paymentMethodLogoColor, #EB001B)"
                d="M25.236 15.027a11.254 11.254 0 014.306-8.863 11.273 11.273 0 100 17.728 11.255 11.255 0 01-4.306-8.865z"
              ></path>
              <path
                fill="var(--paymentMethodLogoColor, #F79E1B)"
                d="M47.783 15.026a11.273 11.273 0 01-18.241 8.863 11.274 11.274 0 000-17.728 11.274 11.274 0 0118.24 8.865z"
              ></path>
              <title>Mastercard</title>
            </svg>
          </span>
          {/* <span>
            <img src="/payment-method/moestro.jpg" className="h-[22px]" />
          </span> */}
          <span>
            <img src="/payment-method/dci-dv.jpg" className="h-[36px]" />
          </span>
          <span>
            <img src="/payment-method/ae.jpg" className="h-[30px]" />
          </span>
        </div>
      </div>
      <PaymentMethodsDialog isOpen={isPaymentMethodsDialog} onClose={() => setIsPaymentMethodsDialog(false)}/>
    </>
  )
}
