import { createSharedPathnamesNavigation } from 'next-intl/navigation'

export const localesWithName = [
  { locale: 'en', name: 'English', iso6393: 'eng' }, // English
]

export const locales = localesWithName.map(({ locale }) => locale) as const

export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = localesWithName.reduce((result, { locale, name }) => {
  result[locale] = name
  return result
}, {})

export const { Link, usePathname, useRouter } = createSharedPathnamesNavigation({ locales })
