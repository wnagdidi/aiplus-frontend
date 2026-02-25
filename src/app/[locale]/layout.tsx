import AppProviders from "./providers"
import { Inter } from "next/font/google"
import "./globals.css"
import { getLocale, getMessages } from "next-intl/server"
import { getTranslations } from "@/hooks/getTranslations"
import { NextIntlClientProvider } from "next-intl"
import { AuthDialogProvider } from "@/context/AuthDialogContext"
import AuthDialog from "@/app/[locale]/auth/authDialog"
import { ClientSessionProvider } from "@/provider/ClientSessionProvider"
import { SnackbarProvider } from "@/context/SnackbarContext"
import { DownloadStatusProvider } from "@/context/DownloadStatusContext"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import ProgressBar from "@/components/ProgressBar"
// import "animate.css/animate.min.css"
import { ActiveSubscriptionProvider } from "@/context/ActiveSubscriptionContext"
import ClientApiSessionSync from "@/provider/ClientApiSessionSync"
import { PricingDialogProvider } from "@/context/PricingDialogContext"
import PricingDialog from "@/app/[locale]/pricing/pricingDialog"
import { GoogleTagManager } from "@next/third-parties/google"
import type { Session } from "next-auth"
import BillingApi from "@/api/server/billingApi"
import { ResultCode } from "@/api/core/common"
import { GTMProvider } from "@/context/GTMContext"
import { BannerContextProvider } from "@/context/BannerContext"
import FacebookLoader from "@/components/facebookLoader"
import { PreviewModeProvider } from "@/context/PreviewModeContext"
import { AvoidaiProChatContextProvider } from "@/context/AvoidaiProChatContext"
import { PopoverProvider } from "@/context/PopoverContext"
import PopoverComponent from "@/app/[locale]/humanize/PopoverComponent"
import GAInitializer from "@/components/GAInitializer"
import { localesWithName } from '@/i18n.config'
import { getThemeClass } from '../../../hero'
import AgeVerification from "@/components/AgeVerification"

const inter = Inter({ subsets: ["latin"], weight: ["400", "700"] })

export async function generateMetadata() {
  const t = await getTranslations('Metadata.default')
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const canonicalPath = locale === 'en' ? '' : `/${locale}`

  // Generate alternate links for each language
  const languageAlternates: Record<string, string> = {}
  localesWithName.forEach(({ locale: lang }) => {
    const path = lang === 'en' ? '' : `/${lang}`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}`

  return {
    title: t("title", {}, true),
    description: t("description", {}, true),
    keywords: t("keywords"),
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages: languageAlternates,
    },
  }
}

export default async function RootLayout({
                                           children,
                                         }: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  const { session } = await getLoggedInfo()

  return (
      <html lang={locale} dir="ltr">
      <head>
        <link rel="preload" as="image" href="/bg_1.png" />
        <link rel="preload" as="image" href="/bg_3.png" />
        {process.env.NEXT_PUBLIC_GTM_ID && (
            <>
              {/* Google Tag Manager */}
              <script
                  dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`
                  }}
              />
              {/* End Google Tag Manager */}
            </>
        )}
        {process.env.NEXT_PUBLIC_PIXEL_ID  && (
          <>
            <script
                dangerouslySetInnerHTML={{
                  __html: `
                  if (typeof window !== 'undefined') {
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${process.env.NEXT_PUBLIC_PIXEL_ID}');
                  }
                `,
                }}
            />
          </>
        )}
      </head>
      <body className={`${inter.className} dark text-foreground bg-background`} suppressHydrationWarning={true}>
        {/* 主题初始化脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const theme = savedTheme || 'dark';
                  const body = document.body;
                  
                  // 移除所有主题类
                  body.classList.remove('light', 'dark');
                  
                  // 添加当前主题类
                  body.classList.add(theme);
                  
                  // 确保主题类在正确的位置，避免水合不匹配
                  const classList = Array.from(body.classList);
                  const themeIndex = classList.indexOf(theme);
                  if (themeIndex > 0) {
                    // 将主题类移到前面，确保顺序一致
                    body.classList.remove(theme);
                    body.classList.add(theme);
                  }
                } catch (e) {
                  console.warn('Theme initialization failed:', e);
                }
              })();
            `,
          }}
        />
      {process.env.NEXT_PUBLIC_GTM_ID && (
          <>
            {/* Google Tag Manager (noscript) */}
            <noscript>
              <iframe
                  src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                  height="0"
                  width="0"
                  style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
            {/* End Google Tag Manager (noscript) */}
          </>
      )}
      <NextIntlClientProvider messages={messages}>
        <ClientSessionProvider session={session}>
          <ClientApiSessionSync>
            <PreviewModeProvider previewToken={process.env.PREVIEW_TOKEN}>
              <SnackbarProvider>
                <DownloadStatusProvider>
                  <ActiveSubscriptionProvider>
                  <GTMProvider>
                    <AuthDialogProvider>
                      <PricingDialogProvider>
                        <BannerContextProvider>
                          <AvoidaiProChatContextProvider>
                            <PopoverProvider>
                              <AppProviders>
                                {children}
                                <GAInitializer />
                                <AuthDialog />
                                <PricingDialog />
                                <ProgressBar />
                                <FacebookLoader />
                                <PopoverComponent />
                                <AgeVerification />
                              </AppProviders>
                            </PopoverProvider>
                          </AvoidaiProChatContextProvider>
                        </BannerContextProvider>
                      </PricingDialogProvider>
                    </AuthDialogProvider>
                  </GTMProvider>
                </ActiveSubscriptionProvider>
                </DownloadStatusProvider>
              </SnackbarProvider>
            </PreviewModeProvider>
          </ClientApiSessionSync>
        </ClientSessionProvider>
      </NextIntlClientProvider>
      </body>
      </html>
  )
}

async function getLoggedInfo() {
  try {
    const session = await getServerSession(authOptions as any)
    return { session }
  } catch (e) {
    return { session: null }
  }
}

// Subscription is initialized client-side by ActiveSubscriptionProvider
