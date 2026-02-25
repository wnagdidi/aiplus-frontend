'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react'
import { Button, Textarea, Card, CardBody, Spinner, Select, SelectItem } from '@heroui/react'
import AiRate from './aiRate'
import LanguageSelector from './LanguageSelector'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import { useSession } from 'next-auth/react'
import { EventEntry, useGTM } from '@/context/GTMContext'
import { translateExecute, translateExecuteGet, translateExecuteRateGet, translateRate } from '@/api/client/translator'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'
import { useLocale } from 'next-intl'
import { Locale } from '@/i18n.config'
import { franc } from 'franc-min'
import { findLabelByValue, francToLanguageValueMap, languageList, MAX_COUNT, MIN_COUNT } from '@/app/[locale]/home/multilingual-translation/util'
import './aiTranslatorTabSwitcher.scss'
import mammoth from 'mammoth'

type LanguageType = 'source' | 'target'

export default function AiTranslatorTabSwitcher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('NewHomeMultilingualTranslation')
  const tHumanize = useTranslations('Humanize')
  const { toggleLoginDialog, toggleSignupDialog } = useContext(AuthDialogContext)
  const { data: session } = useSession()
  const { sendEvent } = useGTM()
  const { subscription, isUnlimited, isWordsPerRequestUnlimited } = useActiveSubscription()
  const locale = useLocale() as Locale
  
  const [browserLanguage, setBrowserLanguage] = useState<string>('')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBrowserLanguage(navigator.language)
    }
  }, [])
  
  const [activeIndex, setActiveIndex] = useState(0)
  const [isShowSourceLanguage, setIsShowSourceLanguage] = useState(false)
  const [isShowTargetLanguage, setIsShowTargetLanguage] = useState(false)
  const [sourceLang, setSourceLang] = useState<string | undefined>()
  const [targetLang, setTargetLang] = useState<string>('')
  const [industryModel, setIndustryModel] = useState('Field')
  const [autoLoading, setAutoLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [rating, setRating] = useState(4.5)
  const [inputText, setInputText] = useState('')
  const [translateValue, setTranslateValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [count, setCount] = useState(0)
  const [humanizeAlert, setHumanizeAlert] = useState(false)
  const [isShowCopyTips, setIsShowCopyTips] = useState(false)
  const [rateResult, setRateResult] = useState<any>(null)
  const [taskId, setTaskId] = useState('')
  const [isShowAiRate, setIsShowAiRate] = useState(false)
  const isShowAiRateRef = useRef(false)
  
  // Document related states
  const [documentType, setDocumentType] = useState('') // pdf, word, text
  const [wordText, setWordText] = useState<string>('')
  const [wordHtml, setWordHtml] = useState<string>('')
  const [pdfHtml, setPdfHtml] = useState<string>('')
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined)
  const [txtContent, setTxtContent] = useState<string | undefined>(undefined)
  const [translatedHtml, setTranslatedHtml] = useState<string>('')
  const [translateText, setTranslateText] = useState<string>('')
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const ratePollingRef = useRef<NodeJS.Timeout | null>(null)
  const leftLanguageInnerRef = useRef<HTMLDivElement>(null)
  const rightLanguageInnerRef = useRef<HTMLDivElement>(null)
  
  const maxCount = useMemo(() => {
    return MAX_COUNT
  }, [isUnlimited, subscription])

  // PDF.js 动态导入
  let pdfjsLib: any = null

  const loadPdfJs = async () => {
    if (!pdfjsLib) {
      const PDFJS = await import('pdfjs-dist')
      pdfjsLib = PDFJS
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
    }
    return pdfjsLib
  }

  const extractPdfText = async (file: File): Promise<string> => {
    try {
      console.log('开始解析PDF文件...')

      // 确保 PDF.js 已加载
      const pdfjs = await loadPdfJs()
      console.log('PDF.js 加载成功')

      const arrayBuffer = await file.arrayBuffer()
      console.log('文件已转换为ArrayBuffer')

      // 创建一个Uint8Array来处理二进制数据
      const data = new Uint8Array(arrayBuffer)
      console.log('创建Uint8Array成功')

      // 加载PDF文档
      const loadingTask = pdfjs.getDocument({ data })
      console.log('PDF加载任务创建成功')

      const pdf = await loadingTask.promise
      console.log(`PDF加载成功，总页数: ${pdf.numPages}`)

      let textContent = ''

      // 遍历每一页
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`正在处理第 ${i} 页`)
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()

        const pageText = content.items
          .map((item: any) => item.str)
          .filter((str: string) => str.trim().length > 0)
          .join(' ')

        textContent += pageText + '\n\n' // 使用两个换行符分隔页面
        console.log(`第 ${i} 页处理完成`)
      }

      console.log('PDF文本提取完成')
      return textContent.trim()
    } catch (error: unknown) {
      console.error('PDF解析详细错误:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      })
      throw new Error(`PDF文件解析失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // 按字符数量截断文本
  const truncateText = (text: string, maxUnits = 300) => {
    let result = ''
    let count = 0

    for (const ch of text) {
      if (count >= maxUnits) break
      result += ch
      count++
    }

    return { limitedText: result, unitUsed: count }
  }

  const tabs = [
    {
      label: t('tab_text'),
      defaultIcon: '/translator/text@2x.png',
      activeIcon: '/translator/text@2x copy.png',
    },
    {
      label: t('tab_document'),
      defaultIcon: '/translator/Documents_icon@2x.png',
      activeIcon: '/translator/Documents_Light-up-_con@2x.png',
    },
  ]

  const comboOptions = [
    { label: t('Academic'), id: 'Field', icon: '/translator/icon@2x.png' },
    { label: t('Business'), id: 'Business', icon: '/translator/icon_Light up@2x.png' },
    { label: t('Technical'), id: 'Technical', icon: '/translator/icon_Light up@2x.png' },
    { label: t('Medical'), id: 'Medical', icon: '/translator/icon_Light up@2x.png' },
    { label: t('Legal'), id: 'Legal', icon: '/translator/icon_Light up@2x.png' },
    { label: t('Marketing'), id: 'Marketing', icon: '/translator/icon_Light up@2x.png' },
    { label: t('Finance'), id: 'Finance', icon: '/translator/icon_Light up@2x.png' },
    { label: t('E-commerce'), id: 'E-commerce', icon: '/translator/icon_Light up@2x.png' },
    { label: t('Literary'), id: 'Literary', icon: '/translator/icon_Light up@2x.png' },
  ]

  const onSelectSourceLanguage = (value: string) => {
    setSourceLang(value)
  }

  const onSelectTargetLanguage = (value: string) => {
    setTargetLang(value)
  }

  const handleAutoDetect = () => {
    getInputValue(inputText)
    setIsShowSourceLanguage(false)
  }



  useEffect(() => {
    const current = findLabelByValue(browserLanguage)
    if (current?.label) {
      setTargetLang(current.label)
    }
  }, [])


  const getInputValue = useCallback(
    (value: string) => {
      setAutoLoading(true)
      setInputText(value)
      if (value) {
        const langCode = franc(value)
        const key: any = (francToLanguageValueMap as any)[langCode]
        const current = findLabelByValue(key)
        if (current?.label) {
          setSourceLang(current.label)
          if (current.label === targetLang) {
            if (targetLang !== 'English') {
              setTargetLang('English')
            } else {
              setTargetLang('Simplified Chinese')
            }
          }
        }
      }
      setTimeout(() => {
        setAutoLoading(false)
      }, 1000)
    },
    [targetLang]
  )

  const handleTabChange = (newTab: string) => {
    // 清空所有内容
    setInputText('')
    setTranslateValue('')
    setTranslateText('')
    setTranslatedHtml('')
    setLoading(false)
    setErrorMsg('')
    setHumanizeAlert(false)
    setCount(0)
    
    // 清空文档相关状态
    setDocumentType('')
    setWordText('')
    setWordHtml('')
    setPdfHtml('')
    setPdfUrl(undefined)
    setTxtContent(undefined)
    setRateResult(null)
    isShowAiRateRef.current = false
    
    // 清空所有轮询
    clearAllPolling()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setTranslatedHtml('')
    const file = event.target.files?.[0]
    if (!file) return

    setHumanizeAlert(true)

    try {
      console.log('开始处理文件:', file.name, 'type:', file.type)

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('文件大小超过10MB限制')
      }

      if (file.type === 'application/pdf') {
        setDocumentType('pdf')
        try {
          console.log('开始处理PDF文件')
          const pdfUrl = URL.createObjectURL(file)
          setPdfUrl(pdfUrl)

          const extractedText = await extractPdfText(file)
          console.log('PDF文本提取成功，长度:', extractedText.length)

          const { limitedText, unitUsed } = truncateText(extractedText, maxCount)
          console.log('文本截断完成，使用字符数:', unitUsed)
          getInputValue(limitedText)
          setPdfHtml(limitedText)
          setCount(unitUsed)
        } catch (error: unknown) {
          console.error('PDF处理失败:', error)
          alert(`PDF处理失败: ${error instanceof Error ? error.message : String(error)}`)
          // 清理资源
          setPdfUrl(undefined)
          setWordHtml('')
          setTranslatedHtml('')
        }
      } else if (file.type === 'text/plain') {
        setDocumentType('text')
        const reader = new FileReader()
        reader.onload = async (e: ProgressEvent<FileReader>) => {
          const text = e.target?.result as string
          getInputValue(text)

          setTxtContent(text)
          setCount(text.length)
        }
        reader.readAsText(file)
      } else {
        setDocumentType('word')
        const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() })
        const html = result.value
        getInputValue(html)
        setWordHtml(html)

        const container = document.createElement('div')
        container.innerHTML = html

        const textNodes: any[] = []
        const walk = (node: any) => {
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
            textNodes.push(node)
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (const child of node.childNodes) {
              walk(child)
            }
          }
        }
        walk(container)

        const fullText = textNodes.map((n) => n.nodeValue).join('')
        const { limitedText, unitUsed } = truncateText(fullText, maxCount)
        setCount(unitUsed) // 更新字符数量

        // 替换 DOM 中的文本节点，仅保留 limitedText 范围内内容
        let remaining = limitedText
        setWordText(limitedText)
        for (const node of textNodes) {
          if (!remaining) {
            node.nodeValue = ''
            continue
          }
          const original = node.nodeValue
          const take = Math.min(original.length, remaining.length)
          node.nodeValue = remaining.slice(0, take)
          remaining = remaining.slice(take)
        }

        const truncatedHtml = container.innerHTML
        setWordHtml(truncatedHtml)
      }
    } catch (error: unknown) {
      console.error('文件处理错误:', error)
      alert(error instanceof Error ? error.message : '文件处理失败')
    } finally {
    }
  }

  const changeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value

    if (val.length) {
      setHumanizeAlert(true)
    }

    if (val.length > 50) {
      setErrorMsg('')
    }

    const len = val.length

    if (len <= maxCount) {
      setInputText(val)
      setCount(len)
    } else {
      setInputText(val.substring(0, maxCount))
      setCount(maxCount)
    }
  }

  const onBlur = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    getInputValue(val)
  }

  const pollTranslateValue = (id: string) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        if (!intervalRef.current) {
          clearInterval(interval)
          return
        }

        try {
          const translateValue = await translateExecuteGet(id)
          if (translateValue?.data?.data?.status !== 'PROCESSING') {
            clearInterval(interval)
            resolve(translateValue)
          }
        } catch (error) {
          clearInterval(interval)
          reject(error)
        }
      }, 5000)

      intervalRef.current = interval
    })
  }

  const pollRateResult = (id: string) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        if (!ratePollingRef.current) {
          clearInterval(interval)
          return
        }

        try {
          const result = await translateExecuteRateGet(id)
          if (result?.data?.data?.status !== 'PROCESSING') {
            clearInterval(interval)
            resolve(result)
          }
        } catch (error) {
          clearInterval(interval)
          reject(error)
        }
      }, 5000)

      ratePollingRef.current = interval
    })
  }

  const handleTranslate = async () => {
    if (!session) {
      toggleSignupDialog(true, EventEntry.RichSignupDialog)
      return
    }

    setDisabled(false)
    setRateResult(null)
    setTranslateValue('')
    if (inputText.length < MIN_COUNT) {
      const minErrorMsg = tHumanize('less_than_min_words', { minWords: MIN_COUNT })
      setErrorMsg(minErrorMsg)
      return
    }

    setErrorMsg('')

    setLoading(true)
    const res = await translateExecute({
      content: inputText,
      language: sourceLang || (browserLanguage ? findLabelByValue(browserLanguage)?.label : undefined),
      outputLanguage: targetLang,
      industryModel,
      localLanguage: locale,
    })
    const id = res?.data?.id

    setTaskId(id)

    if (!id) {
      return
    }

    try {
      const translateValue: any = await pollTranslateValue(id)
      if (translateValue?.data?.data?.status === 'FAILED') {
        setErrorMsg(translateValue?.data?.data?.errorMsg)
        setLoading(false)
        sendEvent('translator', {
          type: 'translate_fail',
          custom_data: {
            class: 'text',
          },
        })

        return
      }
      setTranslateValue(translateValue?.data?.data?.result)
      setLoading(false)
      // 显示评估组件
      isShowAiRateRef.current = true

      sendEvent('translator', {
        type: 'translate_success',
        custom_data: {
          class: 'text',
        },
      })

      const rateResult: any = await pollRateResult(id)
      if (rateResult?.data?.data?.status === 'FAILED') {
        setErrorMsg(rateResult?.data?.data?.errorMsg)
        setLoading(false)
        return
      }
      setRateResult(JSON.parse(rateResult?.data?.data?.result))
    } catch (error) {
      console.error('Error fetching translation:', error)
    }
  }

  const clearAllPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (ratePollingRef.current) {
      clearInterval(ratePollingRef.current)
      ratePollingRef.current = null
    }
  }

  const clearContent = () => {
    setInputText('')
    setTranslateValue('')
    setTranslateText('')
    setTranslatedHtml('')
    setLoading(false)
    setErrorMsg('')
    setHumanizeAlert(false)
    setCount(0)
    
    // 清空文档相关状态
    setDocumentType('')
    setWordText('')
    setWordHtml('')
    setPdfHtml('')
    setPdfUrl(undefined)
    setTxtContent(undefined)
    setRateResult(null)
    isShowAiRateRef.current = false
    
    clearAllPolling()
  }

  const copyResult = () => {
    if (!translateValue) return

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(translateValue)
        .then(() => {
          setIsShowCopyTips(true)
          setTimeout(() => setIsShowCopyTips(false), 2000)
        })
        .catch((err) => console.error('复制失败:', err))
    }

    sendEvent('translator', {
      type: 'translate_click_copy',
      custom_data: {
        class: 'text',
      },
    })
  }

  const humanizeResult = () => {
    localStorage.setItem('SOURCE_TRANSLATOR_CONTENT', translateValue)
    window.open('ai-to-human-text-converter?source=translator', '_blank')
  }

  const toLinkTranslatorBefore = () => {
    localStorage.setItem('SOURCE_TRANSLATOR_CONTENT', inputText)
    window.open('ai-to-human-text-converter?source=translator', '_blank')
  }

  const EmptyComponent = () => (
    <div className="multilingualTranslation-empty">
      {loading ? (
        <div className="flex flex-col items-center">
          <Spinner size="lg" color="primary" />
          {/* <p className="mt-4 text-default-500">翻译中...</p> */}
        </div>
      ) : (
        <div className="empty-inner">
          <img src="/translator/ai_icon@2x.png" alt="AI" className="w-32 h-32" />
          <div className="empty-text">{t('tips_click_text')}</div>
        </div>
      )}
    </div>
  )

  const DocumentComponent = useMemo(() => {
    if (documentType === 'text') {
      return <div className="content-editor">{txtContent}</div>
    } else if (documentType === 'pdf') {
      return <iframe src={pdfUrl} className="content-editor" style={{ width: '100%', height: '100%' }}></iframe>
    } else if (documentType === 'word') {
      return <div dangerouslySetInnerHTML={{ __html: wordHtml }} className="content-editor"></div>
    } else {
      return null
    }
  }, [documentType, txtContent, pdfUrl, wordHtml])

  const DocumentUploadArea = () => (
    <div className="input-box">
      <div className="input-bg-outer">
        <div className="input-bg-inner">
          {/* 文件类型图标 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">PDF</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">DOCX</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">TXT</span>
              </div>
            </div>
          </div>
          <span className="input-text text-center">
            Upload or drop document to translate Max file size <span className="input-max-text">10 MB</span>
          </span>
        </div>
      </div>
      <input
        accept=".txt,.docx,.doc,.pdf"
        id="contained-button-file"
        multiple
        type="file"
        onChange={handleFileChange}
      />
    </div>
  )

  return (
    <div className="multilingualTranslation-container relative">
      {/* Tab Switcher */}
      <div className="multilingualTranslation-tabs">
         {tabs.map((tab, index) => (
           <div
             key={index}
             className="multilingualTranslation-tab-default"
             style={{
               border: '1px solid #3562EC',
               background: activeIndex === index ? '#3562EC' : 'transparent',
               boxShadow: activeIndex === index ? '0px 4px 18.1px 0px #021E2E40' : 'none',
               color: activeIndex === index ? '#fff' : '#3562EC'
             }}
             onClick={() => {
               setActiveIndex(index)
               handleTabChange(index === 0 ? 'text' : 'document')
             }}
           >
             <img 
               src={index === activeIndex ? tab.activeIcon : tab.defaultIcon} 
               alt="tab-icon"
               style={{
                 filter: activeIndex === index ? 'brightness(0) invert(1)' : 'none',
                 opacity: 1
               }}
             />
             <span 
               className="multilingualTranslation-tab-label"
               style={{
                 color: activeIndex === index ? '#fff' : '#3562EC',
                 fontWeight: activeIndex === index ? 500 : 400
               }}
             >
               {tab.label}
             </span>
           </div>
         ))}
      </div>

      {/* Main Translation Interface */}
      <div className="multilingualTranslation-main">
        {/* Content Area */}
        <div className="multilingualTranslation-content flex flex-col lg:flex-row gap-4 lg:gap-0">
          {/* Left Side - Input */}
          
          {/* Left Header - Source Language and Model */}
          <div className='w-full relative'>
            <div className="multilingualTranslation-main-header px-6 flex items-center gap-4 md:justify-between rounded-t-xl lg:rounded-tr-none relative">
              <div 
                className="left-language-inner"
                ref={leftLanguageInnerRef}
                onClick={() => {
                  setIsShowSourceLanguage(!isShowSourceLanguage)
                  setIsShowTargetLanguage(false) // 关闭目标语言选择器
                }}
              >
                <span>{sourceLang || t('automatic_detection')}</span>
                <img src="/translator/active-right-arrow.png" alt="arrow" />
              </div>
              {/* Model Selection - 使用 HeroUI Select 组件 */}
              <div>
                <Select
                  size="sm"
                  variant="bordered"
                  placeholder="Model"
                  selectedKeys={[industryModel]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string
                    setIndustryModel(selectedKey)
                  }}
                  classNames={{
                    trigger: "w-40 h-8 min-h-8 rounded-sm border-[#505ee4] border-[0.5px]",
                    value: "text-sm",
                    selectorIcon: "w-3 h-3"
                  }}
                  renderValue={(items) => {
                    const selectedItem = items[0]
                    if (!selectedItem) return "Model: Field"
                    
                    const option = comboOptions.find(opt => opt.id === selectedItem.key)
                    return (
                      <div className="flex items-center gap-1">
                        <span className="text-default-500">Model:</span>
                        <span className="text-[#505ee4] font-medium">{option?.label || 'Field'}</span>
                      </div>
                    )
                  }}
                >
                  {comboOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex items-center gap-2">
                        <img src={option.icon} alt="" className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              {/* Source Language Selector */}
              <LanguageSelector
                isOpen={isShowSourceLanguage}
                onClose={() => setIsShowSourceLanguage(false)}
                onSelect={onSelectSourceLanguage}
                selectedLanguage={sourceLang}
                title={t('automatic_detection')}
                showAutoDetection={true}
                onAutoDetect={handleAutoDetect}
              />
            </div>
            
            <div className={`content-left bg-white rounded-b-xl ${isShowAiRateRef.current ? 'lg:rounded-b-none' : 'lg:rounded-br-none'}`}>
              <div className="content-editor">
                {activeIndex === 0 ? (
                  // Text mode
                  <Textarea
                    value={inputText}
                    onChange={changeTextarea}
                    onBlur={onBlur}
                    placeholder={t('translator_input_placeholder')}
                    className="w-full h-full resize-none border-none outline-none"
                    classNames={{
                      base: "bg-transparent h-full hover:bg-transparent focus-within:bg-transparent",
                      input: "bg-transparent text-foreground h-full hover:bg-transparent focus:bg-transparent",
                      inputWrapper: "bg-transparent border-none shadow-none h-full hover:bg-transparent focus-within:bg-transparent data-[hover=true]:bg-transparent data-[focus=true]:bg-transparent"
                    }}
                    style={{
                      height: '100%',
                      overflowY: 'hidden',
                      overflowX: 'hidden'
                    }}
                    minRows={14}
                    maxRows={22}
                  />
                ) : (
                  // Document mode
                  <div className="translation-document">
                    {documentType ? (
                      DocumentComponent
                    ) : (
                      <DocumentUploadArea />
                    )}
                  </div>
                )}
              </div>

              {/* Humanize Alert */}
              {humanizeAlert && (
                <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primary">{t('tips_humanize_text')}</span>
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        onClick={toLinkTranslatorBefore}
                      >
                        {t('click_here_to_humanize')}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className='text-xl'
                      onClick={() => setHumanizeAlert(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-danger">{errorMsg}</span>
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className='text-xl'
                      onClick={() => setErrorMsg('')}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="content-left-footer">
                <div className="content-count">
                  <span style={{ color: count === maxCount ? '#FB4C4E' : '' }}>{count}</span>/{maxCount}
                  <div
                    className="clear-content"
                    onClick={clearContent}
                  >
                    <img src="/translator/clear_icon@2x.png" alt="clear" />
                    <span className="clear-text">{tHumanize('clear')}</span>
                  </div>
                </div>
                <div className="left-footer-btns">
                  <div className="button__primary" onClick={handleTranslate}>
                    {loading ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <>
                        <img src="/translator/text@2x copy.png" alt="translate" />
                        <span className="button-text">{t('translator_btn')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Output */}
          <div className='w-full relative'>
            {/* Right Header - Target Language */}
            <div className="multilingualTranslation-main-header rounded-t-xl lg:rounded-tl-none relative">
              <div 
                className="right-language"
                ref={rightLanguageInnerRef}
                onClick={() => {
                  setIsShowTargetLanguage(!isShowTargetLanguage)
                  setIsShowSourceLanguage(false) // 关闭源语言选择器
                }}
              >
                <span>{targetLang || t('target_language')}</span>
                <img src="/translator/active-right-arrow.png" alt="arrow" />
              </div>
              
              {/* Target Language Selector */}
              <LanguageSelector
                isOpen={isShowTargetLanguage}
                onClose={() => setIsShowTargetLanguage(false)}
                onSelect={onSelectTargetLanguage}
                selectedLanguage={targetLang}
                title={t('target_language')}
                showAutoDetection={false}
              />
            </div>
            
            <div className={`multilingualTranslation-content-right bg-white rounded-b-xl ${isShowAiRateRef.current ? 'lg:rounded-b-none' : 'lg:rounded-bl-none'}`}>
              
              {!translateValue ? (
                <EmptyComponent />
              ) : (
                <>
                  <div className="output-content">{translateValue}</div>
                  <div className="content-right-footer">
                    <div className="content-bottom-footer">
                      <div className="left-footer-btns">
                        <div className="button__primary button_shadow" onClick={humanizeResult}>
                          <div className="button-image"></div>
                          <span className="button-text">{tHumanize('humanize')}</span>
                        </div>

                        <div className="button__primary" onClick={copyResult}>
                          <img src="/translator/button_copy_icon@2x.png" alt="copy" />
                          <span className="button-text">{tHumanize('copy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Copy Success Toast */}
      {isShowCopyTips && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="bg-success text-white">
            <CardBody className="p-3">
              <p className="text-sm">{tHumanize('copied_result')}</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* AI Rate Component */}
      {isShowAiRateRef.current && <AiRate result={rateResult} />}
    </div>
  )
}
