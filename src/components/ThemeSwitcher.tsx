'use client'
import { useState, useEffect } from 'react'
import { Button } from '@heroui/react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { getThemeClass, themeClasses } from '../../hero'

export default function ThemeSwitcher({ scrolled }: { scrolled?: boolean }) {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // 初始化主题
  useEffect(() => {
    setMounted(true)
    // 从 localStorage 获取保存的主题，如果没有则使用默认主题
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initialTheme = savedTheme || 'light'
    setCurrentTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  // 应用主题到 body
  const applyTheme = (theme: 'light' | 'dark') => {
    const body = document.body
    // 移除所有主题类
    Object.values(themeClasses).forEach(themeClass => {
      body.classList.remove(themeClass)
    })
    // 添加当前主题类
    body.classList.add(getThemeClass(theme))
    // 保存到 localStorage
    localStorage.setItem('theme', theme)
  }

  // 切换主题
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    setCurrentTheme(newTheme)
    applyTheme(newTheme)
  }

  // 防止水合不匹配，在客户端渲染完成前不显示
  if (!mounted) {
    return (
      <Button
        isIconOnly
        variant="light"
        size="sm"
        className="min-w-8 w-8 h-8"
        isDisabled
      >
        <SunIcon className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      className={`min-w-8 w-8 h-8 ${'text-foreground'}`}
      onPress={toggleTheme}
      aria-label={`切换到${currentTheme === 'light' ? '深色' : '浅色'}主题`}
    >
      {currentTheme === 'light' ? (
        <MoonIcon className={`w-4 h-4 ${'text-foreground'}`} />
      ) : (
        <SunIcon className={`w-4 h-4 ${'text-foreground'}`} />
      )}
    </Button>
  )
}