'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import ReactGA from 'react-ga4'
import * as process from 'process'
import { AnalyticsEventType } from '@/utils/events/analytics'
import { useGTM } from '@/context/GTMContext'

export default function GAInitializer() {
  const { reportEvent } = useGTM()
  const GA4_ID = process.env.NEXT_PUBLIC_GOOGLE_GA4_ID

  useEffect(() => {
    if (GA4_ID && GA4_ID.trim() !== '') {
      if (process.env.NEXT_PUBLIC_ENVIRONMENT_MOD === 'test') {
        ReactGA.initialize(GA4_ID, {
          testMode: true,
          gaOptions: {
            debug: true
          }
        })
      } else {
        ReactGA.initialize(GA4_ID)
      }
      reportEvent(AnalyticsEventType.VIEW_CONTENT, {})
    }
  }, [])

  if (!GA4_ID || GA4_ID.trim() === '') {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}');
        `}
      </Script>
    </>
  )
}
