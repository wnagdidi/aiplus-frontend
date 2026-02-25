'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { Switch, Tooltip } from '@heroui/react'
import { Box } from '@mui/material'
import { isMobile } from "@/util/browser"
import { useLocale } from 'next-intl'

interface HumanizeToolQualityPassingProps 
{
  onQuality: (quality: number) => void
  onPassing: (passing: number) => void
}

export default function HumanizeToolQualityPassing({ onQuality, onPassing }: HumanizeToolQualityPassingProps) {

  const t = useTranslations('Humanize')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorE2, setAnchorE2] = useState<null | HTMLElement>(null);

  const [passing, setPassing] = useState(false);
  const [quality, setQuality] = useState(false);

  const locale = useLocale()

  const handlePassingOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    if(!isMobile()){
      setAnchorEl(event.currentTarget);
    }
  };

  const handlePassingClose = () => {
    setAnchorEl(null);
  };

  const handleQualityOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    if(!isMobile()){
      setAnchorE2(event.currentTarget);
    }
  };

  const handleQualityClose = () => {
    setAnchorE2(null);
  };

  const handlePassingSwitch = (event: React.ChangeEvent<HTMLInputElement>)=>{
    setPassing(event.target.checked)
    onPassing(event.target.checked ? 1 : 0);
  }

  const handleQualitySwitch = (event: React.ChangeEvent<HTMLInputElement>)=>{
    setQuality(event.target.checked)
    onQuality(event.target.checked ? 1 : 0);
  }

  const open1 = Boolean(anchorEl);
  const open2 = Boolean(anchorE2);

  // Replaced with HeroUI Switch (styled by theme)

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, alignItems: {sm: 'flex-end', xs: ''}, justifyContent: {sm: 'flex-end', xs: ''}, width: '100%'}}>
      <div className="flex items-center gap-2" onMouseEnter={handlePassingOpen} onMouseLeave={handlePassingClose}>
        <div className="text-xs" style={{width: locale === 'es' ? 132 : 72}}>{t('passing_rate')}</div>
        <Switch isSelected={passing} onValueChange={(v)=>handlePassingSwitch({target:{checked:v}} as any)} size="sm" />
        <div className="text-xs text-right" style={{width:40,color: passing ? '#914BEC' : undefined}}>{passing ? t('height') : t('normal')}</div>
        {open1 && <div className="text-xs p-2 w-[300px] bg-default-100 rounded-md">{t('hight_passing_tip')}</div>}
      </div>
      
      <div className="flex items-center gap-2" onMouseEnter={handleQualityOpen} onMouseLeave={handleQualityClose}>
        <div className="text-xs" style={{width:72}}>{t('quality')}</div>
        <Switch isSelected={quality} onValueChange={(v)=>handleQualitySwitch({target:{checked:v}} as any)} size="sm" />
        <div className="text-xs text-right" style={{width:40,color: quality ? '#914BEC' : undefined}}>{quality ? t('height') : t('normal')}</div>
        {open2 && <div className="text-xs p-2 w-[300px] bg-default-100 rounded-md">{t('hight_quality_tip')}</div>}
      </div>
    </Box>
  )
}
