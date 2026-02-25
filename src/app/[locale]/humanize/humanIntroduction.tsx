'use client'
import NewFaqs from '@/app/[locale]/components/newFaqs'
import NewsLetter from '@/app/[locale]/components/newsLetter'
import PicAndDes from '@/app/[locale]/components/picAndDescription'
import PricingSection from '@/app/[locale]/home/pricing'
import { EventEntry } from '@/context/GTMContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { useTranslations } from '@/hooks/useTranslations'
import { Locale } from '@/i18n.config'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react'
import { useLocale } from 'next-intl'
import Image from 'next/image'

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
      <div className="section1 pt-12 pb-4">
        <PicAndDes
          title={detectorSection1('title1')}
          sub={detectorSection1('sub_title1')}
          weight={'h2'}
          features={[]}
          imgUrl={`/newHome/converter-section1-01.png`}
          imgProps={{ loading: 'lazy', decoding: 'async',width: '590',height: '446' }}
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
          imgProps={{ loading: 'lazy', decoding: 'async',width: '590',height: '446' }}
          imgUrl={`/newHome/converter-section1-02.png`}
        />
      </div>
    )
  }

  const renderCard = (name: string, des: string, imgSrc: string) => {
    return (
      <div className="relative lg:col-span-1">
        <div className="absolute inset-px rounded-lg bg-[var(--card-bg)]" />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
          <Image
            alt=""
            src={imgSrc}
            width={550}
            height={300}
            loading="lazy"
            priority={false}
            fetchPriority="low"
            decoding="async"
            className="h-80 object-cover"
            unoptimized
          />
          <div className="p-10 pt-4">
            <p className="mt-2 text-lg font-medium tracking-tight text-foreground">{name}</p>
            <p className="mt-2 max-w-lg text-sm/6 text-default-500">{des}</p>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-default-200/50" />
      </div>
    )
  }

  const renderSection2 = () => {
    return (
      <div className="section2">
        <div className="bg-background py-10">
          <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-pretty text-foreground text-center">
              {detectorSection2('title')}
            </h2>
            <div className="sub-title mx-auto max-w-2xl mt-6 text-lg/8 text-default-500 text-center">
              {detectorSection2('sub_title')}
            </div>
            <div className="mt-10 lg:ml-20 lg:mr-20 grid grid-cols-1 gap-[20px] lg:gap-[100px] sm:mt-16 lg:grid-cols-2 lg:grid-rows-2">
              {renderCard(
                detectorSection2('list.one.name'),
                detectorSection2('list.one.des'),
                '/newHome/Students1-1.png',
              )}
              {renderCard(
                detectorSection2('list.two.name'),
                detectorSection2('list.two.des'),
                '/newHome/Copywriters.png',
              )}
              {renderCard(
                detectorSection2('list.three.name'),
                detectorSection2('list.three.des'),
                '/newHome/SEOProfessionals.png',
              )}
              {renderCard(
                detectorSection2('list.four.name'),
                detectorSection2('list.four.des'),
                '/newHome/WritingAgency.png',
              )}
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
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8 py-10">
          <h2 className="mt-2 mb-8 text-3xl sm:text-4xl font-semibold tracking-tight text-pretty text-foreground text-center">
            {detectorSection3('title')}
          </h2>
          <div className="list">
            <div className="divide-y divide-default-200 overflow-hidden rounded-lg bg-default-100 shadow-sm sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
              {actions.map((action) => (
                <div
                  key={action.title}
                  className="group relative bg-background p-6 focus-within:ring-2 focus-within:ring-primary focus-within:ring-inset"
                >
                  <div className="mt-8">
                    <h3 className="text-base font-semibold text-foreground">
                      <a className="focus:outline-hidden">
                        {/* Extend touch target to entire panel */}
                        <span aria-hidden="true" className="absolute inset-0" />
                        {action.title}
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-default-500">{action.des}</p>
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
        <div className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
            <Table aria-label="simple table" className="min-w-[650px]">
              <TableHeader>
                <TableColumn className="bg-foreground text-background">{detectorSection4('th1')}</TableColumn>
                <TableColumn className="bg-foreground text-background">{detectorSection4('th2')}</TableColumn>
                <TableColumn className="bg-foreground text-background">{detectorSection4('th3')}</TableColumn>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.field1}</TableCell>
                    <TableCell>{row.field2}</TableCell>
                    <TableCell>{row.field3}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="link">
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  onClick={onScrollTop}
                  className="rounded-md cursor-pointer bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
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
          onScrollTop()
          // openDialogIfLogged(EventEntry.GeneralRecommendCTA)
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
        {renderFooterBanner()}
      </div>
    </>
  )
}
