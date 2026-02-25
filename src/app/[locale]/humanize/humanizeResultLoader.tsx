'use client'
import {useTranslations} from '@/hooks/useTranslations'
import {helperContainerStyle, helperContentStyle} from '@/app/[locale]/home/styles'
import * as React from 'react'
import { Card, CardBody, Progress, CircularProgress } from '@heroui/react'

// 移除自定义 Box/Typography/Stack，用原生 + Tailwind

export default function HumanizeResultLoader() {
  const t = useTranslations('Humanize')
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex items-center justify-center">
        <Card className="shadow-[0_2px_16px_0_#0000000A] rounded-lg w-fit">
          <CardBody className="p-4">
            <span className="text-[20px]">{t('analyzing_content')}</span>
            <div className="mt-4 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <CircularProgress size="sm" isIndeterminate aria-label="loading" className="w-5 h-5" />
                <span className="text-sm">{t('processing_texts')}</span>
              </div>
              <div className="flex items-center gap-4">
                <CircularProgress size="sm" isIndeterminate aria-label="loading" className="w-5 h-5" />
                <span className="text-sm">{t('identifying_text')}</span>
              </div>
              <div className="flex items-center gap-4">
                <CircularProgress size="sm" isIndeterminate aria-label="loading" className="w-5 h-5" />
                <span className="text-sm">{t('comparing_human_pattern')}</span>
              </div>
            </div>
            <Progress size="sm" isIndeterminate className="mt-8" aria-label="progress" />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
