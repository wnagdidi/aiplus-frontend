// 声明这是一个客户端组件
'use client'

// 导入必要的依赖
import { getSample } from '@/api/client/humanizeApi'
import { ChildContentRef, ChildKeyWordsRef } from '@/api/client/humanizeApi.interface'
import { isUserCanVisitApi } from '@/api/client/userApi'
import CoreApiError from '@/api/core/coreApiError'
import ExceedsWordLimitDialog from '@/app/[locale]/humanize/exceedsWordLimitDialog'
import HumanizeInput from '@/app/[locale]/humanize/humanizeInput'
import HumanizeSeoDialog from '@/app/[locale]/humanize/humanizeSeoDialog'
import HumanizeToolButtons from '@/app/[locale]/humanize/humanizeToolButtons'
import ClearIcon from '@/components/ClearIcon'
import HumanizeaiIcon from '@/components/HumanizeaiIcon'
import RightIcon from '@/components/RightIcon'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import { EventEntry, useGTM } from '@/context/GTMContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { useTranslations } from '@/hooks/useTranslations'
import { isMobile } from '@/util/browser'
import { promptOnTagLogin } from '@/util/google'
import { wordsCounter } from '@/util/humanize'
import { Button } from '@heroui/react'
import { useSession } from 'next-auth/react'
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './page.css'

// 移除自定义替代组件，统一改用 HeroUI 与原生 HTML + Tailwind

// 最小字数限制
const MIN_WORDS = 50

// 组件属性接口定义
interface HumanizeInputControlProps {
  onHumanize: (content: string, keywords: string, personal: string, isMore?: boolean) => void // 人性化处理回调
  onContentChange: (content: string) => void // 内容变化回调
  humanizing: boolean // 是否正在处理中
  from: string | undefined
}

// 人性化输入控制组件
const HumanizeInputControl = forwardRef((props: HumanizeInputControlProps, ref: React.Ref<ChildContentRef>) => {
  const { onHumanize, humanizing, onContentChange, from } = props

  // Hooks和上下文
  const { data: session } = useSession() // 用户会话
  const tError = useTranslations('Error') // 错误信息翻译
  const tParam = useTranslations('Humanize.Param') // 参数翻译
  const { showSnackbar } = useSnackbar() // 提示消息
  const { subscription, isUnlimited, isWordsPerRequestUnlimited } = useActiveSubscription() // 订阅信息
  const { toggleRichSignupDialog, toggleSignupDialog, toggleLoginDialog } = useContext(AuthDialogContext) // 认证对话框控制
  const { openDialog: openPricingDialog } = usePricingDialog() // 定价对话框控制
  const t = useTranslations('Humanize') // 人性化功能翻译
  const { openDialogIfLogged } = usePricingDialog()

  // 状态管理
  const [content, setContent] = useState('') // 输入内容
  const [keywords, setKeywords] = useState<string>('') // SEO关键词
  const [personal, setPersonal] = useState<string>('') // 个性化设置
  const [initialContent, setInitialContent] = useState('') // 初始内容
  const [sample, setSample] = useState('') // 示例文本
  const [simpleError, setSimpleError] = useState('') // 简单错误信息
  const [trySampleCount, setTrySampleCount] = useState(0) // 尝试示例次数
  const [tryCount, setTryCount] = useState(0) // 尝试次数
  const [isEditorInit, setIsEditorInit] = useState(false) // 编辑器是否初始化
  const [exceedsWordsOneTimeLimit, setExceedsWordsOneTimeLimit] = useState(false) // 是否超出单次字数限制
  const [exceedsWordsMonthlyLimitDialogOpen, setExceedsWordsMonthlyLimitDialogOpen] = useState(false) // 月度字数限制对话框
  const [inputClearFlag, setInputClearFlag] = useState(0) // 输入清除标志
  const [isUserCanUse, setIsUserCanUse] = useState(false) // 用户是否可以使用
  const [loadTip, setLoadingTip] = useState(false) // 加载提示
  const { sendEvent, reportEvent } = useGTM()
  const keywordsRef = useRef<ChildKeyWordsRef>(null) // 关键词引用

  // 尝试示例
  const onTrySample = async () => {
    if (!isEditorInit) {
      showSnackbar('Preparing humanize components, please try later', 'info')
      return
    }
    reportEvent('ClickSample', {})
    if (sample) {
      setInitialContent(sample)
      setContent(sample)
      updateContent(sample)
      return
    }
    try {
      const sampleFromRemote = await getSample()
      setSample(sampleFromRemote)
      updateContent(sampleFromRemote)
    } catch (e) {
      if (e instanceof CoreApiError) {
        showSnackbar(tError(e.code, e.context()), 'error')
      } else {
        showSnackbar((e as any).message, 'error')
      }
    }
  }

  // 粘贴文本
  const onPasteText = async () => {
    if (!isEditorInit) {
      showSnackbar('Preparing humanize components, please try later', 'info')
      return
    }
    sendEvent('humanize_paste_text')
    if (!session && !isUserCanUse) {
      toggleSignupDialog(true, EventEntry.HumanizePasteButton)
      return
    }
    try {
      const text = await navigator.clipboard.readText()
      setInitialContent(text)
      updateContent(text)
    } catch (e: any) {
      showSnackbar(e.message, 'error')
    }
  }

  // 更新内容
  const updateContent = (newContent: string) => {
    setSimpleError('')
    setContent(newContent)
    onContentChange(newContent)
    if (!newContent) {
      setInitialContent('')
      setInputClearFlag(+new Date())
    }
  }

  // 文本内容变化处理
  const onTextContentChange = (text: string) => {
    updateContent(text)
    if (!session) {
      promptOnTagLogin()
    }
  }

  // 编辑器初始化处理
  const handleEditorInit = () => {
    setIsEditorInit(true)
  }

  // 点击人性化按钮处理
  const onClickHumanize = async () => {
    setSimpleError('')
    const isSample = content === sample
    if (!session && !isUserCanUse) {
      toggleRichSignupDialog(true, EventEntry.HumanizeCustomContentWithoutLogin, true)
      return
    }

    if (!session && isUserCanUse) {
    } else {
      sendEvent('click_humanize', { custom_data: { predictedLtv: '1', currency: 'USD', value: 1, words: wordsCount } })
    }

    if (wordsCount < MIN_WORDS) {
      setSimpleError(t('less_than_min_words', { minWords: MIN_WORDS }))
      return
    }

    const exceedWordsLimit = wordsCount + (subscription?.currentMonthUsage || 0) > (subscription?.wordsLimitTotal as any)

    if (session && !isSample && exceedWordsLimit && subscription?.isFree) { setExceedsWordsMonthlyLimitDialogOpen(true); return }
    if (!isUnlimited && !isSample && !subscription?.isFree && exceedWordsLimit) { setExceedsWordsMonthlyLimitDialogOpen(true); return }
    if (session && !isUnlimited && !subscription?.isFree && exceedWordsLimit) { setExceedsWordsMonthlyLimitDialogOpen(true); return }

    if (!session && !isSample) { toggleRichSignupDialog(true, EventEntry.HumanizeCustomContentWithoutLogin, true); return }

    await onHumanize(content, keywords, personal, false)
    await isUserCanVisit()
    sessionStorage.setItem('HUMANIZE_BTN', 'HUMANIZE')
    if (!session) { promptOnTagLogin() }
    if (!session && content === sample) { setTrySampleCount(trySampleCount + 1) }
    if (session && subscription?.isFree && content !== sample) { setTryCount(tryCount + 1) }
  }

  const handleGetPremium = () => { openPricingDialog(EventEntry.HumanizeExceedWordLimitPerRequestUpgradeButton) }

  const wordsCount = wordsCounter(content)

  useEffect(() => {
    if (isWordsPerRequestUnlimited) { setExceedsWordsOneTimeLimit(false) }
    else if (!subscription) { setExceedsWordsOneTimeLimit(wordsCount > 300) }
    else { setExceedsWordsOneTimeLimit(wordsCount > (subscription as any).wordsLimitOneTimes) }
  }, [wordsCount, subscription])

  useEffect(() => {
    const initSample = async () => {
      try {
        const sampleFromRemote = await getSample()
        setSample(sampleFromRemote)
      } catch (e: any) {
        if (e instanceof CoreApiError) { showSnackbar(tError(e.code, e.context()), 'error') }
        else { showSnackbar(e.message, 'error') }
      }
    }
    initSample(); isUserCanVisit()
  }, [])

  const isUserCanVisit = async () => {
    try {
      const res = await isUserCanVisitApi()
      setIsUserCanUse(res); setLoadingTip(true)
    } catch (e: any) {
      setLoadingTip(true)
      if (e instanceof CoreApiError) { showSnackbar(tError(e.code, e.context()), 'error') }
      else { showSnackbar(e.message, 'error') }
    }
  }

  useEffect(() => { setInitialContent(content) }, [isWordsPerRequestUnlimited, (subscription as any)?.wordsLimitOneTimes])

  const overMore = () => { if (!subscription || isUnlimited) return false; return wordsCount > percentOverHalf() }
  const overJust = () => { if (!subscription || isUnlimited) return false; return wordsCount > restWord() }
  const percentOverHalf = () => { if (!subscription) return 0; return (subscription as any).wordsLimitTotal - (subscription as any).currentMonthUsage <= 0 ? (subscription as any).wordsLimitTotal - (subscription as any).currentMonthUsage : Number((((subscription as any).wordsLimitTotal - (subscription as any).currentMonthUsage) * 1.5).toFixed(0)) }
  const restWord = (): number => { if (!subscription) return 0; return (subscription as any).wordsLimitTotal - (subscription as any).currentMonthUsage }
  const showTip = () => { if (exceedsWordsOneTimeLimit) return true; return ((subscription as any)?.wordsLimitOneTimes || 300) < (overMore() ? percentOverHalf() : restWord()) }

  const handleSetKeywords = (keywords: string) => { setKeywords(keywords); if (keywordsRef.current) { if (keywords) { keywordsRef.current.handleSetContent(1, keywords) } else { keywordsRef.current.handleSetContent(1, '') } } }
  const handleSetPersonal = (personal: string) => { setPersonal(personal); if (keywordsRef.current) { if (personal) { keywordsRef.current.handleSetContent(2, personal) } else { keywordsRef.current.handleSetContent(2, '') } } }
  useEffect(() => { setInitialContent(content) }, [isWordsPerRequestUnlimited, (subscription as any)?.wordsLimitTotal])
  const handleMoreContent = (content: string) => { setInitialContent(content); setContent(content); updateContent(content) }
  useImperativeHandle(ref, () => ({ handleMoreContent, handleSetKeywords, handleSetPersonal }), [content])

  return (
    <>
      <div className="h-full">
        <div className={`flex flex-col mb-0 ${from === 'article' ? 'h-[252px]' : 'h-[396px]'}`}>
          <HumanizeInput
            defaultContent={initialContent}
            onChange={onTextContentChange}
            onInit={handleEditorInit}
            maxWords={isWordsPerRequestUnlimited ? 9999999 : (subscription as any)?.wordsLimitOneTimes || 500}
            clearFlag={inputClearFlag}
            onSetKeywords={handleSetKeywords}
            onSetPersonal={handleSetPersonal}
            keywords={keywords}
            personal={personal}
          />
          {simpleError && (
            <div className="p-2 rounded text-sm bg-red-100 text-red-700" role="alert">{simpleError}</div>
          )}
        </div>
        {!content && (
          <div className="pointer-events-none">
            <HumanizeToolButtons onTrySample={onTrySample} onPasteText={onPasteText} />
          </div>
        )}
        <div className="absolute right-2 bottom-0 flex gap-2 items-center">
          {wordsCount > 0 && (
            <div className="flex gap-1 items-center">
              <button onClick={() => updateContent('')} aria-label="clear" type="button" className="cursor-pointer text-sm text-[#375375] hover:text-primary flex items-center gap-1">
                <ClearIcon fontSize="14" /> {t('clear')}
              </button>
            </div>
          )}
          <div className="flex items-center justify-end">
            <Button
              id="humanizeButton"
              startContent={<HumanizeaiIcon useCurrentColor className="text-white" />}
              endContent={<RightIcon useCurrentColor className="text-white text-[14px]" />}
              onPress={onClickHumanize}
              isLoading={humanizing}
              className="group px-6 h-[36px] rounded-sm bg-gradient-to-r from-[#00d3fe] to-[#006ffd] hover:from-[#00b9e4] hover:to-[#005ae0] hover:brightness-105"
              classNames={{
                base: 'transition-colors duration-200',
                content: 'text-white font-bold'
              }}
            >
              <span style={{ fontWeight: 700 }} className="text-white">
                {t('humanize').toUpperCase()}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <ExceedsWordLimitDialog isOpen={exceedsWordsMonthlyLimitDialogOpen} onClose={() => setExceedsWordsMonthlyLimitDialogOpen(false)} />
    </>
  )
})

export default HumanizeInputControl
