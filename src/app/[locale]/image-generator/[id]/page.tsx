'use client'

import MainAppBar from '@/app/[locale]/appBar'
import { useGTM } from '@/context/GTMContext'
import { useEffect, useMemo, useRef, useState, useContext } from 'react'
import { Button, Card, CardBody } from '@heroui/react'
import { PhotoIcon, RectangleStackIcon, PauseIcon } from '@heroicons/react/24/outline'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { useDownloadStatus } from '@/context/DownloadStatusContext'
import {
  uploadImage,
  getGenerationStatus,
  getImageTemplate,
  getUserCredits,
  imageGenerate,
  getGenerateStatus,
  getUserProfile,
  downloadImageGeneration,
} from '@/api/client/feeLoveApi'
import { getLocalStorage } from '@/util/localStorage'
import {
  BreastSize as ApiBreastSize,
  Resolution as ApiResolution,
  GenerationStatus
} from '@/api/client/feeLoveApi.interface'

type ViewMode = 'sideBySide' | 'slider'

type BreastSize = 'small' | 'medium' | 'large' | 'huge' | 'enormous'

type Resolution = '2k' | '4k'

// Parameter 接口定义
interface Parameter {
  id: string
  actionId: string
  name: string
  label: string
  type: 'SELECT' | 'INPUT'
  options?: string[]
  defaultValue?: string
  required: boolean
  sortOrder: number
}


const DEFAULT_ORIGINAL_IMG =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80'

const DEFAULT_RESULT_IMG =
  'https://images.pexels.com/photos/1391499/pexels-photo-1391499.jpeg'

interface ImageGeneratorPageProps {
  params: { id: string }
}

export default function ImageGeneratorPage({ params }: ImageGeneratorPageProps) {
  // 检查环境变量 NEXT_PUBLIC_CLOAK
  const isCloakEnabled = process.env.NEXT_PUBLIC_CLOAK === 'true'
  
  const { sendEvent } = useGTM() 
  const router = useRouter()
  const routeParams = useParams<{ locale: string }>()
  const { id } = params
  const { data: session } = useSession()
  const { toggleLoginDialog } = useContext(AuthDialogContext)
  const { showSnackbar } = useSnackbar()
  const { showDownloadStatus } = useDownloadStatus()

  const models = [
    {
        value: 'inpaint',
        label: 'Standard',
        // icon: Zap,
        desc: 'Fast & Reliable'
    },
    {
        value: 'comfy',
        label: 'ComfyUI Pro',
        // icon: Sparkles,
        desc: 'Best Quality (BETA)'
    },
    {
        value: 'pulid',
        label: 'PuLID',
        // icon: Camera,
        desc: 'Identity Keep'
    },
    {
        value: 'z-image',
        label: 'Z-Image',
        // icon: ImageIcon,
        desc: 'Creative'
    }
];

  // --- States from AI+V Project ---
  const [templateName, setTemplateName] = useState<string>('')
  const [sourceImage, setSourceImage] = useState<string | null>('')
  const [resultImage, setResultImage] = useState<string | null>('') // Initially no generated image
  const [imageGenerationId, setImageGenerationId] = useState<string | number | null>(null)
  
  const [model, setModel] = useState<string>('inpaint')
  const [credits, setCredits] = useState(0)
  const [currentCreditsBalance, setCurrentCreditsBalance] = useState<number | null>(null) // 当前积分余额
  const [sourceDimensions, setSourceDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [posterId, setPosterId] = useState<string | null>(null)
  const [hasUserGenerated, setHasUserGenerated] = useState(false) // 标记是否是用户主动生成成功的
  const [generationError, setGenerationError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingTokenRef = useRef(0) // 用于取消轮询

  // --- States from Wishbox Project ---
  const [mode, setMode] = useState<ViewMode>('sideBySide')
  const [breastSize, setBreastSize] = useState<BreastSize>('small')
  const [resolution, setResolution] = useState<Resolution>('2k')
  const [sliderPct, setSliderPct] = useState(50)
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)

  // --- Parameters States ---
  const [hasParameters, setHasParameters] = useState<boolean>(false)
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({})

  const costCredits = useMemo(() => 5, []) // 固定5个积分
  const canGenerate = sourceImage // && credits >= costCredits && !isGenerating

  // 从 API 获取当前积分（优先），失败时 fallback 到 localStorage
  const fetchCreditsBalance = async () => {
    // 检查是否有用户（登录用户或访客用户）
    const hasUser = session?.user || (() => {
      try {
        const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
        return storedSession?.user?.accessToken && storedSession.user.isGuest
      } catch {
        return false
      }
    })()
    
    if (!hasUser) {
      setCurrentCreditsBalance(0)
      return
    }

    try {
      const profileData = await getUserProfile()
      if (profileData?.creditsBalance !== undefined && profileData?.creditsBalance !== null) {
        setCurrentCreditsBalance(profileData.creditsBalance)
        return
      }
    } catch (error) {
      console.error('Failed to fetch credits from getUserProfile:', error)
    }

    // fallback：localStorage 或 session
    try {
      const sessionData = getLocalStorage<any>('AVOID_AI_SESSION')
      const creditsFromStorage = sessionData?.user?.creditsBalance
      if (creditsFromStorage !== undefined && creditsFromStorage !== null) {
        setCurrentCreditsBalance(creditsFromStorage)
        return
      }
      
      // 如果 localStorage 没有，尝试从 session 获取
      if (session?.user?.creditsBalance !== undefined && session.user.creditsBalance !== null) {
        setCurrentCreditsBalance(session.user.creditsBalance)
        return
      }
      
      setCurrentCreditsBalance(0)
    } catch (error) {
      console.error('Failed to get credits from localStorage fallback:', error)
      setCurrentCreditsBalance(0)
    }
  }

  // --- Logic from AI+V Project ---

  // Get image dimensions helper
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => {
        resolve({ width: 768, height: 1024 }) // Fallback
      }
      img.src = url
    })
  }

  // Fetch existing generation data if ID exists
  useEffect(() => {
    if (id && id !== 'new') {
      fetchGeneration()
    } else {
      if (DEFAULT_ORIGINAL_IMG) {
        getImageDimensions(DEFAULT_ORIGINAL_IMG).then(setSourceDimensions)
      }
    }
  }, [id])

  // 页面初始化及 session 变化时，从 API 获取当前积分
  useEffect(() => {
    fetchCreditsBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const fetchGeneration = async () => {
    try {
      const data = await getImageTemplate(id)
      let mediaArr, resultImageUrl
      mediaArr = data?.character?.media || []
      if(mediaArr.length) {
        resultImageUrl = mediaArr[0].url || null
      }
      setTemplateName(data.character.name || '')
      setSourceImage(data.character.coverUrl || null)
      setResultImage(resultImageUrl)
      setImageGenerationId(id)
      // 初始化加载时不设置 hasUserGenerated，这样按钮不会显示
      setHasUserGenerated(false)
      if (data.model) {
        setModel(data.model)
      }
      if (data.sourceImageUrl) {
        getImageDimensions(data.sourceImageUrl).then(setSourceDimensions)
      }

      // 提取 parameters 数据
      const actions = data?.actions || []
      if (actions.length > 0 && actions[0]) {
        const action = actions[0]
        const actionParameters = action.parameters || []
        
        if (actionParameters.length > 0) {
          setHasParameters(true)
          // 按 sortOrder 排序
          const sortedParameters = [...actionParameters].sort((a, b) => a.sortOrder - b.sortOrder)
          setParameters(sortedParameters)
          
          // 初始化参数值，使用 defaultValue 或第一个选项
          const initialValues: Record<string, string> = {}
          sortedParameters.forEach((param) => {
            if (param.type === 'SELECT' && param.options && param.options.length > 0) {
              initialValues[param.id] = param.defaultValue || param.options[0]
            } else if (param.defaultValue) {
              initialValues[param.id] = param.defaultValue
            }
          })
          setParameterValues(initialValues)
        } else {
          setHasParameters(false)
          setParameters([])
          setParameterValues({})
        }
      } else {
        setHasParameters(false)
        setParameters([])
        setParameterValues({})
      }
    } catch (error) {
      console.error('Failed to fetch generation:', error)
    }
  }

  const fetchCredits = async () => {
    try {
      const data = await getUserCredits()
      setCredits(data.totalCredits || 0)
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件格式
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      showSnackbar('Only JPG, JPEG, PNG, and WEBP formats are allowed', 'error')
      // 清空文件输入
      if (e.target) {
        e.target.value = ''
      }
      return
    }
      
    // 积分检查已在点击 Upload 按钮时完成，这里直接开始上传
    setIsUploading(true)
    try {
      const data = await uploadImage(file)
      setSourceImage(data.url)
      setResultImage(null) // Clear previous result
      setHasUserGenerated(false) // 上传新图片时重置标记
      setGenerationError(false)

      const dims = await getImageDimensions(data.url)
      setSourceDimensions(dims)

      // 保存 poster_id
      if (data.id) {
        setPosterId(data.id)
      }
      
      // uploadImage 成功后直接调用 handleGenerate，传递 poster_id
      await handleGenerate(data.id)
    } catch (error: any) {
      console.error('Upload error:', error)
      showSnackbar(error.message || 'Failed to upload image', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const pollStatus = async (requestId: string | number, pollingToken: number, generationId?: string | number | null) => {
    // 进入轮询阶段：至少从 50% 开始，避免第二次生图因闭包/旧状态导致卡住
    setGenerationProgress((prev) => (prev < 50 ? 50 : prev))

    // 启动一个定时器，让进度自然递增到95%（用函数式更新避免闭包卡住）
    const progressTimer = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 95) return prev
        return Math.min(95, prev + 0.3) // 平滑递增
      })
    }, 300) as any

    try {
      while (true) {
        try {
          // 如果期间发起了新的生成/离开页面，则取消本次轮询
          if (pollingTokenRef.current !== pollingToken) {
            clearInterval(progressTimer)
            return
          }
          
          // 调用 getGenerateStatus 接口获取生图状态
          const data = await getGenerateStatus(requestId)
          
          console.log(`[Polling] Status: ${data?.status}`, data) // 调试日志
          
          const status = data?.status
          if (generationId) {
            setImageGenerationId(generationId)
          }
          
          // 完成状态：生图完成，使用 generatedUrl
          if (status === 'completed') {
            clearInterval(progressTimer)
            setGenerationProgress(100)
            
            // 使用 generatedUrl 作为最终结果
            if (data.generatedUrl) {
              setResultImage(data.generatedUrl)
              // 从 getGenerateStatus 返回的数据中获取 id（当 status 为完成时）
              const generationId = (data as any)?.id ?? (data as any)?.data?.id ?? (data as any)?.generationId ?? (data as any)?.recordId ?? null
              setImageGenerationId(generationId)
              // 标记为用户主动生成成功，显示按钮
              setHasUserGenerated(true)
            } else {
              throw new Error('Generated URL not found in response')
            }
            
            // completed 状态时不更新积分（已在 imageGenerate 成功返回时更新）
            
            return
          } 
          // 失败状态
          else if (status === 'failed' || status === 'error') {
            clearInterval(progressTimer)
            
            // 失败时更新用户积分
            try {
              const profileData = await getUserProfile()
              if (profileData?.creditsBalance !== undefined && profileData?.creditsBalance !== null) {
                setCurrentCreditsBalance(profileData.creditsBalance)
                // 更新 localStorage
                const sessionData = getLocalStorage<any>('AVOID_AI_SESSION')
                if (sessionData && sessionData.user) {
                  sessionData.user.creditsBalance = profileData.creditsBalance
                  localStorage.setItem('AVOID_AI_SESSION', JSON.stringify(sessionData))
                }
                // 触发自定义事件，通知 appBar 更新积分
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: { credits: profileData.creditsBalance } }))
                }
              }
            } catch (error) {
              console.error('Failed to update credits after generation failure:', error)
            }
            
            throw new Error(data.error || data.message || 'Generation failed during processing')
          }
          // 其他状态（pending, processing 等）继续轮询

          await new Promise((resolve) => setTimeout(resolve, 2500))
        } catch (error: any) {
          clearInterval(progressTimer)
          console.error('Polling error:', error)
          throw error
        }
      }
    } catch (error: any) {
      clearInterval(progressTimer)
      throw error
    }
  }

  // 将字符串转换为驼峰格式（支持空格和下划线分隔）
  // 例如: "Breast Size" -> "breastSize", "hair_style" -> "hairStyle", "long wavy" -> "longWavy"
  const toCamelCase = (str: string): string => {
    // 先处理下划线和空格，统一用空格分隔
    const normalized = str.replace(/[_\s]+/g, ' ')
    return normalized
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map((word, index) => {
        const lowerWord = word.toLowerCase()
        if (index === 0) {
          return lowerWord
        }
        return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1)
      })
      .join('')
  }

  // 模拟进度更新（用于在等待 API 响应时显示进度，从0%到98%）
  const simulateProgress = () => {
    setGenerationProgress(0)
    
    // 清除之前的定时器
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // 模拟进度：0% -> 98%（在整个API调用过程中持续递增）
    let currentProgress = 0
    progressIntervalRef.current = setInterval(() => {
      if (currentProgress < 98) {
        currentProgress += 1.2 // 每次增加1.2%，更快
        setGenerationProgress(Math.min(98, currentProgress))
      } else {
        // 到达98%后停止，等待API调用完成
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
      }
    }, 250) as any // 每150ms更新一次，更快
  }

  const handleGenerate = async (uploadedPosterId?: string | null) => {
    if (!sourceImage) return
    
    // 使用传入的 posterId 或状态中的 posterId
    const currentPosterId = uploadedPosterId !== undefined ? uploadedPosterId : posterId

    setIsGenerating(true)
    setGenerationProgress(0)
    setResultImage(null) // Clear previous result
    setHasUserGenerated(false) // 开始生成时重置标记
    setGenerationError(false)
    
    // 开始模拟进度（从0%开始递增）
    simulateProgress()

    try {
      // 获取 characterId（从 URL 参数 id 获取）
      const characterId = id && id !== 'new' ? id : ''
      
      if (!characterId) {
        throw new Error('Character ID is required')
      }

      // 构建参数对象
      const params: Record<string, string | number | boolean> = {}
      
      // 如果有 poster_id，添加到参数中
      if (currentPosterId) {
        params.posterId = currentPosterId
      }
      
      // 如果有 parameters，将 parameterValues 转换为驼峰格式的键值对
      if (hasParameters && parameters.length > 0 && Object.keys(parameterValues).length > 0) {
        parameters.forEach((param) => {
          const value = parameterValues[param.id]
          if (value !== undefined && value !== null && value !== '') {
            // 将参数名转换为驼峰格式（例如 "Breast Size" -> "breastSize", "hair_style" -> "hairStyle"）
            const camelKey = toCamelCase(param.name)
            // 将参数值也转换为驼峰格式（例如 "long wavy" -> "longWavy"）
            const camelValue = typeof value === 'string' ? toCamelCase(value) : value
            params[camelKey] = camelValue
          }
        })
      }

      // 调用 imageGenerate 接口
      const result = await imageGenerate(characterId, params)
      
      // 清除模拟进度的定时器（API调用完成后）
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      console.log('[handleGenerate] API response:', result) // 调试日志

      if (!result) {
        throw new Error('No result returned from API')
      }

      // imageGenerate 接口成功返回后，立即更新用户积分
      try {
        const profileData = await getUserProfile()
        if (profileData?.creditsBalance !== undefined && profileData?.creditsBalance !== null) {
          setCurrentCreditsBalance(profileData.creditsBalance)
          // 更新 localStorage
          const sessionData = getLocalStorage<any>('AVOID_AI_SESSION')
          if (sessionData && sessionData.user) {
            sessionData.user.creditsBalance = profileData.creditsBalance
            localStorage.setItem('AVOID_AI_SESSION', JSON.stringify(sessionData))
          }
          // 触发自定义事件，通知 appBar 更新积分
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: { credits: profileData.creditsBalance } }))
          }
        }
      } catch (error) {
        console.error('Failed to update credits after imageGenerate:', error)
      }

      // 如果启用了 CLOAK，imageGenerate 接口会直接返回生图结果，不需要轮询
      if (isCloakEnabled) {
        // 直接从返回结果中获取生图结果
        const generatedUrl = result.generatedUrl || (result as any)?.data?.generatedUrl || (result as any)?.url
        const generationId = result.id || (result as any)?.data?.id || (result as any)?.generationId || (result as any)?.recordId

        if (generatedUrl) {
          setGenerationProgress(100)
          setResultImage(generatedUrl)
          if (generationId) {
            setImageGenerationId(generationId)
          }
          setHasUserGenerated(true)
          
          // 如果 id 是 'new'，更新 URL
          if (id === 'new' && generationId) {
            const locale = routeParams?.locale || 'en'
            router.replace(`/${locale}/image-generator/${generationId}`)
          }
        } else {
          throw new Error('Generated URL not found in response')
        }
      } else {
        // 原有逻辑：需要轮询获取生图状态
        const status = result.status
        const requestId = result.requestId

        // 如果 status 为 pending，需要轮询
        if (status === 'pending') {
          if (!requestId) {
            throw new Error('Request ID is required for polling')
          }
          
          console.log('Async job started, requestId:', requestId)
          setGenerationProgress(50) // 设置初始轮询进度
          
          // 如果 id 是 'new'，更新 URL
          if (id === 'new' && result.id) {
            router.replace(`/image-generator/${result.id}`)
          }
          
          // 每次生成递增 token，用于取消前一次轮询
          pollingTokenRef.current += 1
          const pollingToken = pollingTokenRef.current
          
          // 开始轮询状态
          await pollStatus(requestId, pollingToken, result.id)
        } else {
          throw new Error(`Unexpected status: ${status}`)
        }
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      setGenerationError(true)
      // 清除定时器
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setGenerationProgress(0)
      
      showSnackbar(error.message || 'Failed to generate image', 'error')
    } finally {
      setIsGenerating(false)
      // 确保清理定时器
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }

  // 清理定时器
  // 卸载时清理进度定时器和停止轮询
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      // 让进行中的 pollStatus 立刻退出
      pollingTokenRef.current += 1
    }
  }, [])

  // --- Logic from Wishbox Project ---
  const setPctFromClientX = (clientX: number) => {
    const el = sliderRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width)
    const pct = (x / rect.width) * 100
    setSliderPct(Math.round(pct * 10) / 10)
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      setPctFromClientX(e.clientX)
    }
    const onUp = () => {
      draggingRef.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return
      const t = e.touches[0]
      if (!t) return
      setPctFromClientX(t.clientX)
    }
    const onTouchEnd = () => {
      draggingRef.current = false
    }
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const backgroundGradient = {
    background: '#1e1e2e',
    backgroundImage: 'linear-gradient(to bottom right in oklab, #000 0%, color-mix(in oklab, lab(24.9401% 45.2703 -51.2728) 20%,transparent) 50%, color-mix(in oklab, lab(29.4367% 49.3962 3.35757) 20%,transparent) 100%)'
  }

  return (
    <div className="min-h-screen text-white pt-[60px]" style={backgroundGradient}>
      <MainAppBar alwaysShow={true} isNotBg={false} />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-7xl mx-auto">
          {/* Left preview */}
          <div className="lg:col-span-6 space-y-4">
            {/* Tabs */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setMode('slider')}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    mode === 'slider' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <RectangleStackIcon className="h-4 w-4" />
                  Slider
                </button>
                <button
                  type="button"
                  onClick={() => setMode('sideBySide')}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    mode === 'sideBySide' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <PhotoIcon className="h-4 w-4" />
                  Side by Side
                </button>
              </div>
            </div>

            {mode === 'sideBySide' && (
              <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="overflow-hidden border border-white/10 bg-[#0c0a17]">
                  <CardBody className="p-0">
                    <div className="min-h-[300px] relative rounded-2xl overflow-hidden border-2 border-[#ec4899]/20 bg-gray-900 shadow-xl group">
                      {sourceImage ? (
                        <img src={sourceImage} alt="Original" className="w-full h-auto object-contain max-h-[70vh]" />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-800 text-white/50">Upload an image</div>
                      )}
                      <div className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-black">
                        Original
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="overflow-hidden border border-pink-500/40 bg-[#0c0a17]">
                  <CardBody className="p-0">
                    <div className="relative min-h-[300px] rounded-2xl overflow-hidden border-2 border-[#ec4899] bg-gray-900 h-full flex items-center justify-center shadow-xl group">
                      {isGenerating ? (
                        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-800 text-white/50 space-y-4 p-4">
                          <div className="text-sm font-medium">Generating...</div>
                          <div className="w-full max-w-xs space-y-2">
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
                                style={{ width: `${generationProgress}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                              </div>
                            </div>
                            <div className="text-xs text-center text-white/60">{Math.round(generationProgress)}%</div>
                          </div>
                        </div>
                      ) : resultImage ? (
                        <img
                          src={resultImage}
                          alt="Generated Result"
                          className="w-full h-auto object-contain max-h-[70vh]"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-800 text-white/50">Result will appear here</div>
                      )}
                      <div className="absolute left-3 top-3 rounded-md bg-pink-500 px-2 py-1 text-xs font-semibold text-white">
                        Generated Result
                      </div>
                    </div>
                  </CardBody>
                </Card>
                </div>

                {/* Action Buttons */}
                {!isGenerating && generationError && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        if (!sourceImage) return
                        const currentCredits = currentCreditsBalance ?? 0
                        if (currentCredits < costCredits) {
                          showSnackbar(
                            `Insufficient credits. You need ${costCredits} credits to generate an image, but you only have ${currentCredits} credits.`,
                            'warning'
                          )
                          return
                        }
                        setGenerationError(false)
                        handleGenerate()
                      }}
                      className="max-w-[160px] w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                        <path d="M20 2v4"></path>
                        <path d="M22 4h-4"></path>
                        <circle cx="4" cy="20" r="2"></circle>
                      </svg>
                      Try Again
                    </button>
                  </div>
                )}

                {!isGenerating && !generationError && resultImage && hasUserGenerated && (
                  <div className="mt-4 flex gap-3 justify-center">
                    {/* Download Button */}
                    <button
                      disabled={isDownloading || !imageGenerationId}
                      onClick={async () => {
                        if (!imageGenerationId) {
                          showSnackbar('Cannot download: Missing image generation ID', 'error')
                          return
                        }
                        setIsDownloading(true)
                        try {
                          showDownloadStatus('preparing')
                          await downloadImageGeneration(imageGenerationId, `generated-image-${Date.now()}.jpg`)
                          showDownloadStatus('success')
                        } catch (error: any) {
                          console.error('Download failed:', error)
                          showDownloadStatus('error')
                          showSnackbar(error.message || 'Failed to download image', 'error')
                        } finally {
                          setIsDownloading(false)
                        }
                      }}
                      className={`max-w-[160px] cursor-pointer flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${isDownloading || !imageGenerationId ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {isDownloading ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                            <path d="M12 15V3"></path>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <path d="m7 10 5 5 5-5"></path>
                          </svg>
                          Download
                        </>
                      )}
                    </button>

                    {/* Try Again Button */}
                    <button
                      onClick={() => {
                        if (!sourceImage) return
                        // 积分不足提示
                        const currentCredits = currentCreditsBalance ?? 0
                        if (currentCredits < costCredits) {
                          showSnackbar(
                            `Insufficient credits. You need ${costCredits} credits to generate an image, but you only have ${currentCredits} credits.`,
                            'warning'
                          )
                          return
                        }
                        handleGenerate()
                      }}
                      className="max-w-[160px] cursor-pointer flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                        <path d="M20 2v4"></path>
                        <path d="M22 4h-4"></path>
                        <circle cx="4" cy="20" r="2"></circle>
                      </svg>
                      Try Again
                    </button>

                    {/* Hot Video Button */}
                    {!isCloakEnabled && (
                      <button
                        onClick={() => {
                          // Navigate to generate page with the result image
                          if (resultImage) {
                            router.push(`/${routeParams?.locale || 'en'}/generate?image=${encodeURIComponent(resultImage)}`)
                          }
                        }}
                        className="flex-1 max-w-[160px] cursor-pointer px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                          <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                          <rect x="2" y="6" width="14" height="12" rx="2"></rect>
                        </svg>
                        Hot Video
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {mode === 'slider' && (
              <div className="space-y-4">
              <Card className="overflow-hidden border border-pink-500/30 bg-[#0c0a17]">
                <CardBody className="p-0">
                  <div 
                    ref={sliderRef} 
                    className="relative w-full max-h-[70vh] lg:max-h-[100vh] rounded-2xl overflow-hidden bg-gray-900 select-none shadow-2xl"
                    style={{ aspectRatio: '1 / 1.5' }}
                  >
                    {/* Source image (底层，完整显示) */}
                    <div className="absolute inset-0">
                      {sourceImage ? (
                        <img
                          src={sourceImage}
                          alt="Source image"
                          className="w-full h-full object-cover md:object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-800 text-white/50">
                          Upload an image
                        </div>
                      )}
                    </div>

                    {/* Result image (上层，通过 clip-path 控制显示区域) */}
                    {resultImage && (
                      <div
                        className="absolute inset-0"
                        style={{ clipPath: `inset(0px ${100 - sliderPct}% 0px 0px)`, opacity: 1 }}
                      >
                        {isGenerating ? (
                          <div className="flex flex-col items-center justify-center h-full w-full bg-gray-800/50 text-white space-y-3 p-4">
                            <div className="text-sm font-medium">Generating...</div>
                            <div className="w-3/4 max-w-xs space-y-2">
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
                                  style={{ width: `${generationProgress}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                              </div>
                              <div className="text-xs text-center text-white/60">{Math.round(generationProgress)}%</div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={resultImage}
                            alt="Result image"
                            className="w-full h-full object-cover md:object-contain"
                          />
                        )}
                      </div>
                    )}

                    {/* Slider divider and handle */}
                    <div
                      className="z-10 absolute top-0 bottom-0 w-1 bg-white/80 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                      style={{ left: `${sliderPct}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize border-2 border-[#ec4899] transition-transform hover:scale-110 active:scale-95"
                        onMouseDown={(e) => {
                          draggingRef.current = true
                          setPctFromClientX(e.clientX)
                        }}
                        onTouchStart={(e) => {
                          draggingRef.current = true
                          const t = e.touches[0]
                          if (t) setPctFromClientX(t.clientX)
                        }}
                        aria-label="Drag"
                      >
                        <div className="flex gap-0.5">
                          <div className="w-1 h-5 bg-[#ec4899] rounded-full"></div>
                          <div className="w-1 h-5 bg-[#ec4899] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

                {/* Action Buttons */}
                {!isGenerating && generationError && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        if (!sourceImage) return
                        const currentCredits = currentCreditsBalance ?? 0
                        if (currentCredits < costCredits) {
                          showSnackbar(
                            `Insufficient credits. You need ${costCredits} credits to generate an image, but you only have ${currentCredits} credits.`,
                            'warning'
                          )
                          return
                        }
                        setGenerationError(false)
                        handleGenerate()
                      }}
                      className="max-w-[160px] w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                        <path d="M20 2v4"></path>
                        <path d="M22 4h-4"></path>
                        <circle cx="4" cy="20" r="2"></circle>
                      </svg>
                      Try Again
                    </button>
                  </div>
                )}

                {!isGenerating && !generationError && resultImage && hasUserGenerated && (
                  <div className="mt-4 flex gap-3 justify-center">
                    {/* Download Button */}
                    <button
                      disabled={isDownloading || !imageGenerationId}
                      onClick={async () => {
                        if (!imageGenerationId) {
                          showSnackbar('Cannot download: Missing image generation ID', 'error')
                          return
                        }
                        setIsDownloading(true)
                        try {
                          showDownloadStatus('preparing')
                          await downloadImageGeneration(imageGenerationId, `generated-image-${Date.now()}.jpg`)
                          showDownloadStatus('success')
                        } catch (error: any) {
                          console.error('Download failed:', error)
                          showDownloadStatus('error')
                          showSnackbar(error.message || 'Failed to download image', 'error')
                        } finally {
                          setIsDownloading(false)
                        }
                      }}
                      className={`max-w-[160px] flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${isDownloading || !imageGenerationId ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {isDownloading ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                            <path d="M12 15V3"></path>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <path d="m7 10 5 5 5-5"></path>
                          </svg>
                          Download
                        </>
                      )}
                    </button>

                    {/* Try Again Button */}
                    <button
                      onClick={() => {
                        if (!sourceImage) return
                        // 积分不足提示
                        const currentCredits = currentCreditsBalance ?? 0
                        if (currentCredits < costCredits) {
                          showSnackbar(
                            `Insufficient credits. You need ${costCredits} credits to generate an image, but you only have ${currentCredits} credits.`,
                            'warning'
                          )
                          return
                        }
                        handleGenerate()
                      }}
                      className="max-w-[160px] flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                        <path d="M20 2v4"></path>
                        <path d="M22 4h-4"></path>
                        <circle cx="4" cy="20" r="2"></circle>
                      </svg>
                      Try Again
                    </button>

                    {/* Hot Video Button */}
                    {!isCloakEnabled && (
                      <button
                        onClick={() => {
                          // Navigate to generate page with the result image
                          if (resultImage) {
                            router.push(`/${routeParams?.locale || 'en'}/generate?image=${encodeURIComponent(resultImage)}`)
                          }
                        }}
                        className="flex-1 max-w-[160px] px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                          <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                          <rect x="2" y="6" width="14" height="12" rx="2"></rect>
                        </svg>
                        Hot Video
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border border-pink-500/20 bg-[#1a1a24]">
              <CardBody className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold text-yellow-400">{templateName}</div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileUpload}
                  />
                  <Button
                    className="bg-yellow-400 text-black font-semibold"
                    size="sm"
                    onClick={() => {
                      sendEvent('start_trial', {
                        custom_data: {
                          currency: 'USD',
                          value: 1
                        }
                      })
                      
                      // 检查是否已登录（包括访客用户）
                      // 优先检查 NextAuth session，如果没有则检查 localStorage 中的访客 session
                      const hasUser = session?.user || (() => {
                        try {
                          const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
                          return storedSession?.user?.accessToken && storedSession.user.isGuest
                        } catch {
                          return false
                        }
                      })()
                      
                      if (!hasUser) {
                        // 未登录，弹出登录弹窗
                        toggleLoginDialog(true)
                        return
                      }
                      
                      // 检查积分是否足够
                      const currentCredits = currentCreditsBalance ?? 0
                      if (currentCredits < costCredits) {
                        showSnackbar(`Insufficient credits. You need ${costCredits} credits to generate an image, but you only have ${currentCredits} credits.`, 'warning')
                        return
                      }
                      
                      // 积分足够，触发文件选择
                      fileInputRef.current?.click()
                    }}
                    isDisabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </CardBody>
            </Card>

            {hasParameters && parameters.length > 0 && (
              <Card className="border border-pink-500/20 bg-[#1a1a24]">
                <CardBody className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">•</span>
                      <span className="text-base font-bold text-white">Parameters</span>
                    </div>
                    {parameters.map((param) => (
                      <div key={param.id} className="mt-4 first:mt-3">
                        <div className="text-sm text-white/80 mb-2">{param.label}</div>
                        {param.type === 'SELECT' && param.options && param.options.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {param.options.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setParameterValues((prev) => ({
                                    ...prev,
                                    [param.id]: option,
                                  }))
                                }}
                                className={`h-9 rounded-lg border text-sm font-semibold capitalize transition-colors ${
                                  parameterValues[param.id] === option
                                    ? 'bg-yellow-400 text-black border-yellow-400'
                                    : 'bg-transparent text-white/80 border-pink-500/30 hover:border-pink-500/60'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* <Card className="border border-pink-500/20 bg-[#1a1a24]">
              <CardBody className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white mb-3">Generation Model</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {models.map((m, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setModel(m.value)}
                        className={`h-9 rounded-lg border text-sm font-semibold capitalize transition-colors ${
                          model === m.value
                            ? 'bg-yellow-400 text-black border-yellow-400'
                            : 'bg-transparent text-white/80 border-pink-500/30 hover:border-pink-500/60'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card> */}

            <Card className="border border-white/10 bg-[#1a1a24]">
              <CardBody className="space-y-3">
                <div className="text-sm font-semibold text-white/80">Image Resolution</div>
                <div className="grid grid-cols-2 gap-2">
                  {(['2k', '4k'] as Resolution[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResolution(r)}
                      className={`h-10 rounded-lg border text-sm font-semibold uppercase transition-colors ${
                        resolution === r
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-transparent text-white/70 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className={`border ${currentCreditsBalance !== null && currentCreditsBalance < costCredits ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-[#1a1a24]'}`}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/90">Cost:</span>
                  <span className="text-sm text-white/90 font-semibold">{costCredits} credits</span>
                </div>
                {currentCreditsBalance !== null && currentCreditsBalance < costCredits && (
                  <div className="mt-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                    <p className="text-sm text-red-300 font-medium">
                      Insufficient credits. You have {currentCreditsBalance} credits.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
            {/* isDisabled={!canGenerate || isGenerating} */}
            <div className="space-y-3">
              <Button
                className="w-full bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:bg-white/10 disabled:text-white/60"
                isDisabled
                onClick={() => handleGenerate()}
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
              
              {/* Progress Bar */}
              {isGenerating && (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>Generating image...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
                      style={{ width: `${generationProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Card className="border border-white/10 bg-[#1a1a24]">
              <CardBody className="text-xs text-white/60 space-y-2">
                <div>• Upload clear, high-quality images for best results</div>
                <div>• Adjust parameters to customize the output</div>
                <div>• Generate image costs 5 credits per use. Generate video costs 20 credits per use.</div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
