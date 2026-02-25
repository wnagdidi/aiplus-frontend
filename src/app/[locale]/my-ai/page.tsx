'use client'

import FeeLoveLayout, { useCredits } from '@/components/layout/FeeLoveLayout'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useState, useEffect, useMemo, useRef } from 'react'
import { EventEntry, useGTM } from '@/context/GTMContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { Avatar, Card, CardBody, Button, Chip, Input, Select, SelectItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Modal, ModalBody, ModalContent, cn } from '@heroui/react'
import {
  CreditCardIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  PhotoIcon,
  CubeTransparentIcon,
  CurrencyDollarIcon,
  GiftIcon,
  CalendarIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import {
  getImageGenerationsList,
  getVideoGenerationsList,
  getCreditsHistory,
  getCreationsStatistics,
  downloadImageGeneration,
  deleteGeneration,
  updateUserPassword
} from '@/api/client/feeLoveApi'
import {
  GenerationStatus,
  ImageGenerationRecord,
  VideoGenerationRecord,
} from '@/api/client/feeLoveApi.interface'
import { getLocalStorage } from '@/util/localStorage'
import { useSession } from 'next-auth/react'
import { useSnackbar } from '@/context/SnackbarContext'
import { useDownloadStatus } from '@/context/DownloadStatusContext'

// Initial stats data
const initialStats = [
  { name: 'Available Credits', value: '5', icon: CreditCardIcon, action: '+ Buy' },
  { name: 'Total Creations', value: '0', subtext: '0 videos • 0 images', icon: SparklesIcon, action: 'Create →' },
  { name: 'Success Rate', value: '0%', subtext: '0 completed • 0 failed', icon: CheckCircleIcon },
  { name: 'In Progress', value: '0', subtext: 'All done!', icon: VideoCameraIcon },
]

const mainTabs = ['My Creations', 'Billing', 'Credit History', 'Security']
// 检查环境变量 NEXT_PUBLIC_CLOAK
const isCloakEnabled = process.env.NEXT_PUBLIC_CLOAK === 'true'
const contentTabs = isCloakEnabled ? ['Images'] : ['Videos', 'Images']

function MyAiPageContent() {
  const { sendEvent, reportEvent } = useGTM()
  const { openDialog: openPricingDialog } = usePricingDialog()
  const { data: session, status } = useSession()
  const { showSnackbar } = useSnackbar()
  const { showDownloadStatus } = useDownloadStatus()
  const { creditsBalance: creditsFromLayout } = useCredits()
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const locale = useLocale()
  
  // Get initial tab from URL params
  const initialTab = searchParams.get('tab') || 'My Creations'
  const [activeMainTab, setActiveMainTab] = useState(initialTab)
  const [activeContentTab, setActiveContentTab] = useState(isCloakEnabled ? 'Images' : 'Videos')
  
  // 获取完整路径的辅助函数
  const getFullPath = (path: string) => {
    if (!path) {
      return locale === 'en' ? '/' : `/${locale}`
    }
    return locale === 'en' ? `/${path}` : `/${locale}/${path}`
  }
  
  // 访客 session 状态
  const [guestSession, setGuestSession] = useState<any>(null)

  // 检查并同步访客 session
  useEffect(() => {
    const updateGuestSession = () => {
      if (!session) {
        // 未登录时，检查 localStorage 中的访客 session
        try {
          const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
          if (storedSession?.user?.accessToken && storedSession.user.isGuest) {
            setGuestSession(storedSession)
          } else {
            setGuestSession(null)
          }
        } catch (error) {
          console.error('Failed to read guest session from localStorage:', error)
          setGuestSession(null)
        }
      } else {
        // 已登录时，清除访客 session
        setGuestSession(null)
      }
    }

    // 初始检查
    updateGuestSession()

    // 监听访客 session 更新事件
    const handleGuestSessionUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ session: any }>
      if (customEvent.detail?.session) {
        setGuestSession(customEvent.detail.session)
      } else {
        // 如果没有 session，重新检查 localStorage
        updateGuestSession()
      }
    }

    // 监听 localStorage 变化（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'AVOID_AI_SESSION' && !session) {
        updateGuestSession()
      }
    }

    window.addEventListener('guestSessionUpdated', handleGuestSessionUpdated)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('guestSessionUpdated', handleGuestSessionUpdated)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [session])

  // 访问控制：如果未登录（包括访客）则重定向到登录页
  useEffect(() => {
    // 等待 session 状态加载完成
    if (status === 'loading') {
      return
    }
    
    // 检查登录用户
    if (session?.user) {
      return // 已登录，允许访问
    }
    
    // 检查访客 session（状态或 localStorage）
    const checkGuestSession = () => {
      try {
        const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
        return storedSession?.user?.accessToken && storedSession.user.isGuest
      } catch {
        return false
      }
    }
    
    const hasGuestSession = guestSession?.user || checkGuestSession()
    
    // 如果未登录且没有访客 session，重定向到登录页
    // 但给一点时间让访客 session 创建（最多等待 3 秒）
    if (!hasGuestSession) {
      // 延迟检查，给 ClientApiSessionSync 时间创建访客 session
      let checkCount = 0
      const maxChecks = 6 // 检查 6 次，每次 500ms，总共 3 秒
      const intervalId = setInterval(() => {
        checkCount++
        const finalCheck = guestSession?.user || checkGuestSession()
        
        if (finalCheck) {
          // 找到了访客 session，清除定时器
          clearInterval(intervalId)
        } else if (checkCount >= maxChecks) {
          // 超时了，重定向到登录页
          clearInterval(intervalId)
          router.push(getFullPath('login'))
        }
      }, 500) // 每 500ms 检查一次
      
      return () => clearInterval(intervalId)
    }
  }, [session, guestSession, status, router, locale])
  
  // Update tab when URL param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && mainTabs.includes(tabParam)) {
      setActiveMainTab(tabParam)
    }
  }, [searchParams])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false)
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // My Creations states
  const [statusFilter, setStatusFilter] = useState<string>('All Status')
  const [sortOrder, setSortOrder] = useState<string>('Newest First')
  const [resolutionFilter, setResolutionFilter] = useState<string>('All Resolutions')
  const [imageGenerations, setImageGenerations] = useState<ImageGenerationRecord[]>([])
  const [videoGenerations, setVideoGenerations] = useState<VideoGenerationRecord[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  // Download loading states - track by generation id
  const [downloadingIds, setDownloadingIds] = useState<Set<string | number>>(new Set())
  
  // Pagination states
  const [imagePage, setImagePage] = useState(1)
  const [imagePageSize] = useState(9)
  const [imageTotal, setImageTotal] = useState(0)
  const [videoPage, setVideoPage] = useState(1)
  const [videoPageSize] = useState(9)
  const [videoTotal, setVideoTotal] = useState(0)
  
  // Credit History states
  const [creditsHistory, setCreditsHistory] = useState<any[]>([])
  const [isLoadingCreditsHistory, setIsLoadingCreditsHistory] = useState(false)
  const [creditsHistoryPage, setCreditsHistoryPage] = useState(1)
  const [creditsHistoryPageSize] = useState(20)
  const [creditsHistoryTotal, setCreditsHistoryTotal] = useState(0)
  
  // Stats states
  const [stats, setStats] = useState(initialStats)

  // Image preview modal state
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<ImageGenerationRecord[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)

  const openImagePreview = (images: ImageGenerationRecord[], index: number) => {
    setPreviewImages(images)
    setPreviewIndex(index)
    setIsImagePreviewOpen(true)
  }

  const closeImagePreview = () => {
    setIsImagePreviewOpen(false)
  }

  const handlePrevImage = () => {
    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNextImage = () => {
    setPreviewIndex((prev) => (prev < previewImages.length - 1 ? prev + 1 : prev))
  }

  // Video preview modal state
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false)
  const [previewVideos, setPreviewVideos] = useState<VideoGenerationRecord[]>([])
  const [previewVideoIndex, setPreviewVideoIndex] = useState(0)

  const openVideoPreview = (videos: VideoGenerationRecord[], index: number) => {
    // 停止并重置当前点击的视频
    const currentVideo = videos[index]
    if (currentVideo?.id) {
      const video = videoRefs.current.get(currentVideo.id)
      if (video) {
        video.pause()
        video.currentTime = 0
      }
    }
    setPreviewVideos(videos)
    setPreviewVideoIndex(index)
    setIsVideoPreviewOpen(true)
  }

  const closeVideoPreview = () => {
    setIsVideoPreviewOpen(false)
  }

  const handlePrevVideo = () => {
    setPreviewVideoIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNextVideo = () => {
    setPreviewVideoIndex((prev) => (prev < previewVideos.length - 1 ? prev + 1 : prev))
  }

  // 存储每个视频元素的 ref
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  // Video Details 弹框中的视频 ref
  const previewVideoRef = useRef<HTMLVideoElement>(null)

  // Mock data for testing - you can modify this to see different states

  const mockVideoData: VideoGenerationRecord[] = [
    {
      id: 'vid-001',
      userId: 'user-001',
      sourceImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      videoUrl: null,
      templateId: 'template-001',
      prompt: 'Sexy Secretary',
      status: GenerationStatus.FAILED,
      creditCost: 10,
      createdAt: new Date('2026-01-15').toISOString(),
      updatedAt: new Date('2026-01-15').toISOString(),
    },
  ]

  const handleGetPremium = () => {
    // 直接打开计划选择对话框，让用户选择计划
    reportEvent('PricePageUpgrade', {})
    openPricingDialog(EventEntry.HumanizeExceedWordLimitPerRequestUpgradeButton)
  }

  // Reset page when filters change
  useEffect(() => {
    setImagePage(1)
    setVideoPage(1)
  }, [statusFilter, sortOrder, resolutionFilter])

  // Reset page when tab changes
  useEffect(() => {
    if (activeContentTab === 'Images') {
      setImagePage(1)
    } else if (activeContentTab === 'Videos') {
      setVideoPage(1)
    }
  }, [activeContentTab])

  // 当视频切换或弹框打开时，自动播放视频
  useEffect(() => {
    if (isVideoPreviewOpen && previewVideoRef.current) {
      const videoUrl = previewVideos[previewVideoIndex]?.videoUrl || (previewVideos[previewVideoIndex] as any)?.generatedUrl
      if (videoUrl) {
        // 使用 setTimeout 确保 DOM 已更新
        const timer = setTimeout(() => {
          if (previewVideoRef.current) {
            previewVideoRef.current.play().catch((error) => {
              // 忽略播放错误（可能是浏览器策略限制）
              console.warn('Video autoplay failed:', error)
            })
          }
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [isVideoPreviewOpen, previewVideoIndex, previewVideos])

  // Update credits from API (fallback to localStorage)
  // 从 FeeLoveLayout 获取积分，并更新 stats（支持登录用户和访客用户）
  useEffect(() => {
    if (creditsFromLayout !== null && creditsFromLayout !== undefined) {
      // 从 FeeLoveLayout 获取的积分
        setStats((prevStats) => {
          const updatedStats = [...prevStats]
        updatedStats[0] = { ...updatedStats[0], value: String(creditsFromLayout) }
            return updatedStats
          })
    } else {
      // 如果 FeeLoveLayout 还没有获取到积分，尝试从 session 或 guestSession 或 localStorage 获取（fallback）
      let creditsBalance: number | null = null
      
      // 优先从 session 获取
      if (session?.user?.creditsBalance !== undefined && session.user.creditsBalance !== null) {
        creditsBalance = session.user.creditsBalance
      }
      // 其次从 guestSession 获取
      else if (guestSession?.user?.creditsBalance !== undefined && guestSession.user.creditsBalance !== null) {
        creditsBalance = guestSession.user.creditsBalance
      }
      // 最后从 localStorage 获取
      else {
      try {
        const sessionData = getLocalStorage<any>('AVOID_AI_SESSION')
          creditsBalance = sessionData?.user?.creditsBalance
        } catch (error) {
          console.error('Failed to get credits from localStorage fallback:', error)
        }
      }
      
        if (creditsBalance !== undefined && creditsBalance !== null) {
          setStats((prevStats) => {
            const updatedStats = [...prevStats]
            updatedStats[0] = { ...updatedStats[0], value: String(creditsBalance) }
            return updatedStats
          })
      } else {
        // 如果都没有，显示 0
        setStats((prevStats) => {
          const updatedStats = [...prevStats]
          updatedStats[0] = { ...updatedStats[0], value: '0' }
          return updatedStats
        })
      }
    }
  }, [creditsFromLayout, session, guestSession])

  // Fetch statistics on mount
  useEffect(() => {
    fetchCreationsStatistics()
  }, [])

  // Fetch data when tab changes
  useEffect(() => {
    if (activeMainTab === 'My Creations') {
      if (activeContentTab === 'Images') {
        fetchImageGenerations()
      } else if (activeContentTab === 'Videos') {
        fetchVideoGenerations()
      }
    } else if (activeMainTab === 'Credit History') {
      fetchCreditsHistory()
    }
  }, [activeMainTab, activeContentTab, statusFilter, sortOrder, resolutionFilter, imagePage, videoPage, creditsHistoryPage])

  const fetchImageGenerations = async () => {
    setIsLoadingImages(true)
    try {
      // 构建请求参数
      const params: {
        page?: number
        pageSize?: number
        sort?: string
        status?: string
      } = {
        page: imagePage,
        pageSize: imagePageSize,
      }

      // 转换 sortOrder
      if (sortOrder === 'Newest First') {
        params.sort = 'newest'
      } else if (sortOrder === 'Oldest First') {
        params.sort = 'oldest'
      }

      // 转换 statusFilter
      if (statusFilter !== 'All Status') {
        const statusMap: Record<string, string> = {
          'Completed': 'completed',
          'Processing': 'processing',
          'Failed': 'failed',
          'Pending': 'pending',
        }
        params.status = statusMap[statusFilter] || statusFilter.toLowerCase()
      }

      const result = await getImageGenerationsList(params)
      
      // 根据接口返回的数据结构设置数据
      // 接口返回格式: { code: "SUCCESS", data: { total, records, pageSize, page } }
      // getImageGenerationsList 返回 response.data.data，所以 result 应该是 { total, records, pageSize, page }
      if (result) {
        // 处理可能的嵌套结构：如果 result 有 data 字段，则使用 data，否则直接使用 result
        const data = result.data || result
        if (data.records && Array.isArray(data.records)) {
          setImageGenerations(data.records)
          setImageTotal(data.total || 0)
        } else if (Array.isArray(result.records)) {
          // 如果 result 直接包含 records（向后兼容）
        setImageGenerations(result.records)
        setImageTotal(result.total || 0)
        } else {
          setImageGenerations([])
          setImageTotal(0)
        }
      } else {
        setImageGenerations([])
        setImageTotal(0)
      }
    } catch (error) {
      console.error('Failed to fetch image generations:', error)
      setImageGenerations([])
    } finally {
      setIsLoadingImages(false)
    }
  }

  const fetchVideoGenerations = async () => {
    setIsLoadingVideos(true)
    try {
      // 构建请求参数
      const params: {
        page?: number
        pageSize?: number
        sort?: string
        resolution?: string
        status?: string
      } = {
        page: videoPage,
        pageSize: videoPageSize,
      }

      // 转换 sortOrder
      if (sortOrder === 'Newest First') {
        params.sort = 'newest'
      } else if (sortOrder === 'Oldest First') {
        params.sort = 'oldest'
      }

      // 转换 statusFilter
      if (statusFilter !== 'All Status') {
        const statusMap: Record<string, string> = {
          'Completed': 'completed',
          'Processing': 'processing',
          'Failed': 'failed',
        }
        params.status = statusMap[statusFilter] || statusFilter.toLowerCase()
      }

      // 转换 resolutionFilter
      if (resolutionFilter !== 'All Resolutions') {
        params.resolution = resolutionFilter.toLowerCase()
      }

      const result = await getVideoGenerationsList(params)
      
      // 根据接口返回的数据结构设置数据
      // 数据结构: { code: "SUCCESS", data: { code: "SUCCESS", data: { page, pageSize, records, total } } }
      if (result?.records) {
        console.log('111')
        setVideoGenerations(result.records)
        setVideoTotal(result.total || 0)
      }  else {
        console.log('222')
        setVideoGenerations([])
        setVideoTotal(0)
      }
    } catch (error) {
      console.error('Failed to fetch video generations:', error)
      setVideoGenerations([])
    } finally {
      setIsLoadingVideos(false)
    }
  }

  const handleClearFilters = () => {
    setStatusFilter('All Status')
    setSortOrder('Newest First')
    setResolutionFilter('All Resolutions')
    // 重置页码
    setImagePage(1)
    setVideoPage(1)
  }

  const fetchCreditsHistory = async () => {
    setIsLoadingCreditsHistory(true)
    try {
      const result = await getCreditsHistory(creditsHistoryPage, creditsHistoryPageSize)
      
      // 根据接口返回的数据结构设置数据
      // 假设返回结构类似: { page, pageSize, records, total }
      if (result?.items) {
        setCreditsHistory(result.items)
        setCreditsHistoryTotal(result.total || 0)
      } else if (Array.isArray(result)) {
        // 如果直接返回数组
        setCreditsHistory(result)
        setCreditsHistoryTotal(result.length)
      } else {
        setCreditsHistory([])
        setCreditsHistoryTotal(0)
      }
    } catch (error) {
      console.error('Failed to fetch credits history:', error)
      setCreditsHistory([])
    } finally {
      setIsLoadingCreditsHistory(false)
    }
  }

  const fetchCreationsStatistics = async () => {
    try {
      const result = await getCreationsStatistics()
      
      // 更新 stats，保留第一个 Available Credits，更新其他三个
      setStats((prevStats) => {
        const updatedStats = [...prevStats]
        
        // 更新 Total Creations
        if (result?.totalCreations !== undefined) {
          const totalCreations = result.totalCreations
          const videos = result.totalVideos || 0
          const images = result.totalImages || 0
          updatedStats[1] = {
            ...updatedStats[1],
            value: totalCreations.toString(),
            subtext: `${videos} videos • ${images} images`,
          }
        }
        
        // 更新 Success Rate
        if (result?.successRate !== undefined) {
          const successRate = result.successRate
          const completed = result.completed || 0
          const failed = result.failed || 0
          updatedStats[2] = {
            ...updatedStats[2],
            value: `${successRate}%`,
            subtext: `${completed} completed • ${failed} failed`,
          }
        }
        
        // 更新 In Progress
        if (result?.inProgress !== undefined) {
          const inProgress = result.inProgress
          updatedStats[3] = {
            ...updatedStats[3],
            value: inProgress.toString(),
            subtext: inProgress === 0 ? 'All done!' : `${inProgress} in progress`,
          }
        }
        
        return updatedStats
      })
    } catch (error) {
      console.error('Failed to fetch creations statistics:', error)
      // 保持初始 stats，不更新
    }
  }

  const formatDate = (dateArray: number[] | string) => {
    // 如果是数组格式 [年, 月, 日, 时, 分, 秒]
    if (Array.isArray(dateArray)) {
      const [year, month, day] = dateArray
      // 月份从 0 开始，所以需要减 1
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    // 兼容字符串格式
    const date = new Date(dateArray)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateInput: number[] | string | Date) => {
    let date: Date
    
    // 如果是数组格式 [年, 月, 日, 时, 分, 秒]
    if (Array.isArray(dateInput)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput
      date = new Date(year, month - 1, day, hour, minute, second)
    } else if (dateInput instanceof Date) {
      date = dateInput
    } else {
      date = new Date(dateInput)
    }
    
    // 格式化日期部分: "Jan 15, 2026"
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
    
    // 格式化时间部分: "10:41 PM"
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    return `${dateStr}, ${timeStr}`
  }

  const getStatusDisplayName = (status: GenerationStatus) => {
    switch (status) {
      case GenerationStatus.COMPLETED:
        return 'Completed'
      case GenerationStatus.PENDING:
        return 'Pending'
      case GenerationStatus.IN_PROGRESS:
      case GenerationStatus.IN_QUEUE:
        return 'Processing'
      case GenerationStatus.FAILED:
        return 'Failed'
      default:
        return status
    }
  }

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let filtered = [...imageGenerations]

    // Apply status filter
    if (statusFilter !== 'All Status') {
      const statusMap: Record<string, GenerationStatus> = {
        Completed: GenerationStatus.COMPLETED,
        Processing: GenerationStatus.IN_PROGRESS,
        Failed: GenerationStatus.FAILED,
        Pending: GenerationStatus.PENDING,
      }
      const targetStatus = statusMap[statusFilter]
      if (targetStatus) {
        filtered = filtered.filter((item) => {
          if (statusFilter === 'Processing') {
            return item.status === GenerationStatus.IN_PROGRESS || item.status === GenerationStatus.IN_QUEUE
          }
          return item.status === targetStatus
        })
      }
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'Newest First' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [imageGenerations, statusFilter, sortOrder])

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let filtered = [...videoGenerations]

    // Apply status filter
    if (statusFilter !== 'All Status') {
      const statusMap: Record<string, GenerationStatus> = {
        Completed: GenerationStatus.COMPLETED,
        Processing: GenerationStatus.IN_PROGRESS,
        Failed: GenerationStatus.FAILED,
        Pending: GenerationStatus.PENDING,
      }
      const targetStatus = statusMap[statusFilter]
      if (targetStatus) {
        filtered = filtered.filter((item) => {
          if (statusFilter === 'Processing') {
            return item.status === GenerationStatus.IN_PROGRESS || item.status === GenerationStatus.IN_QUEUE
          }
          return item.status === targetStatus
        })
      }
    }

    // Apply resolution filter
    if (resolutionFilter !== 'All Resolutions') {
      filtered = filtered.filter((item) => {
        // Assuming videoGenerationRecord has a resolution field
        // If not, you may need to add it or adjust this logic
        const itemResolution = (item as any).resolution || ''
        if (resolutionFilter === '480p') {
          return itemResolution === '480p' || itemResolution === '480P'
        } else if (resolutionFilter === '720p') {
          return itemResolution === '720p' || itemResolution === '720P'
        }
        return true
      })
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'Newest First' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [videoGenerations, statusFilter, sortOrder, resolutionFilter])

  // Determine display state
  const hasImageData = imageGenerations.length > 0
  const hasVideoData = videoGenerations.length > 0
  const hasFilteredImageResults = filteredImages.length > 0
  const hasFilteredVideoResults = filteredVideos.length > 0
  const hasActiveFilters = statusFilter !== 'All Status' || sortOrder !== 'Newest First' || (activeContentTab === 'Videos' && resolutionFilter !== 'All Resolutions')

  // 如果未登录或正在加载，显示加载状态或返回空（避免闪烁）
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/70">Loading...</div>
      </div>
    )
  }

  // 检查是否有用户（登录用户或访客用户）
  // 也检查 localStorage，因为 guestSession 状态可能还没更新
  const hasUser = session?.user || guestSession?.user || (() => {
    try {
      const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
      return storedSession?.user?.accessToken && storedSession.user.isGuest
    } catch {
      return false
    }
  })()
  
  if (!hasUser) {
    return null // 重定向中，不渲染内容
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 text-white">
        {/* User Header */}
        <div className="bg-[#1a1a24] p-4 rounded-xl flex items-center gap-4 border border-white/10">
          <Avatar className="h-12 w-12 bg-pink-500 text-white text-xl font-bold">A</Avatar>
          <div>
            <h1 className="text-lg font-semibold text-white">{session?.user?.name || ''}</h1>
            <p className="text-sm text-white/70 truncate">{session?.user?.email || ''}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            // 根据卡片类型确定图标背景色和图标颜色
            let iconBgColor = 'bg-pink-500/10'
            let iconColor = 'text-pink-400'
            if (stat.name === 'Total Creations') {
              iconBgColor = 'bg-blue-500/10'
              iconColor = 'text-blue-400'
            } else if (stat.name === 'Success Rate') {
              iconBgColor = 'bg-green-500/10'
              iconColor = 'text-green-400'
            } else if (stat.name === 'In Progress') {
              iconBgColor = 'bg-yellow-500/10'
              iconColor = 'text-yellow-400'
            }

            return (
              <div
                key={stat.name}
                className="rounded-lg border shadow-sm bg-[#1a1a24] border-white/10 p-6 hover:border-pink-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${iconBgColor}`}>
                    <stat.icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  {stat.action && (stat.action !== 'Create →' || !isCloakEnabled) && (
                    <button
                      onClick={() => {
                        if (stat.action === '+ Buy') {
                          handleGetPremium()
                        } else if (stat.action === 'Create →') {
                          router.push(`/${params?.locale ?? 'en'}/generate`)
                        }
                      }}
                      className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 text-xs ${
                        stat.name === 'Available Credits'
                          ? 'bg-pink-500 hover:bg-pink-600 text-white'
                          : 'border border-white/20 bg-transparent hover:bg-white/5 text-white'
                      }`}
                    >
                      {stat.action === '+ Buy' ? (
                        <>
                          <PlusIcon className="w-3 h-3 mr-1" />
                          Buy
                        </>
                      ) : (
                        <>
                          Create
                          <ArrowRightIcon className="w-3 h-3 ml-1" />
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/60">{stat.name}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                {stat.subtext && (
                    <p className={`text-xs ${
                      stat.name === 'Total Creations' ? 'text-blue-400' : 'text-white/60'
                    }`}>
                      {stat.subtext}
                    </p>
                  )}
                </div>
                  </div>
            )
          })}
        </div>

        {/* Main Tabs */}
        <div className="grid grid-cols-4 gap-2 bg-[#1a1a24] p-1 rounded-lg border border-white/10">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeMainTab === tab ? 'bg-pink-500 text-white' : 'text-white/70 hover:bg-white/5'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Data Retention Notice */}
        <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-200 p-4 rounded-lg flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 text-yellow-400 flex-shrink-0" />
            <div>
                <h4 className="font-semibold">Data Retention Notice</h4>
                <p className="text-sm text-yellow-200/80">We only retain your generated content for <span className="font-bold">7 days</span>. Content older than 7 days will be automatically deleted. Please download and save your important creations promptly.</p>
            </div>
        </div>

        {/* Content Area based on Main Tab */}
        <div>
          {activeMainTab === 'My Creations' && (
            <div className="space-y-4">
              {/* Content Tabs */}
              {contentTabs.length > 1 && (
              <div className="flex justify-center">
                  <div className={`grid ${contentTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 bg-[#1a1a24] p-1 rounded-lg border border-white/10 w-full max-w-xs`}>
                    {contentTabs.map((tab) => (
                        <button
                        key={tab}
                        onClick={() => setActiveContentTab(tab)}
                          className={`cursor-pointer px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
                            activeContentTab === tab ? 'bg-pink-500 text-white' : 'text-white/70 hover:bg-white/5'
                        }`}>
                        {tab === 'Videos' ? <VideoCameraIcon className="h-5 w-5"/> : <PhotoIcon className="h-5 w-5"/>}
                        {tab}
                        </button>
                    ))}
                </div>
              </div>
              )}

              {/* Filters */}
              {(hasImageData || hasVideoData) && (
                <div className="flex items-center gap-4 bg-[#1a1a24] border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="h-5 w-5 text-white/60" />
                    <span className="text-sm font-medium text-white/80">Filters:</span>
                 </div>
                  <Select
                    selectedKeys={[statusFilter]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string
                      setStatusFilter(selected)
                    }}
                    classNames={{
                      base: 'w-48',
                      trigger: 'bg-[#0c0a17] border-white/20 text-white',
                      value: 'text-white',
                      popoverContent: 'bg-[#1a1a24] border-white/20',
                    }}
                  >
                    <SelectItem key="All Status">All Status</SelectItem>
                    <SelectItem key="Completed">Completed</SelectItem>
                    <SelectItem key="Processing">Processing</SelectItem>
                    <SelectItem key="Failed">Failed</SelectItem>
                    {activeContentTab === 'Images' ? <SelectItem key="Pending">Pending</SelectItem> : null}
                  </Select>
                  {activeContentTab === 'Videos' && (
                    <Select
                      selectedKeys={[resolutionFilter]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string
                        setResolutionFilter(selected)
                      }}
                      classNames={{
                        base: 'w-48',
                        trigger: 'bg-[#0c0a17] border-white/20 text-white',
                        value: 'text-white',
                        popoverContent: 'bg-[#1a1a24] border-white/20',
                      }}
                    >
                      <SelectItem key="All Resolutions">All Resolutions</SelectItem>
                      <SelectItem key="480p">480p</SelectItem>
                      <SelectItem key="720p">720p</SelectItem>
                    </Select>
                  )}
                  <Select
                    selectedKeys={[sortOrder]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string
                      setSortOrder(selected)
                    }}
                    classNames={{
                      base: 'w-48',
                      trigger: 'bg-[#0c0a17] border-white/20 text-white',
                      value: 'text-white',
                      popoverContent: 'bg-[#1a1a24] border-white/20',
                    }}
                  >
                    <SelectItem key="Newest First">Newest First</SelectItem>
                    <SelectItem key="Oldest First">Oldest First</SelectItem>
                  </Select>
                </div>
              )}

              {/* Images Content */}
              {activeContentTab === 'Images' && (
                <div className="min-h-[400px]">
                  {isLoadingImages ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-white/60">Loading...</div>
                    </div>
                  ) : !hasFilteredImageResults && hasActiveFilters ? (
                    // No filtered results state (图一样式)
                    <div className="bg-[#1a1a24] border border-white/10 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-pink-500/20">
                        <PhotoIcon className="h-10 w-10 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No images match your filters</h3>
                      <p className="text-white/60 mb-6">Try adjusting your filters to see more results.</p>
                      <Button
                        className="bg-[#0c0a17] border border-white/20 text-white hover:bg-white/5"
                        onPress={handleClearFilters}
                      >
                        Clear Filters
                </Button>
              </div>
                  ) : !hasImageData ? (
                    // No data state (图二样式)
                    <div className="bg-[#1a1a24] border border-white/10 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-pink-500/20">
                        <PhotoIcon className="h-10 w-10 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No images yet</h3>
                      <p className="text-white/60 mb-6">
                        Start creating amazing AI-generated images. Your creations will appear here.
                      </p>
                      <Button
                        className="bg-pink-500 text-white font-semibold"
                        onPress={() => router.push(`/${params?.locale ?? 'en'}/image-generator/new`)}
                      >
                        Create Your First Image
                      </Button>
                    </div>
                  ) : !hasFilteredImageResults ? (
                    // No filtered results state (图一样式) - fallback for client-side filtering
                    <div className="bg-[#1a1a24] border border-white/10 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-pink-500/20">
                        <PhotoIcon className="h-10 w-10 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No images match your filters</h3>
                      <p className="text-white/60 mb-6">Try adjusting your filters to see more results.</p>
                      {hasActiveFilters && (
                        <Button
                          className="bg-[#0c0a17] border border-white/20 text-white hover:bg-white/5"
                          onPress={handleClearFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Has data state (图三样式)
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredImages.map((generation, index) => (
                        <div
                          key={generation.id}
                          className="overflow-hidden border border-white/10 bg-[#1a1a24] hover:border-pink-500/50 transition-colors group rounded-xl"
                        >
                          <Card className="bg-transparent border-0 shadow-none">
                          <CardBody className="p-0">
                            <div 
                              className={`relative aspect-square ${(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) ? 'cursor-pointer' : 'cursor-default'}`}
                              onClick={() => {
                                if (generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) {
                                  openImagePreview(filteredImages, index)
                                }
                              }}
                            >
                              <img
                                src={
                                  generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED
                                    ? generation.generatedUrl
                                    : (generation as any).sourceUrl || (generation as any).sourceImageUrl || generation.generatedUrl
                                }
                                alt="Generated"
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                              {/* Hover overlay for preview - only for completed items */}
                              {(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) && (
                                <div 
                                  className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                                  onClick={() => openImagePreview(filteredImages, index)}
                                >
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pink-500/90 flex items-center justify-center">
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
                                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                                      aria-hidden="true"
                                    >
                                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                  </div>
                                </div>
                              )}
                              {/* Status Badge */}
                              {generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED ? (
                                <div className="absolute top-2 left-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm bg-green-500/20 text-green-400 border-green-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                                      <path d="m9 11 3 3L22 4"></path>
                                    </svg>
                                    Completed
                                  </span>
                                </div>
                              ) : generation.status === 'processing' || generation.status === GenerationStatus.IN_PROGRESS || generation.status === GenerationStatus.IN_QUEUE ? (
                                <div className="absolute top-2 left-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 animate-spin" aria-hidden="true">
                                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                    </svg>
                                    Processing
                                  </span>
                                </div>
                              ) : generation.status === 'failed' || generation.status === GenerationStatus.FAILED ? (
                                <div className="absolute top-2 left-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm bg-red-500/20 text-red-400 border-red-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <path d="m15 9-6 6"></path>
                                      <path d="m9 9 6 6"></path>
                                    </svg>
                                    Failed
                                  </span>
                                </div>
                              ) : null}
                            </div>
                            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                              <h3 className="text-xs sm:text-sm font-medium text-white line-clamp-1">
                                {generation.name}
                              </h3>
                              <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/60">
                                <span className="line-clamp-1">{formatDate(generation.createdAt)}</span>
                                <span className="font-medium text-pink-400 whitespace-nowrap ml-2">
                                  {(generation as any)?.credit || '-'} credits
                                </span>
                              </div>
                              {generation.status === GenerationStatus.FAILED && (
                                <div className="text-xs text-red-400 truncate">
                                  retry exhausted, last error: [InvalidParameter.UnsupportedImageFormat] The request...
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-white/10 px-3 sm:px-4 pb-3 sm:pb-4">
                              {(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) ? (
                                <button
                                  type="button"
                                  disabled={downloadingIds.has(generation.id)}
                                  className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md px-3 flex-1 bg-pink-500 hover:bg-pink-600 text-white h-8 sm:h-9 text-xs sm:text-sm min-h-[44px] sm:min-h-0 touch-manipulation"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      setDownloadingIds((prev) => new Set(prev).add(generation.id))
                                      showDownloadStatus('preparing')
                                      await downloadImageGeneration(
                                        generation.id,
                                        `${generation.name || 'image'}.png`,
                                      )
                                      showDownloadStatus('success')
                                    } catch (error) {
                                      console.error('Failed to download image generation:', error)
                                      showDownloadStatus('error')
                                    } finally {
                                      setDownloadingIds((prev) => {
                                        const next = new Set(prev)
                                        next.delete(generation.id)
                                        return next
                                      })
                                    }
                                  }}
                                >
                                  {downloadingIds.has(generation.id) ? (
                                    <>
                                      <svg
                                        className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
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
                                      <span className="hidden sm:inline">Downloading...</span>
                                      <span className="sm:hidden">...</span>
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
                                        className="lucide lucide-download w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
                                        aria-hidden="true"
                                      >
                                        <path d="M12 15V3"></path>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <path d="m7 10 5 5 5-5"></path>
                                      </svg>
                                  <span className="hidden sm:inline">Download</span>
                                  <span className="sm:hidden">Get</span>
                                    </>
                                  )}
                                </button>
                              ) : null}
                              <Dropdown>
                                <DropdownTrigger>
                                  <button
                                    type="button"
                                    className={cn(
                                      'inline-flex items-center cursor-pointer justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-[#0c0a17] hover:bg-white/5 rounded-md px-3 border-white/10 hover:border-white/20 h-8 sm:h-9 min-h-[44px] sm:min-h-0 min-w-[44px] sm:min-w-0 touch-manipulation',
                                      (generation.status === 'failed' ||
                                        generation.status === GenerationStatus.FAILED ||
                                        generation.status === 'processing' ||
                                        generation.status === GenerationStatus.IN_PROGRESS ||
                                        generation.status === GenerationStatus.IN_QUEUE) &&
                                        'flex-1 w-full'
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation()
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
                                      className="lucide lucide-ellipsis-vertical w-3.5 h-3.5 sm:w-4 sm:h-4"
                                      aria-hidden="true"
                                    >
                                      <circle cx="12" cy="12" r="1"></circle>
                                      <circle cx="12" cy="5" r="1"></circle>
                                      <circle cx="12" cy="19" r="1"></circle>
                                    </svg>
                                  </button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  aria-label="Actions"
                                  className="min-w-[8rem] sm:min-w-[12rem]"
                                  classNames={{
                                    base: '!bg-[#1a1a24] border border-white/20 rounded-md',
                                  }}
                                  onAction={async (key) => {
                                    if (key === 'view') {
                                      if (generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) {
                                        openImagePreview(filteredImages, index)
                                      }
                                    } else if (key === 'delete') {
                                      try {
                                        const res = await deleteGeneration(generation.id)
                                        if(res.code == 'SUCCESS') {
                                          setImageGenerations((prev) => prev.filter((item) => item.id !== generation.id))
                                          setImageTotal((prev) => Math.max(0, prev - 1))
                                          showSnackbar('Deleted successfully', 'success')
                                        }
                                      } catch (error: any) {
                                        console.error('Failed to delete generation:', error)
                                        showSnackbar(error?.message || 'Failed to delete', 'error')
                                      }
                                    }
                                  }}
                                >
                                  {(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) ? (
                                    <DropdownItem
                                      key="view"
                                      className="text-white hover:bg-white/10"
                                      startContent={<EyeIcon className="w-4 h-4" />}
                                    >
                                      View Images
                                    </DropdownItem>
                                  ) : null}
                                  <DropdownItem
                                    key="delete"
                                    className="text-red-400 focus:text-red-400 hover:bg-white/10"
                                    startContent={<TrashIcon className="w-4 h-4" />}
                                  >
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Pagination for Images */}
                  {imageTotal > imagePageSize && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        total={Math.ceil(imageTotal / imagePageSize)}
                        page={imagePage}
                        onChange={(page) => {
                          setImagePage(page)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        classNames={{
                          base: 'gap-2',
                          item: 'bg-[#1a1a24] border border-white/10 text-white',
                          cursor: 'bg-pink-500 text-white',
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Videos Content */}
              {activeContentTab === 'Videos' && (
                <div className="min-h-[400px]">
                  {isLoadingVideos ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-white/60">Loading...</div>
                    </div>
                  ) : !hasFilteredVideoResults && hasActiveFilters ? (
                    // No filtered results state (图一样式)
                    <div className="bg-[#1a1a24] border border-white/10 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-pink-500/20">
                        <VideoCameraIcon className="h-10 w-10 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No videos match your filters</h3>
                      <p className="text-white/60 mb-6">Try adjusting your filters to see more results.</p>
                      <Button
                        className="bg-[#0c0a17] border border-white/20 text-white hover:bg-white/5"
                        onPress={handleClearFilters}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : !hasVideoData ? (
                    // No data state (图二样式)
                    <div className="bg-[#1a1a24] border border-white/10 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-pink-500/20">
                        <VideoCameraIcon className="h-10 w-10 text-pink-400" />
                 </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
                      <p className="text-white/60 mb-6">
                        Start creating amazing AI-generated videos. Your creations will appear here.
                      </p>
                      <Button
                        className="bg-pink-500 text-white font-semibold"
                        onPress={() => router.push(`/${params?.locale ?? 'en'}/generate`)}
                      >
                        Create Your First Video
                </Button>
              </div>
                  ) : !hasFilteredVideoResults ? (
                    // No filtered results state (图一样式) - fallback for client-side filtering
                    <div className="bg-[#1a1a24] border border-white/10 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-pink-500/20">
                        <VideoCameraIcon className="h-10 w-10 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No videos match your filters</h3>
                      <p className="text-white/60 mb-6">Try adjusting your filters to see more results.</p>
                      {hasActiveFilters && (
                        <Button
                          className="bg-[#0c0a17] border border-white/20 text-white hover:bg-white/5"
                          onPress={handleClearFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Has data state (图三样式)
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredVideos.map((generation, index) => (
                        <div 
                          key={generation.id}
                          className="rounded-lg border text-card-foreground shadow-sm bg-background-secondary border-[#6a6a7a] overflow-hidden group hover:border-[#ec4899] transition-all duration-200"
                          onMouseEnter={() => {
                            const video = videoRefs.current.get(generation.id)
                            if (video) {
                              video.play().catch(() => {
                                // 忽略播放错误（可能是浏览器策略限制）
                              })
                            }
                          }}
                          onMouseLeave={() => {
                            const video = videoRefs.current.get(generation.id)
                            if (video) {
                              video.pause()
                              video.currentTime = 0
                            }
                          }}
                        >
                          <div className="relative aspect-[3/4] bg-background-tertiary cursor-pointer">
                            {(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) ? (
                              <video
                                ref={(el) => {
                                  if (el) {
                                    videoRefs.current.set(generation.id, el)
                                  } else {
                                    videoRefs.current.delete(generation.id)
                                  }
                                }}
                                src={(generation as any).generatedUrl || generation.videoUrl || undefined}
                                className="w-full h-full object-cover"
                                preload="metadata"
                                loop
                                playsInline
                                muted
                              />
                            ) : (
                              <img
                                src={(generation as any).sourceUrl || generation.sourceImageUrl || ''}
                                alt="Video source"
                                className="w-full h-full object-cover"
                              />
                            )}
                            {/* Hover overlay for preview - only for completed items */}
                            {(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) && (
                              <div 
                                className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                                onClick={() => openVideoPreview(filteredVideos, index)}
                              >
                                <div className="w-16 h-16 rounded-full bg-[#ec4899]/90 flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="white"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-play w-8 h-8 text-white ml-1"
                                    aria-hidden="true"
                                  >
                                    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
                                  </svg>
                                </div>
                              </div>
                            )}
                              {/* Status Badge */}
                              {generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED ? (
                                <div className="absolute top-2 left-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm bg-green-500/20 text-green-400 border-green-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                                      <path d="m9 11 3 3L22 4"></path>
                                    </svg>
                                    Completed
                                  </span>
                                </div>
                              ) : generation.status === 'processing' || generation.status === GenerationStatus.IN_PROGRESS || generation.status === GenerationStatus.IN_QUEUE ? (
                                <div className="absolute top-2 left-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 animate-spin" aria-hidden="true">
                                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                    </svg>
                                    Processing
                                  </span>
                                </div>
                              ) : generation.status === 'failed' || generation.status === GenerationStatus.FAILED ? (
                                <div className="absolute top-2 left-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm bg-red-500/20 text-red-400 border-red-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <path d="m15 9-6 6"></path>
                                      <path d="m9 9 6 6"></path>
                                    </svg>
                                    Failed
                                  </span>
                                </div>
                              ) : null}
                            {/* Resolution Badge */}
                            {(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) && (
                              <div className="absolute top-2 right-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black/60 text-white border border-white/20 backdrop-blur-sm">
                                  {(generation as any)?.resolution || 'P480'}
                                </span>
                                </div>
                              )}
                            </div>
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs text-foreground-muted">
                              <span>{formatDate(generation.createdAt)}</span>
                              <span className="font-medium text-[#ec4899]">
                                {(generation as any)?.credit || (generation as any)?.creditCost || '-'} credits
                              </span>
                              </div>
                              {generation.status === GenerationStatus.FAILED && (
                                <div className="text-xs text-red-400 truncate">
                                  retry exhausted, last error: [InvalidParameter.UnsupportedImageFormat] The request...
                                </div>
                              )}
                            </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-[#6a6a7a] px-4 pb-4">
                              {(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) ? (
                                <button
                                  type="button"
                                  disabled={downloadingIds.has(generation.id)}
                                  className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 flex-1 bg-[#ec4899] hover:bg-[#ec4899]-hover text-[#ec4899]-foreground"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      setDownloadingIds((prev) => new Set(prev).add(generation.id))
                                      showDownloadStatus('preparing')
                                      await downloadImageGeneration(
                                        generation.id,
                                        `${generation.prompt || (generation as any).name || 'video'}.mp4`,
                                      )
                                      showDownloadStatus('success')
                                    } catch (error) {
                                      console.error('Failed to download video generation:', error)
                                      showDownloadStatus('error')
                                      showSnackbar('Failed to download video', 'error')
                                    } finally {
                                      setDownloadingIds((prev) => {
                                        const next = new Set(prev)
                                        next.delete(generation.id)
                                        return next
                                      })
                                    }
                                  }}
                                >
                                  {downloadingIds.has(generation.id) ? (
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
                                      <span className="hidden sm:inline">Downloading...</span>
                                      <span className="sm:hidden">...</span>
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
                                      <span className="hidden sm:inline">Download</span>
                                  <span className="sm:hidden">Get</span>
                                    </>
                                  )}
                                </button>
                              ) : null}
                              <Dropdown>
                                <DropdownTrigger>
                                  <button
                                    type="button"
                                    className={cn(
                                    'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-9 rounded-md px-3 border-[#6a6a7a] hover:bg-background-tertiary',
                                      !(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) &&
                                        'flex-1 min-h-[44px] sm:min-h-0 h-11 sm:h-9 w-full'
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation()
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
                                    className="lucide lucide-ellipsis-vertical w-4 h-4"
                                    aria-hidden="true"
                                  >
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                  </svg>
                                  </button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  aria-label="Actions"
                                  className="min-w-[8rem] sm:min-w-[12rem]"
                                  classNames={{
                                    base: '!bg-[#1a1a24] border border-white/20 rounded-md',
                                  }}
                                  onAction={async (key) => {
                                    if (key === 'view') {
                                    openVideoPreview(filteredVideos, index)
                                    } else if (key === 'delete') {
                                      try {
                                        const res = await deleteGeneration(generation.id)
                                        if(res.code == 'SUCCESS') {
                                          setVideoGenerations((prev) => prev.filter((item) => item.id !== generation.id))
                                          setVideoTotal((prev) => Math.max(0, prev - 1))
                                          showSnackbar('Deleted successfully', 'success')
                                        }
                                      } catch (error: any) {
                                        console.error('Failed to delete generation:', error)
                                        showSnackbar(error?.message || 'Failed to delete', 'error')
                                      }
                                    }
                                  }}
                                >
                                  {(generation.status === 'completed' || generation.status === GenerationStatus.COMPLETED) ? (
                                    <DropdownItem
                                      key="view"
                                      className="text-white hover:bg-white/10"
                                      startContent={<EyeIcon className="w-4 h-4" />}
                                    >
                                      View Details
                                    </DropdownItem>
                                  ) : null}
                                  <DropdownItem
                                    key="delete"
                                    className="text-red-400 focus:text-red-400 hover:bg-white/10"
                                    startContent={<TrashIcon className="w-4 h-4" />}
                                  >
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Pagination for Videos */}
                  {hasFilteredVideoResults && videoTotal > videoPageSize && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        total={Math.ceil(videoTotal / videoPageSize)}
                        page={videoPage}
                        onChange={(page) => {
                          setVideoPage(page)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        classNames={{
                          base: 'gap-2',
                          item: 'bg-[#1a1a24] border border-white/10 text-white',
                          cursor: 'bg-pink-500 text-white',
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
                    {activeMainTab === 'Billing' && (
            <div className="space-y-6">
              {/* Subscription Section */}
              <div className="bg-[#1a1a24] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5 text-pink-400" />
                  Subscription
                </h2>
                <div className="mt-6 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <CubeTransparentIcon className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">No Active Subscription</h3>
                  <p className="text-white/60 mt-2">Subscribe to get monthly credits and exclusive benefits.</p>
                  <Button
                    className="mt-6 bg-pink-500 text-white font-semibold"
                    onPress={() => router.push(`/${params?.locale ?? 'en'}/feelove-pricing`)}
                  >
                    View Plans
                  </Button>
                </div>
              </div>

              {/* Order History Section */}
              <div className="bg-[#1a1a24] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-pink-400" />
                  Order History
                </h2>
                <div className="mt-6 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <CubeTransparentIcon className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">No orders yet</h3>
                </div>
              </div>
            </div>
          )}
                    {activeMainTab === 'Credit History' && (
            <div className="bg-[#1a1a24] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Credit History</h2>
                  <p className="text-white/60">Track your credit transactions and usage</p>
                </div>
                <select className="bg-[#0c0a17] border border-white/20 rounded-lg px-3 py-2 text-sm">
                  <option>All Time</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>

              {isLoadingCreditsHistory ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-white/60">Loading...</div>
                </div>
              ) : creditsHistory.length === 0 ? (
                <div className="bg-[#0c0a17] border border-white/10 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/20">
                    <GiftIcon className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No credit history yet</h3>
                  <p className="text-white/60">Your credit transactions will appear here</p>
                </div>
              ) : (
                <>
              <div className="space-y-3">
                    {creditsHistory.map((item: any, index: number) => {
                      const type = item.type || (item.amount > 0 ? 'bonus' : 'usage')
                      const amount = Math.abs(item.amount || item.creditAmount || 0)
                      const isPositive = item.amount > 0
                      
                      // Determine icon, colors, and badge based on type
                      let IconComponent = GiftIcon
                      let iconBgColor = 'bg-green-500/20'
                      let amountColor = 'text-green-400'
                      let badgeText = 'Credited'
                      let badgeClass = 'bg-green-500/20 text-green-400 border-green-500/30'
                      let showRefundText = false
                      
                      if (type === 'usage') {
                        IconComponent = MinusIcon
                        iconBgColor = 'bg-red-500/20'
                        amountColor = 'text-red-400'
                        badgeText = 'Used'
                        badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        showRefundText = false
                      } else if (type === 'refund') {
                        IconComponent = PlusIcon
                        iconBgColor = 'bg-green-500/20'
                        amountColor = 'text-green-400'
                        badgeText = 'Credited'
                        badgeClass = 'bg-green-500/20 text-green-400 border-green-500/30'
                        showRefundText = true
                      } else if (type === 'bonus') {
                        IconComponent = GiftIcon
                        iconBgColor = 'bg-green-500/20'
                        amountColor = 'text-green-400'
                        badgeText = 'Credited'
                        badgeClass = 'bg-green-500/20 text-green-400 border-green-500/30'
                        showRefundText = false
                      }
                      
                      return (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${iconBgColor}`}>
                              <IconComponent className="w-4 h-4 text-white" />
                    </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-medium text-sm sm:text-base line-clamp-1">
                                {item.description || item.reason || 'Credit transaction'}
                              </p>
                              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                                <CalendarIcon className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{item.createdAt ? formatDateTime(item.createdAt) : 'N/A'}</span>
                                {showRefundText && (
                                  <span className="text-green-400 whitespace-nowrap">Refund</span>
                                )}
                      </div>
                    </div>
                  </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 ml-11 sm:ml-0">
                            <div className="text-left sm:text-right">
                              <div className={`font-semibold text-sm sm:text-base flex items-center sm:justify-end ${amountColor}`}>
                                {isPositive ? '+' : '-'}{amount}
                  </div>
                              <div className="text-[10px] sm:text-xs text-gray-400">credits</div>
                </div>
                            <span className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 ${badgeClass}`}>
                              {badgeText}
                            </span>
              </div>
                </div>
                      )
                    })}
                  </div>
                  
                  {/* Pagination for Credit History */}
                  {creditsHistoryTotal > creditsHistoryPageSize && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        total={Math.ceil(creditsHistoryTotal / creditsHistoryPageSize)}
                        page={creditsHistoryPage}
                        onChange={(page) => {
                          setCreditsHistoryPage(page)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        classNames={{
                          base: 'gap-2',
                          item: 'bg-[#1a1a24] border border-white/10 text-white',
                          cursor: 'bg-pink-500 text-white',
                        }}
                      />
              </div>
                  )}
                </>
              )}
            </div>
          )}
          {activeMainTab === 'Security' && (
            <div className="bg-[#1a1a24] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <LockClosedIcon className="h-5 w-5 text-pink-400" />
                  Password
                </h2>
              </div>

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()

                  if (!session) {
                    showSnackbar('Please sign in to update password', 'warning')
                    return
                  }

                  if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
                    showSnackbar('Please fill in all fields', 'warning')
                    return
                  }

                  if (newPassword.length < 6) {
                    showSnackbar('New password must be at least 6 characters', 'warning')
                    return
                  }

                  if (newPassword !== confirmPassword) {
                    showSnackbar('New password and confirm password do not match', 'warning')
                    return
                  }

                  setIsUpdatingPassword(true)
                  try {
                    await updateUserPassword(currentPassword, newPassword)
                    showSnackbar('Password updated successfully', 'success')
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setIsCurrentPasswordVisible(false)
                    setIsNewPasswordVisible(false)
                    setIsConfirmPasswordVisible(false)
                  } catch (error: any) {
                    console.error('Failed to update password:', error)
                    showSnackbar(error?.message || 'Failed to update password', 'error')
                  } finally {
                    setIsUpdatingPassword(false)
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Current password</label>
                  <Input
                    type={isCurrentPasswordVisible ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onValueChange={setCurrentPassword}
                    classNames={{
                      base: 'w-full',
                      input: 'text-white',
                      inputWrapper: 'bg-[#0c0a17] border-white/20 pr-10',
                    }}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                        className="focus:outline-none"
                      >
                        {isCurrentPasswordVisible ? (
                          <EyeSlashIcon className="h-5 w-5 text-white/60" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-white/60" />
                        )}
                      </button>
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">New password</label>
                  <Input
                    type={isNewPasswordVisible ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onValueChange={setNewPassword}
                    classNames={{
                      base: 'w-full',
                      input: 'text-white',
                      inputWrapper: 'bg-[#0c0a17] border-white/20 pr-10',
                    }}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                        className="focus:outline-none"
                      >
                        {isNewPasswordVisible ? (
                          <EyeSlashIcon className="h-5 w-5 text-white/60" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-white/60" />
                        )}
                      </button>
                    }
                  />
                  <p className="mt-1 text-xs text-white/50">At least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Confirm password</label>
                  <Input
                    type={isConfirmPasswordVisible ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onValueChange={setConfirmPassword}
                    classNames={{
                      base: 'w-full',
                      input: 'text-white',
                      inputWrapper: 'bg-[#0c0a17] border-white/20 pr-10',
                    }}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                        className="focus:outline-none"
                      >
                        {isConfirmPasswordVisible ? (
                          <EyeSlashIcon className="h-5 w-5 text-white/60" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-white/60" />
                        )}
                      </button>
                    }
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    isDisabled={isUpdatingPassword}
                    className="bg-pink-500 text-white font-semibold"
                  >
                    <LockClosedIcon className="h-4 w-4 mr-2" />
                    Update password
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <Modal
        isOpen={isImagePreviewOpen && previewImages.length > 0}
        onOpenChange={setIsImagePreviewOpen}
        hideCloseButton
        className="bg-black/95 border-0 max-w-full sm:max-w-4xl md:max-w-5xl h-screen sm:h-[90vh] p-0"
        backdrop="opaque"
        placement="center"
      >
        <ModalContent className="h-full">
          {(onClose) => {
            const current = previewImages[previewIndex]
            if (!current) return null
            let dateLabel = ''
            try {
              dateLabel = current.createdAt ? formatDate(current.createdAt as any) : ''
            } catch (e) {
              dateLabel = ''
            }
            if (!dateLabel || dateLabel === 'Invalid Date') {
              dateLabel = '-'
            }

            return (
              <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-2 sm:p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-sm sm:text-base text-white font-medium truncate">
                      {current.name || current.prompt || 'Image'}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 hidden sm:block">{dateLabel}</p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Download */}
                    <button
                      disabled={downloadingIds.has(current.id)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-9 rounded-md px-3 bg-white/20 hover:bg-white/30 text-white border-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async () => {
                        try {
                          setDownloadingIds((prev) => new Set(prev).add(current.id))
                          showDownloadStatus('preparing')
                          await downloadImageGeneration(current.id, `${current.name || 'image'}.png`)
                          showDownloadStatus('success')
                        } catch (error) {
                          console.error('Failed to download image generation:', error)
                          showDownloadStatus('error')
                        } finally {
                          setDownloadingIds((prev) => {
                            const next = new Set(prev)
                            next.delete(current.id)
                            return next
                          })
                        }
                      }}
                    >
                      {downloadingIds.has(current.id) ? (
                        <svg
                          className="animate-spin w-4 h-4 sm:w-5 sm:h-5"
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
                      ) : (
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
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        aria-hidden="true"
                      >
                        <path d="M12 15V3"></path>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <path d="m7 10 5 5 5-5"></path>
                      </svg>
                      )}
                    </button>
                    {/* Close */}
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-9 rounded-md px-3 bg-white/20 hover:bg-white/30 text-white border-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                      onClick={onClose}
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
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        aria-hidden="true"
                      >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Image */}
                <ModalBody className="flex-1 flex items-center justify-center p-2 sm:p-6 md:p-8 pt-16 sm:pt-24 md:pt-28 pb-20 sm:pb-28 md:pb-32">
                  <img
                    alt={current.name || current.prompt || 'Image'}
                    className="max-w-[95%] sm:max-w-[85%] md:max-w-[75%] max-h-[70vh] sm:max-h-[65vh] md:max-h-[60vh] w-auto h-auto object-contain"
                    src={current.generatedUrl}
                  />
                </ModalBody>

                {/* Footer controls */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 flex items-center gap-1 sm:gap-2 z-10">
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap font-medium h-9 rounded-md bg-black/50 hover:bg-black/70 text-white border-0 disabled:opacity-30 min-h-[44px] sm:min-h-0 text-xs sm:text-sm px-2 sm:px-3"
                    disabled={previewIndex === 0}
                    onClick={handlePrevImage}
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
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1"
                      aria-hidden="true"
                    >
                      <path d="m15 18-6-6 6-6"></path>
                    </svg>
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  <div className="px-2 sm:px-3 py-1 bg-black/70 rounded text-white text-xs sm:text-sm whitespace-nowrap">
                    {previewIndex + 1} / {previewImages.length}
                  </div>

                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap font-medium h-9 rounded-md bg-black/50 hover:bg-black/70 text-white border-0 disabled:opacity-30 min-h-[44px] sm:min-h-0 text-xs sm:text-sm px-2 sm:px-3"
                    disabled={previewIndex >= previewImages.length - 1}
                    onClick={handleNextImage}
                  >
                    <span className="hidden sm:inline">Next</span>
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
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:ml-1"
                      aria-hidden="true"
                    >
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )
          }}
        </ModalContent>
      </Modal>

      {/* Video Preview Modal */}
      {isVideoPreviewOpen && previewVideos.length > 0 && (
        <>
          {/* Backdrop */}
          <div
            data-state="open"
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            style={{ pointerEvents: 'auto' }}
            data-aria-hidden="true"
            aria-hidden="true"
            onClick={closeVideoPreview}
          />

          {/* Video Preview Dialog */}
          <div
            role="dialog"
            aria-describedby="video-preview-desc"
            aria-labelledby="video-preview-title"
            data-state="open"
            className="fixed z-50 grid max-w-lg border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] w-screen h-[100dvh] left-0 top-0 translate-x-0 translate-y-0 rounded-none sm:w-full sm:h-[90vh] sm:left-1/2 sm:top-1/2 sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:max-w-6xl p-0 gap-0 bg-[#1a1a24] border-white/10"
            tabIndex={-1}
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-col space-y-1.5 text-center sm:text-left px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 id="video-preview-title" className="tracking-tight text-xl font-bold text-white">
                  Video Details
                </h2>
                <button
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-white/80 h-9 rounded-md px-3 hover:bg-white/5"
                  onClick={closeVideoPreview}
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
                    className="lucide lucide-x w-5 h-5"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Video Player Section */}
              <div className="relative bg-black flex items-center justify-center h-[50dvh] lg:flex-1">
                {(previewVideos[previewVideoIndex]?.videoUrl || (previewVideos[previewVideoIndex] as any)?.generatedUrl) && (
                  <video
                    ref={previewVideoRef}
                    key={previewVideos[previewVideoIndex].id}
                    src={previewVideos[previewVideoIndex].videoUrl || (previewVideos[previewVideoIndex] as any)?.generatedUrl || undefined}
                    className="max-w-full max-h-full object-contain"
                    controls
                    autoPlay
                    loop
                    preload="auto"
                    muted
                    playsInline
                  />
                )}
                {!(previewVideos[previewVideoIndex]?.videoUrl || (previewVideos[previewVideoIndex] as any)?.generatedUrl) && previewVideos[previewVideoIndex]?.sourceImageUrl && (
                  <img
                    src={previewVideos[previewVideoIndex].sourceImageUrl}
                    alt="Video source"
                    className="max-w-full max-h-full object-contain"
                  />
                )}

                {/* Navigation Buttons */}
                {previewVideos.length > 1 && (
                  <>
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-white/80 absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 p-0 disabled:opacity-30"
                      disabled={previewVideoIndex === 0}
                      onClick={handlePrevVideo}
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
                        className="lucide lucide-chevron-left w-6 h-6"
                        aria-hidden="true"
                      >
                        <path d="m15 18-6-6 6-6"></path>
                      </svg>
                    </button>
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-white/80 absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 p-0 disabled:opacity-30"
                      disabled={previewVideoIndex >= previewVideos.length - 1}
                      onClick={handleNextVideo}
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
                        className="lucide lucide-chevron-right w-6 h-6"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6"></path>
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {previewVideoIndex + 1} / {previewVideos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Information Panel */}
              <div className="w-full lg:w-96 bg-[#0c0a17] lg:border-l border-white/10 flex flex-col overflow-y-auto flex-1">
                <div className="p-6 space-y-4 flex-1" id="video-preview-desc">
                  <h3 className="font-semibold text-white mb-4">Information</h3>

                  {/* Prompt */}
                  <div className="flex items-start gap-3">
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
                      className="lucide lucide-message-square w-5 h-5 text-white/60 mt-0.5"
                      aria-hidden="true"
                    >
                      <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-white/60">Prompt</p>
                      <p className="text-white text-sm leading-relaxed">
                        {previewVideos[previewVideoIndex]?.prompt || previewVideos[previewVideoIndex]?.name || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Created */}
                  <div className="flex items-start gap-3">
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
                      className="lucide lucide-calendar w-5 h-5 text-white/60 mt-0.5"
                      aria-hidden="true"
                    >
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                    </svg>
                    <div>
                      <p className="text-sm text-white/60">Created</p>
                      <p className="text-white">
                        {previewVideos[previewVideoIndex]?.createdAt
                          ? formatDateTime(previewVideos[previewVideoIndex].createdAt)
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Resolution */}
                  <div className="flex items-start gap-3">
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
                      className="lucide lucide-video w-5 h-5 text-white/60 mt-0.5"
                      aria-hidden="true"
                    >
                      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                      <rect x="2" y="6" width="14" height="12" rx="2"></rect>
                    </svg>
                    <div>
                      <p className="text-sm text-white/60">Resolution</p>
                      <p className="text-white">{(previewVideos[previewVideoIndex] as any)?.resolution || 'P480'}</p>
                    </div>
                  </div>

                  {/* Credits Used */}
                  <div className="flex items-start gap-3">
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
                      className="lucide lucide-credit-card w-5 h-5 text-white/60 mt-0.5"
                      aria-hidden="true"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                    <div>
                      <p className="text-sm text-white/60">Credits Used</p>
                      <p className="text-[#ec4899] font-medium">{(previewVideos[previewVideoIndex] as any)?.credit || (previewVideos[previewVideoIndex] as any)?.creditCost || previewVideos[previewVideoIndex]?.creditCost || '-'}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 flex items-center justify-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          previewVideos[previewVideoIndex]?.status === 'completed' ||
                          previewVideos[previewVideoIndex]?.status === GenerationStatus.COMPLETED
                            ? 'bg-green-400'
                            : 'bg-red-400'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Status</p>
                      <p className="text-white capitalize">
                        {getStatusDisplayName(previewVideos[previewVideoIndex]?.status || GenerationStatus.PENDING)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] border-t border-white/10 space-y-3">
                  <button
                    disabled={previewVideos[previewVideoIndex] && downloadingIds.has(previewVideos[previewVideoIndex].id)}
                    className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={async (e) => {
                      e.stopPropagation()
                      const current = previewVideos[previewVideoIndex]
                      if (!current) return
                      try {
                        setDownloadingIds((prev) => new Set(prev).add(current.id))
                        showDownloadStatus('preparing')
                        await downloadImageGeneration(
                          current.id,
                          `${current.prompt || (current as any).name || 'video'}.mp4`,
                        )
                        showDownloadStatus('success')
                      } catch (error) {
                        console.error('Failed to download video generation:', error)
                        showDownloadStatus('error')
                        showSnackbar('Failed to download video', 'error')
                      } finally {
                        setDownloadingIds((prev) => {
                          const next = new Set(prev)
                          next.delete(current.id)
                          return next
                        })
                      }
                    }}
                  >
                    {previewVideos[previewVideoIndex] && downloadingIds.has(previewVideos[previewVideoIndex].id) ? (
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
                  </button>
                  <button
                    className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-500 hover:bg-red-600 text-white h-10 px-4 py-2 w-full"
                    onClick={async (e) => {
                      e.stopPropagation()
                      const current = previewVideos[previewVideoIndex]
                      if (current) {
                        try {
                          const res = await deleteGeneration(current.id)
                          if (res.code == 'SUCCESS') {
                            setVideoGenerations((prev) => prev.filter((item) => item.id !== current.id))
                            setVideoTotal((prev) => Math.max(0, prev - 1))
                            setPreviewVideos((prev) => prev.filter((item) => item.id !== current.id))
                            if (previewVideos.length === 1) {
                              closeVideoPreview()
                            } else if (previewVideoIndex >= previewVideos.length - 1) {
                              setPreviewVideoIndex((prev) => Math.max(0, prev - 1))
                            }
                            showSnackbar('Deleted successfully', 'success')
                          }
                        } catch (error: any) {
                          console.error('Failed to delete generation:', error)
                          showSnackbar(error?.message || 'Failed to delete', 'error')
                        }
                      }
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
                      className="lucide lucide-trash2 w-4 h-4 mr-2"
                      aria-hidden="true"
                    >
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      <path d="M3 6h18"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default function MyAiPage() {
  return (
    <FeeLoveLayout className="p-4 md:p-6">
      <MyAiPageContent />
    </FeeLoveLayout>
  )
}
