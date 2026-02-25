'use client'
import { getHumanizeResult, getVariables, humanize } from '@/api/client/humanizeApi'
import { ChildContentRef,	ChildKeyWordsRef, HumanizeStatus, HumanizeVariable, Variable } from '@/api/client/humanizeApi.interface'
import { isUserCanVisitApi } from '@/api/client/userApi'
import { logError } from '@/api/core/common'
import CoreApiError from '@/api/core/coreApiError'
import TrailEnds from '@/app/[locale]/components/trialEnds'
import DetectorsResult from '@/app/[locale]/humanize/detectorsResult'
import HumanizeInputControl from '@/app/[locale]/humanize/humanizeInputControl'
import HumanizeResult from '@/app/[locale]/humanize/humanizeResult'
import HumanizeChangeLanguage from '@/app/[locale]/humanize/humanizeChangeLanguage'
import HumanizeSeo from '@/app/[locale]/humanize/humanizeSeo'
import MoreSetting from '@/app/[locale]/humanize/moreSetting'
import UsageTips from '@/app/[locale]/usageTips'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import { EventEntry, useGTM } from '@/context/GTMContext'
import { usePreviewMode } from '@/context/PreviewModeContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { useTranslations } from '@/hooks/useTranslations'
import { localesWithName } from '@/i18n.config'
import { isMobile } from '@/util/browser'
import { truncateWords, wordsCounter } from '@/util/humanize'
import { AnalyticsEventType } from '@/utils/events/analytics'
import { Card, CardBody, Link, Button } from '@heroui/react'
import DrawerIcon from '@/components/DrawerIcon'
import SettingIcon from '@/components/SettingIcon'
import JingIcon from '@/components/JingIcon'
import VectorIcon from '@/components/VectorIcon'
import HumanizeChooseMode from '@/app/[locale]/humanize/humanizeChooseMode'
import { franc } from 'franc-min'
import { useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getNeedGuide } from '@/api/client/billingApi'
import Step from '@/app/[locale]/humanize/step'

export const DEFAULT_MAX_WORDS_PER_REQUEST = 300

interface SelectOption {
  value: string
  label: string
}

interface VariableSelectItem {
  key: string
  options: SelectOption[]
}

export default function HumanizeControl({from}: {from?: string}) {
  const searchParams = useSearchParams()

  const t = useTranslations('Humanize')
  const l = useTranslations('AvoidaiPro')
  const locale = useLocale()
  const tError = useTranslations('Error')
  const { showSnackbar } = useSnackbar()
  const { refreshActiveSubscription, subscription, isWordsPerRequestUnlimited } = useActiveSubscription()
  const { toggleRichSignupDialog, toggleLoginDialog, toggleSignupDialog } = useContext(AuthDialogContext)
  const { data: session } = useSession()
  const [humanizing, setHumanizing] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [keywords, setKeywords] = useState<string>('')
  const [personal, setPersonal] = useState<string>('')
  const [humanizeParameters, setHumanizeParameters] = useState<HumanizeVariable[]>()
  const [resultId, setResultId] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [status, setStatus] = useState<HumanizeStatus | null>(null)
  const [wordsCount, setWordsCount] = useState<number>(0)
  const { sendEvent, reportEvent } = useGTM()
  const { isPreview } = usePreviewMode()
  const [highQuality, setHighQuality] = useState(0)
  const [highPassing, setHighPassing] = useState(0)
  const { openDialog: openPricingDialog, openDialogWithPlanToBuy } = usePricingDialog()
  
  // 首次渲染使用稳定的默认值，避免 SSR/CSR 不一致；挂载后根据设备/会话再计算
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMoreSettingOpen, setIsMoreSettingOpen] = useState(false)
  const [showSettingIcon, setShowSettingIcon] = useState(false)
  const childContentRef = useRef<ChildContentRef>(null)
  const [isUserCanUse, setIsUserCanUse] = useState(false)
  const [loadTip, setLoadingTip] = useState(false)
  const [isMoreAction, setIsMoreAction] = useState(false)
  const [trialVisible, setTrialVisible] = useState(false)
  // 1需要指引，2不需要指引
  const [isNeedGuide, setIsNeedGuide] = useState(2)
  // 抽屉完全展开后再显示 SEO 面板
  const [showSeoPanel, setShowSeoPanel] = useState(false)
  // SEO 面板淡入淡出过渡
  const [seoVisible, setSeoVisible] = useState(false)
  // 抽屉宽度过渡中的标记，用于在动画期间裁剪内容避免撑高
  const [drawerAnimating, setDrawerAnimating] = useState(false)

  // 挂载时同步计算是否需要展开，尽量在首帧前完成，避免可见的抖动
  useLayoutEffect(() => {
    try {
      const canUseWindow = typeof window !== 'undefined'
      const shouldOpen = canUseWindow && !isMobile() && !!session && subscription?.isFree === false
      if (shouldOpen) {
        // 先展开宽度，再延迟渲染内部内容，避免内容先撑高
        setIsDrawerOpen(true)
        setShowSettingIcon(true)
        setDrawerAnimating(true)
        setShowSeoPanel(false)
        setSeoVisible(false)
        setTimeout(() => {
          setShowSeoPanel(true)
          requestAnimationFrame(() => setSeoVisible(true))
          setDrawerAnimating(false)
        }, 260)
      } else {
        setIsDrawerOpen(false)
        setShowSettingIcon(false)
        setShowSeoPanel(false)
        setSeoVisible(false)
      }
    } catch (_) {}
  }, [subscription])

  // 用户交互展开/收起时，也在动画期间裁剪内容
  useEffect(() => {
    setDrawerAnimating(true)
    const t = setTimeout(() => setDrawerAnimating(false), 260)
    return () => clearTimeout(t)
  }, [isDrawerOpen])

	const keywordsRef = useRef<ChildKeyWordsRef>(null) // 关键词引用
  const moreSettingRef = useRef<HTMLDivElement>(null)
  const mobileSettingBtnRef = useRef<HTMLButtonElement>(null)
  const webSettingBtnRef = useRef<HTMLDivElement>(null)

	const handleSetKeywords = (keywords: string) => {
		setKeywords(keywords)
		if (keywordsRef.current) {
			if (keywords) {
				keywordsRef.current.handleSetContent(1, keywords)
			} else {
				keywordsRef.current.handleSetContent(1, '')
			}
		}
    if (childContentRef.current) {
      childContentRef.current.handleSetKeywords(keywords)
    }
	}

	const handleSetPersonal = (personal: string) => {
		setPersonal(personal)
		if (keywordsRef.current) {
			if (personal) {
				keywordsRef.current.handleSetContent(2, personal)
			} else {
				keywordsRef.current.handleSetContent(2, '')
			}
		}
    if (childContentRef.current) {
      childContentRef.current.handleSetPersonal(personal)
    }
	}

  const onHumanize = async (content: string, keywords: string, personal: string, isMore: boolean = false) => {
    sendEvent('start_humanize', { wordsCount: wordsCounter(content) })
    setIsMoreAction(isMore)
    let language = 'eng'
    if (humanizeParameters) {
      const outputLanguage = humanizeParameters.find(cell => cell.name === 'Output Language')
      if (outputLanguage) {
        language = outputLanguage.value
      }
    }
    if (!isMore) {
      reportEvent('ClickHumanize', {
        wordsCount: wordsCounter(content),
        personal: personal,
        keywords: keywords,
        language: franc(content),
        highQuality: highQuality,
        highPassRate: highPassing,
        variables: humanizeParameters,
      })
    }
    reset('')
    setHumanizing(true)
    setContent(content)
    setKeywords(keywords)
    setPersonal(personal)
    const contentToHumanize = isWordsPerRequestUnlimited
      ? content
      : truncateWords(content, subscription?.wordsLimitOneTimes || DEFAULT_MAX_WORDS_PER_REQUEST)
    try {
      const resp: any = await humanize({
        content: contentToHumanize,
        variables: humanizeParameters,
        language: franc(contentToHumanize),
        keywords: keywords,
        personal: personal,
        highQuality: highQuality,
        highPassRate: highPassing,
        ...(isPreview ? { preview: true } : {}),
      })
      const id = resp?.id as string | undefined
      const message = resp?.message as string | undefined
      const requestID = resp?.requestID as string | undefined
      
      if (!id) {
        reportEvent(AnalyticsEventType.HUMANIZE_FAILED, {
          custom_data: {
            currency: 'USD',
            value: 1,
            reason: message || '',
            requestID: requestID || '',
          },
        })
        showSnackbar(message || '', 'error')
        setHumanizing(false)
      }
      if (id) {
        setId(id)
        localStorage.setItem('TOKEN', id)
      }
    } catch (e: any) {
      const errorMessage = e instanceof CoreApiError ? tError(e.code, e.context()) : (e?.message || 'Unknown error')
      showSnackbar(errorMessage, 'error')
      logError(errorMessage, { content }, e)
      setHumanizing(false)
    }
  }

  const handleRefresh = () => {
    content && onHumanize(content, keywords, personal, true)
  }

  const handleMoreHumanize = (content: string) => {
    console.log('more more:')
    content && onHumanize(content, keywords, personal, true)
    if (childContentRef.current) {
      childContentRef.current.handleMoreContent(content)
    }
  }

  const reset = (content: string) => {
    if (!content) {
      setWordsCount(0)
    } else {
      setWordsCount(wordsCounter(content))
    }
    setId(null)
    setContent('')
    setKeywords('')
    setPersonal('')
    setResultId(null)
    setResult(null)
    setStatus(null)
  }

  const handlePassingChange = (passing: number) => {
    setHighPassing(passing)
  }
  const handleQualityChange = (quality: number) => {
    setHighQuality(quality)
  }

  const handleVariables = (key: string, value: string) => {
    const personaItem = humanizeParameters?.find((param) => param.name == key)
    if (!personaItem) {
      const humanizeVariable: HumanizeVariable = {
        name: key,
        value: value,
      }
      setHumanizeParameters([...(humanizeParameters || []), humanizeVariable])
    } else {
      personaItem.value = value
    }
  }

  const handleGetPremium = () => {
    // 直接打开计划选择对话框，让用户选择计划
    reportEvent('PricePageUpgrade', {})
    openPricingDialog(EventEntry.HumanizeExceedWordLimitPerRequestUpgradeButton)
  }

  const getOptionsList = (list: VariableSelectItem[], key: string) => {
    return list.find((item) => item['key'] === key)
  }

  const extractVariableSelectItem = (variables: Variable[], locale: string = 'en'): VariableSelectItem[] => {
    const iso6393 = localesWithName.find((l) => l.locale === (locale || 'en'))?.iso6393
    return variables
      .filter((variable) => !!variable.options?.length)
      .map((variable) => {
        const key = variable.variable
        const options = variable!.options!.map((option) => {
          if (option.configs?.length) {
            const configMatchLocale = option.configs.find((config) => config.language === iso6393)
            if (configMatchLocale) {
              return { value: option.option, label: configMatchLocale.value }
            }
          }
          return { value: option.option, label: option.option }
        })
        return { key, options }
      })
  }

  const isUserCanVisit = async () => {
    try {
      const res = await isUserCanVisitApi()
      console.log('是否首次使用:' + res)
      setIsUserCanUse(res)
      setLoadingTip(true)
    } catch (e: any) {
      setLoadingTip(true)
      if (e instanceof CoreApiError) {
        showSnackbar(tError(e.code, e.context()), 'error')
      } else {
        showSnackbar(e.message, 'error')
      }
    }
  }

  useEffect(() => {
    if (!id || status === HumanizeStatus.FINISH || status === HumanizeStatus.FAILED) {
      return
    }

    let checking = false
    const checkResult = async () => {
      // skip if time to get result > interval
      if (checking) {
        return
      }
      try {
        checking = true
        const humanizeResult = await getHumanizeResult(id)
        setStatus(humanizeResult.status)
        if (humanizeResult.status === HumanizeStatus.FINISH) {
          await refreshActiveSubscription()
          setResultId(humanizeResult.id)
          setResult(humanizeResult.result)
          setHumanizing(false)
          // 平滑滚动至 DetectorsResult 区域，尽量让其完整可见
          setTimeout(() => {
            const el = document.getElementById('detectorsResult')
            if (el) {
              const rect = el.getBoundingClientRect()
              const canFit = rect.height <= window.innerHeight
              if (canFit) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              } else {
                const offset = 12 // 顶部留出少量间距
                const targetTop = window.scrollY + rect.top - offset
                window.scrollTo({ top: targetTop, behavior: 'smooth' })
                // 二次校准，若底部仍未完全可见则再补滚动
                setTimeout(() => {
                  const r = el.getBoundingClientRect()
                  const delta = r.bottom - window.innerHeight
                  if (delta > 0) {
                    window.scrollBy({ top: delta + 8, behavior: 'smooth' })
                  }
                }, 350)
              }
            }
          }, 50)
          if (isMoreAction) {
            reportEvent('HumanizeMoreSuccess', {})
          } else {
            reportEvent('HumanizeSuccess', {})
          }
        } else if (humanizeResult.status === HumanizeStatus.FAILED) {
          reportEvent(AnalyticsEventType.HUMANIZE_FAILED, {
            custom_data: {
              currency: 'USD',
              value: 1,
              reason: humanizeResult?.errorMsg || '',
              requestID: humanizeResult?.requestID || '',
            },
          })

          setResultId(null)
          setResult(null)
          setHumanizing(false)
          showSnackbar('Humanize failed: ' + humanizeResult.errorMsg, 'error')
          logError(humanizeResult.errorMsg, { humanizeResult }, new Error(humanizeResult.errorMsg))
        }
      } catch (e: any) {
        reportEvent(AnalyticsEventType.HUMANIZE_FAILED, {
          custom_data: {
            currency: 'USD',
            value: 1,
            reason: (e as any)?.errorMsg || (e as any)?.message || '',
            requestID: (e as any)?.requestID || '',
          },
        })
        setResultId(null)
        setResult(null)
        setHumanizing(false)
        setStatus(HumanizeStatus.FINISH)
        const errorMessage = e instanceof CoreApiError ? tError(e.code, e.context()) : ((e as any)?.message || 'Unknown error')
        showSnackbar(errorMessage, 'error')
        logError(errorMessage, { content }, e)
      } finally {
        checking = false
      }
    }

    const interval = setInterval(checkResult, 1000)
    return () => clearInterval(interval)
  }, [status, id, tError, showSnackbar])

  useLayoutEffect(() => {
    const loadVariables = async () => {
      const response = await getVariables(isPreview)
      const items = extractVariableSelectItem(response, locale)

      const readability = getOptionsList(items, 'readability')
      const purpose = getOptionsList(items, 'purpose')
      const language = getOptionsList(items, 'Output Language')
      const format = getOptionsList(items, 'Format')
      const rewriting = getOptionsList(items, 'Rewriting Level')

      localStorage.setItem('READABILITY', JSON.stringify(readability))
      localStorage.setItem('PURPOSE', JSON.stringify(purpose))
      localStorage.setItem('OUTPUT_LANGUAGE', JSON.stringify(language))
      localStorage.setItem('FORMAT', JSON.stringify(format))
      localStorage.setItem('REWRITING_LEVEL', JSON.stringify(rewriting))

      handleVariables('readability', readability?.options[0]['value'] || '')
      handleVariables('purpose', purpose?.options[0]['value'] || '')
      // handleVariables('Output Language', language?.options[0]['value'] || '')
      handleVariables('Format', format?.options[0]['value'] || '')
      handleVariables('Rewriting Level', rewriting?.options[0]['value'] || '')
    }

    const readabilityList = localStorage.getItem('READABILITY')
    if (!readabilityList) {
      loadVariables()
    } else {
      const readability = JSON.parse(localStorage.getItem('READABILITY') || '')
      const purpose = JSON.parse(localStorage.getItem('PURPOSE') || '')
      const language = JSON.parse(localStorage.getItem('OUTPUT_LANGUAGE') || '')
      const format = JSON.parse(localStorage.getItem('FORMAT') || '')
      const rewriting = JSON.parse(localStorage.getItem('REWRITING_LEVEL') || '')

      handleVariables('readability', readability?.options[0]['value'])
      handleVariables('purpose', purpose?.options[0]['value'])
      // handleVariables('Output Language', 'English')
      handleVariables('Format', format?.options[0]['value'])
      handleVariables('Rewriting Level', rewriting?.options[0]['value'])
    }
    // 判断是否首次访问
    isUserCanVisit()
  }, [humanizeParameters])

  useEffect(() => {
    const sourceName = searchParams.get('source')
    if (sourceName === 'translator') {
      const content = localStorage.getItem('SOURCE_TRANSLATOR_CONTENT') || ''
      if (childContentRef.current) {
        childContentRef.current.handleMoreContent(content)
      }
    }
  }, [])

  useEffect(() => {
    if(session && subscription?.isFree == false) {
      getNeedGuide('humanize')
      .then(res => {
        if(res.data == 1) {
          setIsNeedGuide(res.data)
        }
      })
    }
  }, [subscription])

  // 抽屉按钮点击，切换展开状态；收起时同时关闭 MoreSetting
  const drawerClickFn = () => {
    setIsDrawerOpen((prev) => {
      if (prev) {
        // 关闭抽屉时立即隐藏 SettingIcon
        setIsMoreSettingOpen(false)
        setShowSettingIcon(false)
        // 关闭时先做淡出过渡，再卸载
        setSeoVisible(false)
        setTimeout(() => setShowSeoPanel(false), 200)
      } else {
        // 打开抽屉时延迟显示 SettingIcon，等待抽屉展开动画完成
        setTimeout(() => {
          setShowSettingIcon(true)
        }, 250) // 250ms 延迟，略大于抽屉动画时间 240ms
        // 打开时在动画结束后再渲染 SEO 面板，避免宽度过渡期间的高度抖动
        setTimeout(() => {
          setShowSeoPanel(true)
          // 下一帧开始淡入
          setTimeout(() => setSeoVisible(true), 20)
        }, 250)
      }
      return !prev
    })
  }

  // 更多设置按钮点击，切换显示状态
  const moreSettingFn = () => {
    console.log('session---------------->', session)
    if(!isMoreSettingOpen) {
      reportEvent('MoreSetting', {})
    }
    setIsMoreSettingOpen((prev) => !prev)
  }

  // 点击页面其他区域时关闭 MoreSetting（移动端/桌面端通用）
  useEffect(() => {
    const handleDocClick = (event: MouseEvent | TouchEvent) => {
      if (!isMoreSettingOpen) return
      const target = event.target as Node
      if (moreSettingRef.current && moreSettingRef.current.contains(target)) return
      if (mobileSettingBtnRef.current && mobileSettingBtnRef.current.contains(target)) return
      if (webSettingBtnRef.current && webSettingBtnRef.current.contains(target)) return
      setIsMoreSettingOpen(false)
    }
    document.addEventListener('mousedown', handleDocClick)
    document.addEventListener('touchstart', handleDocClick)
    return () => {
      document.removeEventListener('mousedown', handleDocClick)
      document.removeEventListener('touchstart', handleDocClick)
    }
  }, [isMoreSettingOpen])

  // 固定像素方案（更稳定，避免小数比例导致布局抖动）
  const LEFT_WIDTH_COLLAPSED_PX = 48
  const LEFT_WIDTH_EXPANDED_PX = 260

  // 根据 from=article 调整布局宽度
  const getLeftWidth = () => {
    if (from === 'article') {
      return isDrawerOpen ? 200 : 48  // article 模式下更窄
    }
    return isDrawerOpen ? LEFT_WIDTH_EXPANDED_PX : LEFT_WIDTH_COLLAPSED_PX
  }

  return (
    <>
      <div className="overflow-hidden mt-12">
        <div className="w-full">
          <div className="w-full">
          {session &&
            (wordsCount <= (subscription?.wordsLimitOneTimes || 300) ? (
                <div className="limited-words-login inline-block min-w-[280px] w-full sm:w-auto ml-0 sm:ml-1 px-1">
                  <span className="limited-words-text pl-0 sm:pl-0 text-left pl-2 sm:pl-0">
                  {l('free_plan')} {wordsCount}
                  {isWordsPerRequestUnlimited ? '' : '/' + (subscription?.wordsLimitOneTimes || 300) + ' ' + t('words')}
                  <Link onPress={handleGetPremium} href="#" className="text-sm font-medium text-primary">
                    {t('get_premium')}
                  </Link>
                  </span>
                </div>
              ) : (
                <div className="limited-words-remind ml-0 sm:ml-1 w-full sm:w-[290px]">
                  <span className="limited-words-text pl-0 sm:pl-0 text-left sm:text-center pl-2 sm:pl-0">
                  PRO | Not Enough Words
                  <Link onPress={handleGetPremium} href="#" className="text-sm font-medium text-primary">
                    {t('get_premium')}
                  </Link>
                  </span>
                </div>
              ))}
          </div>
          
          {/* 三栏容器：移动端纵向，md+ 横向 */}
          <div className="flex flex-col md:flex-row w-full gap-0">
          {/* 左侧抽屉面板（md+ 固定像素宽度按状态过渡） */}
          <div className="hidden md:block shrink-0 transition-all duration-[240ms]" style={{ 
            width: getLeftWidth(),
            height: from === 'article' ? '368px' : '538px'
          }}>
            <div 
              className={`relative z-10 p-2 border-r border-[#e1e5ea] flex flex-col items-center bg-white h-full transition-all duration-[240ms] md:rounded-l-[12px] ${
                session ? 'rounded-bl-[12px]' : 'rounded-l-[12px]'
              } ${
                (humanizing || result) && 'md:rounded-bl-none'
              } ${drawerAnimating ? 'overflow-hidden' : ''}`}
              style={{ width: getLeftWidth() }}
            >
              <div className="sticky top-0 w-full flex items-center justify-between pb-3 border-b border-[#e1e5ea] bg-white z-20">
              <Button 
                id="drawerButton" 
                onClick={drawerClickFn} 
                  className="min-w-8 h-8 rounded-sm text-base bg-white p-0 hover:bg-gray-100 [&_svg]:fill-[#375375] hover:[&_svg]:fill-[#8B59ED]"
              >
                <DrawerIcon />
              </Button>
                <div
                onClick={isDrawerOpen ? moreSettingFn : undefined}
                aria-disabled={!isDrawerOpen}
                  ref={webSettingBtnRef}
                  className={`${showSettingIcon ? 'flex' : 'hidden'} gap-1 items-center ${
                    isDrawerOpen ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isMoreSettingOpen ? 'bg-[#678CB926]' : 'bg-white'
                  } rounded-[29px] px-3 py-1 transition-all duration-[240ms] ${
                    showSettingIcon ? 'opacity-100' : 'opacity-0'
                  } ${isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  <span className="text-sm text-[#375375D9] font-normal hidden sm:block">{t('more_setting')}</span>
                <SettingIcon width={14} height={13} />
                </div>
              </div>
              
              {/* 收起状态显示的图标 */}
              <div 
                className={`${isDrawerOpen ? 'hidden' : 'flex'} flex-col items-center transition-all duration-[240ms]`}
              >
                <div className="mt-3">
                <JingIcon width={19} height={17}  />
                </div>
                <div className="mt-3">
                <VectorIcon width={18} height={18} />
                </div>
                <div className="mt-3">
                <SettingIcon width={18} height={18} />
                </div>
              </div>
              
              {/* 展开状态显示的内容（抽屉完全展开后再渲染，并带过渡） */}
              <div 
                className={`w-full transition-all duration-[240ms] ${
                  isDrawerOpen ? 'block opacity-100 pointer-events-auto' : 'hidden opacity-0 pointer-events-none'
                }`}
              >
                {showSeoPanel && (
                  <div className={`transition-opacity duration-200 ease-out ${seoVisible ? 'opacity-100' : 'opacity-0'}`}>
              <HumanizeSeo onKeywords={handleSetKeywords} onPersonal={handleSetPersonal} ref={keywordsRef} from={from} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 中间列（自适应） */}
          <div className="w-full md:flex-1 md:min-w-0 relative pt-0 mb-4 sm:mb-0 transition-all duration-[240ms]" style={{ 
            height: from === 'article' ? '368px' : '538px'
          }}>
            {/* MoreSetting 覆盖层 */}
            <div
              className={`absolute top-0 left-0 p-4 bg-[#FDFDFF] rounded-[12px] md:rounded-l-none shadow-[4px_0_12px_rgba(0,0,0,0.1)] z-30 w-full h-full overflow-hidden overflow-y-scroll scrollbar-none ${
                isMoreSettingOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              } transition-all duration-[240ms]`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              ref={moreSettingRef}
          >
            <MoreSetting
              onPurpose={handleVariables}
              onRewriting={handleVariables}
              onFormat={handleVariables}
              onPassing={handlePassingChange} 
              onQuality={handleQualityChange}
                onKeywords={handleSetKeywords}
                onPersonal={handleSetPersonal}
              />
            </div>
            
            {/* 顶部工具栏 */}
            <div className="sticky top-0 flex items-center gap-2 h-14 bg-[var(--panel-top-bg)] px-5 z-10">
            <HumanizeChooseMode onPersona={handleVariables} />
          </div>

            <Card className="rounded-t-none rounded-b-[12px] md:rounded-none bg-white pb-4 md:border-r md:border-[#e6ebf2] border-0 shadow-none" style={{ height: from === 'article' ? '312px' : '482px' }}>
            <CardBody className="p-0 flex flex-col" style={{ height: from === 'article' ? '312px' : '482px' }}>
                <div className="relative" style={{ height: from === 'article' ? '312px' : '482px' }}>
                  <HumanizeInputControl
                    onHumanize={onHumanize}
                    humanizing={humanizing}
                    onContentChange={reset}
                    from={from}
                    ref={childContentRef}
                  />
                  {/* 移动端：左下角浮动设置按钮 */}
                  <button
                    ref={mobileSettingBtnRef}
                    onClick={moreSettingFn}
                    className="md:hidden absolute left-3 bottom-2 z-1 rounded-md shadow-sm flex items-center justify-center text-[#375375] hover:text-[#8B59ED] active:scale-[0.98]"
                    aria-label="More settings"
                  >
                    <SettingIcon width={18} height={18} />
                  </button>
                </div>
            </CardBody>
          </Card>
          </div>
          
          {/* 右侧列（自适应） */}
          <div className="w-full md:flex-1 md:min-w-0 relative pt-0 mb-4 sm:mb-0 transition-all duration-[240ms]" style={{ 
            height: from === 'article' ? '368px' : '538px'
          }}>
            <div className="raised-select-out sticky top-0 flex items-center rounded-t-[12px] md:rounded-tl-none md:rounded-tr-[12px] justify-between px-5 bg-[var(--panel-top-bg)] h-14 z-10">
            <HumanizeChangeLanguage onLanguage={handleVariables} />
            <UsageTips />
          </div>
            <Card className={`${(humanizing || result) ? 'rounded-t-none rounded-b-[12px] md:rounded-none' : 'rounded-t-none rounded-b-[12px] md:rounded-l-none md:rounded-tr-none md:rounded-br-[12px]'} bg-white border-0 shadow-none`} style={{ height: from === 'article' ? '312px' : '482px' }}>
              <CardBody className="p-0 flex items-center justify-center text-[#7a8aa0]" style={{ height: from === 'article' ? '312px' : '482px' }}>
              <HumanizeResult
                humanizing={humanizing}
                result={result || ''}
                onRefresh={handleRefresh}
                onMoreHumanize={handleMoreHumanize}
              />
            </CardBody>
          </Card>
          </div>
          </div>
      </div>
      </div>
      
      {(humanizing || result) && (
        <div id="detectorsResult">
          <DetectorsResult result={result || ''} resultId={resultId || ''} humanizing={humanizing} />
        </div>
      )}
      
      <TrailEnds
        visible={trialVisible}
        onClose={() => {
          setTrialVisible(false)
        }}
      />
      <Step isNeedGuide={isNeedGuide} />
    </>
  )
}