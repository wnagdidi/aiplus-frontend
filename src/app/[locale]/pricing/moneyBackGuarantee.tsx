import { useTranslations } from '@/hooks/useTranslations'
import { Tooltip } from '@heroui/react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export default function MoneyBackGuarantee() {
  const tBilling = useTranslations('Billing')
  const tHome = useTranslations('Home')
  return (
    <div className='inline-flex gap-1 items-center'>
      <a href='/refund-policy' target="_blank" style={{ color: 'rgba(85, 82, 114, 1)', fontSize: '14px', textDecoration: 'underline' }} title={tHome('return_policy')}>
        {tBilling('money_back_guarantee')}
      </a>
      <Tooltip
        className="w-[300px]"
        radius="sm"
        content={
          <span>
            {tBilling('money_back_guarantee_tip_1')}
            &nbsp;
            <a href='/refund-policy' target="_blank" style={{fontSize: '14px', textDecoration: 'underline' }}>
              {tHome('return_policy')}
            </a>
            &nbsp;
            {tBilling('money_back_guarantee_tip_2')}
          </span>
        }
        placement="top"
      >
        <InformationCircleIcon className="w-4 h-4" style={{ color: 'rgba(85, 82, 114, 1)' }} />
      </Tooltip>
    </div>
  )
}
