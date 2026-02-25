'use client'
import {useTranslations} from '@/hooks/useTranslations'
import * as React from 'react'
import {useActiveSubscription} from '@/context/ActiveSubscriptionContext'
import {usePricingDialog} from '@/context/PricingDialogContext'
import CrownIcon from '@/components/CrownIcon'
import {EventEntry} from '@/context/GTMContext'
import { Button } from '@heroui/react'

const usageClipStyle = {
  display: 'inline-flex',
  padding: '6px 6px 6px 12px',
  borderRadius: '24px',
  backgroundColor: '#c7d7f08a',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: '#1963d7',
  fontWeight: 500,
} as React.CSSProperties
const commonClipStyle = {
  height: '60px',
  lineHeight: '60px',
  fontFamily: 'PingFang SC',
  fontWeight: '500',
  fontSize: '14px',
  borderRadius: '12px',
  padding: '0 16px',
  boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
} as React.CSSProperties
const defaultClipStyle = {
  color: '#fff',
  border: '1px solid #006ffd',
  background: 'linear-gradient(90deg, #006ffd -0.48%, #F7ECFF 100%)',
} as React.CSSProperties
const redClipStyle = {
  color: '#DC0013',
  border: '1px solid #FF828A',
  background: '#FFADBE',
} as React.CSSProperties
const notClipStyle = {
  color: '#9A1521',
  border: '1px solid #FF8088',
  background: 'linear-gradient(90deg, #FF717A 0%, #FFCACB 100%)',

} as React.CSSProperties

export default function MonthlyUsage(props: any) {
  const t = useTranslations('Humanize')
  const tBilling = useTranslations('Billing')
  const { subscription, isUnlimited, refreshActiveSubscription } = useActiveSubscription()
  const { openDialog: openPricingDialog } = usePricingDialog()
  const { isChange } = props

  React.useEffect(() => {
    refresh()
  }, [isChange])

  const refresh = () => {
    refreshActiveSubscription()
  }

  const getMonthlyStyle = (type: string) => {
    if(!subscription) {
      return type === 'BOX'? defaultClipStyle : {background: '#B95DFF'}
    }
    if(subscription.wordsLimitTotal > 0 && subscription.wordsLimitTotal - subscription.currentMonthUsage > 0 && subscription.wordsLimitTotal - subscription.currentMonthUsage < 50) {
      return type === 'BOX'? redClipStyle : {background: '#FFADBE'}
    }else if(subscription.wordsLimitTotal > 0 && subscription.wordsLimitTotal - subscription.currentMonthUsage > 50) {
      return type === 'BOX'? defaultClipStyle : {background: '#B95DFF'}
    }else if(subscription.wordsLimitTotal > 0 && subscription.wordsLimitTotal - subscription.currentMonthUsage <= 0) {
      return type === 'BOX'? notClipStyle : {background: '#FF717A'}
    }else {
      return type === 'BOX'? defaultClipStyle : {background: '#B95DFF'}
    }
  }

  if (!subscription) {
    return <div />
  }

  return (
    <div className="w-full md:w-[423px]">
      {isUnlimited ? (
        <div className="w-full md:w-[423px]" style={{...(commonClipStyle as React.CSSProperties), ...(defaultClipStyle as React.CSSProperties)}}>{tBilling('unlimited_words')}</div>
      ) : (
        <div className="w-full md:w-[423px] flex items-center justify-between" style={{...(commonClipStyle as React.CSSProperties), ...(getMonthlyStyle('BOX') as React.CSSProperties)}}>
          {t('monthly_usage_desc', { used: subscription.currentMonthUsage, total: subscription.wordsLimitTotal>0?subscription.wordsLimitTotal:0 })}
          <Button
            onPress={() => openPricingDialog(EventEntry.HumanizeMonthlyUsageGetMoreButton)}
            size="sm"
            startContent={<CrownIcon />}
            className="rounded-[18px]"
            style={{ ...(getMonthlyStyle('BTN') as React.CSSProperties) }}
          >
            {t('get_premium')}
          </Button>
        </div>
      )}
    </div>
  )
}
