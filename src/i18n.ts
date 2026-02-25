import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from './i18n.config'

// Load the translation file for the active locale
// on each request and make it available to our
// pages, components, etc.
export default getRequestConfig(async ({ locale }: { locale: Locale }) => {
  if (!locales.includes(locale)) {
    console.log(new Date(), 'WARN', 'locale', locale, 'is not supported')
    return notFound()
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
