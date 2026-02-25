import NewFooter from '@/app/[locale]/home/newFooter'
import MainAppBar from '@/app/[locale]/appBar'
import * as React from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import SendEmailForm from '@/app/[locale]/contact-us/sendEmailForm'
import {defaultLDScript} from "@/app/[locale]/pageLD";
import {getTranslations} from '@/hooks/getTranslations'
import { localesWithName } from '@/i18n.config'
import { getLocale } from 'next-intl/server'
import { Card } from '@heroui/react'

export async function generateMetadata() {
  const t = await getTranslations('Metadata.contactUs')
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en' ? '/contact-us' : `/${locale}/contact-us`

  // Generate alternate links for each language
  const languageAlternates = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '/contact-us' : `/${lang}/contact-us`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}/contact-us`

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

export default function ContactUsPage() {
  const t = useTranslations('ContactUs')
  const tCommon = useTranslations('Common')

  return (
    <>
      <MainAppBar />
      <div className="bg-background text-[#375375]">
        <div className="max-w-screen-2xl mx-auto px-4 pb-12 pt-37">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mt-8 mb-12">{t('contact_us_title')}</h1>
            {/* <p className="text-default-500">{t('send_us_email')}</p> */}
          </div>

          <Card className="w-full p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
              <div className="text-center md:text-left">
                <h2 className="text-[34px] font-semibold text-[#375375]">{t('how_can_we_help')}</h2>
                <p className="text-default-500 mt-2 mb-6 text-[#375375]">{t('send_us_email')}</p>
                <SendEmailForm />
              </div>

              <div className="relative min-h-[480px] md:min-h-[600px] rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-top" style={{backgroundImage: 'url(/contact_us_custom_service_manager.jpg)'}} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
                  <p className="mb-4">{t('manager_said')}</p>
                  <p className="mb-1">{t('manager_name')}</p>
                  <p className="opacity-90">{t('manager_desc')}</p>
                </div>
              </div>
            </div>
          </Card>

          {process.env.NEXT_PUBLIC_SITE_POWER_BY && (
            <p className="text-center mt-6 text-default-500">
              {process.env.NEXT_PUBLIC_SITE_POWER_BY}
            </p>
          )}
        </div>
        <NewFooter />
      </div>
      {defaultLDScript}
    </>
  )
}
