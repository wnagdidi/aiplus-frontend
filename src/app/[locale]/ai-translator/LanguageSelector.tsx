'use client'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { languageList } from '@/app/[locale]/home/multilingual-translation/util'

interface LanguageSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (language: string) => void
  selectedLanguage?: string
  title: string
  showAutoDetection?: boolean
  onAutoDetect?: () => void
}

export default function LanguageSelector({
  isOpen,
  onClose,
  onSelect,
  selectedLanguage,
  title,
  showAutoDetection = false,
  onAutoDetect
}: LanguageSelectorProps) {
  const t = useTranslations('NewHomeMultilingualTranslation')
  const [searchText, setSearchText] = useState('')

  // Filter language list based on search text
  const filteredLanguageList = useMemo(() => {
    if (!searchText) return languageList
    
    return languageList.map(group => ({
      ...group,
      groupList: group.groupList.filter(lang => 
        lang.label.toLowerCase().includes(searchText.toLowerCase())
      )
    })).filter(group => group.groupList.length > 0)
  }, [searchText])

  const handleSelect = (language: string) => {
    onSelect(language)
    onClose()
    setSearchText('')
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg z-20 h-[400px] flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 md:pt-5 pb-4 md:pb-6">
        <h3 className="text-[#375375] text-lg md:text-xl font-medium">
          {title}
        </h3>
      </div>

      {/* Search Box */}
      <div className="px-4 md:px-6 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <div className="flex items-center border border-[#375375] rounded-full h-9 px-4 md:px-5">
              <img src="/translator/Search_icon@2x.png" alt="search" className="w-4 h-4" />
              <input 
                type="text" 
                placeholder={t('search_language')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 ml-2 outline-none text-sm bg-transparent"
              />
            </div>
          </div>
          {showAutoDetection && (
            <div 
              className="flex items-center justify-center border border-[#878787] rounded-full h-9 px-4 md:px-5 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                if (onAutoDetect) {
                  onAutoDetect()
                }
                onClose()
              }}
            >
              <img src="/translator/auto_icon@2x.png" alt="auto" className="w-4 h-4" />
              <span className="ml-2 text-[#878787] text-sm font-medium">{t('automatic_detection')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Language List */}
      <div className="px-4 md:px-6 pb-4 md:pb-6 flex-1 flex flex-col">
        <div className="border border-gray-200 rounded-lg flex-1 overflow-y-auto max-h-[250px]">
          {filteredLanguageList.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-[#375375] text-sm">
              <img src="/translator/icon@2x copy 6.png" alt="no results" className="w-5 h-5 mr-2" />
              <span>No results</span>
            </div>
          ) : (
            filteredLanguageList.map((group, groupIndex) => (
            <div key={groupIndex} className="px-4 md:px-6 py-3 bg-white">
              <div className="bg-[#E3EEFF] text-[#375375] text-base md:text-lg font-black mb-3 px-3 py-2 rounded">
                {group.groupName}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-3">
                {group.groupList.map((lang, langIndex) => (
                  <div
                    key={langIndex}
                    className={`cursor-pointer text-sm font-normal hover:text-[#3562EC] ${
                      lang.label === selectedLanguage ? 'text-[#3562EC]' : 'text-black'
                    }`}
                    onClick={() => handleSelect(lang.label)}
                  >
                    {lang.label}
                  </div>
                ))}
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  )
}
