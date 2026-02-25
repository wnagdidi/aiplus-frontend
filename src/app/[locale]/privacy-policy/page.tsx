import Footer from '@/app/[locale]/home/footer'
import NewFooter from '@/app/[locale]/home/newFooter'
import MainAppBar from '@/app/[locale]/appBar'
import {mainTitleStyle} from '@/app/[locale]/home/styles'
import {useTranslations} from '@/hooks/useTranslations'
import * as React from 'react'
import {defaultLDScript} from "@/app/[locale]/pageLD";
import {getTranslations} from '@/hooks/getTranslations'
import { localesWithName } from '@/i18n.config'
import { getLocale } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.privacyPolicy')

  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en' ? '/privacy-policy' : `/${locale}/privacy-policy`

  // Generate alternate links for each language
  const languageAlternates = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '/privacy-policy' : `/${lang}/privacy-policy`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}/privacy-policy`

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

export default function PrivacyPolicyPage() {
  const t = useTranslations('PrivacyPolicy')
  const policyData = [
    {
      "title": t("information_we_collect_title"),
      "items": [
        t("information_we_collect_item_1"),
        t("information_we_collect_item_2"),
        t("information_we_collect_item_3"),
        t("information_we_collect_item_4")
      ]
    },
    {
      "title": t("how_we_use_your_information_title"),
      "items": [
        t("how_we_use_your_information_item_1"),
        t("how_we_use_your_information_item_2"),
        t("how_we_use_your_information_item_3"),
        t("how_we_use_your_information_item_4"),
        t("how_we_use_your_information_item_5"),
        t("how_we_use_your_information_item_6"),
        t("how_we_use_your_information_item_7")
      ]
    },
    {
      "title": t("storage_and_retention_of_data_title"),
      "items": [
        t("storage_and_retention_of_data_item_1"),
      ]
    },
    {
      "title": t("disclosure_and_sharing_of_data_when_required_by_law_title"),
      "items": [
        t("disclosure_and_sharing_of_data_when_required_by_law_item_1"),
        t("disclosure_and_sharing_of_data_when_required_by_law_item_2"),
        t("disclosure_and_sharing_of_data_when_required_by_law_item_3"),
        t("disclosure_and_sharing_of_data_when_required_by_law_item_4"),
        t("disclosure_and_sharing_of_data_when_required_by_law_item_5")
      ]
    },
    {
      "title": t("cookies_and_tracking_technologies_title"),
      "items": [
        t("cookies_and_tracking_technologies_item_1"),
        t("cookies_and_tracking_technologies_item_2")
      ]
    },
    {
      "title": t("your_rights_and_choices_title"),
      "items": [
        t("your_rights_and_choices_item_1"),
        t("your_rights_and_choices_item_2"),
        t("your_rights_and_choices_item_3"),
        t("your_rights_and_choices_item_4")
      ]
    },
    {
      "title": t("security_title"),
      "items": [
        t("security_item_1")
      ]
    },
    {
      "title": t("international_data_transfers_title"),
      "items": [
        t("international_data_transfers_item_1")
      ]
    },
    {
      "title": t("children's_privacy_title"),
      "items": [
        t("children's_privacy_item_1")
      ]
    },
    {
      "title": t("changes_to_this_policy_title"),
      "items": [
        t("changes_to_this_policy_item_1")
      ]
    },
    {
      "title": t("contact_us_title"),
      "items": [
        t("contact_us_item_1")
      ]
    }
  ]


  return (
    <>
      <MainAppBar />
      <div className="bg-background text-[#375375]">
        <div className="max-w-6xl mx-auto px-4 pb-12 pt-24">
          <h1 className="text-3xl mt-8 font-bold text-center text-[36px]">{t('privacy_policy')}</h1>
          <p className="text-default-500 text-center mt-5 mb-12">{t('last_modified')}</p>
          <p className="text-default-600 mb-6">{t('privacy_policy_desc')}</p>
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
