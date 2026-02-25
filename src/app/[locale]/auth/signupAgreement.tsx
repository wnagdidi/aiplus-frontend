import { Link } from '@heroui/react'
import {useTranslations} from '@/hooks/useTranslations'

export default function SignupAgreement() {
  const t = useTranslations('Auth')

  return (
    <div className="w-full text-center text-xs">
      <span>{t('sign_up_agree')}</span>
      <Link href="/term-and-services" target="_blank" className="mx-1 text-xs text-[rgb(0,107,214)] font-medium inline">
        {t('terms_of_service')}
      </Link>
      <span>{t('and')}</span>
      <Link href="/privacy-policy" target="_blank" className="mx-1 text-xs text-[rgb(0,107,214)] font-medium inline">
        {t('privacy_policy')}
      </Link>
      <span>.</span>
    </div>
  )
}
