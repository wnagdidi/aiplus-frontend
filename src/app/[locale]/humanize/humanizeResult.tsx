'use client'
import {useTranslations} from '@/hooks/useTranslations'
import HumanizeResultHelper from '@/app/[locale]/humanize/humanizeResultHelper'
import HumanizeResultLoader from '@/app/[locale]/humanize/humanizeResultLoader'
import HumanizeResultContent from '@/app/[locale]/humanize/humanizeResultContent'

interface HumanizeResultProps {
  humanizing: boolean
  result?: string
  onRefresh: () => void
  onMoreHumanize: (content: string) => void
}

export default function HumanizeResult({ humanizing, result, onRefresh, onMoreHumanize }: HumanizeResultProps) {
  const t = useTranslations('Humanize')
  const initial = !humanizing && !result
  return (
    <>
      {initial && <HumanizeResultHelper />}
      {humanizing && <HumanizeResultLoader />}
      {result && <HumanizeResultContent result={result} onRefresh={onRefresh} onMoreHumanize={onMoreHumanize} />}
    </>
  )
}
