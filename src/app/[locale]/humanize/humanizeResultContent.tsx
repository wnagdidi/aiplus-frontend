'use client'
import { useTranslations } from '@/hooks/useTranslations'
import { helperContainerStyle } from '@/app/[locale]/home/styles'
import { useSnackbar } from '@/context/SnackbarContext'
import { useGTM } from '@/context/GTMContext'
import * as React from 'react'
import HumanizeResultRating from '@/app/[locale]/humanize/humanizeResultRating'
import { isMobile } from '@/util/browser'
import GobackIcon from '@/components/GobackIcon'
import CopyIcon from '@/components/CopyIcon'
import { Button as HButton } from '@heroui/react'

// 改为 HeroUI + 原生 HTML/Tailwind
const Button = ({ startIcon, onClick, children, ...rest }: any) => (
  <HButton startContent={startIcon} onPress={onClick} {...rest}>{children}</HButton>
)
const LoadingButton = ({ startIcon, loading, onClick, children, ...rest }: any) => (
  <HButton isLoading={!!loading} startContent={startIcon} onPress={onClick} {...rest}>{children}</HButton>
)

interface HumanizeResultContentProps {
  result: string
  onRefresh: () => void
  onMoreHumanize: (content: string) => void
}
export default function HumanizeResultContent({ result, onRefresh, onMoreHumanize }: HumanizeResultContentProps) {
  const t = useTranslations('Humanize')
  const { showSnackbar } = useSnackbar();
  const { sendEvent , reportEvent } = useGTM()

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(result)
      reportEvent('ClickCopy', {})
      showSnackbar(t('copied_result'))
      sendEvent('humanize_copy_result')

    } catch (err: any) {
      showSnackbar('Failed to copy text: ' + err.message, 'error')
      console.error('Failed to copy text: ', err)
    }
  }

/*   const handleRefresh = () => {
    sendEvent('restart_humanize')
    reportEvent('ClickHumanizeMore', {})
    onRefresh()
  } */

  const handleMoreHumanize = () => {
    sessionStorage.setItem('HUMANIZE_BTN', 'MORE_HUMANIZE')
    reportEvent('ClickHumanizeMore', {})
    onMoreHumanize(result)
  }

  return (
    <div className="w-full h-full relative" style={{ height: 488 }}>
      <div className="h-full flex flex-col">
        <textarea
          value={result}
          readOnly
          style={{
            resize: 'none',
            padding: '16px',
            width: '100%',
            height: '100%',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '24px',
            textAlign: 'start',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            flex: 1,
          }}
        />
        <div className="flex px-2 mt-2 mb-4 gap-1 items-center">
          <div className={`flex gap-2 items-center w-full justify-end`}>
            <Button
              startContent={
                <CopyIcon
                  className="text-[#914BEC] text-[15px]"
                />
              }
              onPress={handleCopyContent}
              className="h-9 px-4 font-bold bg-gradient-to-r from-[#914BEC26] to-[#507AF626] hover:from-[rgb(145,75,236,0.3)] hover:to-[rgb(80,122,246,0.3)] rounded-md"
            >
              <span className="font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #914BEC, #507AF6)' }}>
                {t('copy').toUpperCase()}
              </span>
            </Button>
            <LoadingButton
              startContent={
                <GobackIcon
                  className="text-[#914BEC] text-[15px]"
                />
              }
              onPress={handleMoreHumanize}
              isLoading={false}
              className="w-[209px] h-9 font-bold bg-gradient-to-r from-[#914BEC26] to-[#507AF626] hover:from-[rgb(145,75,236,0.3)] hover:to-[rgb(80,122,246,0.3)] rounded-md"
            >
              <span className="font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #914BEC, #507AF6)' }}>
                {t('more_humanized').toUpperCase()}
              </span>
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  )
}
