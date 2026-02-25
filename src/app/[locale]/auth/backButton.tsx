import * as React from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import { Button } from '@heroui/react'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

interface BackButtonProps {
  onBack: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function BackButton({ onBack, size = 'md', className }: BackButtonProps) {
  const t = useTranslations('Auth')

  return (
    <div className={`absolute left-0 -top-3 ${className || ''}`}>
      <Button 
        className="icon-transition-x" 
        onClick={onBack} 
        size={size} 
        startContent={<ChevronLeftIcon className="w-4 h-4" />}
        variant="light"
      >
        {t('back')}
      </Button>
    </div>
  )
}
