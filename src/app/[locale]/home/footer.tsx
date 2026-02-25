'use client'
import { useLocale } from 'next-intl'
import { useTranslations } from '@/hooks/useTranslations'
import Link from '@/components/routerLlink'
import { Locale, usePathname } from '@/i18n.config'
import LocaleSwitcher from '@/components/localeSwitcher'
import PaymentMethodsControl from "@/app/[locale]/pricing/paymentMethodsControl";
import { useRouter } from '@/components/next-intl-progress-bar'
import NewFooter from './newFooter'

const logoStyle = {
  width: '120px',
  height: 'auto',
  marginLeft: '12px',
  display: 'inline',
}

export default function Footer() {
  const tCommon = useTranslations('Common')
  const t = useTranslations('Home')
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  // console.log(pathname, '===> pathname')
  return <NewFooter />
  // Legacy footer preserved above via NewFooter; unused MUI footer removed
  // If needed in future, implement Tailwind/HeroUI footer here
  return null
}
