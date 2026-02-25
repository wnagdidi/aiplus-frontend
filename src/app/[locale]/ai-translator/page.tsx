import BillingApi from '@/api/server/billingApi'
import NewFooter from '@/app/[locale]/home/newFooter'
import RecommendPricing from '@/app/[locale]/home/recommendPricing'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import GoogleLoginComponent from '@/components/GoogleLoginComponent'
import { localesWithName } from '@/i18n.config'
import { getServerSession } from 'next-auth'
import { getLocale } from 'next-intl/server'
import { getTranslations } from '../../../hooks/getTranslations'
import AiTranslatorHeader from './aiTranslatorHeader'
import AiTranslatorContent from './aiTranslatorContent'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.aiTranslator')
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en' ? '/ai-translator' : `/${locale}/ai-translator`

  // Generate alternate links for each language
  const languageAlternates = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '/ai-translator' : `/${lang}/ai-translator`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}/ai-translator`

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

export default async function AiTranslator({ searchParams }: { searchParams: any }) {
  const session = await getServerSession(authOptions)
  const billingApi = new BillingApi(session?.user?.accessToken)
  const plans = await billingApi.getPlans()
  
  const tabType = searchParams.tab === 'document' ? 'document' : 'text'

  return (
    <>
      <div className="main-wrapper">
        <AiTranslatorHeader />
        <AiTranslatorContent />
      </div>
      
      <hr className="my-8 border-default-200" />
      <NewFooter />
      <GoogleLoginComponent />
      <RecommendPricing />
    </>
  )
}
