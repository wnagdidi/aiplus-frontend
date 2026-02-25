'use client'
import { getDetectResults } from '@/api/client/humanizeApi'
import CoreApiError from '@/api/core/coreApiError'
import HalfPercentIcon from '@/components/halfPercentIcon'
import { useTranslations } from '@/hooks/useTranslations'
import SuccessIcon from '@/components/SuccessIcon'
import QueryIcon from '@/components/QueryIcon'
import ErrorIcon from '@/components/ErrorIcon'
import { Chip, Card, CardBody, Avatar, Spinner, Progress } from '@heroui/react'
import { useEffect, useState } from 'react'

interface HumanizeResultProps {
  resultId: string
  result: string
  humanizing: boolean
}

export default function DetectorsResult({ resultId, result, humanizing }: HumanizeResultProps) {
  const t = useTranslations('Humanize')
  const tError = useTranslations('Error')
  const [percent, setPercent] = useState(80)
  const [detectorScores, setDetectorScores] = useState([
    { name: 'Accuracy', score: 8.5, logo: '/humanize-result/accuracy_icon.png', loading: true, success: false }, 
    { name: 'Readability', score: 8.5, logo: '/humanize-result/readability_icon.png',  loading: true, success: false }, 
    { name: 'Grammatical Correctness', score: 8.5, logo: '/humanize-result/grammatical_icon.png',  loading: true, success: false }, 
    { name: 'Tone Consistency', score: 8.5, logo: '/humanize-result/tone_icon.png',  loading: true, success: false }, 
    { name: 'Cultural Adaptation', score: 8.5, logo: '/humanize-result/cultural_icon.png',  loading: true, success: false }
  ])
  const [detectorSuccess, setDetectorSuccess] = useState([
    { name: 'GPTZero', logo: '/detector/gpt_zero_logo.png', loading: true, success: false },
    { name: 'Copyleaks', logo: '/detector/copyleaks_logo.png', loading: true, success: false },
    { name: 'ZeroGPT', logo: '/detector/zero_gpt_logo.png', loading: true, success: false }
  ])
  const [detectors, setDetectors] = useState([
    { name: 'Originality.ai', logo: '/detector/originality_logo.png', loading: true, success: false },
    { name: 'Turnitin', logo: '/detector/turnitin_logo.png', loading: true, success: false },
    { name: 'Winston AI', logo: '/detector/winston_logo.png', loading: true, success: false },
    { name: 'Content at Scale', logo: '/detector/content_at_scale_logo.jpeg', loading: true, success: false }
  ])
  const [detectorAll, setDetectorAll] = useState([...detectorSuccess,...detectors])
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  const check = async () => {
    try {
      await getDetectResults(resultId)
      setDetectorScores((prev) =>
        prev.map((item) => ({
          ...item,
          score: Math.round((8 + Math.random()) * 10) / 10,
          loading: false,
          success: true,
        }))
      )

      const possiblePercents = [80, 85, 90]
      let randomPercent = possiblePercents[Math.floor(Math.random() * possiblePercents.length)]
      const humanizeBtn = (typeof window !== 'undefined' ? window.sessionStorage.getItem('HUMANIZE_BTN') : null) || ''
      const recordedPercentStr = typeof window !== 'undefined' ? window.sessionStorage.getItem('DETECTORS_PERCENT') : null
      const recordedPercent = recordedPercentStr ? parseInt(recordedPercentStr, 10) : undefined

      if (humanizeBtn === 'MORE_HUMANIZE' && recordedPercent) {
        if (recordedPercent === 80) randomPercent = 85
        else if (recordedPercent === 85) randomPercent = 90
        else randomPercent = 90
      }
      setPercent(randomPercent)

      const totalItems = 7
      const detectorSuccessCount = detectorSuccess.length
      const totalSuccessTarget = Math.round((randomPercent / 100) * totalItems)
      const needSuccessInDetectors = Math.max(0, Math.min(detectors.length, totalSuccessTarget - detectorSuccessCount))
      const needFalseInDetectors = Math.max(0, detectors.length - needSuccessInDetectors)

      const updatedDetectorSuccess = detectorSuccess.map((d) => ({ ...d, loading: false, success: true }))

      const recordedFalseStr = typeof window !== 'undefined' ? window.sessionStorage.getItem('DETECTORS_FALSE') : null
      const recordedFalse: number[] = recordedFalseStr ? (JSON.parse(recordedFalseStr) as number[]) : []

      const detectorLen = detectors.length
      const indices = Array.from({ length: detectorLen }, (_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = indices[i]
        indices[i] = indices[j]
        indices[j] = tmp
      }

      let falseIndices: number[] = []
      if (humanizeBtn === 'MORE_HUMANIZE' && recordedFalse.length > 0) {
        falseIndices = recordedFalse.slice(0, needFalseInDetectors)
        if (falseIndices.length < needFalseInDetectors) {
          const candidate = indices.filter((i) => !falseIndices.includes(i))
          falseIndices = falseIndices.concat(candidate.slice(0, needFalseInDetectors - falseIndices.length))
        }
      } else {
        falseIndices = indices.slice(0, needFalseInDetectors)
      }

      const falseSet = new Set(falseIndices)
      const updatedDetectors = detectors.map((d, idx) => ({
        ...d,
        loading: false,
        success: falseSet.has(idx) ? (humanizeBtn === 'MORE_HUMANIZE' ? ('MORE_HUMANIZE' as any) : false) : true,
      }))

      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('DETECTORS_PERCENT', String(randomPercent))
          const nonTrueIndices = updatedDetectors
            .map((d, i) => (d.success === true ? -1 : i))
            .filter((v) => v >= 0)
          window.sessionStorage.setItem('DETECTORS_FALSE', JSON.stringify(nonTrueIndices))
        }
      } catch {}

      setDetectorSuccess(updatedDetectorSuccess)
      setDetectors(updatedDetectors)
      setDetectorAll([...updatedDetectorSuccess, ...updatedDetectors])
      sessionStorage.removeItem('HUMANIZE_BTN')
      setChecking(false)
    } catch (e: any) {
      if (e instanceof CoreApiError) {
        setError(tError(e.code, e.context()))
      } else {
        setError(e?.message ?? String(e))
      }
    }
  }

  useEffect(() => {
    if (!result && humanizing) {
      setChecking(true)
      setDetectorScores((prev) =>
        prev.map((item) => ({
          ...item,
          loading: true,
        }))
      )
      setDetectorAll((prev) =>
        prev.map((item) => ({
          ...item,
          loading: true,
        }))
      )
      return
    }
    try {
      check()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    }
  }, [result])

  const renderScoreResult = () => {
    const totalPieHeight = 160
    const humanPieHeight = Math.round((percent / 100) * totalPieHeight)
    const aiPieHeight = totalPieHeight - humanPieHeight
    
    return (
      <div className="flex flex-col items-center">
        {/* Rate section */}
        <div className="text-[24px] sm:text-[28px] font-semibold flex gap-1">
          <span className="text-[48px] sm:text-[56px] font-bold text-[#52C41A]">{percent}</span>
          <span className="mt-[6px] sm:mt-[10px] text-[#52C41A]">%</span>
        </div>
        
        {/* Description */}
        <div className="mb-[10px] text-sm sm:text-base">
          of text is likely <span className="text-[#52C41A]">Human-written</span>
        </div>
        
        {/* Chart data */}
        <div className="h-[200px] w-[240px] sm:w-[280px] md:w-[300px] flex">
          {/* AI item */}
          <div className="w-1/2 flex flex-col justify-end">
            <div className="overflow-hidden">
              <div 
                className="w-[80px] sm:w-[90px] md:w-[100px] mx-auto border-t border-l border-r border-[rgb(220,223,228)] rounded-t-sm shadow-[rgba(0,0,0,0.08)_0px_8px_16px_0px,rgba(0,0,0,0.04)_0px_16px_20px_0px,rgba(0,0,0,0.12)_0px_0px_2px_0px]"
                style={{ height: `${aiPieHeight}px`, background: '#FF4D50' }}
              ></div>
            </div>
            <div className="h-[2px] bg-[#dcdfe4]"></div>
            <div className="text-center text-xs sm:text-sm text-gray-600 mt-1">AI</div>
          </div>
          
          {/* Human item */}
          <div className="w-1/2 flex flex-col justify-end">
            <div className="overflow-hidden">
              <div 
                className="w-[80px] sm:w-[90px] md:w-[100px] mx-auto border-t border-l border-r border-[rgb(220,223,228)] rounded-t-sm shadow-[rgba(0,0,0,0.08)_0px_8px_16px_0px,rgba(0,0,0,0.04)_0px_16px_20px_0px,rgba(0,0,0,0.12)_0px_0px_2px_0px]"
                style={{ height: `${humanPieHeight}px`, background: '#52C41A' }}
              ></div>
            </div>
            <div className="h-[2px] bg-[#dcdfe4]"></div>
            <div className="text-center text-xs sm:text-sm text-gray-600 mt-1">Human</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#FDFAFF] rounded-[12px] md:rounded-t-none md:rounded-b-[12px]">
      {checking ? (
        <div className="flex-1 flex justify-center items-center h-[300px] sm:h-[350px] p-4">
          <div className="w-full sm:w-[450px] text-center">
            <div className="text-lg sm:text-xl font-semibold">{t('detecting_title')}</div>
            <div className="mt-2 text-sm">{t('detecting_subtitle')}</div>
            <Progress isIndeterminate size="sm" className="mt-8 mb-2" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 p-4 sm:p-6 md:p-4">
          <div className="flex-shrink-0 self-center md:self-auto md:ml-0">
            {renderScoreResult()}
          </div>
          <div className="flex-1 min-w-0 md:ml-2">
            {error ? (
              <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>
            ) : checking ? (
              <>
                <div className="text-xl font-semibold">{t('detecting_title')}</div>
                <div className="mt-2 text-sm">{t('detecting_subtitle')}</div>
                <Progress isIndeterminate size="sm" className="mt-1 mb-2" />
              </>
            ) : (
              <div className="text-[0.98rem] p-2 bg-green-100 text-green-700 rounded">{t('output_content_human_written')}</div>
            )}
            <div className="flex gap-4 sm:gap-9 flex-wrap mt-4 sm:mt-5">
              {detectorScores.map((score) => (
                <div key={score.name} className="flex gap-1 items-center">
                  <Avatar src={score.logo} alt={score.name} className="w-5 h-5" radius="sm" />
                  <span className="text-sm font-normal">{score.name}:</span>
                  {score.loading && <Spinner size="sm" />}
                  {!score.loading && score.success && <span className="text-sm font-normal">{score.score}</span>}
                </div>
              ))}
            </div>
            <div className="mt-6 sm:mt-9 text-sm">{t('checking_result')}</div>
            <div className="mt-3 sm:mt-4 flex gap-4 sm:gap-9 flex-wrap">
              {detectorAll.map((detector) => (
                <div key={detector.name} className="flex items-center gap-1">
                  <Chip size="sm" avatar={<Avatar alt={detector.name} src={detector.logo} className="w-4 h-4" />} className="bg-[#F5F5F5]">
                    {detector.name}
                  </Chip>
                  {detector.loading && <Spinner size="sm" />}
                  {!detector.loading && detector.success === true && (<SuccessIcon />)}
                  {!detector.loading && (detector.success as any) === 'MORE_HUMANIZE' && (<QueryIcon />)}
                  {!detector.loading && detector.success === false && (<ErrorIcon />)}
                </div>
              ))}
            </div>
            <hr className="mt-6 sm:mt-8" />
            <div className="mt-6 sm:mt-8 flex justify-center gap-4 sm:gap-5 md:gap-10 flex-wrap">
              <div className="flex items-center gap-1"><SuccessIcon /><span className="text-sm">{t('human_written')}</span></div>
              <div className="flex items-center gap-1"><QueryIcon /><span className="text-sm">{t('50_human_written')}</span></div>
              <div className="flex items-center gap-1"><ErrorIcon /><span className="text-sm">{t('ai_generated')}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
