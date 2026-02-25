'use client'
import NewFaqs from '@/app/[locale]/components/newFaqs'
import NewsLetter from '@/app/[locale]/components/newsLetter'
import PicAndDes from '@/app/[locale]/components/picAndDescription'
import PricingSection from '@/app/[locale]/home/pricing'
import { EventEntry } from '@/context/GTMContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { useTranslations } from '@/hooks/useTranslations'
import { Locale } from '@/i18n.config'
import { useLocale } from 'next-intl'

export default function Index(props: any) {
  const { openDialogIfLogged } = usePricingDialog()
  const detectorSection1 = useTranslations('Bypass.section1')
  const detectorSection2 = useTranslations('Bypass.section2')
  const detectorSection3 = useTranslations('Bypass.section3')

  const detectorSection6 = useTranslations('Bypass.section6')
  const detectorSection7 = useTranslations('Bypass.section7')
  const faqListLang = useTranslations('Bypass.section6.faqList')
  const faqs = new Array(6).fill({}).map((item, index) => ({
    id: index,
    question: faqListLang(`q${index + 1}`),
    answer: faqListLang(`a${index + 1}`),
  }))

  const locale = useLocale() as Locale
  const getRootPath = () => {
    return locale === 'en' ? '/' : `/${locale}`
  }

  const onScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderSection1 = () => {
    return (
      <div className="section1">
        <PicAndDes
          title={detectorSection1('title1')}
          sub={detectorSection1('sub_title1')}
          weight={'h2'}
          features={[]}
          imgUrl={`/newHome/bypass-section1-01.png`}
        />
        <PicAndDes
          title={detectorSection1('title2')}
          sub={detectorSection1('sub_title2')}
          weight={'h2'}
          isPicRight={false}
          features={[]}
          linkText={detectorSection1('button')}
          // linkHref={getRootPath()}
          buttonCallback={onScrollTop}
          imgUrl={`/newHome/bypass-section1-02.png`}
        />
        <PicAndDes
          title={detectorSection1('title3')}
          sub={detectorSection1('sub_title3')}
          weight={'h2'}
          features={[]}
          imgUrl={`/newHome/bypass-section1-03.png`}
        />
      </div>
    )
  }

  const renderSection2 = () => {
    return (
      <div className="section2">
        <div className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
            <p className="mx-auto mt-2  text-balance text-center text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
              {detectorSection2('title')}
            </p>
            <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
              <div className="relative lg:row-span-2">
                <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                  <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                      {detectorSection2('name1')}
                    </p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                      {detectorSection2('des1')}
                    </p>
                  </div>
                  <div className="relative min-h-[30rem] w-full grow [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
                    <div className="absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
                      <img className="size-full object-cover object-top" src="/newHome/StudentsAcademics.png" alt="bypass-section2-1" />
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]"></div>
              </div>
              <div className="relative lg:row-span-2">
                <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                  <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                      {detectorSection2('name2')}
                    </p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                      {detectorSection2('des2')}
                    </p>
                  </div>
                  <div className="relative min-h-[30rem] w-full grow [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
                    <div className="absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
                      <img className="size-full object-cover object-top" src="/newHome/WritersBloggers.png" alt="bypass-section2-2" />
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]"></div>
              </div>
              <div className="relative lg:row-span-2">
                <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                  <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                      {detectorSection2('name3')}
                    </p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                      {detectorSection2('des3')}
                    </p>
                  </div>
                  <div className="relative min-h-[30rem] w-full grow [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
                    <div className="absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
                      <img
                        className="size-full object-cover object-top"
                        src="/newHome/BusinessesProfessionals.png"
                        alt="bypass-section2-3"
                      />
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSection3 = () => {
    const actions = [
      {
        title: detectorSection3('title1'),
        des1: detectorSection3('des1'),
      },
      {
        title: detectorSection3('title2'),
        des1: detectorSection3('des2-1'),
        des2: detectorSection3('des2-2'),
      },
      {
        title: detectorSection3('title3'),
        des1: detectorSection3('des3'),
      },
      {
        title: detectorSection3('title4'),
        des1: detectorSection3('des4-1'),
        des2: detectorSection3('des4-2'),
      },
      {
        title: detectorSection3('title5'),
        des1: detectorSection3('des5'),
      },
      {
        title: detectorSection3('title6'),
        des1: detectorSection3('des6-1'),
        des2: detectorSection3('des6-2'),
      },
    ]
    return (
      <div className="bg-white py-24 sm:py-32 section3">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <p className="mt-2 mb-8 text-4xl font-semibold tracking-tight text-pretty text-gray-950 sm:text-5xl text-center">
            {detectorSection3('title')}
          </p>
          <div className="list">
            <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow-sm sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
              {actions.map((action) => (
                <div
                  key={action.title}
                  className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-inset"
                >
                  <div className="mt-8">
                    <h3 className="text-base font-semibold text-gray-900">
                      <a className="focus:outline-hidden">
                        {/* Extend touch target to entire panel */}
                        <span aria-hidden="true" className="absolute inset-0" />
                        {action.title}
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">{action.des1}</p>
                    {action.des2 && <p className="mt-2 text-sm text-gray-500">{action.des2}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderFooterBanner = () => {
    return (
      <NewsLetter
        title={detectorSection7('title')}
        subTitle={detectorSection7('sub_title')}
        buttonText={detectorSection7('button_text')}
        buttonCallback={() => {
          openDialogIfLogged(EventEntry.GeneralRecommendCTA)
        }}
      />
    )
  }

  return (
    <>
      <div className="ai-translator">
        {renderSection1()}
        {renderSection2()}
        {renderSection3()}
        <PricingSection plans={props.plans} />
        <NewFaqs title={detectorSection6('title')} faqs={faqs} />
        {renderFooterBanner()}
      </div>
    </>
  )
}
