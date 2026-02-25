import MainAppBar from '@/app/[locale]/appBar'
import MainTitle from '@/app/[locale]/home/mainTitle'
import Tabbar from '@/app/[locale]/tabbar'
import HumanIntroduction from '@/app/[locale]/humanize/humanIntroduction'
import { Divider } from '@heroui/react'
import dynamic from 'next/dynamic'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import BillingApi from '@/api/server/billingApi'
import { getLocale } from 'next-intl/server'
import { getTranslations } from '@/hooks/getTranslations'


const NewFooterLazy = dynamic(() => import('@/app/[locale]/home/newFooter'))
const RecommendPricingLazy = dynamic(() => import('@/app/[locale]/home/recommendPricing'))
const GoogleLoginLazy = dynamic(() => import('@/components/GoogleLoginComponent'), { ssr: false })
const RedirectHomeLazy = dynamic(() => import('./redirectHome'))

export const revalidate = 60

export async function generateMetadata() {
  const t = await getTranslations('Metadata.home')
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const canonicalPath = locale === 'en' ? '' : `/${locale}`
  return {
    title: t('title', {}, true),
    description: t('description', {}, true),
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
    },
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions as any)
  const accessToken = (session as any)?.user?.accessToken as string | undefined
  const billingApi = new BillingApi(accessToken || '')
  const plans = await billingApi.getPlans()
  return (
    <>
      <MainAppBar />
      <div className="main-wrapper">
        <div className="relative overflow-hidden pb-8 bg-cover bg-no-repeat bg-center" style={{ 
          backgroundImage: 'var(--home-bg-image)',
          backgroundColor: 'var(--home-bg-color)'
        }}>
          <div className="absolute inset-0 z-10"></div>
          <div className="relative z-20 pt-37 px-6 mx-auto max-w-screen-2xl">
            <MainTitle currentTab={0} />
            <Tabbar currentTab={0} />
          </div>
        </div>
        <HumanIntroduction plans={plans}/>
      </div>
      <Divider />
      <NewFooterLazy />
      <GoogleLoginLazy />
      <RecommendPricingLazy />
      <RedirectHomeLazy /> 
    </>
  )
}
