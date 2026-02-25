'use client'
import { Modal, ModalContent, ModalBody, Button } from '@heroui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { usePricingDialog } from '@/context/PricingDialogContext'
import SuccessIcon from '@/components/SuccessIcon'
import { useTranslations } from '@/hooks/useTranslations'
import { EventEntry } from '@/context/GTMContext'
import MoneyBackGuarantee from '@/app/[locale]/pricing/moneyBackGuarantee'
import { useEffect, useState } from 'react'
import { PlanDuration } from '@/api/core/billing'
import { hoverBackgroundGradient } from '@/theme'

interface ExceedsWordLimitDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExceedsWordLimitDialog({ isOpen, onClose }: ExceedsWordLimitDialogProps) {
  const t = useTranslations('Humanize')
  const tBilling = useTranslations('Billing')
  const { openDialog: openPricingDialog, plans } = usePricingDialog()
  const [yearlyMoneys, setYearlyMoneys] = useState(0)

  const handleUpgrade = () => {
    openPricingDialog(EventEntry.HumanizeHitWordLimitUpgradeButton)
    onClose()
  }

  useEffect(() => {
    if (plans) {
      const yearlyPlans = plans.find(plan => plan.tags[0] === PlanDuration.Yearly)
      if (yearlyPlans) {
        setYearlyMoneys(yearlyPlans.realPriceOneMonth)
      }
    }
  }, [plans])

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl" className="bg-transparent shadow-none [&>button]:text-white [&>button]:!opacity-100">
      <ModalContent className="bg-white rounded-2xl max-h-[90vh] md:max-h-none">
        <ModalBody className="p-6 md:p-8 overflow-y-auto">
          <div className="relative">
            <button className="absolute top-[-15px] right-[-15px] text-gray-400 hover:text-gray-600 z-10" onClick={onClose} aria-label="close">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-bold text-center mb-6">{t('hit_word_limit')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="flex flex-col justify-between p-4">
                <ul className="space-y-4 text-gray-700">
                  <li className='flex items-center gap-3'>
                    <SuccessIcon />
                    <span>{t('paraphrase_unlimited_text')}</span>
                  </li>
                  <li className='flex items-center gap-3'>
                    <SuccessIcon />
                    <span>{t('paraphrase_in_unlimited_modes')}</span>
                  </li>
                  <li className='flex items-center gap-3'>
                    <SuccessIcon />
                    <span>{t('access_premium_grammarrecommendations')}</span>
                  </li>
                  <li className='flex items-center gap-3'>
                    <SuccessIcon />
                    <span>{t('prevent_accidental_plagiarism')}</span>
                  </li>
                  <li className='flex items-center gap-3'>
                    <SuccessIcon />
                    <span>{t('and_so_much_more')}</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <div className="bg-purple-100 text-sm font-semibold rounded-full px-4 py-1 inline-block mb-3">{t('starting_from')}</div>
                  <div className="text-base mb-5" style={{display: yearlyMoneys > 0? 'block' : 'none'}}>${yearlyMoneys} USD {tBilling('per_month_c')}</div>
                  <div className="flex flex-col items-start">
                    <Button 
                      onPress={handleUpgrade}
                      style={{background: hoverBackgroundGradient}}
                      className="w-full max-w-xs text-white font-bold py-3 px-6 rounded-sm hover:opacity-90 transition-opacity duration-300 shadow-lg"
                    >
                      {t('get_premium_today')}
                    </Button>
                    <div className="mt-4">
                      <MoneyBackGuarantee />
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Column */}
              <div className="bg-[#ebf1fe] rounded-xl p-6 flex flex-col justify-between items-center">
                <div className="w-full">
                  <div className="bg-[#e199ef] text-white rounded-full px-5 py-2 inline-block mb-6">{t('paraphrase_unlimited_words')}</div>
                  <ul className="space-y-4 text-gray-700">
                    <li className='flex items-center gap-3'>
                      <SuccessIcon />
                      <span>{t('grammar_improved')}</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <SuccessIcon />
                      <span>{t('spelling_fixed')}</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <SuccessIcon />
                      <span>{t('tone_adjusted')}</span>
                    </li>
                  </ul>
                </div>
                <img className='w-40 h-auto mt-6' src="/newHome/exceeds.png" alt="Mascot" />
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
