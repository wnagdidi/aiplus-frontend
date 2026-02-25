'use client'

import MainAppBar from '@/app/[locale]/appBar'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import { EventEntry } from '@/context/GTMContext'
import { getLocalStorage } from '@/util/localStorage'
import { useSnackbar } from '@/context/SnackbarContext'
import { useDownloadStatus } from '@/context/DownloadStatusContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Textarea,
  Switch,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  cn,
} from '@heroui/react'
import {
  PlusIcon,
  PlayCircleIcon,
  HeartIcon,
} from '@heroicons/react/24/solid'
import {
  ArrowUpTrayIcon,
  ArrowLeftIcon,
  BoltIcon,
  UserIcon,
  StarIcon,
  SparklesIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  getCharacters,
  getFeaturedVideos,
  getVideosPresets,
  uploadImage,
  videoGenerate,
  getGenerateStatus,
  getUserProfile,
  downloadImageGeneration,
} from '@/api/client/feeLoveApi'
import { useSession } from 'next-auth/react'
import { useContext } from 'react'

// 角色数据
interface SelectCharacterItem {
  id: string
  name: string
  cover?: string
  icon?: typeof ArrowUpTrayIcon
  isUpload?: boolean
  isViewMore?: boolean
}

// 模板数据类型
interface Template {
  id: string
  name: string
  emoji: string
  hot: boolean
  prompt?: string
}

// Featured Creations 数据类型
interface FeaturedVideo {
  id: string
  name: string
  prompt?: string
  videoUrl?: string
  popularity?: number
  isHot?: boolean
  sortOrder?: number
  active?: boolean
  isShow?: boolean
}

interface CharacterItem {
  id: string
  name: string
  cover?: string
  coverUrl?: string
}

interface FeaturedCreation {
  id: string
  title: string
  likes: string
  videoUrl: string
  prompt: string
  isVideo: true
}

// Featured Creations 骨架屏卡片（样式参考设计稿）
const FeaturedCreationSkeletonCard = ({ delayMs = 0 }: { delayMs?: number }) => (
  <div className="relative group" style={{ animationDelay: `${delayMs}ms` }}>
    <div className="relative aspect-[9/16] rounded-lg sm:rounded-xl overflow-hidden border border-pink-500/20">
      <div
        className="animate-pulse rounded-md absolute inset-0 w-full h-full bg-gray-800/60"
        style={{ animationDelay: `${delayMs}ms` }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
        <div className="mb-2 sm:mb-3 space-y-2">
          <div className="animate-pulse rounded-md h-3 w-full bg-gray-700/50" style={{ animationDelay: `${delayMs}ms` }} />
          <div className="animate-pulse rounded-md h-3 w-5/6 bg-gray-700/50" style={{ animationDelay: `${delayMs}ms` }} />
          <div className="animate-pulse rounded-md h-3 w-4/6 bg-gray-700/50" style={{ animationDelay: `${delayMs}ms` }} />
        </div>
        <div className="animate-pulse w-full h-8 sm:h-9 rounded-md bg-gray-700/50" style={{ animationDelay: `${delayMs}ms` }} />
      </div>
    </div>
  </div>
)

export default function GeneratePage() {
  const { data: session } = useSession()
  const { toggleLoginDialog } = useContext(AuthDialogContext)
  const { showSnackbar } = useSnackbar()
  const { showDownloadStatus } = useDownloadStatus()
  const { openDialog: openPricingDialog } = usePricingDialog()

  const [selectedCharacter, setSelectedCharacter] = useState<string>('')
  // 保存从 localStorage 读取的角色 cover 信息（用于生成弹窗显示）
  const [savedCharacterCover, setSavedCharacterCover] = useState<string | null>(null)
  const [videoModel, setVideoModel] = useState<string>('feelove/lite')
  const [prompt, setPrompt] = useState(
    `Girl stripping off her clothes, with seductive facial expression. She becomes completely naked and undressed. Woman revealing her breasts. The woman reveals her outie vagina and pussy. her breasts jiggle violently as she reveals them and her outie pussy. NSFW. Nude. One scene. One Cut.`
  )
  const [autoEnhance, setAutoEnhance] = useState(true)
  const [resolution, setResolution] = useState<'480p' | '720p'>('480p')

  // Templates 状态
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)

  // Featured Videos 状态
  const [featuredCreations, setFeaturedCreations] = useState<FeaturedCreation[]>([])
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true)

  // --- Added logic/state from AI+V_project_full_v1.0 ---
  const [credits, setCredits] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationSucceeded, setGenerationSucceeded] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [posterId, setPosterId] = useState<number | null>(null)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [generationRequestId, setGenerationRequestId] = useState<string | number | null>(null)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [generatedVideoId, setGeneratedVideoId] = useState<string | number | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // View More modal state
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false)
  const [characterSearch, setCharacterSearch] = useState('')
  const [modalCharacters, setModalCharacters] = useState<CharacterItem[]>([])
  const [characterPage, setCharacterPage] = useState(1)
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false)
  const [hasMoreCharacters, setHasMoreCharacters] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 从 localStorage 获取当前积分（参考 image-generator/[id]）
  const getCurrentCredits = (): number => {
    try {
      const sessionData = getLocalStorage<any>('AVOID_AI_SESSION')
      return sessionData?.user?.creditsBalance || 0
    } catch (error) {
      console.error('Failed to get credits from localStorage:', error)
      return 0
    }
  }

  const requireLogin = () => {
    if (session) return true
    toggleLoginDialog(true, EventEntry.LoginPositionTryFree)
    return false
  }

  const hasImage = useMemo(() => {
    if (selectedCharacter === 'upload') return !!uploadedImageUrl
    return !!selectedCharacter
  }, [selectedCharacter, uploadedImageUrl])

  const selectedScene = useMemo(
    () => templates.find((t) => t.id === selectedSceneId) ?? null,
    [selectedSceneId]
  )

  // 使用后端搜索，直接返回 modalCharacters（后端已经根据 q 参数过滤）
  const filteredModalCharacters = useMemo(() => {
    return modalCharacters
  }, [modalCharacters])

  const selectCharacters = useMemo<SelectCharacterItem[]>(() => {
    const top = modalCharacters.slice(0, 4)
    return [
      { id: 'upload', name: 'Upload Image', icon: ArrowUpTrayIcon, isUpload: true },
      ...top,
      { id: 'view-more', name: 'View More', icon: UserIcon, isViewMore: true },
    ]
  }, [modalCharacters])

  const canGenerate = !isGenerating

  const currentHint = useMemo(() => {
    if (!hasImage) return '👆 请先选择角色或上传图片'
    if (!selectedScene) return '👇 请选择一个动作场景'
    return '✅ 准备就绪！点击底部按钮生成视频'
  }, [hasImage, selectedScene])

  const [activeTab, setActiveTab] = useState<'generator' | 'preview'>('generator')
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useLayoutEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // 轮询控制：生成视频通常 > 30s，因此延迟 30s 后再开始请求 getGenerateStatus
  const pollStartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingTokenRef = useRef(0)

  // 更新 localStorage 中的积分（参考 image-generator/[id]）
  const updateCreditsInLocalStorage = (newCredits: number) => {
    try {
      const sessionData = getLocalStorage<any>('AVOID_AI_SESSION')
      if (sessionData && sessionData.user) {
        sessionData.user.creditsBalance = newCredits
        localStorage.setItem('AVOID_AI_SESSION', JSON.stringify(sessionData))
        setCredits(newCredits)
        
        // 触发自定义事件，通知 appBar 更新积分
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: { credits: newCredits } }))
        }
      }
    } catch (error) {
      console.error('Failed to update credits in localStorage:', error)
    }
  }

  // 模拟进度更新（0 -> 98%，用于等待接口）
  const simulateProgress = () => {
    setGenerationProgress(0)

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    let currentProgress = 0
    progressIntervalRef.current = setInterval(() => {
      if (currentProgress < 98) {
        currentProgress += 1.2
        setGenerationProgress(Math.min(98, currentProgress))
      } else {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
      }
    }, 250) as any
  }

  // 轮询生成状态（参考 image-generator/[id]/pollStatus）
  const pollStatus = async (requestId: string | number, pollingToken: number) => {
    setGenerationProgress((prev) => (prev < 50 ? 50 : prev))

    const progressTimer = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 95) return prev
        return Math.min(95, prev + 0.3)
      })
    }, 300) as any

    try {
      // 前 30 秒不调用 getGenerateStatus（生成视频通常需要更久），避免无效轮询
      if (pollStartTimeoutRef.current) {
        clearTimeout(pollStartTimeoutRef.current)
        pollStartTimeoutRef.current = null
      }
      await new Promise<void>((resolve) => {
        pollStartTimeoutRef.current = setTimeout(() => {
          pollStartTimeoutRef.current = null
          resolve()
        }, 30_000) as any
      })

      // 如果期间发起了新的生成/离开页面，则取消本次轮询
      if (pollingTokenRef.current !== pollingToken) {
        clearInterval(progressTimer)
        return
      }

      // 持续轮询，直到返回 completed / failed / error，或轮询被取消
      // 依赖 pollingTokenRef 实现取消，而不是固定轮询次数
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          if (pollingTokenRef.current !== pollingToken) {
            clearInterval(progressTimer)
            return
          }

          const data = await getGenerateStatus(requestId)
          const status = data?.status

          if (status === 'completed') {
            clearInterval(progressTimer)
            setGenerationProgress(100)

            // 保存生成完成的 id（用于下载）
            if (data?.id) {
              setGeneratedVideoId(data.id)
            } else if ((data as any)?.data?.id) {
              setGeneratedVideoId((data as any).data.id)
            }

            // completed 状态时不更新积分（已在 videoGenerate 成功返回时更新）

            return
          } else if (status === 'failed' || status === 'error') {
            clearInterval(progressTimer)

            try {
              const profileData = await getUserProfile()
              if (profileData?.creditsBalance !== undefined) {
                updateCreditsInLocalStorage(profileData.creditsBalance)
              }
            } catch (error) {
              console.error('Failed to update credits after generation failure:', error)
            }

            throw new Error(data.error || data.message || 'Generation failed during processing')
          }

          await new Promise((resolve) => setTimeout(resolve, 2500))
        } catch (error: any) {
          clearInterval(progressTimer)
          console.error('Polling error:', error)
          throw error
        }
      }

      // 理论上不会到达这里（循环在上面 return / throw 时退出）
    } catch (error: any) {
      clearInterval(progressTimer)
      throw error
    }
  }

  // Fetch credits using getUserProfile
  useEffect(() => {
    const fetchCredits = async () => {
      setIsLoadingData(true)
      try {
        const profileData = await getUserProfile()
        if (profileData?.creditsBalance !== undefined) {
          updateCreditsInLocalStorage(profileData.creditsBalance)
        }
      } catch (e) {
        console.error('Failed to fetch credits:', e)
        // 优先用本地缓存值兜底
        const cached = getCurrentCredits()
        if (cached) {
          setCredits(cached)
        }
      } finally {
        setIsLoadingData(false)
      }
    }

    // 优先用本地缓存值兜底
    const cached = getCurrentCredits()
    if (cached) {
      setCredits(cached)
    }
    fetchCredits()
  }, [session])

  // 卸载时清理进度定时器
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (pollStartTimeoutRef.current) {
        clearTimeout(pollStartTimeoutRef.current)
        pollStartTimeoutRef.current = null
      }
      // 让进行中的 pollStatus 立刻退出
      pollingTokenRef.current += 1
    }
  }, [])

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true)
      try {
        const data = await getVideosPresets()
        // data 是一个数组
        if (Array.isArray(data)) {
          // 根据 isShow 属性过滤：为 true 显示，false 隐藏，并按 sortOrder 排序
          const filteredData = data
            .filter((item: any) => item.isShow === true)
            .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))

          // 转换为 Template 格式
          const mappedTemplates: Template[] = filteredData.map((item: any) => {
            // 解码 Unicode emoji (例如: "\\uD83D\\uDCBC" -> "💼")
            let emoji = item.emoji || '🎬'
            if (typeof emoji === 'string' && emoji.startsWith('\\u')) {
              try {
                emoji = JSON.parse(`"${emoji}"`)
              } catch {
                // 如果解析失败，使用默认值
                emoji = '🎬'
              }
            }

            return {
              id: item.id || '',
              name: item.name || '',
              emoji: emoji,
              hot: item.isHot === true,
              prompt: item.prompt || undefined,
            }
          })

          setTemplates(mappedTemplates)

          // 默认选中第一个模板
          if (mappedTemplates.length > 0 && !selectedSceneId) {
            const firstTemplate = mappedTemplates[0]
            setSelectedSceneId(firstTemplate.id)
            // 如果第一个模板有 prompt，自动应用
            if (firstTemplate.prompt) {
              setPrompt(firstTemplate.prompt)
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch templates:', e)
        // 如果获取失败，使用空数组
        setTemplates([])
      } finally {
        setIsLoadingTemplates(false)
      }
    }

    fetchTemplates()
  }, [])

  // Fetch featured videos from API
  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoadingFeatured(true)
      try {
        const data = await getFeaturedVideos()
        if (Array.isArray(data)) {
          // 根据 isFeatured 属性过滤：为 true 显示，false 不显示
          const filtered = data
            .filter((item: any) => item.isFeatured === true)
            .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))

          const mapped: FeaturedCreation[] = filtered
            .filter((item: any) => !!item.videoUrl)
            .map((item: any) => {
              const likes = typeof item.popularity === 'number' ? `${item.popularity}` : ''
              return {
                id: item.id || '',
                title: item.name || '',
                likes,
                videoUrl: item.videoUrl,
                prompt: item.prompt || '',
                isVideo: true,
              }
            })

          setFeaturedCreations(mapped)
        } else {
          setFeaturedCreations([])
        }
      } catch (e) {
        console.error('Failed to fetch featured videos:', e)
        setFeaturedCreations([])
      } finally {
        setIsLoadingFeatured(false)
      }
    }

    fetchFeatured()
  }, [])

  useEffect(() => {
    if (isMobile === false) setActiveTab('generator')
  }, [isMobile])

  const mapCharacters = useCallback((items: any[]): CharacterItem[] => {
    return (items || [])
      .map((item) => ({
        id: String(item.id ?? item.characterId ?? item.code ?? item.name ?? ''),
        name: item.name || item.title || 'Character',
        cover: item.coverUrl || item.cover || item.avatar || item.imageUrl || item.thumbnail || '',
        coverUrl: item.coverUrl,
      }))
      .filter((item) => item.id)
  }, [])

  const loadCharacters = useCallback(
    async (page: number, replace = false, searchQuery?: string) => {
      const PAGE_SIZE = 20
      setIsLoadingCharacters(true)
      try {
        const query = searchQuery !== undefined ? (searchQuery.trim() || undefined) : undefined
        const res = await getCharacters(undefined, page, PAGE_SIZE, query)
        const listRaw = Array.isArray(res) ? res : res?.list || res?.items || res?.data || []
        const mapped = mapCharacters(listRaw)

        setModalCharacters((prev) => {
          const next = replace ? mapped : [...prev, ...mapped.filter((m) => !prev.some((p) => p.id === m.id))]
          return next
        })

        setCharacterPage(page)
        setHasMoreCharacters(mapped.length >= PAGE_SIZE)
      } catch (e) {
        console.error('Failed to fetch characters:', e)
      } finally {
        setIsLoadingCharacters(false)
      }
    },
    [mapCharacters]
  )

  // 页面加载时初始化获取角色列表
  useEffect(() => {
    loadCharacters(1, true, '')
  }, [loadCharacters])

  // 清除选中的角色（同时清除 localStorage）
  const clearSelectedCharacter = useCallback(() => {
    setSelectedCharacter('')
    setSavedCharacterCover(null)
    try {
      localStorage.removeItem('SELECTED_CHARACTER_FOR_GENERATE')
    } catch (error) {
      console.error('Failed to remove character from localStorage:', error)
    }
  }, [])

  // 从 localStorage 读取角色信息并设置为选中状态
  useEffect(() => {
    try {
      const savedCharacter = localStorage.getItem('SELECTED_CHARACTER_FOR_GENERATE')
      if (savedCharacter && !selectedCharacter) {
        const character = JSON.parse(savedCharacter)
        // 保存角色 cover 信息，用于生成弹窗显示
        if (character.cover) {
          setSavedCharacterCover(character.cover)
        }
        // 等待角色列表加载完成后再设置
        if (modalCharacters.length > 0 || selectCharacters.length > 0) {
          // 检查角色是否在已加载的角色列表中
          const characterExists = 
            modalCharacters.some(c => c.id === character.id) ||
            selectCharacters.some(c => c.id === character.id)
          
          if (characterExists) {
            setSelectedCharacter(character.id)
            // 设置为选中状态后立即清空 localStorage
            localStorage.removeItem('SELECTED_CHARACTER_FOR_GENERATE')
            // 如果角色在列表中找到了，清除保存的 cover（使用列表中的 cover）
            setSavedCharacterCover(null)
          }
        }
      }
    } catch (error) {
      console.error('Failed to read character from localStorage:', error)
    }
  }, [modalCharacters, selectCharacters, selectedCharacter])

  // 使用 ref 存储防抖 timer 和上一次的搜索关键词
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const prevSearchRef = useRef<string>('')

  // 当搜索关键词变化时，重新加载角色列表（使用后端搜索，添加防抖）
  useEffect(() => {
    if (!isCharacterModalOpen) {
      return
    }

    const isSearchChanged = prevSearchRef.current !== characterSearch

    // 如果搜索关键词变化，使用防抖
    if (isSearchChanged) {
      // 清除之前的 timer
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }

      // 重置到第一页
      setModalCharacters([])
      setCharacterPage(1)

      // 防抖：延迟 300ms 后执行搜索
      searchTimerRef.current = setTimeout(() => {
        loadCharacters(1, true, characterSearch)
        prevSearchRef.current = characterSearch
        searchTimerRef.current = null
      }, 300)
    }

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
        searchTimerRef.current = null
      }
    }
  }, [characterSearch, isCharacterModalOpen, loadCharacters])

  const handleCharacterModalScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget
      if (
        hasMoreCharacters &&
        !isLoadingCharacters &&
        target.scrollTop + target.clientHeight >= target.scrollHeight - 80
      ) {
        loadCharacters(characterPage + 1, false)
      }
    },
    [characterPage, hasMoreCharacters, isLoadingCharacters, loadCharacters]
  )

  // 上传图片（参考 image-generator/[id]/page.tsx，但这里不会自动触发生成）
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件格式
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      showSnackbar('Only JPG, JPEG, PNG, and WEBP formats are allowed', 'error')
      if (e.target) {
        e.target.value = ''
      }
      return
    }

    setIsUploading(true)
    setIsLoadingData(true)
    try {
      const data = await uploadImage(file)

      // 使用上传后的图片 URL 作为角色图片
      setUploadedImageUrl(data.url)
      if (data.id) {
        setPosterId(data.id)
      }
      setSelectedCharacter('upload')

      setToastMessage('Uploaded image')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2500)
    } catch (err: any) {
      console.error('Upload error:', err)
      showSnackbar(err?.message || 'Failed to upload image.', 'error')
    } finally {
      setIsUploading(false)
      setIsLoadingData(false)
    }
  }

  const handleTemplateClick = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId)

    // 再次点击当前选中的模板 => 取消选中并清空 Prompt
    if (selectedSceneId === templateId) {
      setSelectedSceneId(null)
      setPrompt('')
      return
    }

    // 选中新模板
    setSelectedSceneId(templateId)

    // 如果模板有 prompt 字段，则使用它；否则保持原有逻辑
    if (tpl?.prompt) {
      setPrompt(tpl.prompt)
    } else if (tpl?.id === 'undress') {
      // 兼容旧逻辑
      setPrompt(
        `Girl stripping off her clothes, with seductive facial expression. She becomes completely naked and undressed. Woman revealing her breasts. The woman reveals her outie vagina and pussy. her breasts jiggle violently as she reveals them and her outie pussy. NSFW. Nude. One scene. One Cut.`
      )
    }

    setToastMessage(`已选择场景: ${tpl?.name || templateId}`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleGenerate = async () => {
    if (!requireLogin()) return
    const creditCost = resolution === '720p' ? 40 : 20
    if (credits < creditCost) {
      showSnackbar('You need more credits to generate this video. Check out our plans!', 'error')
      openPricingDialog(EventEntry.PricingDialog)
      return
    }

    let finalImageUrl = ''
    if (selectedCharacter === 'upload') {
      finalImageUrl = uploadedImageUrl || ''
    } else {
      const char =
        selectCharacters.find((c) => c.id === selectedCharacter) ||
        modalCharacters.find((c) => c.id === selectedCharacter)
      finalImageUrl = char?.cover || ''
    }

    if (!finalImageUrl) {
      showSnackbar('Please upload an image or select a character to get started', 'warning')
      return
    }

    // if (!selectedScene) {
    //   showSnackbar('Please select a template/scene first.', 'warning')
    //   return
    // }

    if (!prompt || !prompt.trim()) {
      showSnackbar('Please enter a prompt to describe what you want', 'warning')
      return
    }

    setIsGenerating(true)
    // 移动端（宽度 < 1024）点击生成时，自动切换到预览 Tab，方便查看进度条
    if (isMobile) {
      setActiveTab('preview')
    }
    setGenerationSucceeded(false)
    setGenerationRequestId(null)
    setGeneratedVideoUrl(null)

    try {
      const isRoleGeneration = selectedCharacter !== 'upload'
      const characterId = isRoleGeneration ? selectedCharacter : undefined

      const payload: { prompt: string; posterId?: number; characterId?: string; quality?: string } = {
        prompt,
      }

      if (posterId) {
        payload.posterId = posterId
      }

      if (characterId) {
        payload.characterId = characterId
      }

      // 根据 resolution 设置 quality 参数
      payload.quality = resolution === '720p' ? '720P' : '480P'

      simulateProgress()

      const result = await videoGenerate(payload)

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      if (!result) {
        throw new Error('No result returned from API')
      }

      // videoGenerate 接口成功返回后，立即更新用户积分
      try {
        const profileData = await getUserProfile()
        if (profileData?.creditsBalance !== undefined) {
          updateCreditsInLocalStorage(profileData.creditsBalance)
        }
      } catch (error) {
        console.error('Failed to update credits after videoGenerate:', error)
      }

      const status = result.status
      const requestId = result.requestId ?? result.request_id
      const videoUrl = result.videoUrl ?? result.video_url ?? result.url

      if (status === 'pending') {
        if (!requestId) {
          throw new Error('Request ID is required for polling')
        }

        setGenerationRequestId(requestId)
        // 每次生成递增 token，用于取消前一次轮询（以及 30s 延迟启动）
        pollingTokenRef.current += 1
        const pollingToken = pollingTokenRef.current
        await pollStatus(requestId, pollingToken)

        const finalData = await getGenerateStatus(requestId)
        const finalVideoUrl = finalData?.generatedUrl || finalData?.data?.generatedUrl || null

        // 保存生成完成的 id（用于下载）
        if (finalData?.id) {
          setGeneratedVideoId(finalData.id)
        } else if ((finalData as any)?.data?.id) {
          setGeneratedVideoId((finalData as any).data.id)
        }

        if (finalVideoUrl) {
        setGeneratedVideoUrl(finalVideoUrl)
        setGenerationSucceeded(true)
        }
        return
      }

      throw new Error(`Unexpected status: ${status}`)
    } catch (e: any) {
      console.error('Generation failed:', e)

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setGenerationProgress(0)

      try {
        const profileData = await getUserProfile()
        if (profileData?.creditsBalance !== undefined) {
          updateCreditsInLocalStorage(profileData.creditsBalance)
        }
      } catch (updateError) {
        console.error('Failed to update credits after generation error:', updateError)
      }

      showSnackbar(e?.message || 'Generation failed', 'error')
    } finally {
      setIsGenerating(false)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }

  return (
    <>
      <MainAppBar />

      <Modal
        isOpen={isCharacterModalOpen}
        onOpenChange={(open) => {
          setIsCharacterModalOpen(open)
          if (!open) {
            setCharacterSearch('')
          }
        }}
        size="4xl"
        classNames={{
          base: 'bg-[#121a2a] border border-white/10 text-white dark',
          backdrop: 'bg-black/60 backdrop-blur-sm',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-white/70" />
                    <div className="text-base font-semibold">Select a Character</div>
                  </div>
                </div>
                <div className="text-xs text-white/60">Choose a character to generate videos with</div>
              </ModalHeader>
              <ModalBody className="pb-6">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  >
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                  </svg>
                  <input
                    type="text"
                  placeholder="Search characters..."
                  value={characterSearch}
                    onChange={(e) => setCharacterSearch(e.target.value)}
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div
                  className="mt-4 max-h-[520px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-500/30 scrollbar-track-transparent hover:scrollbar-thumb-pink-500/50"
                  onScroll={handleCharacterModalScroll}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {filteredModalCharacters.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCharacter(c.id)
                          setSavedCharacterCover(null)
                          // 清除 localStorage，因为用户主动选择了新角色
                          try {
                            localStorage.removeItem('SELECTED_CHARACTER_FOR_GENERATE')
                          } catch (error) {
                            console.error('Failed to remove character from localStorage:', error)
                          }
                          setIsCharacterModalOpen(false)
                          setCharacterSearch('')
                        }}
                        className={`cursor-pointer relative rounded-xl overflow-hidden border transition-colors text-left ${
                          selectedCharacter === c.id
                            ? 'border-pink-500 ring-2 ring-pink-500/50'
                            : 'border-white/10 hover:border-pink-500/50'
                        }`}
                      >
                        <div className="aspect-[3/4] relative">
                          <img src={c.cover} alt={c.name} className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="text-xs font-semibold text-white truncate">{c.name}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {filteredModalCharacters.length === 0 && (
                    <div className="py-12 text-center text-white/60">No characters found</div>
                  )}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <div 
        className="dark relative pt-[48px] md:pt-[60px]" 
        style={{ 
          height: 'calc(100vh)',
          background: '#1e1e2e',
          backgroundImage: 'linear-gradient(to bottom right in oklab, #000 0%, color-mix(in oklab, lab(24.9401% 45.2703 -51.2728) 20%,transparent) 50%, color-mix(in oklab, lab(29.4367% 49.3962 3.35757) 20%,transparent) 100%)'
        }}
      >
        <div className="mx-auto h-full flex flex-col">
          {isMobile && (
            <div className="px-4 md:px-6 pt-2 bg-[#060612]">
              <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('generator')}
                  className={`h-10 rounded-md text-sm font-semibold transition-colors ${
                    activeTab === 'generator'
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Generator
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`h-10 rounded-md text-sm font-semibold transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Preview &amp; Inspired
                </button>
              </div>
            </div>
          )}

          {/* Main Content - Left and Right Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] flex-1 min-h-0">
            {/* Left Sidebar - Form Section */}
            <aside className={`relative h-full bg-[#060612] overflow-hidden ${isMobile && activeTab !== 'generator' ? 'hidden' : ''}`}>
              {/* Scrollable Content */}
              <div className="p-4 pb-28 md:p-6 md:pb-28 h-full space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/30 scrollbar-track-transparent hover:scrollbar-thumb-pink-500/50">
                {/* Select Character */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-white">Select Character</h3>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  {(() => {
                    const selectedChar =
                      selectCharacters.find((c) => c.id === selectedCharacter) ||
                      modalCharacters.find((c) => c.id === selectedCharacter)

                    // 上传图片选中状态：大条卡片展示
                    if (selectedCharacter === 'upload' && uploadedImageUrl) {
                      return (
                        <div className="p-3 flex items-center justify-between rounded-xl border-2 border-pink-500 bg-[#050814]">
                          <div className="flex items-center gap-3">
                            {uploadedImageUrl ? (
                              <img
                                src={uploadedImageUrl}
                                alt="Uploaded image"
                                className="w-14 h-14 rounded-lg object-cover border border-pink-500/60"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-800 border border-pink-500/60" />
                            )}
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                <ArrowUpTrayIcon className="h-4 w-4 text-pink-400" />
                                <span>Your uploaded image</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            isIconOnly
                            variant="light"
                            className="text-white/70 hover:text-white"
                            onPress={() => {
                              clearSelectedCharacter()
                              setUploadedImageUrl(null)
                            }}
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </Button>
                        </div>
                      )
                    }

                    // 普通角色选中状态
                    if (selectedChar && !('isUpload' in selectedChar && selectedChar.isUpload) && !('isViewMore' in selectedChar && selectedChar.isViewMore)) {
                      return (
                        <div className="p-2 flex items-center justify-between rounded-xl border-2 border-pink-500 bg-[#1a1a24]">
                          <div className="flex items-center gap-3">
                            {selectedChar.cover ? (
                              <img
                                src={selectedChar.cover}
                                alt={selectedChar.name}
                                className="w-12 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                              }}
                            />
                            ) : (
                              <div className="w-12 h-16 bg-gray-800 rounded-lg" />
                            )}
                            <span className="text-white font-semibold">{selectedChar.name}</span>
                          </div>
                          <Button
                            isIconOnly
                            variant="light"
                            className="text-white/70 hover:text-white"
                            onPress={() => clearSelectedCharacter()}
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </Button>
                        </div>
                      )
                    }

                    // 默认：展示可选卡片网格
                    return (
                      <div className="grid grid-cols-3 gap-2.5 max-lg:flex max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:grid-cols-none max-lg:gap-2 max-lg:pr-2 max-lg:[&>*]:shrink-0 max-lg:[&>*]:w-28">
                        {selectCharacters.map((char) => {
                          const Icon = char.icon
                          const isUpload = char.isUpload
                          const isViewMore = char.isViewMore

                          return (
                            <Card
                              key={char.id}
                              className={`cursor-pointer border transition-all ${
                                selectedCharacter === char.id
                                  ? 'border-pink-500 bg-pink-500/10'
                                  : 'border-white/10 bg-[#0c0a17] hover:border-pink-400/40'
                              }`}
                              isPressable
                              onPress={() => {
                                if (char.isUpload) {
                                  if (!requireLogin()) return
                                  fileInputRef.current?.click()
                                  return
                                }
                                if (char.isViewMore) {
                                  setIsCharacterModalOpen(true)
                                  return
                                }
                                setSelectedCharacter(char.id)
                                setSavedCharacterCover(null)
                                // 清除 localStorage，因为用户主动选择了新角色
                                try {
                                  localStorage.removeItem('SELECTED_CHARACTER_FOR_GENERATE')
                                } catch (error) {
                                  console.error('Failed to remove character from localStorage:', error)
                                }
                              }}
                            >
                              <CardBody className="p-0">
                                <div className="aspect-[3/4] relative overflow-hidden rounded-md">
                                  {isUpload ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-dashed border-white/30">
                                      {uploadedImageUrl ? (
                                        <img
                                          src={uploadedImageUrl}
                                          alt="Uploaded image"
                                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                      ) : null}
                                      {Icon && <Icon className="h-8 w-8 text-white/70 relative" />}
                                      <span className="text-xs text-white/70 text-center px-2 relative">Your own photo</span>
                                    </div>
                                  ) : isViewMore ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1a1a24]">
                                      {Icon && <Icon className="h-8 w-8 text-white/70" />}
                                      <span className="text-xs text-white/70">View More</span>
                                    </div>
                                  ) : (
                                    <>
                                      {char.cover ? (
                                        <img
                                          src={char.cover}
                                          alt={char.name}
                                          className="absolute inset-0 w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                          }}
                                      />
                                      ) : (
                                        <div className="absolute inset-0 bg-gray-800" />
                                      )}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                      <div className="absolute bottom-0 left-0 right-0 p-2">
                                        <p className="text-xs text-white font-medium truncate">{char.name}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </CardBody>
                            </Card>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>

                {/* Video Model */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-white">Video Model</h3>
                  <p className="text-xs text-white/50">Templates use the optimal model by default</p>
                  <Select
                    selectedKeys={new Set([videoModel])}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string
                      setVideoModel(selected)
                    }}
                    classNames={{
                      base: 'w-full',
                      trigger: 'bg-[#1a1a24] border border-white/20 text-white h-auto min-h-12 hover:border-white/30',
                      value: 'text-white',
                      popoverContent: 'bg-[#1a1a24] border-2 border-pink-500/50 shadow-xl shadow-pink-500/20 [&_[data-selected=true]_[data-slot=selected-icon]]:hidden [&_[data-hover=true]]:!bg-[#1e2939]',
                      listbox: 'p-2',
                      listboxWrapper: 'bg-[#1a1a24]',
                    }}
                    renderValue={() => {
                      const key = videoModel
                      let Icon = BoltIcon
                      let iconColor = 'text-orange-400'
                      if (key === 'feelove/basic') {
                        Icon = StarIcon
                        iconColor = 'text-yellow-400'
                      }
                      if (key === 'feelove/pro') {
                        Icon = SparklesIcon
                        iconColor = 'text-blue-400'
                      }
                      return (
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                          <span>{key}</span>
                          {key === 'feelove/lite' && (
                            <Chip size="sm" className="bg-pink-500/20 text-pink-400 border-pink-500/40">
                              Recommended
                            </Chip>
                          )}
                        </div>
                      )
                    }}
                  >
                    <SelectItem
                      key="feelove/lite"
                      textValue="feelove/lite"
                      classNames={{
                        base: 'rounded-lg transition-all hover:!bg-[#1e2939]',
                        title: 'text-white',
                        description: 'text-white/50',
                      }}
                      startContent={<BoltIcon className="h-4 w-4 text-orange-400" />}
                      endContent={
                        <div className="flex items-center gap-2">
                          <Chip size="sm" className="bg-pink-500/20 text-pink-400 border-pink-500/40">
                            Recommended
                          </Chip>
                        </div>
                      }
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white">feelove/lite</span>
                        </div>
                        <p className="text-xs text-white/50">Fast generation, best for general scenes</p>
                      </div>
                    </SelectItem>
                    <SelectItem
                      key="feelove/basic"
                      textValue="feelove/basic"
                      classNames={{
                        base: 'rounded-lg transition-all hover:!bg-[#1e2939]',
                        title: 'text-white',
                        description: 'text-white/50',
                      }}
                      startContent={<StarIcon className="h-4 w-4 text-yellow-400" />}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white">feelove/basic</span>
                        </div>
                        <p className="text-xs text-white/50">Basic model, great for kiss & romantic scenes</p>
                      </div>
                    </SelectItem>
                    <SelectItem
                      key="feelove/pro"
                      textValue="feelove/pro"
                      classNames={{
                        base: 'rounded-lg transition-all hover:!bg-[#1e2939]',
                        title: 'text-white',
                        description: 'text-white/50',
                      }}
                      startContent={<SparklesIcon className="h-4 w-4 text-blue-400" />}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white">feelove/pro</span>
                        </div>
                        <p className="text-xs text-white/50">Better quality for NSFW content (slower but best results)</p>
                      </div>
                    </SelectItem>
                  </Select>
                </div>

                {/* Your Prompt */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-sm font-semibold text-white flex items-center gap-2">Your Prompt</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all touch-manipulation"
                        title="Clear prompt"
                        onClick={() => setPrompt('')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-trash2 lucide-trash-2 w-4 h-4"
                          aria-hidden="true"
                        >
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M3 6h18"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                  </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="border-input aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content border border-white/20 bg-transparent px-3 py-2 outline-none focus-visible:border-pink-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm prompt-textarea w-full text-base min-h-[100px] bg-gradient-to-br from-black/40 to-black/20 text-white placeholder:text-gray-500 resize-none rounded-xl shadow-lg transition-all"
                      placeholder="Type your prompt here, or use the quick tools below..."
                      maxLength={2000}
                      rows={6}
                    />
                      </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-green-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Prompt ready! You can edit it or generate now.</span>
                    </div>
                    <div className="px-2.5 py-1 text-gray-500">
                      {prompt.length}/2000
                  </div>
                </div>
                </div>
                <p className="text-xs text-white/50 text-center mt-3">Or Pick by Template to Start</p>

                {/* Popular Templates */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-white">Popular Templates</h3>
                  {isLoadingTemplates ? (
                    <div className="text-sm text-white/60 text-center py-8">Loading templates...</div>
                  ) : templates.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className={`cursor-pointer border border-white/10 bg-[#0c0a17] hover:border-pink-400/40 transition-all ${
                            selectedSceneId === template.id ? 'border-pink-500 bg-pink-500/10' : ''
                          }`}
                          isPressable
                          onPress={() => handleTemplateClick(template.id)}
                        >
                          <CardBody className="p-2.5">
                            <div className="flex flex-col items-center gap-1">
                              <div className="text-2xl">{template.emoji}</div>
                              <p className="text-xs text-white/80 text-center truncate w-full">{template.name}</p>
                              {template.hot && (
                                <Chip size="sm" className="bg-[#f6339a] text-white text-[10px] border-pink-500/40 mt-1">
                                  HOT
                                </Chip>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-white/60 text-center py-8">No templates available</div>
                  )}
                </div>

                {/* Options */}
                <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-pink-500/20 p-4 space-y-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Options</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-wand-sparkles w-4 h-4 text-pink-400"
                        aria-hidden="true"
                      >
                        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path>
                        <path d="m14 7 3 3"></path>
                        <path d="M5 6v4"></path>
                        <path d="M19 14v4"></path>
                        <path d="M10 2v2"></path>
                        <path d="M7 8H3"></path>
                        <path d="M21 16h-4"></path>
                        <path d="M11 3H9"></path>
                      </svg>
                    <span className="text-sm text-white">Auto Enhance</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoEnhance}
                      onClick={() => setAutoEnhance(!autoEnhance)}
                      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                        autoEnhance
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                          : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                          autoEnhance ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                    </button>
                  </div>
                </div>

                {/* Resolution */}
                <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-pink-500/20 p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Resolution</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setResolution('480p')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        resolution === '480p'
                          ? 'border-pink-500 bg-pink-500/10 text-white'
                          : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                      <div className="text-sm font-semibold">480p</div>
                      <div className="text-xs opacity-70">Cost 20 credit</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolution('720p')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        resolution === '720p'
                          ? 'border-pink-500 bg-pink-500/10 text-white'
                          : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                      <div className="text-sm font-semibold">720p</div>
                      <div className="text-xs opacity-70">Cost 40 credits</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Generate Button - Fixed at bottom */}
              <div className="absolute z-[10] left-0 right-0 bottom-0 p-3 sm:p-4 lg:p-6 bg-gray-950/80 backdrop-blur-md border-t border-pink-500/20">
                <Button
                  size="lg"
                  className={cn(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none h-10 px-4 w-full btn-gradient py-4 sm:py-5 text-sm sm:text-base lg:text-lg font-semibold shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation',
                    'bg-gradient-to-r from-[#ec4899] to-[#db2777] text-white hover:bg-primary/90'
                  )}
                  isDisabled={!canGenerate}
                  onPress={handleGenerate}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-sparkles w-4 h-4 sm:w-5 sm:h-5 mr-2"
                    aria-hidden="true"
                  >
                    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                    <path d="M20 2v4"></path>
                    <path d="M22 4h-4"></path>
                    <circle cx="4" cy="20" r="2"></circle>
                  </svg>
                  {isGenerating ? (
                    'Generating...'
                  ) : session ? (
                    <>
                      <span className="hidden sm:inline">
                        Generate · {resolution === '720p' ? '40' : '20'} Credits
                      </span>
                      <span className="sm:hidden">
                        Generate · {resolution === '720p' ? '40' : '20'} 💎
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Generate · Get Credits</span>
                      <span className="sm:hidden">Generate · Get 💎</span>
                    </>
                  )}
                </Button>
              </div>
            </aside>

            {/* Right Section - Featured Creations */}
            <div className={`h-full space-y-6 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/30 scrollbar-track-transparent hover:scrollbar-thumb-pink-500/50 ${isMobile && activeTab !== 'preview' ? 'hidden' : ''}`}>
              {isGenerating && (
                <div className="max-w-2xl w-full relative mx-auto">
                  <img
                    alt="Processing"
                    className="w-full h-[400px] sm:h-[520px] lg:h-[650px] object-contain rounded-2xl opacity-30 blur-sm"
                    src={
                      (selectedCharacter === 'upload'
                        ? uploadedImageUrl
                        : selectCharacters.find((c) => c.id === selectedCharacter)?.cover ||
                          modalCharacters.find((c) => c.id === selectedCharacter)?.cover ||
                          savedCharacterCover) ||
                      uploadedImageUrl ||
                      selectCharacters.find((c) => c.id !== 'upload' && c.id !== 'view-more')?.cover ||
                      modalCharacters.find((c) => c.id !== 'upload' && c.id !== 'view-more')?.cover ||
                      savedCharacterCover ||
                      ''
                    }
                  />
                  <div className="absolute inset-0 flex items-center justify-center px-6">
                    <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-pink-500/30 shadow-2xl w-full max-w-lg">
                      <div className="relative flex items-center justify-center mb-6 sm:mb-8">
                        <span className="inline-flex items-center justify-center rounded-full border-4 border-pink-400 bg-white/5 w-20 h-20 sm:w-24 sm:h-24 shadow-xl relative">
                          <img alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain animate-spin" src="/logo.png" />
                        </span>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-pink-500/50 animate-ping"></div>
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-5">🎬 AI Magic in Progress...</h3>
                      <p className="text-gray-200 text-base sm:text-lg mb-2 sm:mb-3">Transforming your image into an amazing video</p>
                      <p className="text-pink-300 text-sm sm:text-base font-medium mb-1">Estimated 30-300 seconds, please don't close the page</p>
                      <div className="mt-6 sm:mt-8 w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"
                          style={{ width: `${Math.max(2, Math.min(100, generationProgress || 0))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 生成成功展示区域 */}
              {!isGenerating && generationSucceeded && (
                <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] py-4">
                  <div className="mb-4 sm:mb-6 hidden sm:block">
                    <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check w-4 h-4 sm:w-5 sm:h-5 text-green-400"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      <span className="text-green-400 font-semibold text-sm sm:text-base">Generation Successful!</span>
                    </div>
                  </div>
                  <div className="mb-4 sm:mb-6 max-w-2xl w-full px-2">
                    <video
                      src={generatedVideoUrl || 'https://s.feelove.app/videos/cmjg0549_ed01d25f_1768918765109.mp4'}
                      className="w-full rounded-lg sm:rounded-xl shadow-2xl border border-pink-500/30 max-h-[80vh]"
                      controls
                      autoPlay
                      loop
                      playsInline
                      style={{ maxHeight: '85vh' }}
                    ></video>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0">
                    <button
                      type="button"
                      className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#ec4899] text-primary-foreground hover:bg-[#ec4899]/90 h-11 rounded-md px-8 btn-gradient w-full sm:w-auto touch-manipulation"
                      onClick={async () => {
                        if (generatedVideoId) {
                          setIsDownloading(true)
                          try {
                            showDownloadStatus('preparing')
                            await downloadImageGeneration(
                              generatedVideoId,
                              `video-${generatedVideoId}.mp4`
                            )
                            showDownloadStatus('success')
                          } catch (error) {
                            console.error('Failed to download video:', error)
                            showDownloadStatus('error')
                            showSnackbar('Failed to download video', 'error')
                            // 如果下载失败，回退到打开链接
                            if (generatedVideoUrl) {
                              window.open(generatedVideoUrl, '_blank')
                            }
                          } finally {
                            setIsDownloading(false)
                          }
                        } else if (generatedVideoUrl) {
                          // 如果没有 id，回退到打开链接
                          window.open(generatedVideoUrl, '_blank')
                        }
                      }}
                    >
                      {isDownloading ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4 mr-2"
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
                      {isDownloading ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4 mr-2"
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-download w-4 h-4 mr-2"
                        aria-hidden="true"
                      >
                        <path d="M12 15V3"></path>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <path d="m7 10 5 5 5-5"></path>
                      </svg>
                      Download Video
                        </>
                      )}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-11 rounded-md px-8 border-pink-500/50 text-pink-400 hover:bg-pink-500/10 w-full sm:w-auto touch-manipulation"
                      onClick={() => {
                        setGenerationSucceeded(false)
                        setGenerationProgress(0)
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-sparkles w-4 h-4 mr-2"
                        aria-hidden="true"
                      >
                        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                        <path d="M20 2v4"></path>
                        <path d="M22 4h-4"></path>
                        <circle cx="4" cy="20" r="2"></circle>
                      </svg>
                      Generate Another
                    </button>
                  </div>
                </div>
              )}

              {!isGenerating && !generationSucceeded && (
                <>
              <div className="flex-shrink-0 py-4">
                <h2 className="text-[24px] font-bold text-white flex items-center justify-center gap-2">
                  <span>✨</span>
                  <span>Featured Creations</span>
                </h2>
                <p className="text-white/60 mt-1 text-sm text-center">Get inspired by these amazing examples</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                {isLoadingFeatured ? (
                  <>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <FeaturedCreationSkeletonCard key={`featured-skeleton-${index}`} delayMs={index * 50} />
                    ))}
                  </>
                ) : featuredCreations.length > 0 ? (
                  featuredCreations.map((item) => (
                    <div 
                      className="relative group cursor-pointer" 
                      key={item.id}
                      onClick={() => {
                        if (item.prompt) {
                          setPrompt(item.prompt)
                        }
                        setActiveTab('generator')
                      }}
                    >
                      <div className="relative aspect-[9/16] rounded-lg sm:rounded-xl overflow-hidden border border-pink-500/20 group-hover:border-pink-500/40 transition-all duration-300">
                        <video src={item.videoUrl} className="w-full h-full object-cover" autoPlay loop playsInline muted></video>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 transition-all duration-300 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0">
                          <div className="mb-2 sm:mb-3">
                            <p className="text-gray-100 text-xs sm:text-sm line-clamp-3 leading-relaxed">{item.prompt}</p>
                          </div>
                          <button
                            type="button"
                            className="cursor-pointer bg-gradient-to-r from-[#ec4899] to-[#db2777] inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-8 w-full btn-gradient text-xs sm:text-sm h-8 sm:h-9"
                            onClick={() => {
                              if (item.prompt) {
                                setPrompt(item.prompt)
                              }
                              setActiveTab('generator')
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-sparkles w-3 h-3 sm:w-4 sm:h-4 mr-1.5" aria-hidden="true">
                              <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path>
                            </svg>
                            Create Similar Video
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 text-white/60">No featured videos available.</div>
                )}
              </div>
                </>
              )}

              {/* How it works - 4 steps */}
              {!isGenerating && !generationSucceeded && (
              <div className="w-full">
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Get Started in 4 Easy Steps</h3>
                  <p className="text-gray-400 text-sm sm:text-base">Simple steps to create amazing AI videos</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    {
                      step: '1',
                      title: 'Upload or Select',
                      desc: 'Choose a character or upload your image',
                      iconBg: 'bg-pink-500/20',
                      bar: 'from-pink-500 to-purple-500',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload w-4 h-4 sm:w-5 sm:h-5 text-pink-400" aria-hidden="true">
                          <path d="M12 3v12"></path>
                          <path d="m17 8-5-5-5 5"></path>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        </svg>
                      ),
                    },
                    {
                      step: '2',
                      title: 'Customize Prompt',
                      desc: 'Adjust settings and write your prompt',
                      iconBg: 'bg-purple-500/20',
                      bar: 'from-purple-500 to-blue-500',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-sparkles w-4 h-4 sm:w-5 sm:h-5 text-purple-400" aria-hidden="true">
                          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path>
                          <path d="m14 7 3 3"></path>
                          <path d="M5 6v4"></path>
                          <path d="M19 14v4"></path>
                          <path d="M10 2v2"></path>
                          <path d="M7 8H3"></path>
                          <path d="M21 16h-4"></path>
                          <path d="M11 3H9"></path>
                        </svg>
                      ),
                    },
                    {
                      step: '3',
                      title: 'Generate Video',
                      desc: 'AI transforms your image into video',
                      iconBg: 'bg-blue-500/20',
                      bar: 'from-blue-500 to-cyan-500',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video w-4 h-4 sm:w-5 sm:h-5 text-blue-400" aria-hidden="true">
                          <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                          <rect x="2" y="6" width="14" height="12" rx="2"></rect>
                        </svg>
                      ),
                    },
                    {
                      step: '4',
                      title: 'Download & Share',
                      desc: 'Get your stunning video result',
                      iconBg: 'bg-green-500/20',
                      bar: 'from-cyan-500 to-green-500',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 sm:w-5 sm:h-5 text-green-400" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                      ),
                    },
                  ].map((card, index) => (
                    <div key={card.step} className="relative group">
                      {index < 3 && (
                        <div className="hidden lg:block absolute top-10 left-[calc(100%+0.5rem)] w-4 h-0.5 bg-gradient-to-r from-gray-700 to-gray-600 -z-10" />
                      )}
                      <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-4 hover:border-gray-600/50 transition-all duration-300 h-full">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm border border-gray-600">
                            {card.step}
                          </div>
                          <div className={cn('flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center', card.iconBg)}>
                            {card.icon}
                          </div>
                        </div>
                        <h4 className="text-white font-semibold text-sm sm:text-base mb-1">{card.title}</h4>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{card.desc}</p>
                        <div className={cn('mt-3 h-1 rounded-full bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity', card.bar)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
