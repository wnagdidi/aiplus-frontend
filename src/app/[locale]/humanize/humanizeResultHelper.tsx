'use client'
import {useTranslations} from '@/hooks/useTranslations'
import {helperContainerStyle} from '@/app/[locale]/home/styles'

export default function HumanizeResultHelper() {
  const t = useTranslations('Humanize')
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col gap-2 items-center mb-10">
        <img width="108" src="/rewrite-helper-new.png" alt="rewrite" />
        <span className="px-3 text-center text-[rgba(55,83,117,0.5)] max-w-[400px]">
          {t('humanize_helper_text')}
        </span>
      </div>
    </div>
  )
}
