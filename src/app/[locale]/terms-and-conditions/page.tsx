import Footer from '@/app/[locale]/home/footer'
import MainAppBar from '@/app/[locale]/appBar'
import { mainTitleStyle } from '@/app/[locale]/home/styles'
import { useTranslations } from '@/hooks/useTranslations'
import { defaultLDScript } from '@/app/[locale]/pageLD'
import { getTranslations } from '@/hooks/getTranslations'
import { Brand } from '@/types/brand'
import { useCallback } from 'react'
import { localesWithName } from '@/i18n.config'
import { getLocale } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.termsAndConditions')
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en' ? '/term-and-services' : `/${locale}/term-and-services`

  // Generate alternate links for each language
  const languageAlternates = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '/term-and-services' : `/${lang}/term-and-services`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}/term-and-services`
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

export default function TermAndServicesPage() {
  const t = useTranslations('TermsAndConditions')
  const termsData =
    process.env.NEXT_PUBLIC_BRAND_NAME === Brand.AvoidAI
      ? [
          {
            highlight: t('highlight_1'),
          },
          {
            highlight: t('highlight_2'),
          },
          {
            header: t('pre_service'),
          },
          {
            title: t('acceptance_of_terms_and_conditions_title', {}, true),
            items: [t('acceptance_of_terms_and_conditions_items_1', {}, true)],
          },
          {
            title: t('flexible_plans_title'),
            items: [t('flexible_plans_items_1')],
          },
          {
            title: t('free_plan_title'),
            items: [t('free_plan_items_1'), t('free_plan_items_2')],
          },
          {
            header: t('during_service'),
          },
          {
            title: t('quality_assurance_title'),
            items: [t('quality_assurance_items_1'), t('quality_assurance_items_2')],
          },
          {
            title: t('prohibited_uses_title'),
            items: [
              t('prohibited_uses_items_1'),
              [t('prohibited_uses_items_list_1'), t('prohibited_uses_items_list_2')],
            ],
          },
          {
            title: t('technical_support_title'),
            items: [t('technical_support_items_1')],
          },
          {
            title: t('shape_the_future_title'),
            items: [t('shape_the_future_items_1'), t('shape_the_future_items_2')],
          },
          {
            highlight: t('highlight_3'),
          },
          {
            header: t('post_service'),
          },
          {
            title: t('refund_policy_title', {}, true),
            items: [t('refund_policy_items_1', {}, true), t('refund_policy_items_2', {}, true), t('refund_policy_items_3', {}, true)],
          },
          {
            title: t('service_quality_guarantee_title'),
            items: [t('service_quality_guarantee_items_1')],
          },
          {
            title: t('customer_support_title'),
            items: [t('customer_support_items_1')],
          },
          {
            title: t('secure_payment_support_title'),
            items: [
              [
                t('secure_payment_support_items_list_1'),
                t('secure_payment_support_items_list_2'),
                t('secure_payment_support_items_list_3'),
              ],
            ],
          },
          {
            title: t('lifetime_plan_title'),
            items: [t('lifetime_plan_items_1')],
          },
          {
            header: t('general_terms'),
          },
          {
            title: t('legal_compliance_title'),
            items: [t('legal_compliance_items_1')],
          },
          {
            title: t('intellectual_property_title'),
            items: [t('intellectual_property_items_1')],
          },
          {
            title: t('complete_agreement_title'),
            items: [t('complete_agreement_items_1')],
          },
          {
            title: t('no_waiver_title'),
            items: [t('no_waiver_items_1')],
          },
          {
            title: t('severability_title'),
            items: [t('severability_items_1', {}, true)],
          },
          {
            title: t('contact_us_title'),
            items: [t('contact_us_items_1', {}, true)],
          },
        ]
      : [
          {
            title: t('acceptance_of_terms_and_conditions_title', {}, true),
            items: [t('acceptance_of_terms_and_conditions_items_1', {}, true), t('acceptance_of_terms_and_conditions_items_2')],
          },
          {
            title: t('registration_and_user_accounts_title'),
            items: [
              t('registration_and_user_accounts_items_1'),
              t('registration_and_user_accounts_items_2'),
              t('registration_and_user_accounts_items_3'),
            ],
          },
          {
            title: t('rights_to_intellectual_property_title'),
            items: [t('rights_to_intellectual_property_items_1'), t('rights_to_intellectual_property_items_2')],
          },
          {
            title: t('user_content_title'),
            items: [t('user_content_items_1'), t('user_content_items_2')],
          },
          {
            title: t('not_allowed_uses_title'),
            items: [t('not_allowed_uses_items_1'), t('not_allowed_uses_items_2')],
          },
          {
            title: t('miscellaneous_title'),
            items: [t('miscellaneous_items_1'), t('miscellaneous_items_2'), t('miscellaneous_items_3')],
          },
          {
            title: t('payments_subscriptions_and_refunds_title'),
            items: [
              t('payments_subscriptions_and_refunds_items_1'),
              t('payments_subscriptions_and_refunds_items_2'),
              t('payments_subscriptions_and_refunds_items_3'),
              t('payments_subscriptions_and_refunds_items_4'),
            ],
          },
          {
            title: t('refund_policy_title', {}, true),
            items: [
              t('refund_policy_items_1', {}, true),
              t('refund_policy_items_2', {}, true),
              t('refund_policy_items_3', {}, true),
              t('refund_policy_items_4'),
              t('refund_policy_items_5'),
            ],
          },
          {
            title: t('severability_title'),
            items: [t('severability_items_1', {}, true)],
          },
          {
            title: t('contact_us_title'),
            items: [t('contact_us_items_1', {}, true)],
          },
        ]

  const typographyWithSubtitle = useCallback((text: string) => text, [])

  return (
    <>
      <MainAppBar />
      <div className="bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center">{t('terms_and_conditions')}</h1>
          <p className="text-default-500 text-center mt-2 mb-8">{t('last_modified')}</p>
          {termsData.map((section) => (
            <div key={section.title || section.highlight || section.header} className="mb-6">
              {section.header && (
                <h2 className="text-2xl font-semibold mt-8 mb-4">{section.header}</h2>
              )}
              {section.title && (
                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
              )}
              {section.highlight && (
                <p className="font-semibold mb-2">{section.highlight}</p>
              )}
              <div className="flex flex-col gap-3">
                {section.items?.map((text: string | string[]) =>
                  typeof text === 'string' ? (
                    <p key={text} className="text-default-600">{typographyWithSubtitle(text)}</p>
                  ) : (
                    text.map((listItemText: string) => (
                      <p key={listItemText} className="text-default-600">{typographyWithSubtitle(listItemText)}</p>
                    ))
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
        <Footer />
      </div>
      {defaultLDScript}
    </>
  )
}
