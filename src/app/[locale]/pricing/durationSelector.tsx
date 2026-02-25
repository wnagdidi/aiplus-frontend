'use client'
import React, { useEffect, useState } from 'react'
import { PlanDuration } from '@/api/core/billing'
import { useTranslations } from '@/hooks/useTranslations'
import MainButton from '@/components/MainButton'
import { Button, Tooltip } from '@heroui/react'
import { SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import './page.css'
import { isMobile } from '@/util/browser'

interface DurationSelectorProps {
  isOpen: boolean
  duration: PlanDuration
  durations: PlanDuration[]
  onChange: (duration: PlanDuration) => void
}
export default function DurationSelector({isOpen, duration, durations, onChange }: DurationSelectorProps) {
  const t = useTranslations('Billing')
  const [isToolTipOpen,setIsOpen] = useState(true)

  useEffect(()=>{
    setTimeout(()=>{
      setIsOpen(true)
    },0)
  },[])

  useEffect(()=>{
    if(isOpen) {
      setTimeout(()=>{
        setIsOpen(true)
      },0)
    } else {
      setTimeout(()=>{
        setIsOpen(false)
      },0)
    }
  },[isOpen])

  const buttonLabel = (d) =>
    d === PlanDuration.Yearly ? (
      duration === PlanDuration.Yearly ? (
        <>
          {t(d)} <SparklesIcon width={20} height={20} className="inline mx-1" /> {t('save_up_to', { percent: '80%' })}
        </>
      ) : (
        t(d) + ' ' + t('save_up_to', { percent: '80%' })
      )
    ) : d === PlanDuration.Lifetime ? (
       <span className="inline-flex items-center">
        {t(d)}
        <Tooltip isOpen={isToolTipOpen} content={<span className="text-xs">Equals 2 years’ price</span>}>
          <InformationCircleIcon className="w-4 h-4 ml-1 text-white" />
        </Tooltip>
       </span>
    ) : (
      t(d) 
    )

  return (
    <div className="text-center mt-2">
      <div className="duration-selector">
        {durations.filter((item, index) => index !== 2).map((d, index) =>
          d === duration ? (
            <MainButton
              onClick={() => onChange(d)}
              key={d}
              sx={{ height: '36px', borderRadius: '8px', zIndex: 1, minWidth: '220px', marginBottom: '5px' }}
              variant="contained"
              disableElevation
            >
              {buttonLabel(d)}
            </MainButton>
          ) : (
            <Button
              onClick={() => onChange(d)}
              key={d}
              variant="bordered"
              className="h-9 text-sm rounded-lg bg-white min-w-[220px] mb-1.5"
            >
              {buttonLabel(d)}
            </Button>
          ),
        )}
      </div>
    </div>
  )
}
