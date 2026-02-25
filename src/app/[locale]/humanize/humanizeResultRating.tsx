'use client'
import { useEffect, useState } from 'react'
import { Rating } from '@heroui/react'
import { setChatRating } from '@/api/client/humanizeApi'
import {useGTM} from "@/context/GTMContext";
import { useTranslations } from '@/hooks/useTranslations'

export default function HumanizeResultRating() {
  const [rating, setRating] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const { sendEvent , reportEvent } = useGTM()
  const t = useTranslations('Common')


  // 评分
  const handleRating = async (event: React.SyntheticEvent, value: number | null) => {
    const rate = value ? value : 0
    const token = localStorage.getItem('TOKEN') || ''
    setDisabled(true)
    setRating(rate)
    reportEvent('ClickRate', {})
    await setChatRating({ token: token, rate: rate })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-[50px]">{t('rate')}：</span>
      <Rating isDisabled={disabled} value={rating} onChange={handleRating as any} size="sm" />
    </div>
  )
}
