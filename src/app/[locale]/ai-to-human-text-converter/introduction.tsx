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
  const detectorSection1 = useTranslations('Converter.section1')
  const detectorSection2 = useTranslations('Converter.section2')
  const detectorSection3 = useTranslations('Converter.section3')
  const detectorSection4 = useTranslations('Converter.section4')
  const detectorSection6 = useTranslations('Converter.section6')
  const detectorSection7 = useTranslations('Converter.section7')
  const faqListLang = useTranslations('Converter.section6.faqList')
  const faqs = new Array(7).fill({}).map((item, index) => ({
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
          imgUrl={`/newHome/converter-section1-01.png`}
          imgStyle={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}
        />
        <PicAndDes
          title={detectorSection1('title2')}
          sub={detectorSection1('sub_title2')}
          weight={'h2'}
          isPicRight={false}
          features={[]}
          linkText={detectorSection1('button')}
          buttonCallback={onScrollTop}
          imgUrl={`/newHome/converter-section1-02.png`}
        />
      </div>
    )
  }

  const renderSection2 = () => {
    return (
      <div className="section2">
        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-950 sm:text-5xl text-center">
              {detectorSection2('title')}
            </h2>
            <div className="sub-title mx-auto max-w-2xl mt-6 text-lg/8 text-gray-600 text-center">
              {detectorSection2('sub_title')}
            </div>
            <div className="mt-10 lg:ml-20 lg:mr-20 grid grid-cols-1 gap-[20px] lg:gap-[100px] sm:mt-16 lg:grid-cols-2 lg:grid-rows-2">
              <div className="relative lg:col-span-1">
                <div className="absolute inset-px rounded-lg bg-white" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
                  <img alt="" src="/newHome/Students1-1.png" className="h-80 object-cover" />
                  <div className="p-10 pt-4">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{detectorSection2('list.one.name')}</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{detectorSection2('list.one.des')}</p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5" />
              </div>
              
              <div className="relative lg:col-span-1">
                <div className="absolute inset-px rounded-lg bg-white" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
                  <img alt="" src="/newHome/Copywriters.png" className="h-80 object-cover" />
                  <div className="p-10 pt-4">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{detectorSection2('list.two.name')}</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{detectorSection2('list.two.des')}</p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5" />
              </div>
              
              <div className="relative lg:col-span-1">
                <div className="absolute inset-px rounded-lg bg-white" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
                  <img alt="" src="/newHome/SEOProfessionals.png" className="h-80 object-cover" />
                  <div className="p-10 pt-4">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{detectorSection2('list.three.name')}</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{detectorSection2('list.three.des')}</p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5" />
              </div>
              
              <div className="relative lg:col-span-1">
                <div className="absolute inset-px rounded-lg bg-white" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
                  <img alt="" src="/newHome/WritingAgency.png" className="h-80 object-cover" />
                  <div className="p-10 pt-4">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{detectorSection2('list.four.name')}</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{detectorSection2('list.four.des')}</p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5" />
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
        des: detectorSection3('des1'),
      },
      {
        title: detectorSection3('title2'),
        des: detectorSection3('des2'),
      },
      {
        title: detectorSection3('title3'),
        des: detectorSection3('des3'),
      },
      {
        title: detectorSection3('title4'),
        des: detectorSection3('des4'),
      },
      {
        title: detectorSection3('title5'),
        des: detectorSection3('des5'),
      },
      {
        title: detectorSection3('title6'),
        des: detectorSection3('des6'),
      },
    ]
    return (
      <div className="section3">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <h2 className="mt-2 mb-8 text-4xl font-semibold tracking-tight text-pretty text-gray-950 sm:text-5xl text-center">
            {detectorSection3('title')}
          </h2>
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
                        <span aria-hidden="true" className="absolute inset-0" />
                        {action.title}
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">{action.des}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSection4 = () => {
    const rows = [
      {
        field1: detectorSection4('field1_1'),
        field2: detectorSection4('field1_2'),
        field3: detectorSection4('field1_3'),
      },
      {
        field1: detectorSection4('field2_1'),
        field2: detectorSection4('field2_2'),
        field3: detectorSection4('field2_3'),
      },
      {
        field1: detectorSection4('field3_1'),
        field2: detectorSection4('field3_2'),
        field3: detectorSection4('field3_3'),
      },
      {
        field1: detectorSection4('field4_1'),
        field2: detectorSection4('field4_2'),
        field3: detectorSection4('field4_3'),
      },
      {
        field1: detectorSection4('field5_1'),
        field2: detectorSection4('field5_2'),
        field3: detectorSection4('field5_3'),
      },
      {
        field1: detectorSection4('field6_1'),
        field2: detectorSection4('field6_2'),
        field3: detectorSection4('field6_3'),
      },
      {
        field1: detectorSection4('field7_1'),
        field2: detectorSection4('field7_2'),
        field3: detectorSection4('field7_3'),
      },
    ]

    return (
      <div className="section4">
        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{detectorSection4('th1')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{detectorSection4('th2')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{detectorSection4('th3')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.field1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.field2}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.field3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="link">
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  onClick={onScrollTop}
                  className="rounded-md cursor-pointer bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {detectorSection4('button')}
                </a>
              </div>
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
        {renderSection4()}
        
        <PricingSection plans={props.plans} />
        {renderFooterBanner()}
      </div>
    </>
  )
}