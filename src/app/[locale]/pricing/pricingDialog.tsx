'use client'
import { Modal, ModalBody, ModalContent, Button, Spinner } from '@heroui/react'
import {CloseIcon} from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon'
import {usePricingDialog} from '@/context/PricingDialogContext'
import EmbeddedPlanControl from '@/app/[locale]/pricing/embeddedPlanControl'
import {Plan} from '@/api/core/billing'
import {EventEntry, useGTM} from '@/context/GTMContext'
import { useEffect } from 'react'

export default function PricingDialog() {
  const { isOpen, closeDialog, plans, planToBuy, planToBuyCanBuy, setPlanToBuy } = usePricingDialog()
  const { sendEvent } = useGTM()

  console.log('PricingDialog rendering, planToBuy:', planToBuy, 'planToBuyCanBuy:', planToBuyCanBuy)

  // 监听 planToBuyCanBuy 变化
  useEffect(() => {
    console.log('PricingDialog useEffect planToBuyCanBuy changed:', planToBuyCanBuy)
  }, [planToBuyCanBuy])

  const handleSetPlanToBuy = (plan: Plan, isCanBuy?: boolean) => {
    setPlanToBuy(plan, isCanBuy)
  }

  return (
    <>
      <Modal
        hideCloseButton
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        radius="lg"
        classNames={{
          base: 'rounded-2xl dark',
          wrapper: 'p-0 sm:p-3',
          backdrop: 'backdrop-blur-none bg-black/50',
        }}
      >
        <ModalContent className="w-screen h-[100dvh] sm:w-auto sm:max-w-[1200px] sm:h-auto sm:min-h-0 sm:max-h-[calc(100vh-24px)] bg-[#1a1a24] border border-white/10 rounded-2xl overflow-hidden max-w-full dark shadow-2xl">
          <button onClick={closeDialog} aria-label="close" className="absolute right-4 top-4 z-10 text-white hover:text-white/70">
            <CloseIcon />
          </button>
          <ModalBody className={`${!planToBuy ? 'bg-[#1a1a24]' : 'bg-[#1a1a24]'} py-4 sm:py-6 px-0`}>
            <div className="px-4 sm:px-8 w-full max-w-full overflow-visible">
                {plans ? (
                  <EmbeddedPlanControl
                    plans={plans}
                    planToBuy={planToBuy}
                    planToBuyCanBuy={planToBuyCanBuy}
                    setPlanToBuy={handleSetPlanToBuy}
                    compact
                    onClose={closeDialog}
                    entry={EventEntry.PricingDialog}
                    isOpen={isOpen}
                  />
                ) : (
                  'Loading plans'
                )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
)}
