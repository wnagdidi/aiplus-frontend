import MainAppBar from '@/app/[locale]/appBar'
import * as React from 'react'
import {getTranslations} from '@/hooks/getTranslations'
import AboutUsComponent from './aboutUsComponent'
import { localesWithName } from '@/i18n.config'
import { getLocale } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.aboutUs')

  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en' ? '/about-us' : `/${locale}/about-us`

  // Generate alternate links for each language
  const languageAlternates = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '/about-us' : `/${lang}/about-us`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}/about-us`

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

export default function AboutUs() {

  return (
    <>
      <MainAppBar />
      <AboutUsComponent />
    </>
  )
}
