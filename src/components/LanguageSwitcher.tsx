"use client"
import { localeNames, locales, usePathname, type Locale } from "@/i18n.config"
import { useRouter } from "@/components/next-intl-progress-bar"
import { Select, SelectItem, Selection } from "@heroui/react"
import TranslateIcon from '@/components/TranslateIcon'
import { isMobile } from '@/util/browser'
import { useState } from 'react'

export default function LanguageSwitcher({ locale, scrolled }: { locale: Locale, scrolled?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [selected, setSelected] = useState<Locale>(locale)

  const handleSelectionChange = (keys: Selection) => {
    const key = Array.from(keys)[0] as Locale
    if (!key) return
    setSelected(key)
    router.replace(pathname + window.location.search, { locale: key })
  }

  return (
    <div className="raised-select flex flex-row items-center">
      <TranslateIcon className={`hidden sm:block ${'text-foreground'}`} />
      <Select
        size="sm"
        selectedKeys={new Set([selected])}
        onSelectionChange={handleSelectionChange}
        className="min-w-[100px] max-w-[110px]"
        classNames={{
          trigger: "bg-transparent border-none shadow-none data-[hover=true]:bg-transparent",
          value: `text-sm ${scrolled ? 'text-foreground' : '!text-[#375375]'}`,
          selectorIcon: `${'text-foreground'}`,
          popoverContent: "min-w-[180px] w-[180px]"
        }}
        aria-label="locale-switcher"
        renderValue={() => (
          <span className={`mobile-appbar-ft-11 md:text-[14px] text-[12px] ${'text-foreground'}`}>{localeNames[selected]}</span>
        )}
      >
        {locales.map((loc) => (
          <SelectItem 
            key={loc} 
            value={loc}
            className="w-full text-foreground hover:bg-default-100"
          >
            {localeNames[loc]}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}
