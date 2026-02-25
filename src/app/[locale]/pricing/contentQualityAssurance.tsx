import { useTranslations } from '@/hooks/useTranslations'
import { Tooltip } from '@heroui/react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export default function ContentQualityAssurance() {
  const tBilling = useTranslations('Billing')
  const tHome = useTranslations('Home')
  return (
    <div className='inline-flex gap-1 items-center'>
      <a href='/term-and-services' target="_blank" style={{ color: 'rgba(85, 82, 114, 1)', fontSize: '14px', textDecoration: 'underline' }} title={tHome('return_policy')}>
        {tBilling('content_quality_assurance')}
      </a>
      <Tooltip
        className="w-[300px]"
        radius="sm"
        content={
          <span>
            {tBilling('content_quality_assurance_tip_1')}
            &nbsp;
            <a href='/term-and-services' target="_blank" style={{fontSize: '14px', textDecoration: 'underline' }}>
              {tHome('terms_and_conditions')}
            </a>
            &nbsp;
            {tBilling('content_quality_assurance_tip_2')}
          </span>
        }
        placement="top"
      >
        <InformationCircleIcon className="w-4 h-4" style={{ color: 'rgba(85, 82, 114, 1)' }} />
      </Tooltip>
    </div>
  )
}
