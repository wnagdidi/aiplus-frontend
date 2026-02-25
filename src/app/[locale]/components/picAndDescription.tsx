'use client'
import { Button } from '@heroui/react'
import Image from 'next/image'
import { hoverBackgroundGradient, hoverTextColor } from '@/theme'

interface PicAndDesProps {
  title: string
  sub: string
  weight?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  features?: string[]
  imgUrl?: string
  imgStyle?: React.CSSProperties
  isPicRight?: boolean
  linkText?: string
  imgProps?: any
  buttonCallback?: () => void
}

export default function PicAndDes({
  title,
  sub,
  weight = 'h2',
  features = [],
  imgUrl,
  imgStyle = {},
  isPicRight = true,
  linkText,
  buttonCallback,
  imgProps= {}
}: PicAndDesProps) {
  const TitleTag = weight

  return (
    <div className="p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl ring-1 ring-default-200/20 md:p-10" style={{backgroundColor: 'var(--card-bg)'}}>
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isPicRight ? '' : 'lg:grid-flow-col-dense'}`}>
          {/* Text Content */}
          <div className={isPicRight ? '' : 'lg:col-start-2'}>
            <TitleTag className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {title}
            </TitleTag>
            <p className="text-lg text-default-500 mb-6 leading-relaxed">
              {sub}
            </p>
            
            {features.length > 0 && (
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="text-default-600">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {linkText && buttonCallback && (
              <Button
                onClick={buttonCallback}
                className="rounded-sm text-white px-6 py-3 transition-colors"
                style={{
                  background: hoverBackgroundGradient
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dbdfe6'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = hoverBackgroundGradient
                  e.currentTarget.style.color = '#fff'
                }}
                size="md"
              >
                {linkText}
              </Button>
            )}
          </div>

          {/* Image Content */}
          <div className={isPicRight ? '' : 'lg:col-start-1'}>
            {imgUrl && (
              <div className="relative">
                <Image
                  src={imgUrl}
                  alt={(imgProps as any).alt || ''}
                  width={(imgProps as any).width || 912}
                  height={(imgProps as any).height || 600}
                  loading={(imgProps as any).loading || 'lazy'}
                  priority={false}
                  fetchPriority={(imgProps as any).fetchpriority || 'low'}
                  decoding="async"
                  className="w-full h-auto rounded-lg shadow-lg"
                  style={imgStyle}
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
