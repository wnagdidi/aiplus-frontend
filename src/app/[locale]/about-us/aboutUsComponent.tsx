'use client'
import Footer from '@/app/[locale]/home/footer'
import NewFooter from '@/app/[locale]/home/newFooter'
import { useTranslations } from '@/hooks/useTranslations'
import { Button as HButton, Chip as HChip } from '@heroui/react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import * as React from 'react'
import {useRouter} from '@/components/next-intl-progress-bar'

export default function AboutUsComponent() {

  const t = useTranslations('AboutUs')
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen text-[#375375]">
      <div className="pt-24 flex-1 pb-4 max-w-6xl mx-auto px-4">
        <h1 className="mt-7 sm:mt-8 font-bold text-4xl sm:text-[36px] leading-[2.25rem] sm:leading-[62px] text-center">
          {t('about_us')}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 sm:mt-20">
          <div className="flex flex-col gap-2 items-start">
            {/* <HChip
              variant="bordered"
              color="primary"
            >
              {t('what_we_do')}
            </HChip> */}
            <h2 className="text-xl font-semibold">
              {t('our_vision_title')}
            </h2>
            <p className="text-base">
              {t('our_vision_content')}
            </p>
            <h2 className="text-xl font-semibold">
              {t('our_mission_title')}
            </h2>
            <p className="text-base">
              {t('our_mission_content')}
            </p>
            {/* <HChip
              variant="bordered"
              color="primary"
              className="mt-6"
            >
              {t('launch_with_ease')}
            </HChip> */}
            {/* <h2 className="text-xl font-semibold">
              {t('launch_with_ease_title')}
            </h2>
            <p className="text-base">
              {t('launch_with_ease_desc')}
            </p> */}
            <HButton
              color="primary"
              size="lg"
              endContent={<ChevronRightIcon className="w-5 h-5" />}
              className="text-xl rounded-full mt-4 icon-transition-x icon-small"
              onPress={() => router.push('/')}>
              {t('get_started')}
            </HButton>
          </div>
          <div className="md:col-span-1">
            <img
              src="/landpress-about-modern.jpg"
              className="w-full"
              alt="About us"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-6 mb-6">
          <div className="p-2">
            <h2 className="text-xl font-semibold">
              {t('our_core_values_title')}
            </h2>
            <p className="text-base mt-2">
              {t('our_core_values_desc_1')}
            </p>
            <p className="text-base mt-2">
              {t('our_core_values_desc_2')}
            </p>
            <p className="text-base mt-2">
              {t('our_core_values_desc_3')}
            </p>
            <p className="text-base mt-2">
              {t('our_core_values_desc_4')}
            </p>
            <p className="text-base mt-2">
              {t('our_core_values_desc_5')}
            </p>
            <p className="text-base mt-2">
              {t('our_core_values_desc_6')}
            </p>
            <p className="text-base mt-2">
              {t('our_core_values_desc_7')}
            </p>
            <p className="text-base mt-2">
              {t('our_core_values_desc_8')}
            </p>
          </div>
          <div className="p-2">
            <h2 className="text-xl font-semibold">
              {t('our_commitment_to_you')}
            </h2>
            <p className="text-base mt-2">
              {t('our_commitment_to_you_desc_1')}
            </p>
            <p className="text-base mt-2">
              {t('our_commitment_to_you_desc_2')}
            </p>
            <p className="text-base mt-2">
              {t('our_commitment_to_you_desc_3')}
            </p>
            <p className="text-base mt-2">
              {t('our_commitment_to_you_desc_4')}
            </p>
          </div>
          <div className="p-2">
            <p className="font-medium text-base mt-2">
              {t('last_info')}
            </p>
          </div>
          <div className="p-2">
            <h2 className="text-xl font-semibold">
              {t('sincerely_title')}
            </h2>
          </div>
        </div>
      </div>
      <NewFooter />
    </div>
  )
}
