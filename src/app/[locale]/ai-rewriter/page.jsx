import BillingApi from '@/api/server/billingApi'
import MainAppBar from '@/app/[locale]/appBar'
import MainTitle from '@/app/[locale]/home/mainTitle'
import NewFooter from '@/app/[locale]/home/newFooter'
import RecommendPricing from '@/app/[locale]/home/recommendPricing'
import Tabbar from '@/app/[locale]/tabbar'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import GoogleLoginComponent from '@/components/GoogleLoginComponent'
import { localesWithName } from '@/i18n.config'
// 已删除干扰的样式导入
// import '@/style/main.scss'
// import '@/style/mobile.scss'
// import '@/style/swiper.scss'
// import { Box, Divider } from '@mui/material'
// import Container from '@mui/material/Container'
import { getServerSession } from 'next-auth'
import { getLocale } from 'next-intl/server'
import { getTranslations } from '../../../hooks/getTranslations'
import Introduction from './introduction'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.aiRewriter')
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en' ? '/ai-rewriter' : `/${locale}/ai-rewriter`

  // Generate alternate links for each language
  const languageAlternates = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '/ai-rewriter' : `/${lang}/ai-rewriter`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}/ai-rewriter`

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
          style={{
            background: 'linear-gradient(180deg,#fff,#fff4fa 40%,#fbd9fd 75%,#e2d5ff 90%,#fff 100%)',
          }}
        >
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
          <div className="pt-6 relative z-20 max-w-7xl mx-auto px-4">
            <MainTitle routeName="rewriter" />
            <Tabbar currentTab={0} hiddenTab />
          </div>
        </div>
        <Introduction plans={plans} />
      </div>
      {/* <ProductLink /> */}
      <hr className="my-8 border-gray-200" />
      <NewFooter />
      <GoogleLoginComponent />
      <RecommendPricing />
    </>
  )
}
