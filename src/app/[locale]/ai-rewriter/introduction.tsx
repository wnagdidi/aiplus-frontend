'use client'
import NewFaqs from '@/app/[locale]/components/newFaqs'
import NewsLetter from '@/app/[locale]/components/newsLetter'
import PicAndDes from '@/app/[locale]/components/picAndDescription'
import PricingSection from '@/app/[locale]/home/pricing'
import { EventEntry } from '@/context/GTMContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { useTranslations } from '@/hooks/useTranslations'

export default function Index(props: any) {
  const { openDialogIfLogged } = usePricingDialog()
  const detectorSection1 = useTranslations('Rewriter.section1')
  const detectorSection2 = useTranslations('Rewriter.section2')
  const detectorSection3 = useTranslations('Rewriter.section3')
  const detectorSection4 = useTranslations('Rewriter.section4')
  const detectorSection5 = useTranslations('Rewriter.section5')
  const detectorSection6 = useTranslations('Rewriter.section6')
  const faqListLang = useTranslations('Rewriter.section6.faqList')
  const faqs = new Array(7).fill({}).map((item, index) => ({
    id: index,
    question: faqListLang(`q${index + 1}`),
    answer: faqListLang(`a${index + 1}`),
  }))

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
          imgUrl={`/newHome/rewriter-seciton1.png`}
        />
      </div>
    )
  }

  const renderSection2 = () => {
    const actions = [
      {
        title: detectorSection2('title1'),
        des: detectorSection2('des1'),
      },
      {
        title: detectorSection2('title2'),
        des: detectorSection2('des2'),
      },
      {
        title: detectorSection2('title3'),
        des: detectorSection2('des3'),
      },
      {
        title: detectorSection2('title4'),
        des: detectorSection2('des4'),
      },
    ]
    return (
      <div className="section2 bg-white py-24 sm:py-32 section3">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <p className="mt-2 mb-8 text-4xl font-semibold tracking-tight text-pretty text-gray-950 sm:text-5xl text-center">
            {detectorSection2('title')}
          </p>
          <div className="sub-title mx-auto max-w-2xl mt-6 text-lg/8 text-gray-600 text-center">
            {detectorSection2('sub_title')}
          </div>
          <div className="list mt-8">
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
                    <p className="mt-2 text-sm text-gray-500">{action.des}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="link">
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                onClick={onScrollTop}
                className="rounded-md cursor-pointer bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {detectorSection2('button')}
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSection3 = () => {
    return (
      <div className="section3">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-950 sm:text-5xl text-center">
            {detectorSection3('title')}
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
            <div className="relative lg:col-span-3">
              <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] lg:rounded-tl-[calc(2rem+1px)]">
                <img alt="" src="/newHome/Students.png" className="h-80 object-cover object-left" />
                <div className="p-10 pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    {detectorSection3('list.one.name')}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{detectorSection3('list.one.des')}</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]" />
            </div>
            <div className="relative lg:col-span-3">
              <div className="absolute inset-px rounded-lg bg-white lg:rounded-tr-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-tr-[calc(2rem+1px)]">
                <img
                  alt=""
                  src="/newHome/Professionals.png"
                  className="h-80 object-cover object-left lg:object-right"
                />
                <div className="p-10 pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    {detectorSection3('list.two.name')}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{detectorSection3('list.two.des')}</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 lg:rounded-tr-[2rem]" />
            </div>
            <div className="relative lg:col-span-2">
              <div className="absolute inset-px rounded-lg bg-white lg:rounded-bl-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-bl-[calc(2rem+1px)]">
                <img alt="" src="/newHome/ContentCreators.png" className="h-80 object-cover object-left" />
                <div className="p-10 pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    {detectorSection3('list.three.name')}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{detectorSection3('list.three.des')}</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 lg:rounded-bl-[2rem]" />
            </div>
            <div className="relative lg:col-span-2">
              <div className="absolute inset-px rounded-lg bg-white" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
                <img alt="" src="/newHome/Marketers.png" className="h-80 object-cover" />
                <div className="p-10 pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    {detectorSection3('list.four.name')}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{detectorSection3('list.four.des')}</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5" />
            </div>
            <div className="relative lg:col-span-2">
              <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-br-[calc(2rem+1px)]">
                <img alt="" src="/newHome/LanguageLearners.png" className="h-80 object-cover" />
                <div className="p-10 pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    {detectorSection3('list.five.name')}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">{detectorSection3('list.five.des')}</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSection4 = () => {
    const stats = [
      { id: 1, name: detectorSection4('name1'), value: detectorSection4('value1') },
      { id: 2, name: detectorSection4('name2'), value: detectorSection4('value2') },
      { id: 3, name: detectorSection4('name3'), value: detectorSection4('value3') },
      { id: 4, name: detectorSection4('name4'), value: detectorSection4('value4') },
      { id: 5, name: detectorSection4('name5'), value: detectorSection4('value5') },
      { id: 6, name: detectorSection4('name6'), value: detectorSection4('value6') },
      { id: 7, name: detectorSection4('name1'), value: detectorSection4('value7') },
    ]
    return (
      <div className="section4 sm:py-32">
        <div className="relative bg-white">
          <img
            alt=""
            src="/newHome/rewriter-seciton4.png"
            className="h-56 w-full bg-gray-50 object-cover lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2"
          />
          <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
            <div className="px-6 pt-16 pb-24 sm:pt-20 sm:pb-32 lg:col-start-2 lg:px-8 lg:pt-32">
              <div className="mx-auto max-w-2xl lg:mr-0 lg:max-w-lg">
                <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                  {detectorSection4('title')}
                </p>
                <dl className="mt-16 grid max-w-xl grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 xl:mt-16">
                  {stats.map((stat) => (
                    <div key={stat.id} className="flex flex-col gap-y-3 border-l border-gray-900/10 pl-6">
                      <dt className="text-sm/6 text-gray-600">{stat.name}</dt>
                      <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
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
        title={detectorSection5('title')}
        subTitle={detectorSection5('sub_title')}
        buttonText={detectorSection5('button_text')}
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
        <NewFaqs title={detectorSection6('title')} faqs={faqs} />
        {renderFooterBanner()}
      </div>
    </>
  )
}
