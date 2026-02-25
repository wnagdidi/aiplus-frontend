'use client'
import * as React from 'react'
import PaymentMethodsAvoidAI from '@/app/[locale]/pricing/paymentMethodsAvoidAI'
import PaymentMethodsDefault from '@/app/[locale]/pricing/paymentMethodsDefault'
import { Brand } from '@/types/brand'

export default function PaymentMethodsControl() {
  if (process.env.NEXT_PUBLIC_BRAND_NAME === Brand.AvoidAI) {
    return <PaymentMethodsAvoidAI />
  } else {
    return <PaymentMethodsDefault />
  }
}
