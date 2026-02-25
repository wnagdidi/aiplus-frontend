import BillingApi from '@/api/server/billingApi'
import MainAppBar from '@/app/[locale]/appBar'
import dynamic from 'next/dynamic'
import { mainContainerFooterStyle, mainContainerStyle } from '@/app/[locale]/home/styles'
import { defaultLDScript } from '@/app/[locale]/pageLD'
import { PricingDialogProvider } from '@/context/PricingDialogContext'
import { standalonePageContentStyle } from '@/app/[locale]/styles'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getTranslations } from '@/hooks/getTranslations'
import { localesWithName } from '@/i18n.config'
// import '@/style/main.scss'
// import '@/style/mobile.scss'
// import '@/style/swiper.scss'
import { Divider } from '@heroui/react'
import { getServerSession } from 'next-auth'
import { getLocale } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.pricing')
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en' ? '/pricing' : `/${locale}/pricing`

  // Generate alternate links for each language
  const languageAlternates = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '/pricing' : `/${lang}/pricing`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}/pricing`

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages: languageAlternates,
    },
  }
}

export const revalidate = 300

const PlanSelectorWrapperLazy = dynamic(() => import('@/app/[locale]/pricing/planSelectorWrapper'))
const PricingDialogLazy = dynamic(() => import('@/app/[locale]/pricing/pricingDialog'))
const FooterLazy = dynamic(() => import('@/app/[locale]/home/footer'))

export default async function PricingPage() {
  const session = await getServerSession(authOptions)
  const billingApi = new BillingApi(session?.user?.accessToken)
  const plans = await billingApi.getPlans()

  return (
    <>
      <MainAppBar />
      <div className="bg-background text-foreground">
        <div className="pt-37 max-w-screen-2xl mx-auto px-4 py-12">
          <PricingDialogProvider>
            <PlanSelectorWrapperLazy plans={plans} />
            <PricingDialogLazy />
          </PricingDialogProvider>
        </div>
        <Divider />
        <FooterLazy />
      </div>
      {defaultLDScript}
    </>
  )
}
