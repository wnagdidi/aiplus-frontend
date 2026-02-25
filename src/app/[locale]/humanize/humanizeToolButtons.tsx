'use client'
import * as React from 'react'
import {CSSProperties} from 'react'
import TrySampleIcon from '@/components/TrySampleIcon'
import PasteIcon from '@/components/PasteIcon'
import { Button } from '@heroui/react'
import {useTranslations} from '@/hooks/useTranslations'

// 移除自定义 Box，使用原生 + Tailwind

const toolButtonsStyle: CSSProperties = {
  position: 'absolute',
  inset: '0',
}

interface HumanizeToolButtonsProps {
  onTrySample: () => void
  onPasteText: () => void
}

export default function HumanizeToolButtons({ onTrySample, onPasteText }: HumanizeToolButtonsProps) {
  const t = useTranslations('Humanize')

  const baseBtnClass = 'pointer-events-auto w-[160px] h-[86px] text-[#375375] font-normal flex flex-col items-center justify-center shadow-none rounded-md group'

  return (
    <div style={toolButtonsStyle} className="flex flex-col md:flex-row items-center justify-center gap-4">
      <Button
        onPress={onPasteText}
        className={`${baseBtnClass} bg-[#F4F4F4] hover:bg-gradient-to-r hover:from-[#00d3fe] hover:to-[#006ffd] hover:text-white`}
        style={{ transition: 'background 0.2s ease, color 0.2s ease' }}
      >
        <PasteIcon className="text-[#375375] group-hover:text-white" />
        {t('paste_text')}
      </Button>
      <Button
        id="trySample"
        onPress={onTrySample}
        className={`${baseBtnClass} bg-[#F4F4F4] hover:bg-gradient-to-r hover:from-[#00d3fe] hover:to-[#006ffd] hover:text-white`}
        style={{ transition: 'background 0.2s ease, color 0.2s ease' }}
      >
        <TrySampleIcon className="text-[#375375] group-hover:text-white" />
        {t('try_a_sample')}
      </Button>
    </div>
  )
}
