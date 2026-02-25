import Popover from '@/app/[locale]/popover'
import { useTranslations } from 'next-intl'

export default function Index() {
  const t = useTranslations('UsageTips')
  const popContent = (
    <div className="content">
      <div className="title" style={{ fontWeight: 'bold', marginBottom: '12px' }}>
        {t('title')}
      </div>
      <p>{t('content')}</p>
      <div className="des" style={{ margin: '8px 0' }}>
        <p>1. {t('content1')}</p>
        <p>2. {t('content2')}</p>
        <p>3. {t('content3')}</p>
      </div>
      <p>{t('content4')}</p>
    </div>
  )
  const triggerDom = <span style={{ fontSize: '14px', fontWeight: '400', color: '#375375', cursor: 'pointer' }}> {t('title')}</span>
  return (
    <div className="tips" style={{ textAlign: 'center' }}>
      <Popover trigger={triggerDom} popContent={popContent} />
    </div>
  )
}
