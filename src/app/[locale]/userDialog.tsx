'use client'
import {
  Modal,
  ModalContent,
  ModalBody,
  Button as HButton,
  Chip as HChip,
  Progress,
  Avatar as HAvatar,
} from '@heroui/react'
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline'
import * as React from 'react'
import {useState} from 'react'
import {useSession} from 'next-auth/react'
import ProfileForm from '@/app/[locale]/account/profileForm'
import {useTranslations} from '@/hooks/useTranslations'
import {useActiveSubscription} from '@/context/ActiveSubscriptionContext'
import CoreApiError from '@/api/core/coreApiError'
import {useSnackbar} from '@/context/SnackbarContext'
import {cancelSubscription} from '@/api/client/billingApi'
import {useRouter} from '@/components/next-intl-progress-bar'
import {EventEntry} from '@/context/GTMContext'
import {tHash} from "@/util/crypto";
import {usePricingDialog} from '@/context/PricingDialogContext'

// Replace custom Box/Typography with native elements + Tailwind

const profileBackground = {
  height: '120px',
  width: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='1440' height='560' preserveAspectRatio='none' viewBox='0 0 1440 560'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1012%26quot%3b)' fill='none'%3e%3crect width='1440' height='560' x='0' y='0' fill='%230e2a47'%3e%3c/rect%3e%3cpath d='M812.15 492.19 a48.45 48.45 0 1 0 96.9 0 a48.45 48.45 0 1 0 -96.9 0z' fill='%23037b0b'%3e%3c/path%3e%3cpath d='M573.98 28.31L589.94 28.31L589.94 44.27L573.98 44.27z' fill='%23d3b714'%3e%3c/path%3e%3cpath d='M1101.39 503.12L1108.63 503.12L1108.63 549.57L1101.39 549.57z' fill='%23e73635'%3e%3c/path%3e%3cpath d='M961.04 236.93L991.96 236.93L991.96 267.85L961.04 267.85z' fill='%23d3b714'%3e%3c/path%3e%3cpath d='M866.85 183.07a35.55 35.55 0 1 0-46.32-53.94z' fill='%23037b0b'%3e%3c/path%3e%3cpath d='M658.93 356.04L682.86 356.04L682.86 384.53L658.93 384.53z' stroke='%23e73635'%3e%3c/path%3e%3cpath d='M179.83 320.74 a24.57 24.57 0 1 0 49.14 0 a24.57 24.57 0 1 0 -49.14 0z' stroke='%23e73635'%3e%3c/path%3e%3cpath d='M568.27 529.88L588.97 529.88L588.97 550.58L568.27 550.58z' stroke='%23037b0b'%3e%3c/path%3e%3cpath d='M463.84 536.07 a55.76 55.76 0 1 0 111.52 0 a55.76 55.76 0 1 0 -111.52 0z' stroke='%23d3b714'%3e%3c/path%3e%3cpath d='M915.51 485.01 a31.34 31.34 0 1 0 62.68 0 a31.34 31.34 0 1 0 -62.68 0z' stroke='%23d3b714'%3e%3c/path%3e%3cpath d='M13.77 22.4a35.23 35.23 0 1 0 66.74-22.58z' stroke='%23d3b714'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1012'%3e%3crect width='1440' height='560' fill='white'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e")`,
}

interface UserDialogProps {
  isOpen: boolean
  onClose: () => void
}
export default function UserDialog({ isOpen, onClose }: UserDialogProps) {
  const tCommon = useTranslations('Common')
  const tBilling = useTranslations('Billing')
  const tError = useTranslations('Error')
  const tPlan = useTranslations('Billing.Plan')
  const { data: session } = useSession()
  const { subscription, isUnlimited, isFree, isPaid, isOneTime, refreshActiveSubscription } = useActiveSubscription()
  const { openDialog: openPricingDialog, plans } = usePricingDialog()
  const [editProfile, setEditProfile] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [isOpenConfirmCancelSubscription, setIsOpenConfirmCancelSubscription] = useState(false)
  const { showSnackbar } = useSnackbar()
  const router = useRouter()

  const handleChoosePlan = () => {
    onClose()
    openPricingDialog(EventEntry.ProfileChoosePlanButton)
  }

  const doCancelSubscription = async () => {
    setCancelling(true)
    try {
      await cancelSubscription()
      await refreshActiveSubscription()
      setIsOpenConfirmCancelSubscription(false)
      showSnackbar(tBilling('cancel_subscription_success'))
      router.refresh()
    } catch (e: any) {
      if (e instanceof CoreApiError) {
        showSnackbar(tError(e.code, e.context()), 'error')
      } else {
        showSnackbar(e.message, 'error')
      }
    } finally {
      setCancelling(false)
    }
  }

  const totalLimit = subscription?.wordsLimitTotal || 0
  const used = subscription?.currentMonthUsage || 0
  const remainingWordsCount = Math.max(0, totalLimit - used)
  const usageRate = totalLimit > 0 ? 100 - Number(((used / totalLimit) * 100).toFixed(0)) : 100

  return (
    <>
      <style jsx>{`
        @media (min-width: 640px) {
          .modal-content-desktop {
            border-radius: 16px !important;
          }
        }
      `}</style>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="lg" 
        classNames={{ 
          base: 'rounded-none sm:!rounded-2xl',
          wrapper: 'p-0 sm:p-4',
          backdrop: 'backdrop-blur-sm'
        }}
        hideCloseButton
        scrollBehavior="inside"
      >
        <ModalContent 
          className="w-full h-full sm:w-auto sm:h-auto sm:min-w-[500px] sm:max-w-[90vw] overflow-hidden modal-content-desktop"
          style={{
            borderRadius: '0px'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 p-2 rounded-full hover:bg-gray-100 transition-colors sm:p-1"
            aria-label="close"
          >
            <XMarkIcon className={`w-6 h-6 sm:w-5 sm:h-5 ${!editProfile ? 'text-white' : 'text-gray-600'}`} />
          </button>
          
          {!editProfile && (
            <ModalBody className="p-0 flex flex-col items-center">
              {/* Background Pattern */}
              <div style={profileBackground} className="w-full h-[120px]" />
              
              {/* Avatar */}
              <HAvatar 
                className="w-20 h-20 sm:w-16 sm:h-16 -mt-10 sm:-mt-8 z-10" 
                src={(session as any)?.user?.avatar || ''} 
                name={(session as any)?.user?.name || ''} 
              />
              
              {/* User Name */}
              <div className="flex justify-center w-full px-4 sm:px-[50px] mt-2">
                <div className="w-full overflow-auto flex justify-center">
                  <h2 className="text-xl sm:text-lg font-medium text-gray-900 text-center">{session?.user?.name}</h2>
                </div>
              </div>
              
              {/* Email with Edit Button */}
              <div className="inline-flex mt-1 relative items-center px-4 sm:px-0">
                <span className="text-[#666] text-sm sm:text-sm">{session?.user?.email}</span>
                <button
                  onClick={() => setEditProfile(true)}
                  className="ml-2 p-2 sm:p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="edit"
                >
                  <PencilIcon className="w-5 h-5 sm:w-4 sm:h-4 text-gray-600" />
                </button>
              </div>

              {/* Content Cards */}
              <div className="p-4 sm:p-4 w-full">
                {/* Subscription Card */}
                <div className="p-3 sm:p-2 w-full rounded-lg bg-[#f7f7f7]">
                  <span className="font-medium ml-1 text-sm sm:text-sm">{tCommon('your_subscription')}</span>
                  {isFree && (
                    <>
                      <div className="ml-1 mt-1 text-sm text-gray-600">{tCommon('have_not_subscribed')}</div>
                      <HButton onPress={handleChoosePlan} variant="light" className="mt-2 text-sm w-full sm:w-auto">
                        {tCommon('choose_your_plan')}
                      </HButton>
                    </>
                  )}
                  {isPaid && (
                    <div className="p-3 sm:p-2 mt-2 w-full rounded-lg text-white flex items-center gap-2 sm:gap-1 bg-[#6841ea]">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium ml-1 text-white text-sm sm:text-sm truncate">
                          {tHash(tPlan, subscription?.plan.name || '')}
                        </div>
                        <div className="ml-1 mt-1 text-white text-xs sm:text-xs">
                          {isUnlimited
                            ? tBilling('unlimited_words')
                            : tBilling('words_per_month', { words: totalLimit })}
                        </div>
                      </div>
                      {(() => { 
                        const tag: string = String(subscription?.plan.tags?.[0] ?? '');
                        const tagLabel: string = tag ? (tBilling as any)(tag) : '';
                        return (
                          <HChip 
                            variant="bordered" 
                            className="text-white border-white text-xs flex-shrink-0"
                          >
                            {tagLabel}
                          </HChip>
                        )
                      })()}
                    </div>
                  )}
                </div>
                
                {/* Words Card */}
                <div className="p-4 sm:p-3 mt-4 w-full rounded-lg bg-[#f7f7f7]">
                  <div className="font-medium text-sm sm:text-sm">{tCommon('your_words')}</div>
                  <div className="mt-1 text-sm text-gray-600">{tCommon('number_of_words_available')}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {!isUnlimited && <Progress value={usageRate} className="w-[120px] sm:w-[100px] flex-shrink-0" />}
                    <span className="text-sm flex-1 min-w-0">
                      {isUnlimited ? tBilling('unlimited') : tCommon('words_remaining', { count: remainingWordsCount })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Cancel Subscription Button */}
              {isPaid && subscription?.plan.tags[0] !== 'lifetime' && (
                <div className="px-4 pb-4 sm:pb-2 w-full">
                  <HButton 
                    onPress={() => setIsOpenConfirmCancelSubscription(true)} 
                    variant="light" 
                    className="text-[#C1C1C1] hover:bg-transparent cursor-default text-sm w-full sm:w-auto"
                  >
                    {tBilling('cancel_subscription')}
                  </HButton>
                </div>
              )}
            </ModalBody>
          )}
          
          {editProfile && (
            <ModalBody className="p-4 py-6 sm:py-8">
              <ProfileForm onSuccess={() => setEditProfile(false)} />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenConfirmCancelSubscription} onClose={() => setIsOpenConfirmCancelSubscription(false)}>
        <ModalContent>
        <ModalBody>
          <div className="text-lg font-semibold mb-2">{tBilling('cancel_subscription')}</div>
          <div className="mb-4">{tBilling('cancel_subscription_desc')}</div>
          <div className="flex gap-2 justify-end">
            <HButton isLoading={cancelling} onPress={doCancelSubscription} variant="bordered">
              {tBilling('cancel_subscription')}
            </HButton>
            <HButton onPress={() => setIsOpenConfirmCancelSubscription(false)} color="primary">
              {tCommon('not_now')}
            </HButton>
          </div>
        </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
