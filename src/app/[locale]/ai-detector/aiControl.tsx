import { getHumanScore, scoreSample } from '@/api/client/humanizeApi'
import ExceedsWordLimitDialog from '@/app/[locale]/humanize/exceedsWordLimitDialog'
import MonthlyUsage from '@/app/[locale]/humanize/monthlyUsage'
import UsageTips from '@/app/[locale]/usageTips'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'
import { EventEntry, useGTM } from '@/context/GTMContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { useTranslations } from '@/hooks/useTranslations'
import { wordsCounter } from '@/util/humanize'
import { AnalyticsEventType } from '@/utils/events/analytics'
import { CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Chip, Progress, Card, CardBody, Avatar, Button, CircularProgress } from '@heroui/react'
import { franc } from 'franc-min'
import { useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import HumanizeInput from '../humanize/humanizeInput'

type SimpleType = {
  value: string
  words: string
}

// const SimpleList = [
//   {
//     value: 'ChatGPT',
//     words:
//       'In the quiet town of Willow Creek, nestled amidst the rolling hills and whispering forests, a mysterious figure roams the streets at midnight. With a cloak as black as the night sky and eyes that gleam like silver in the moonlight, this enigmatic wanderer is known only as the Shadow Walker. Some say they are a spirit of vengeance, others a guardian angel watching over the townsfolk. Whispers of their presence spread like wildfire, igniting hope and fear in equal measure. As the nights grow longer and the shadows deepen, the legend of the Shadow Walker continues to grow, shrouded in secrets and mystery.',
//   },
//   {
//     value: 'Human',
//     words:
//       'TikTok has permanently changed content creation as well as consumption. A filed of creativity from a house, a unique storyteller and an influencer displaying the latest trendsearch could be accessed by an algorithmic model. The content varies from dance challenges to comedy skits, educational insights or even those heart-felt moments. And TikTok is that platform where common people can turn into trending sensations overnight and all of a sudden have sway. With the capture of millions around the world, TikTok combines both entertainment and mutual understanding between cultures and generations, creating a lively and vibrant community.',
//   },
//   {
//     value: 'AI+Human',
//     words:
//       'NVIDIA, are among the leading graphics processing technology companies in the world who have redefined computing solutions. These are the chips that power everything from AI to self-driving cars and not just in high-end gaming. NVIDIA Innovations in Transformation, Included Collaborative 3D design using Omniverse and Accelerated Computing with CUDA-enabled Applications This allows for faster simulations and better visualizations processed on smarter algorithms to greatly reduced the time it takes to achieve more complex tasks. From advancements in AI to breakthroughs in autonomous vehicles, NVIDIA is leading the way forward.',
//   },
// ]

enum EnumState {
  Default = 'default',
  Loading = 'loading',
  Done = 'done',
}
const MaxWords = 300
const MinWords = 50
export default function Index() {
  const [inputWords, setInputWords] = useState('')
  const [currentSimple, setCurrentSimple] = useState('')
  const [currentState, setCurrentState] = useState(EnumState.Default)
  const [detectors, setDetectors] = useState([
    { name: 'GPTZero', logo: '/detector/gpt_zero_logo.png', loading: true, success: false },
    { name: 'Originality.ai', logo: '/detector/originality_logo.png', loading: true, success: false },
    { name: 'ZeroGPT', logo: '/detector/zero_gpt_logo.png', loading: true, success: false },
    { name: 'Turnitin', logo: '/detector/turnitin_logo.png', loading: true, success: false },
    { name: 'Winston AI', logo: '/detector/winston_logo.png', loading: true, success: false },
    { name: 'Content at Scale', logo: '/detector/content_at_scale_logo.jpeg', loading: true, success: false },
    { name: 'Copyleaks', logo: '/detector/copyleaks_logo.png', loading: true, success: false },
  ])
  const [detectors2, setDetectors2] = useState([
    { name: 'Human-written', loading: true, success: false },
    { name: 'Human-written', loading: true, success: false },
    { name: 'AI-generated', loading: true, success: false },
  ])
  const [scoreData, setScoreData] = useState({
    humanScore: '',
    aiscore: '',
  })
  const locale = useLocale()
  const { subscription, isUnlimited } = useActiveSubscription()
  const limitWordsCount = subscription ? subscription?.wordsLimitOneTimes : MaxWords
  const [showAlert, setShowAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isChange, setIsChange] = useState(1)
  const t = useTranslations('Humanize')
  const { sendEvent, reportEvent } = useGTM() // 获取GTM事件发送函数
  const { data: session } = useSession()
  const [exceedsWordsMonthlyLimitDialogOpen, setExceedsWordsMonthlyLimitDialogOpen] = useState(false) // 月度字数限制对话框
  const { openDialogIfLogged } = usePricingDialog()

  const [SimpleList, setSimpleList] = useState<SimpleType[]>([])

  const onSelectItem = (item) => {
    setCurrentSimple(item.value)
    onHandleChangeInput(item.words)
  }

  const onClear = () => {
    setInputWords('')
  }

  const getCount = (value: string) => {
    return wordsCounter(value)
  }

  const wordsCount = wordsCounter(inputWords)

  const getResult = async () => {
    const payload = {
      content: inputWords,
      language: locale,
    }
    const res: any = await getHumanScore(payload)
    return res
  }

  const pieHeight = useMemo(() => {
    if (scoreData) {
      const _humanS = (Number.parseFloat(scoreData.humanScore) * 100).toFixed() as unknown as number
      const _aiS = (Number.parseFloat(scoreData.aiscore) * 100).toFixed() as unknown as number
      if (_humanS > _aiS) {
        return {
          human: 160,
          ai: (_aiS / _humanS) * 160,
        }
      } else {
        return {
          ai: 160,
          human: (_humanS / _aiS) * 160,
        }
      }
    }
    return {
      human: 0,
      ai: 0,
    }
  }, [scoreData])

  const onCheck = async () => {
    if (currentState === EnumState.Loading || !inputWords.length) {
      return false
    }
    const values = SimpleList.map((item) => item.words)
    const isSample = values.includes(inputWords)

    // 字数检查
    const min_msg = t('less_than_min_words', { minWords: MinWords })
    console.log(inputWords, MinWords, '=====')
    if (getCount(inputWords) < MinWords) {
      setErrorMsg(min_msg)
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 6000)
      return
    }
    reportEvent(AnalyticsEventType.CLICK_DETECTOR, {
      custom_data: {
        currency: 'USD',
        value: 1,
        wordsCount: wordsCounter(inputWords),
        language: franc(inputWords),
      },
    })

    // 检查是否超出月度字数限制
    const exceedWordsLimit = wordsCount + (subscription?.currentMonthUsage || 0) > subscription?.wordsLimitTotal

    if (session && !isSample && exceedWordsLimit && subscription?.isFree) {
      setExceedsWordsMonthlyLimitDialogOpen(true)
      return
    }

    if (!isUnlimited && !isSample && !subscription?.isFree && exceedWordsLimit) {
      setExceedsWordsMonthlyLimitDialogOpen(true)
      return
    }
    if (session && !isUnlimited && !subscription?.isFree && exceedWordsLimit) {
      setExceedsWordsMonthlyLimitDialogOpen(true)
      return
    }

    // 防止访客一直刷
    if (!session && !isSample) {
      openDialogIfLogged(EventEntry.GeneralRecommendCTA)
      return
    }

    setCurrentState(EnumState.Loading)
    setDetectors(detectors.map((detector) => Object.assign(detector, { loading: true, success: true })))
    setDetectors2(detectors2.map((detector) => Object.assign(detector, { loading: true, success: true })))
    const res = await getResult()
    // 如果试用结束，提示升级
    // if (res.message === '') {
    //   setTrialVisible(true)
    // }
    if (res.data) {
      reportEvent(AnalyticsEventType.DETECTOR_SUCCESS, {
        custom_data: {
          currency: 'USD',
          value: 1,
          wordsCount: wordsCounter(inputWords),
          language: franc(inputWords),
        },
      })
      setScoreData(res.data)
      setIsChange((pre) => ++pre)
    } else {
      reportEvent(AnalyticsEventType.DETECTOR_FAILED, {
        custom_data: {
          currency: 'USD',
          value: 1,
          wordsCount: wordsCounter(inputWords),
          language: franc(inputWords),
          reason: res?.message || '',
          requestID: res?.requestID || '',
        },
      })
      setErrorMsg(res.message)
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 6000)
    }
    const _detectors2 = [...detectors2]
    _detectors2.map((detector) => Object.assign(detector, { loading: false, success: true }))
    _detectors2[2].success = false
    setDetectors2(_detectors2)
    setDetectors(detectors.map((detector) => Object.assign(detector, { loading: false, success: true })))
    setCurrentState(EnumState.Done)
  }

  const detectorToolLang = useTranslations('Detector.tool')
  const tBilling = useTranslations('Billing')

  const getRootPath = () => {
    return locale === 'en' ? '/' : `/${locale}`
  }

  const onHandleChangeInput = (words: string) => {
    // if (limitWordsCount !== 0 && getCount(words) > limitWordsCount) {
    //   const max_msg = t('more_than_max_words')
    //   setErrorMsg(max_msg)
    //   setShowAlert(true)
    //   setTimeout(() => {
    //     setShowAlert(false)
    //   }, 6000)
    //   return
    // }
    setInputWords(words)
  }

  const renderScoreResult = () => {
    const totalPieHeight = 160
    const aiScore = Number.parseFloat(scoreData.aiscore) * 100 || 0
    const humanScore = 100 - aiScore
    const aiPieHeight = Math.round((aiScore / 100) * totalPieHeight)
    const humanPieHeight = totalPieHeight - aiPieHeight

    return (
      <div className="flex flex-col items-center">
        {/* 百分比显示区域 */}
        <div className="text-[28px] font-semibold flex gap-1">
          <span className="text-[56px] font-bold text-[#375375]">{aiScore.toFixed()}</span>
          <span className="mt-[10px] text-[#375375]">%</span>
        </div>

        {/* 描述文字 */}
        <div className="mb-[10px] text-[#375375]">
          of text is likely AI
        </div>

        {/* 图表区域 */}
        <div className="h-[200px] w-[300px] flex">
          {/* AI 条形图 */}
          <div className="w-1/2 flex flex-col justify-end">
            <div className="overflow-hidden">
              <div
                className="w-[100px] mx-auto border-t border-l border-r border-[rgb(220,223,228)] rounded-t-sm shadow-small"
                style={{ height: `${aiPieHeight}px`, background: '#feb153' }}
              ></div>
            </div>
            <div className="h-[2px] bg-[#dcdfe4]"></div>
            <div className="text-center text-sm text-gray-600 mt-1">AI</div>
          </div>

          {/* Human 条形图 */}
          <div className="w-1/2 flex flex-col justify-end">
            <div className="overflow-hidden">
              <div
                className="w-[100px] mx-auto border-t border-l border-r border-[rgb(220,223,228)] rounded-t-sm shadow-small"
                style={{ height: `${humanPieHeight}px` }}
              ></div>
            </div>
            <div className="h-[2px] bg-[#dcdfe4]"></div>
            <div className="text-center text-sm text-gray-600 mt-1">Human</div>
          </div>
        </div>
      </div>
    )
  }

  const getScoreSample = async () => {
    const res = await scoreSample()
    const data = res.data
    const arr = []
    console.log(res, 'res')
    for (const i in data) {
      arr.push({
        value: i.replace(/sample-detector-/, ''),
        words: data[i],
      })
    }

    setSimpleList(arr)
  }

  useEffect(() => {
    getScoreSample()
  }, [])

  const onTextContentChange = (text: string) => {
    onHandleChangeInput(text)
  }

  return (
    <div className="ai-detector mt-12">
      {/* 示例选择 */}
      <div className="simples flex h-[28px] items-center gap-3 mb-4">
        <span className="label text-foreground">{detectorToolLang('sample')}</span>
        <div className="value flex gap-4">
          {SimpleList.map((item, index) => {
            return (
              <span
                key={index}
                className={`item px-2 py-1 bg-white text-[#375375] rounded text-sm cursor-pointer ${
                  item.value === currentSimple ? 'text-[rgb(58,126,255)] bg-[rgba(230,244,255,0.85)]' : 'hover:text-[rgb(58,126,255)] hover:bg-[rgba(230,244,255,0.85)]'
                }`}
                onClick={() => {
                  onSelectItem(item)
                }}
              >
                {item.value}
              </span>
            )
          })}
        </div>
      </div>

      {/* 编辑器与结果 两栏布局 */}
      <div className="editor flex flex-col md:flex-row">
        {/* 左侧编辑器卡片 */}
        <div className="left flex-1 bg-white p-6 rounded-t-sm md:rounded-r-none md:rounded-l-sm">
          <div className="container relative">
            <span className="close absolute right-[-10px] top-[-10px] cursor-pointer text-[#7a8aa0] hover:text-[#375375]" onClick={onClear}>
              <TrashIcon className="w-5 h-5" />
            </span>
            <div className="top h-[342px]">
              {/* 编辑器 */}
              <HumanizeInput
                defaultContent={inputWords}
                onChange={onTextContentChange}
                onInit={() => {}}
                maxWords={limitWordsCount || 500}
                clearFlag={0}
                onSetKeywords={() => {}}
                onSetPersonal={() => {}}
                keywords={''}
                personal={''}
              />
            </div>
            <div className='flex items-center justify-between mt-4'>
              <div>
                {!!inputWords && (
                  <span className="count text-sm text-[#7a8aa0]">
                    {getCount(inputWords)} / {limitWordsCount === 0 ? '' : limitWordsCount} {limitWordsCount === 0 ? tBilling('unlimited_words') : detectorToolLang('words')}
                  </span>
                )}
              </div>
              <Button
                onClick={onCheck}
                isDisabled={!inputWords.length}
                className={`${!inputWords.length ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} min-w-[128px] h-10 px-5 rounded-sm text-white bg-gradient-to-r from-[#00d3fe] to-[#006ffd] hover:from-[#00b9e4] hover:to-[#005ae0] transition-colors`}
              >
                {detectorToolLang('check_ai')}
              </Button>
            </div>
          </div>
        </div>

        {/* 分隔线（仅桌面端） */}
        <div className="hidden md:block w-px bg-[#e6ebf2]" />

        {/* 右侧结果卡片 */}
        <div className="right w-full md:w-[500px] bg-white rounded-b-sm md:rounded-l-none md:rounded-r-sm">
          <div className="top p-4 md:p-6 min-h-[420px]">
            {currentState === EnumState.Default && (
              <div className="default flex flex-col items-center justify-center text-center text-[#7a8aa0] gap-3">
                <img src="/newHome/exceeds.png" alt="" className="w-[120px]" />
                <div className="text">{detectorToolLang('check_result_tip')}</div>
              </div>
            )}
            {(currentState === EnumState.Loading || currentState === EnumState.Done) && (
              <div className="loading">
                {currentState === EnumState.Loading && (
                  <div className="title text-center">
                    <div className="main text-lg font-semibold text-[#375375]">{detectorToolLang('loading_main')}</div>
                    <div className="sub text-sm text-[#7a8aa0] mt-1">{detectorToolLang('loading_sub')}</div>
                    <div className="mt-3 flex justify-center"><CircularProgress size="sm" isIndeterminate className="w-12 h-12" /></div>
                  </div>
                )}
                {currentState === EnumState.Done && scoreData.aiscore && (
                  <div className="mt-2">{renderScoreResult()}</div>
                )}
                <div className="platforms mt-6">
                  <div className="name text-sm text-[#375375] mb-2">{detectorToolLang('check_result')}</div>
                  <div className="list flex flex-wrap gap-3">
                    {detectors.map((detector) => (
                      <div key={detector.name} className="flex items-center space-x-2">
                        <Chip size="sm" avatar={<Avatar alt={detector.name} src={detector.logo} size="sm" />} className="bg-gray-100">
                          {detector.name}
                        </Chip>
                        {detector.loading && <CircularProgress size="sm" isIndeterminate className="w-4 h-4" />}
                        {!detector.loading && detector.success && <CheckIcon className="w-4 h-4 text-green-500" />}
                        {!detector.loading && !detector.success && <XMarkIcon className="w-4 h-4 text-red-500" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="state-list mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {detectors2.map((item, index) => {
                    return (
                      <div className="item flex items-center gap-2" key={index}>
                        {item.loading && <CircularProgress size="sm" isIndeterminate className="w-4 h-4" />}
                        {!item.loading && item.success && <CheckIcon className="w-4 h-4 text-green-500" />}
                        {!item.loading && !item.success && <XMarkIcon className="w-4 h-4 text-red-500" />}
                        <span className="text-sm text-[#375375]">{item.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {/* 渐变信息面板 + 大按钮 */}
            <div className="mt-6 rounded-[16px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] bg-gradient-to-br from-[#dff6e6] via-[#e9e8ff] to-[#d9c9ff]">
              <div className="text-[#375375] text-lg font-semibold">{detectorToolLang('title')}</div>
              <ul className="list-disc pl-5 text-[#375375] text-sm mt-2 space-y-1">
                <li>{detectorToolLang('tips1')}</li>
                <li>{detectorToolLang('tips2')}</li>
                <li>{detectorToolLang('tips3')}</li>
              </ul>
              <a className="mt-4 w-full h-[56px] rounded-[12px] bg-black flex items-center justify-center" href={getRootPath()}>
                <span className="bg-gradient-to-r from-[#00d3fe] to-[#6c63ff] bg-clip-text text-transparent text-[18px] font-semibold">{detectorToolLang('button')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 底部 Usage */}
      <div className="extra mt-8">
        <div className="content flex justify-center relative w-full my-5">
          <div className="flex items-center justify-center w-full sm:w-1/2 gap-4">
            <UsageTips />
            {/* <MonthlyUsage isChange={isChange} /> */}
          </div>
        </div>
      </div>

      {showAlert && (
        <div className="common-alert fixed bottom-4 right-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{errorMsg}</span>
            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setShowAlert(false)}>
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ExceedsWordLimitDialog isOpen={exceedsWordsMonthlyLimitDialogOpen} onClose={() => setExceedsWordsMonthlyLimitDialogOpen(false)} />
    </div>
  )
}
