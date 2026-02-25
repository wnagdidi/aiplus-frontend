import BillingApi from '@/api/server/billingApi'
import MainAppBar from '@/app/[locale]/appBar'
import MainTitle from '@/app/[locale]/home/mainTitle'
import dynamic from 'next/dynamic'
import Tabbar from '@/app/[locale]/tabbar'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { localesWithName } from '@/i18n.config'
// 已删除干扰的样式导入
import { getServerSession } from 'next-auth'
import { getLocale } from 'next-intl/server'
import { getTranslations } from '../../../hooks/getTranslations'
const NewFooterLazy = dynamic(() => import('@/app/[locale]/home/newFooter'))
const AiIntroductionLazy = dynamic(() => import('./aiIntroduction'))

export async function generateMetadata() {
  const t = await getTranslations('Metadata.aiDetector')
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en' ? '/ai-detector' : `/${locale}/ai-detector`

  // Generate alternate links for each language
  const languageAlternates = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '/ai-detector' : `/${lang}/ai-detector`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}/ai-detector`

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

export const revalidate = 60

export default async function AiDetector() {
  const session = await getServerSession(authOptions)
  const billingApi = new BillingApi(session?.user?.accessToken)
  const plans = await billingApi.getPlans()
  return (
    <>
      <MainAppBar />
      <div className="main-wrapper">
        <div
          className="relative overflow-hidden pb-2"
        >
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'var(--ai-detector-bg)',
              backgroundSize: 'cover',
            }}
          />
          <div className="pt-37 relative z-20 max-w-screen-2xl mx-auto px-4">
            <MainTitle routeName={'detector'} />
            <Tabbar currentTab={1} eagerAI={true} />
          </div>
        </div>
        <AiIntroductionLazy plans={plans} />
      </div>
      {/* <ProductLink /> */}
      <hr className="my-8 border-gray-200" />
      <NewFooterLazy />
    </>
  )
}
