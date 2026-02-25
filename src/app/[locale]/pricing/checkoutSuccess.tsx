'use client'
import * as React from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import RichSuccessIcon from '@/components/RichSuccessIcon'
import MainButton from '@/components/MainButton'

interface CheckoutSuccessPros {
  onBack: () => void
}
export default function CheckoutSuccess({ onBack }: CheckoutSuccessPros) {
  const t = useTranslations('Billing')

  return (
    <div className="flex flex-col gap-2 items-center">
      <RichSuccessIcon fontSize="72px" />
      <div className="text-lg font-semibold mb-4">{t('checkout_success')}</div>
      <MainButton onClick={() => onBack()} variant="contained" disableElevation>
        {t('back_to_website')}
      </MainButton>
    </div>
  )
}
