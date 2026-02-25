"use client"

import { localeNames, locales, usePathname, type Locale } from "@/i18n.config"
import { useRouter } from "@/components/next-intl-progress-bar"
import { Select, SelectItem, Selection } from "@heroui/react"
import { GlobeAltIcon } from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"

export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const router = useRouter()
  const [selected, setSelected] = useState<Locale>(locale)
  const [isDark, setIsDark] = useState(false)

  // 检测当前主题
  useEffect(() => {
    const checkTheme = () => {
      const body = document.body
      setIsDark(body.classList.contains('dark'))
    }
    
    checkTheme()
    
    // 监听主题变化
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  const handleSelectionChange = (keys: Selection) => {
    const key = Array.from(keys)[0] as Locale
    if (!key) return
    setSelected(key)
    router.replace(pathname + window.location.search, { locale: key })
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <Select
        size="sm"
        selectedKeys={new Set([selected])}
        onSelectionChange={handleSelectionChange}
        aria-label="locale-switcher"
        classNames={{
          trigger: `min-w-20 ${isDark ? 'text-foreground' : 'text-[#375375]'}`,
          value: `${isDark ? 'text-foreground' : 'text-[#375375]'}`,
        }}
        renderValue={() => (
          <div className="flex items-center">
            <GlobeAltIcon className={`w-4 h-4 mr-1 hidden md:inline ${isDark ? 'text-foreground' : 'text-[#375375]'}`} />
            <span style={{ fontSize: '14px' }} className={isDark ? 'text-foreground' : 'text-[#375375]'}>
              {localeNames[selected]}
            </span>
          </div>
        )}
      >
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeNames[loc]}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}
