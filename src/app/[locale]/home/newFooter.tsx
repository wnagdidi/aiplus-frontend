'use client'
import LocaleSwitcher from '@/components/localeSwitcher'
import Link from '@/components/routerLlink'
import { useTranslations } from '@/hooks/useTranslations'
import { Locale } from '@/i18n.config'
// import '@/style/main.scss'
// import '@/style/mobile.scss'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Index() {
  const t = useTranslations('Home')
  const tCommon = useTranslations('Common')
  const tNewDev = useTranslations('NewDev')
  const locale = useLocale() as Locale
  // Avoid hydration mismatch on mobile by rendering year after mount
  const [year, setYear] = useState<string>('')
  useEffect(() => {
    setYear(String(new Date().getFullYear()))
  }, [])

  const getFullPath = (pathname: string) => {
    if (!pathname) {
      return locale === 'en' ? `/` : `/${locale}`
    }
    return locale === 'en' ? `/${pathname}` : `/${locale}/${pathname}`
  }

  const navigation = {
    products: [
      { name: 'Pricing', href: getFullPath('feelove-pricing') },
      { name: 'Support', href: 'feelove-support'}
    ],
    support: [
      { name: 'Submit ticket', href: '#' },
      { name: 'Documentation', href: '#' },
      { name: 'Guides', href: '#' },
    ],
    company: [
      { name: 'Privacy', href: getFullPath('feelove-privacy') },
      { name: 'Terms', href: getFullPath('feelove-terms') },
      { name: 'Disclaimer', href: getFullPath('feelove-disclaimer') }
    ],
    legal: [
      { name: 'Terms of service', href: '#' },
      { name: 'Privacy policy', href: '#' },
      { name: 'License', href: '#' },
    ],
    pages: [
      { name: tCommon('ai_resources'), href: getFullPath('article') }
    ],
    social: [
      {
        name: 'YouTube',
        href: 'https://www.youtube.com/@byecheck',
        icon: (props) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ],
  }

  return (
    <footer className="bg-black/50">
      <div className="border-t border-pink-500/20 py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-2 text-center sm:text-left">
            <a className="group flex items-center justify-center sm:justify-start mb-4" href={getFullPath('')}>
              <Image
                alt="FeeLove logo"
                src={'/logo.png'}
                className="h-6 w-auto"
                width={144}
                height={36}
                sizes="144px"
              />
            </a>
            <p className="text-sm/6 text-balance mt-5 text-default-500">{t('avoid_ai_desc')}</p>
            {/* <div className="flex gap-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={'_blank'}
                  className="text-default-500 hover:text-foreground"
                  rel="nofollow noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="size-6" />
                </a>
              ))}
            </div> */}
          </div>
          {/* <div className="mt-16 grid grid-cols-1 gap-8 xl:col-span-2 xl:mt-0 sm:grid-cols-2 lg:grid-cols-3"> */}
            <div className="text-center sm:text-left">
              <div className="text-sm/6 font-semibold text-foreground">{tCommon('products')}</div>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.products.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm/6 text-default-500 hover:text-pink-400 hover:underline transition-colors">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* <div>
              <div className="text-sm/6 font-semibold text-foreground">{tCommon('pages')}</div>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.pages.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm/6 text-default-500 hover:text-gray-900 hover:underline transition-colors">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}
            <div className="text-center sm:text-left">
              <div className="text-sm/6 font-semibold text-foreground">{tCommon('company')}</div>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm/6 text-default-500 hover:text-pink-400 hover:underline transition-colors" rel="noreferrer">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          {/* </div> */}
        </div>
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
          <p className="text-sm/6 text-default-500" suppressHydrationWarning>
            {'Copyright © '}
            <Link href="/">{tCommon('brandName')}&nbsp;</Link>
            {year}
            <span className="ml-1">{process.env.NEXT_PUBLIC_SITE_POWER_BY}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
