'use client'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Progress } from '@heroui/react'

const SuccessAlert = ({ summary }: { summary: string | undefined }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
      <img src="/translator/right_icon@2x.png" alt="ai-rate-success" className="w-5 h-5" />
      <span className="text-sm text-success">{summary}</span>
    </div>
  )
}

const ErrorAlert = ({ summary }: { summary: string | undefined }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
      <img src="/translator/failed_icon@2x.png" alt="ai-rate-error" className="w-5 h-5" />
      <span className="text-sm text-danger">{summary}</span>
    </div>
  )
}

type ResultType = {
  totalScore: number
  summary: string
  accuracy: number
  readability: number
  grammaticalCorrectness: number
  toneConsistency: number
  culturalAdaptation: number
}

const AiRate = ({ result }: { result: ResultType }) => {
  const t = useTranslations('NewHomeMultilingualTranslation')

  const alert = useMemo(() => {
    if (result?.totalScore >= 6) {
      return <SuccessAlert summary={result?.summary} />
    } else {
      return <ErrorAlert summary={result?.summary} />
    }
  }, [result])

  const LoadingComponent = () => (
    <div className="ai-rate-loading p-4 md:p-6 mt-5 lg:mt-0 bg-[#F3F8FF] rounded-lg lg:rounded-t-none border-default-200">
      <div className="text-center">
        <div className="text-base md:text-lg font-semibold text-foreground mb-2">{t('translate_assess')}</div>
        <div className="text-xs md:text-sm text-default-500 mb-3 md:mb-4">{t('translate_time')}</div>
        <Progress 
          isIndeterminate 
          color="primary" 
          className="w-full"
          classNames={{
            track: "bg-default-100 h-1",
            indicator: "bg-primary h-1"
          }}
        />
      </div>
    </div>
  )

  const ScoreDisplay = ({ score }: { score: number }) => (
    <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto">
      <svg className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-default-200"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
          className="text-success"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl md:text-2xl lg:text-3xl font-bold text-success">{score}</div>
          <div className="text-xs md:text-sm lg:text-base text-default-500">Score</div>
        </div>
      </div>
    </div>
  )

  const MetricItem = ({ icon, label, value }: { icon: string, label: string, value: number }) => (
    <div className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-lg hover:bg-default-50">
      <img src={icon} alt="" className="w-4 h-4 md:w-5 md:h-5" />
      <div className="text-xs md:text-sm text-foreground">
        {label}：<span className="font-medium text-primary">{value}</span>
      </div>
    </div>
  )

  if (!result) {
    return <LoadingComponent />
  }

  return (
    <div className="ai-rate p-4 md:p-6 mt-5 lg:mt-0 bg-[#F3F8FF] rounded-lg lg:rounded-t-none border-default-200">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Score Chart */}
        <div className="flex-shrink-0 flex justify-center lg:justify-start">
          <ScoreDisplay score={result?.totalScore} />
        </div>
        
        {/* Results */}
        <div className="flex-1">
          {alert}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 md:gap-3 mt-4 md:mt-6">
            <MetricItem 
              icon="/translator/icon@2x copy.png" 
              label={t('Accuracy')} 
              value={result?.accuracy || 0} 
            />
            <MetricItem 
              icon="/translator/icon@2x copy 2.png" 
              label={t('Readability')} 
              value={result?.readability || 0} 
            />
            <MetricItem 
              icon="/translator/icon@2x copy 3.png" 
              label={t('Grammatical')} 
              value={result?.grammaticalCorrectness || 0} 
            />
            <MetricItem 
              icon="/translator/icon@2x copy 4.png" 
              label={t('Consistency')} 
              value={result?.toneConsistency || 0} 
            />
            <MetricItem 
              icon="/translator/icon@2x copy 5.png" 
              label={t('Adaptation')} 
              value={result?.culturalAdaptation || 0} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiRate
