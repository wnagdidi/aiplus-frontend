'use client'
import PricingSection from '@/app/[locale]/home/pricing'
import { useTranslations } from '@/hooks/useTranslations'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { EventEntry } from '@/context/GTMContext'
import {
  ArrowDownOnSquareIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ScaleIcon,
  StarIcon,
} from '@heroicons/react/24/solid'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Card, CardBody } from '@heroui/react'
import '@/style/swiper.scss'

export default function Index(props: any) {
  const detectorSection1 = useTranslations('Detector.section1')
  const detectorSection2 = useTranslations('Detector.section2')
  const detector = useTranslations('Detector')
  const detectorSection3 = useTranslations('Detector.section3')
  const detectorSection4 = useTranslations('Detector.section4')
  const detectorSection5 = useTranslations('Detector.section5')
  const detectorSection6 = useTranslations('Detector.section6')

  const onScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const LazyVisibleImage = ({
    width,
    height,
    className,
    children,
  }: { width: number; height: number; className?: string; children: React.ReactNode }) => {
    const [visible, setVisible] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
      const el = ref.current
      if (!el) return
      const io = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            setVisible(true)
            io.disconnect()
          }
        },
        { rootMargin: '300px 0px' }
      )
      io.observe(el)
      return () => io.disconnect()
    }, [])
    const paddingTop = `${(height / width) * 100}%`
    return (
      <div ref={ref} className={className}>
        {visible ? (
          children
        ) : (
          <div className="w-full rounded-xl shadow-lg bg-[rgba(55,83,117,0.06)]" style={{ paddingTop }} />
        )}
      </div>
    )
  }

  const renderSection1 = () => {
    return (
      <section className="pb-8 sm:py-8 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{detectorSection1('title')}</h2>
              <p className="text-default-500 mb-6 leading-relaxed">{detectorSection1('content1')}</p>
            </div>
            <div className="order-1 md:order-2"> 
              <LazyVisibleImage width={800} height={600}>
                <Image 
                  src="/newHome/support-almost-all-odels-ai-test.png" 
                  alt="AI Detector" 
                  className="w-full h-auto rounded-xl shadow-lg"
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={false}
                  fetchPriority="low"
                  decoding="async"
                  loading="lazy"
                />
              </LazyVisibleImage>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderSection11 = () => {
    return (
      <section className="pt-0 pb-8 sm:py-8 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{detectorSection2('title')}</h2>
              <p className="text-default-500 leading-relaxed">{detectorSection2('content1')}</p>
            </div>
            <div className="order-1">
              <LazyVisibleImage width={800} height={600}>
                <Image 
                  src="/newHome/support-almost-all-odels-ai-test.png" 
                  alt="Support" 
                  className="w-full h-auto rounded-xl shadow-lg"
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={false}
                  fetchPriority="low"
                  decoding="async"
                  loading="lazy"
                />
              </LazyVisibleImage>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderSection2 = () => {
    const stats = [
      { id: 1, name: detector('trust_by'), value: '234,567'},
      { id: 2, name: detector('recognized_user'), value: '1,235'},
      { id: 2, name: detector('new_user'), value: '876'},
    ]
    return (
      <div className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base/7 text-white">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    )
    // return (
    //   <div className="section2">
    //     <span className="bar">{detector('trust_by')}</span>
    //     <span className="bar">{detector('new_user')}</span>
    //   </div>
    // )
  }

  const renderSection3 = () => {
    const features = [
      {
        title: detectorSection3('one.title'),
        content: detectorSection3('one.content'),
        icon: ArrowDownOnSquareIcon,
        image: '/newHome/high-accuracy-detection.png',
        isPicRight: true
      },
      {
        title: detectorSection3('two.title'),
        content: detectorSection3('two.content'),
        icon: CheckCircleIcon,
        image: '/newHome/support-almost-all-odels-ai-test.png',
        isPicRight: false
      },
      {
        title: detectorSection3('three.title'),
        content: detectorSection3('three.content1'),
        icon: CloudArrowUpIcon,
        image: '/newHome/advanced-detection-dechnology.png',
        isPicRight: true
      },
      {
        title: detectorSection3('four.title'),
        content: detectorSection3('four.content1'),
        icon: ScaleIcon,
        image: '/newHome/highlighted-ai-content.png',
        isPicRight: false
      },
      {
        title: detectorSection3('five.title'),
        content: detectorSection3('five.content'),
        icon: StarIcon,
        image: '/newHome/different-type-and-style-detection-support.png',
        isPicRight: true
      }
    ]

    return (
      <div className="bg-background">
        <div className="px-6 pt-20 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">{detectorSection3('title')}</h2>
            <p className="mt-8 text-lg font-medium text-pretty text-default-500 sm:text-xl">
              {detectorSection3('sub_title')}
            </p>
          </div>
        </div>

        {features.map((feature, index) => (
          <section key={index} className="py-8">
            <div className="max-w-7xl mx-auto px-6">
              <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${feature.isPicRight ? '' : 'md:grid-flow-col-dense'}`}>
                <div className={feature.isPicRight ? '' : 'md:col-start-2'}>
                  <div className="flex items-center mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-2xl sm:text-3xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-default-500 leading-relaxed">{feature.content}</p>
                </div>
                <div className={feature.isPicRight ? '' : 'md:col-start-1'}>
                  <LazyVisibleImage width={590} height={446}>
                    <Image 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-auto rounded-xl shadow-lg"
                      loading="lazy"
                      decoding="async"
                      width={590}
                      height={446}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      fetchPriority="low"
                    />
                  </LazyVisibleImage>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    )
  }

  const renderSection4 = () => {
    const keys = ['one', 'two', 'three', 'four', 'five'] as const
    return (
      <div className="section4">
        <div className="bg-background px-6 py-20 lg:px-8 text-center">
          {/* <div className="mx-auto max-w-2xl text-center"> */}
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">{detectorSection4('title')}</h2>
          {/* </div> */}
        </div>

        <div className="pb-8 relative flex flex-col items-center gap-3 sm:gap-6">
          <div className="mx-auto w-full px-4 sm:max-w-7xl sm:px-6">
            <div className="swiper-wrapper" style={{ overflow: 'visible', minHeight: '400px' }}>
              <Swiper
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                  768: {
                    spaceBetween: 50,
                    slidesPerView: 3
                  }
                }}
                pagination={{ 
                  clickable: true,
                  el: '.swiper-pagination'
                }}
                modules={[Pagination]}
                className="mySwiper"
              >
                {keys.map((key, index) => (
                  <SwiperSlide key={index}>
                    <div className="slide-content rounded-xl p-6 h-full flex flex-col" style={{ backgroundColor: 'rgba(137, 87, 238, 0.1)' }}>
                      <div className="w-full h-48 mb-4 relative overflow-hidden rounded-lg bg-gray-200">
                        <Image 
                          src={`/detector/what-kinds-of-project-0${index}.jpg`} 
                          alt={detectorSection4(`${key}.title`)}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          unoptimized
                          fetchPriority="low"
                          decoding="async"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{detectorSection4(`${key}.title`)}</h3>
                      <div className="des text-default-500 text-sm leading-relaxed flex-1">{detectorSection4(`${key}.content`)}</div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            <div className="swiper-pagination"></div>
          </div>
        </div>
      </div>
    )
  }

  const renderSection6 = () => {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <Image
              src="/newHome/bg-pink.png"
              alt=""
              fill
              priority={false}
              fetchPriority="low"
              sizes="100vw"
              style={{ objectFit: 'cover', zIndex: -1 }}
              loading="lazy"
              unoptimized
              decoding="async"
            />
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance text-[#375375]">
              {detectorSection6('title')}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-default-500">
              {detectorSection6('sub_title')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                onClick={onScrollTop}
                className="bg-indigo-600 text-white hover:bg-indigo-500"
                size="lg"
              >
                {detectorSection6('button')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="ai-introduction">
      {renderSection1()}
      {renderSection11()}
      {renderSection2()}
      {renderSection3()}
      {renderSection4()}
      <PricingSection plans={props.plans} />
      {renderSection6()}
    </div>
  )
}
