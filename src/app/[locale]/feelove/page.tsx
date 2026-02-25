'use client'

import FeeLoveLayout from '@/components/layout/FeeLoveLayout'
import { Button, Card, CardBody } from '@heroui/react'
import { HeartIcon, PlayCircleIcon, PlusIcon } from '@heroicons/react/24/solid'
import { usePathname, useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, useRef, memo, useMemo } from 'react'
import { getCharacters } from '@/api/client/feeLoveApi'
import { useSession } from 'next-auth/react'
import { useGTM } from '@/context/GTMContext'
import Image from 'next/image'

type ShowcaseCard = {
  id: string
  title: string
  likes: string
  cover?: string
  leftImage?: string
  rightImage?: string
  rightVideo?: string
  layoutType?: 'image-image' | 'image-video'
  isVideo?: boolean
  hasImageActions?: boolean
  isNsfw?: boolean
}

const generateCard: ShowcaseCard = {
    id: 'generate',
    title: 'Generate Video',
    likes: '',
}

const formatLikes = (n: number | undefined): string => {
  if (!n || n <= 0) return ''
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `${n}`
}

const PAGE_SIZE = 20

// 检查环境变量 NEXT_PUBLIC_CLOAK
const isCloakEnabled = process.env.NEXT_PUBLIC_CLOAK === 'true'

// 记录“曾经进入过视口”的卡片，避免在 tab 切换/重挂载时 isInView 重新变回 false 造成闪烁
const everInViewCardIds = new Set<string>()

// 注意：年龄验证弹框已移至全局组件 AgeVerification，在所有页面都会显示

// 骨架屏组件
const CardSkeleton = () => (
  <Card className="h-[360px] relative overflow-hidden border border-purple-500/20 bg-[#0c0a17] shadow-[0_18px_60px_-40px_rgba(0,0,0,0.8)] animate-pulse">
    <CardBody className="p-0 h-[400px] sm:h-[360px]">
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#0c0a17]">
        <div className="flex h-full">
          {/* 左侧图片占位 */}
          <div className="relative w-1/2 h-full overflow-hidden">
            <div className="absolute inset-0 bg-gray-800/60" />
            <div className="absolute inset-0" />
          </div>
          {/* 右侧图片/视频占位 */}
          <div className="relative w-1/2 h-full overflow-hidden border-l border-white/10">
            <div className="absolute inset-0 bg-gray-800/60" />
            <div className="absolute inset-0" />
          </div>
        </div>
        {/* 底部文本占位 */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-700/40 rounded w-3/4" />
            <div className="h-3 bg-gray-700/30 rounded w-1/3" />
          </div>
          <div className="h-6 bg-gray-700/40 rounded-full w-12" />
        </div>
      </div>
    </CardBody>
  </Card>
)

// 骨架屏网格
const SkeletonGrid = ({ count = 12 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={`skeleton-${index}`} />
    ))}
  </>
)

export default function FeeLovePage() {
  const { sendEvent, reportEvent } = useGTM() // GTM事件
  useEffect(()=> {
    sendEvent('view_item',{
      custom_data: {
        currency: 'USD',
        value: 1,                     // 事件价值
      }
    })
  },[])

  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
//i sCloakEnabled ? [] : [generateCard]
  const [showcaseCards, setShowcaseCards] = useState<ShowcaseCard[]>([])
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)

  const fetchCharacters = useCallback(async (page: number, append: boolean = false) => {
    if (isLoadingRef.current) return

    isLoadingRef.current = true
    setIsLoading(true)
    try {
      const tagsParam = searchParams.get('tags') || undefined
      const response = await getCharacters(tagsParam, page, PAGE_SIZE)
      
      setHasFetchedOnce(true)
      
      // 处理不同的返回结构：可能是 { items: [], total: number } 或直接是数组
      let items: any[] = []
      let total: number | undefined = undefined
      
      if (Array.isArray(response)) {
        // 如果直接返回数组
        items = response
        console.log('getCharacters returned array directly, length:', items.length)
      } else if (response && Array.isArray(response.items)) {
        // 如果是 { items: [], total: number } 结构
        items = response.items
        total = response.total
        console.log('getCharacters returned { items, total }, items length:', items.length, 'total:', total)
      } else if (response && Array.isArray(response.data)) {
        // 如果是 { data: [] } 结构
        items = response.data
        total = response.total
        console.log('getCharacters returned { data, total }, data length:', items.length, 'total:', total)
      } else {
        console.warn('Unexpected response structure from getCharacters:', response)
        console.log('Response type:', typeof response, 'Is array:', Array.isArray(response))
      }
      
      if (items && items.length > 0) {
        console.log('Processing items, count:', items.length)
        const mappedCards: ShowcaseCard[] = items.map((item: any, index: number) => {
          const imageMedia = item.media?.find((m: any) => m.kind === 'IMAGE')
          const videoMedia = item.media?.find((m: any) => m.kind === 'VIDEO')
          // 使用 hasImageActions 判断：true=图片模板，false=视频模板
          const isVideo = item.hasImageActions === false

          const card = {
            id: item.id,
            title: item.name,
            likes: formatLikes(item.likes),
            leftImage: item.coverUrl,
            // 后端数据可能缺 media，避免单条数据异常导致整页渲染失败
            rightVideo: isVideo ? videoMedia?.url : undefined,
            rightImage: !isVideo ? imageMedia?.url : undefined,
            layoutType: isVideo ? 'image-video' : 'image-image',
            isVideo: isVideo,
            hasImageActions: item.hasImageActions,
            isNsfw: item.isNsfw || false,
          }
          
          // 调试日志：前3个卡片的数据
          if (index < 3) {
            console.log(`Card ${index}:`, {
              id: card.id,
              title: card.title,
              leftImage: card.leftImage,
              rightImage: card.rightImage,
              rightVideo: card.rightVideo,
              hasImageActions: card.hasImageActions,
              isVideo: card.isVideo,
            })
          }
          
          return card
        })
        
        console.log('Mapped cards count:', mappedCards.length)
        
        if (append) {
          setShowcaseCards(prev => {
            // 过滤掉 generateCard，然后添加新数据，最后再把 generateCard 加回开头（如果未启用 cloak）
            const existingCards = prev.filter(card => card.id !== 'generate')
            return isCloakEnabled 
              ? [...existingCards, ...mappedCards]
              : [generateCard, ...existingCards, ...mappedCards]
          })
        } else {
          setShowcaseCards(isCloakEnabled ? mappedCards : [generateCard, ...mappedCards])
        }

        // 判断是否还有更多数据
        const hasMoreData = mappedCards.length === PAGE_SIZE && (total === undefined || (page * PAGE_SIZE) < total)
        setHasMore(hasMoreData)
      } else {
        if (!append) {
          setShowcaseCards(isCloakEnabled ? [] : [generateCard])
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error)
      // 即使请求失败，也标记为已获取过，避免重复显示骨架屏
      setHasFetchedOnce(true)
      if (!append) {
        setShowcaseCards(isCloakEnabled ? [] : [generateCard])
      }
      setHasMore(false)
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [searchParams])

  // 初始化加载和 tags 变化时重置
  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
    fetchCharacters(1, false)
  }, [fetchCharacters])


  // 滚动加载更多
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current && !isLoading) {
          setCurrentPage(prev => {
            const nextPage = prev + 1
            fetchCharacters(nextPage, true)
            return nextPage
          })
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 600px 0px',
      }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, fetchCharacters, isLoading])

  const tagsParam = searchParams.get('tags') || ''
  const isNoResults = hasFetchedOnce && showcaseCards.length === (isCloakEnabled ? 0 : 1) && !!tagsParam

  const handleClearFilters = () => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete('tags')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // 使用 useCallback 稳定化 onPress 函数，避免 memo 失效
  const handleCardPress = useCallback((item: ShowcaseCard) => {
    if (item.id === 'generate') {
      sendEvent('start_trial', {
        custom_data: {
          currency: 'USD',
          value: 1
        }
      })
      router.push(`/${params?.locale ?? ''}/generate`)
      return
    }

    // 使用 hasImageActions 判断：true=图片模板跳转生图页面，false=视频模板跳转生视频页面
    if (item.hasImageActions === true) {
      router.push(`/${params?.locale ?? ''}/image-generator/${item.id}`)
      return
    }

    // hasImageActions === false 或 undefined，跳转生视频页面
    // 将角色信息保存到 localStorage，供 generate 页面使用
    if (item.id && item.leftImage) {
      try {
        localStorage.setItem('SELECTED_CHARACTER_FOR_GENERATE', JSON.stringify({
          id: item.id,
          name: item.title,
          cover: item.leftImage,
        }))
      } catch (error) {
        console.error('Failed to save character to localStorage:', error)
      }
    }
    router.push(`/${params?.locale ?? ''}/generate`)
  }, [sendEvent, router, params?.locale])

  // 使用 useMemo 稳定化每个卡片的 priority 值，避免每次渲染重新计算
  const cardPriorities = useMemo(() => {
    const priorities: Record<string, boolean> = {}
    showcaseCards.forEach((item, index) => {
      const isGenerate = item.id === 'generate'
      priorities[item.id] = !isGenerate && index < (isCloakEnabled ? 4 : 5)
    })
    return priorities
  }, [showcaseCards])

  // 优化的卡片组件，使用 memo 和 Next.js Image
  const ShowcaseCard = memo(({ 
    item, 
    isGenerate, 
    isVideo, 
    priority,
    onPress 
  }: { 
    item: ShowcaseCard
    isGenerate: boolean
    isVideo: boolean
    priority: boolean
    onPress: (item: ShowcaseCard) => void
  }) => {
    const [leftImageError, setLeftImageError] = useState(false)
    const [rightImageError, setRightImageError] = useState(false)
    // 使用 useRef 保存 priority 的初始值，避免后续 prop 变化导致重新渲染
    const priorityRef = useRef<boolean | undefined>(undefined)
    if (priorityRef.current === undefined) {
      priorityRef.current = priority
    }
    const stablePriority = priorityRef.current
    // 优先级高的立即加载，否则初始为 false，等待 Intersection Observer
    const [isInView, setIsInView] = useState(() => stablePriority || everInViewCardIds.has(item.id))
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (isInView) {
        everInViewCardIds.add(item.id)
      }
    }, [isInView, item.id])

    // 判断是否为外部图片URL（需要 unoptimized）
    const isExternalImage = (url?: string) => {
      if (!url) return false
      try {
        const urlObj = new URL(url)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        return !siteUrl || !urlObj.hostname.includes(new URL(siteUrl).hostname)
      } catch {
        return true
      }
    }

    // 使用 Intersection Observer 实现懒加载
    useEffect(() => {
      // 如果已经有优先级或者已经在视图中，不需要观察
      if (stablePriority || isInView || !cardRef.current) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              everInViewCardIds.add(item.id)
              setIsInView(true)
              observer.disconnect()
            }
          })
        },
        {
          rootMargin: '200px', // 提前200px开始加载，确保内容能及时显示
          threshold: 0.01,
        }
      )

      observer.observe(cardRef.current)

      return () => {
        observer.disconnect()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInView])
    
    // 如果初始优先级高，确保立即设置为可见（只在组件挂载时执行一次）
    useEffect(() => {
      if (stablePriority && !isInView) {
        everInViewCardIds.add(item.id)
        setIsInView(true)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

            return (
              <div ref={cardRef} className="w-full">
              <Card
                className="h-[360px] w-full cursor-pointer group relative overflow-hidden border border-white/10 bg-[#0c0a17] shadow-[0_18px_60px_-40px_rgba(0,0,0,0.8)] transition duration-400 hover:border-pink-400/60 hover:shadow-[0_22px_80px_-42px_rgba(255,45,133,0.55)]"
                isPressable={true}
        onPress={() => onPress(item)}
              >
                <CardBody className="p-0 h-full">
                  {isGenerate ? (
                    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1538] via-[#1c102c] to-[#0d0a18]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,45,133,0.25),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(116,94,242,0.25),transparent_38%)]" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-2 ring-pink-400/60 backdrop-blur-md">
                          <PlusIcon className="h-10 w-10" />
                        </div>
                        <div className="text-center leading-tight">
                          <p className="text-xl font-semibold">Generate Video</p>
                          <p className="text-sm text-white/70">Start creating your AI video</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#0c0a17]">
                      <div className="flex h-full">
                        <div className="relative w-1/2 h-full overflow-hidden">
                  {item.leftImage && !leftImageError && isInView ? (
                            <>
                      <Image
                                src={item.leftImage}
                                alt={item.title || ''}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition duration-700"
                        priority={stablePriority}
                        loading={stablePriority ? undefined : 'lazy'}
                        onError={() => setLeftImageError(true)}
                        unoptimized={isExternalImage(item.leftImage)}
                              />
                              <div className="absolute inset-0" />
                            </>
                  ) : (
                    <div className="absolute inset-0 bg-gray-800" />
                          )}
                        </div>
                        
                        <div className="relative w-1/2 h-full overflow-hidden border-l border-white/10">
                          {item.layoutType === 'image-video' && item.rightVideo && isInView ? (
                            <video
                              src={item.rightVideo}
                              className="absolute inset-0 w-full h-full object-cover"
                              autoPlay
                              loop
                              playsInline
                              muted
                              loading="lazy"
                              preload={stablePriority ? 'auto' : 'none'}
                            />
                  ) : item.rightImage && !rightImageError && isInView ? (
                            <>
                      <Image
                                src={item.rightImage}
                                alt={item.title || ''}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                        priority={stablePriority}
                        loading={stablePriority ? undefined : 'lazy'}
                        onError={() => setRightImageError(true)}
                        unoptimized={isExternalImage(item.rightImage)}
                              />
                              <div className="absolute inset-0" />
                            </>
                  ) : (
                    <div className="absolute inset-0 bg-gray-800" />
                  )}
                        </div>
                      </div>

                      {item.isVideo && item.layoutType === 'image-video' && (
                        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white shadow-lg shadow-black/40 backdrop-blur-md transition duration-300 group-hover:bg-black/75">
                          <PlayCircleIcon className="h-5 w-5" />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white drop-shadow-lg">{item.title}</p>
                  {item.isNsfw && (
                    <span className="text-red-400 font-semibold tracking-wide text-xs">NSFW</span>
                  )}
                        </div>
                        {item.likes && (
                          <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-pink-200 backdrop-blur-md transition duration-300 group-hover:bg-black/60">
                            <HeartIcon className="h-4 w-4 text-[#ff2d85]" />
                            <span className="text-xs font-semibold">{item.likes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
              </div>
            )
  })

  ShowcaseCard.displayName = 'ShowcaseCard'

  return (
    <FeeLoveLayout>
      <div className="p-4 md:p-6">
        <div className="relative space-y-6">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
          <div className="absolute -left-6 top-10 h-56 w-56 rounded-full bg-pink-600/25 blur-[110px]" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-purple-700/25 blur-[130px]" />
          <div className="absolute bottom-6 left-1/3 h-56 w-56 rounded-full bg-indigo-500/15 blur-[110px]" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {/* 初始加载时显示骨架屏 - 一开始就显示，固定24个 */}
          {!hasFetchedOnce ? (
            <SkeletonGrid count={24} />
          ) : (
            /* 显示实际内容 */
            showcaseCards.map((item) => {
            const isGenerate = item.id === 'generate'
            const isVideo = !!item.isVideo
            // 从缓存的 priorities 中获取，避免每次渲染重新计算
            const priority = cardPriorities[item.id] ?? false
            return (
              <ShowcaseCard
                key={item.id}
                item={item}
                isGenerate={isGenerate}
                isVideo={isVideo}
                priority={priority}
                onPress={handleCardPress}
              />
            )
            })
          )}

          {/* 加载更多时显示额外的骨架屏 */}
          {isLoading && hasFetchedOnce && showcaseCards.length > 0 && (
            <SkeletonGrid count={4} />
          )}

          {isNoResults && (
            <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-3 text-center sm:col-span-1 lg:col-span-2 xl:col-span-3 2xl:col-span-3">
              <div className="text-lg font-semibold text-white/90">No results</div>
              <div className="text-sm text-white/55">Try removing some tags or clear filters.</div>
              <Button
                size="sm"
                variant="bordered"
                onPress={handleClearFilters}
                className="mt-2 h-9 rounded-full border border-pink-500/35 bg-transparent px-6 text-sm font-medium text-pink-200 hover:border-pink-500/70 hover:bg-pink-500/10"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* 滚动加载观察元素和加载提示 */}
          {!isNoResults && (
            <div ref={observerTarget} className="col-span-full flex justify-center">
              {/* {isLoading && (
                <div className="text-white/70 text-sm">Loading more...</div>
              )} */}
              {/* {!hasMore && showcaseCards.length > 1 && (
                <div className="text-white/50 text-sm">No more results</div>
              )} */}
            </div>
          )}
        </div>
        </div>
      </div>
    </FeeLoveLayout>
  )
}
