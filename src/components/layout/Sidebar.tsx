'use client'

import { Button, Accordion, AccordionItem, Chip, cn } from '@heroui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import NextLink from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSidebar } from './FeeLoveLayout'
import { getTags } from '@/api/client/feeLoveApi'
import type { TagGroup } from '@/api/client/feeLoveApi.interface'
import { getLocalStorage } from '@/util/localStorage'

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const pathname = usePathname()
  const { data: session } = useSession()
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [guestSession, setGuestSession] = useState<any>(null)

  const getFullPath = (path: string) => {
    if (!path) {
      // 首页路径
      return locale === 'en' ? '/' : `/${locale}`
    }
    return locale === 'en' ? `/${path}` : `/${locale}/${path}`
  }

  const isActive = (path: string) => {
    const fullPath = getFullPath(path)
    // 对于首页，还需要检查是否是根路径
    if (!path) {
      return pathname === fullPath || pathname === '/' || (locale !== 'en' && pathname === `/${locale}`)
    }
    return pathname === fullPath
  }

  // 检查环境变量 NEXT_PUBLIC_CLOAK
  const isCloakEnabled = process.env.NEXT_PUBLIC_CLOAK === 'true'

  const navItems = [
    { key: 'explore', label: 'Explore', path: '' }, // 首页路径为空字符串
    // { key: 'image-generator', label: 'Generator Image', path: 'image-generator/new' },
    ...(isCloakEnabled ? [] : [{ key: 'generate', label: 'Generate Video', path: 'generate' }]),
    { key: 'pricing', label: 'Pricing', path: 'feelove-pricing' },
    { key: 'myai', label: 'My AI', path: 'my-ai' },
  ]

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

  const handleNavClick = (item: (typeof navItems)[number], event: React.MouseEvent) => {
    // 未登录（包括访客）且点击 My AI，则跳转登录页
    // 但如果有访客 session，则允许访问
    if (item.key === 'myai') {
      // 检查登录用户
      if (session?.user) {
        return // 已登录，允许访问
      }
      
      // 检查访客 session（状态或 localStorage）
      const hasGuestSession = guestSession?.user || (() => {
        try {
          const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
          return storedSession?.user?.accessToken && storedSession.user.isGuest
        } catch {
          return false
        }
      })()
      
      if (!hasGuestSession) {
        event.preventDefault()
        router.push(getFullPath('login'))
      }
    }
  }

  const [tagGroups, setTagGroups] = useState<TagGroup[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(true)

  // selectedTags: { [groupKey]: Set<tagSlug> }
  const [selectedTags, setSelectedTags] = useState<Record<string, Set<string>>>({})
  const isUpdatingFromUrl = useRef(false)

  // 获取标签数据
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoadingTags(true)
        const data = await getTags()
        // 按 sortOrder 排序
        const sortedData = [...data].sort((a, b) => a.sortOrder - b.sortOrder)
        // 对每个 tagGroup 的 tags 也进行排序
        sortedData.forEach((group) => {
          group.tags.sort((a, b) => a.sortOrder - b.sortOrder)
        })
        setTagGroups(sortedData)
      } catch (error) {
        console.error('Failed to fetch tags:', error)
        // 如果获取失败，使用空数组
        setTagGroups([])
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchTags()
  }, [])

  // 将 TagGroup[] 转换为 filters 格式
  const filters = tagGroups.map((group) => ({
    key: group.key,
    title: group.name,
    items: group.tags.map((tag) => ({
      key: tag.slug,
      label: tag.name,
    })),
  }))

  // 默认展开的 keys（基于前两个 tagGroup 的 key）
  const defaultExpandedKeys = tagGroups.slice(0, 10).map((group) => group.key)

  const hasAnySelected = useMemo(() => {
    return Object.values(selectedTags).some((set) => set.size > 0)
  }, [selectedTags])

  const handleClearSelected = () => {
    setSelectedTags({})
  }

  // 格式化选中的 tags 为字符串：gender:female|personality:outgoing,romantic
  const formatTagsString = (tags: Record<string, Set<string>>): string => {
    const parts: string[] = []
    Object.entries(tags).forEach(([groupKey, tagSet]) => {
      if (tagSet.size > 0) {
        const tagArray = Array.from(tagSet).sort()
        parts.push(`${groupKey}:${tagArray.join(',')}`)
      }
    })
    return parts.join('|')
  }

  // 从字符串解析 tags：gender:female|personality:outgoing,romantic -> { gender: Set(['female']), personality: Set(['outgoing', 'romantic']) }
  const parseTagsString = (tagsString: string): Record<string, Set<string>> => {
    const result: Record<string, Set<string>> = {}
    if (!tagsString) return result

    const parts = tagsString.split('|')
    parts.forEach((part) => {
      const [groupKey, tagsStr] = part.split(':')
      if (groupKey && tagsStr) {
        const tags = tagsStr.split(',').filter(Boolean)
        if (tags.length > 0) {
          result[groupKey] = new Set(tags)
        }
      }
    })
    return result
  }

  // 检查是否在首页（feelove 页面，现在首页就是 feelove）
  const isFeeLovePage = 
    pathname === getFullPath('') || 
    pathname === '/' || 
    pathname === getFullPath('feelove') || 
    pathname === '/feelove' ||
    (locale !== 'en' && pathname === `/${locale}`)

  // URL -> selectedTags（支持刷新/后退前进）
  useEffect(() => {
    if (!isFeeLovePage || tagGroups.length === 0) return

    const tagsParam = searchParams.get('tags') || ''
    const currentTagsString = formatTagsString(selectedTags)

    if (tagsParam === currentTagsString) return

    isUpdatingFromUrl.current = true

    if (!tagsParam) {
      setSelectedTags({})
      queueMicrotask(() => {
        isUpdatingFromUrl.current = false
      })
      return
    }

    const parsedTags = parseTagsString(tagsParam)

    // 验证解析的 tags 是否在 tagGroups 中存在
    const validTags: Record<string, Set<string>> = {}
    Object.entries(parsedTags).forEach(([groupKey, tagSet]) => {
      const group = tagGroups.find((g) => g.key === groupKey)
      if (!group) return

      const validTagSet = new Set<string>()
      tagSet.forEach((tagSlug) => {
        if (group.tags.some((t) => t.slug === tagSlug)) {
          validTagSet.add(tagSlug)
        }
      })

      if (validTagSet.size > 0) {
        validTags[groupKey] = validTagSet
      }
    })

    setSelectedTags(validTags)
    queueMicrotask(() => {
      isUpdatingFromUrl.current = false
    })
  }, [isFeeLovePage, searchParams, tagGroups])

  // selectedTags -> URL（点击 tag 时会触发）
  useEffect(() => {
    if (!isFeeLovePage || tagGroups.length === 0) return
    if (isUpdatingFromUrl.current) return

    const tagsString = formatTagsString(selectedTags)
    const currentTags = searchParams.get('tags') || ''
    if (tagsString === currentTags) return

    const params = new URLSearchParams(searchParams.toString())
    if (tagsString) params.set('tags', tagsString)
    else params.delete('tags')

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
    router.replace(newUrl, { scroll: false })
  }, [selectedTags, isFeeLovePage, pathname, router, searchParams, tagGroups])

  const toggleTag = (group: TagGroup, tagSlug: string) => {
    setSelectedTags((prev) => {
      const next: Record<string, Set<string>> = { ...prev }
      const current = new Set(next[group.key] ?? [])

      // 强制规则：gender/style 单选；personality/theme/body 多选
      const multiSelectKeys = new Set(['personality', 'theme', 'body'])
      const singleSelectKeys = new Set(['gender', 'style'])
      const isSingleSelect = singleSelectKeys.has(group.key)
        ? true
        : multiSelectKeys.has(group.key)
          ? false
          : !!group.singleSelect

      if (isSingleSelect) {
        if (current.has(tagSlug) && current.size === 1) {
          current.clear()
        } else {
          current.clear()
          current.add(tagSlug)
        }
      } else {
        if (current.has(tagSlug)) current.delete(tagSlug)
        else current.add(tagSlug)
      }

      if (current.size === 0) {
        delete next[group.key]
      } else {
        next[group.key] = current
      }

      return next
    })
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-[#09090e] border-r border-pink-500/20 transition-all duration-300 flex flex-col z-30',
        'hidden md:flex', // Hide on mobile
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header with Logo and Collapse Button */}
      <div className={cn(
        'flex items-center',
        isCollapsed ? 'justify-center p-2' : 'justify-between p-4'
      )}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 via-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/30">
              <span className="text-white font-bold text-lg">❤</span>
            </div>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="min-w-6 w-6 h-6 text-gray-400 hover:text-white"
              onPress={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <img className="h-5" src="/logo.png" alt="" />
              <span className="font-bold text-xl text-white">{process.env.NEXT_PUBLIC_CLOAK === 'true' ? 'Ihoney' : 'FeeLove'}</span>
            </div>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="min-w-6 w-6 h-6 text-gray-400 hover:text-white"
              onPress={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col overflow-hidden py-4 px-3">
        {/* Fixed Navigation Items */}
        <div className="space-y-1 flex-shrink-0">
          {navItems.map((item) => (
            <NextLink
              key={item.key}
              href={getFullPath(item.path)}
              onClick={(e) => handleNavClick(item, e)}
              className={cn(
                'flex items-center rounded-lg transition-colors duration-200',
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                isActive(item.path)
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 font-semibold border border-pink-500/30'
                  : 'text-gray-300 hover:bg-[#1a1a24] hover:text-white'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="text-sm">
                {isCollapsed ? item.label.charAt(0) : item.label}
              </span>
            </NextLink>
          ))}
        </div>

        {/* Filters Section - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="mt-5 flex-1 flex flex-col min-h-0">
            {/* Fixed Header */}
            <div className="mb-3 flex items-center justify-between min-h-[26px] flex-shrink-0">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                EXPLORE
              </h3>
              {hasAnySelected && (
                <button
                  type="button"
                  onClick={handleClearSelected}
                  className="inline-flex items-center gap-1 cursor-pointer rounded-md border border-pink-500/30 px-3 py-1 text-xs font-semibold text-white/80 hover:border-pink-500/60 hover:bg-white/5 transition-colors"
                >
                  <span className="text-white/60">×</span>
                  Clear
                </button>
              )}
            </div>
            {/* Scrollable Accordion Content */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
              {isLoadingTags ? (
                <div className="text-sm text-gray-400 text-center py-4">Loading filters...</div>
              ) : filters.length > 0 ? (
                <Accordion
                  selectionMode="multiple"
                  defaultExpandedKeys={defaultExpandedKeys}
                  showDivider={false}
                  className="px-0"
                >
                  {filters.map((filter) => (
                    <AccordionItem
                      key={filter.key}
                      title={filter.title}
                      className="!border-none !border-0 !shadow-none [&:not(:last-child)]:!border-none mb-1"
                      classNames={{
                        title: 'text-sm font-medium text-white',
                        content: 'pt-1 pb-3',
                        base: '!border-none !border-0 !shadow-none !border-b-0 !border-t-0',
                        trigger: '!border-none !border-0 py-2',
                        indicator: '!border-none',
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {filter.items.map((item) => {
                          const group = tagGroups.find((g) => g.key === filter.key)
                          const isSelected = !!selectedTags[filter.key]?.has(item.key)
                          return (
                            <Chip
                              key={item.key}
                              size="sm"
                              variant="flat"
                              onClick={() => {
                                if (!group) return
                                toggleTag(group, item.key)
                              }}
                              className={cn(
                                'cursor-pointer border transition-colors',
                                isSelected
                                  ? 'bg-pink-500 text-white border-pink-500'
                                  : 'bg-transparent text-gray-300 border-pink-500/30 hover:border-pink-500/60'
                              )}
                            >
                              {item.label}
                            </Chip>
                          )
                        })}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-sm text-gray-400 text-center py-4">No filters available</div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-pink-500/20 p-4">
        {!isCollapsed && (
          <NextLink
            href="#"
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span>Discord</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </NextLink>
        )}
      </div>
    </aside>
  )
}
