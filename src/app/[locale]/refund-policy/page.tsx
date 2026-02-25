import Footer from '@/app/[locale]/home/footer'
import NewFooter from '@/app/[locale]/home/newFooter'
import MainAppBar from '@/app/[locale]/appBar'
import { mainTitleStyle } from '@/app/[locale]/home/styles'
import {useTranslations} from '@/hooks/useTranslations'
import {defaultLDScript} from "@/app/[locale]/pageLD";
import {getTranslations} from '@/hooks/getTranslations'
import { localesWithName } from '@/i18n.config'
import { getLocale } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.refundPolicy')
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en' ? '/refund-policy' : `/${locale}/refund-policy`

  // Generate alternate links for each language
  const languageAlternates = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '/refund-policy' : `/${lang}/refund-policy`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}/refund-policy`

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages: languageAlternates
    }
  }
}

export default function RefundPolicyPage() {
  const t = useTranslations('RefundPolicy')
  const policyData = [
    {
      // title: t('subscription_cancellation_and_refund_policy_title'),
      items: [
        t('subscription_cancellation_and_refund_policy_item_1'), 
        t('subscription_cancellation_and_refund_policy_item_2')
      ],
    },
    {
      title: t('general_subscription_terms_title'),
      items: [
        t('general_subscription_terms_item_1'), 
        t('general_subscription_terms_item_2'),
        t('general_subscription_terms_item_3')
      ]
    },
    {
      title: t('special_refund_cases_title'),
      items: [
        t('special_refund_cases_item_1'), 
        t('special_refund_cases_item_2')
      ]
    },
    {
      title: t('claim_eligible_refunds_policies_title'),
      items: [
        t('claim_eligible_refunds_policies_item_1'), 
        t('claim_eligible_refunds_policies_item_2'),
        t('claim_eligible_refunds_policies_item_3'),
        t('claim_eligible_refunds_policies_item_4'),
        t('claim_eligible_refunds_policies_item_5'),
        t('claim_eligible_refunds_policies_item_6'),
        t('claim_eligible_refunds_policies_item_7')
      ]
    },
    {
      title: t('subscription_cancellation_terms_title'),
      items: [
        t('subscription_cancellation_terms_item_1'), 
        t('subscription_cancellation_terms_item_2'),
        t('subscription_cancellation_terms_item_3'),
        t('subscription_cancellation_terms_item_4'),
        t('subscription_cancellation_terms_item_5'),
        t('subscription_cancellation_terms_item_6')
      ]
    },
  ]

  return (
    <>
      <MainAppBar />
      <div className="bg-background text-[#375375]">
        <div className="max-w-6xl mx-auto px-4 pb-12 pt-24">
          <h1 className="text-3xl mt-8 font-bold text-center mb-12 text-[36px]">{t('refund_policy')}</h1>
          {policyData.map((section) => (
            <div key={section.title} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
              {section.items.map((text) => (
                <p key={text} className="mt-2 text-default-600">{text}</p>
              ))}
            </div>
          ))}
        </div>
        <NewFooter />
      </div>
      {defaultLDScript}
    </>
  )
}
