'use client'
import { useState, useEffect } from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import { isMobile } from "@/util/browser"
import { Select, SelectItem } from '@heroui/react'
import { Locale } from '@/i18n.config'
import { useLocale } from 'next-intl'


interface HumanizeToolLanguageProps {
  onLanguage: (name: string, language: string) => void
}

export default function HumanizeToolLanguage({ onLanguage }: HumanizeToolLanguageProps) {
  const localesWithLanguages = [
    { locale: 'en', name: 'English' }, // English
    { locale: 'es', name: 'Spanish' }, // Spanish
    { locale: 'fr', name: 'French' }, // French
    { locale: 'pt', name: 'Portuguese' }, // Portuguese
    { locale: 'it', name: 'Italian' }, // Italian
    { locale: 'ja', name: 'Japanese' }, // Japanese
    { locale: 'th', name: 'Thai' }, // Thai
    { locale: 'pl', name: 'Polish' }, // Polish
    { locale: 'ko', name: 'Korean' }, // Korean
    { locale: 'de', name: 'German' }, // German
    { locale: 'ru', name: 'Russian' }, // Russian
    { locale: 'da', name: 'Danish' }, // Danish
    { locale: 'ar', name: 'Arabic' }, // Arabic (Modern Standard)
    { locale: 'no', name: 'Norwegian' }, // Norwegian
    { locale: 'nl', name: 'Dutch' }, // Dutch
    { locale: 'id', name: 'Indonesian' }, // Indonesian
    { locale: 'zh-hant', name: 'Chinese (Traditional)' }, // Traditional Chinese
    { locale: 'zh-hans', name: 'Chinese (Simplified)' }, // Simplified Chinese
    { locale: 'tr', name: 'Turkish' }, // Turkish
  ]
  const t = useTranslations('Humanize')
  const locale = useLocale() as Locale // 当前语言
  const currentLanguage = localesWithLanguages.find(item => item.locale === locale) || { locale: 'en', name: 'English' } // 当前语言
  const [language, setLanguage] = useState(currentLanguage.name);
  const [openLanguage, setOpenLanguage] = useState(false);
  const [languageList, setLanguageList] = useState([]);

  const handleChangeLanguage = (value: string) => {
    setLanguage(value);
    onLanguage('Output Language', value);
  };

  const handleCloseLanguage = () => {
    setOpenLanguage(false);
  };

  const handleOpenLanguage = () => {
    setOpenLanguage(true);
  };
  
  useEffect(() => 
  {
    const languages = localStorage.getItem('OUTPUT_LANGUAGE')  || "";
    if(languages!='' && languages!='undefined')
    {
      const languageArr = JSON.parse(languages);
      setLanguageList(languageArr['options']);
      if(!language){
        setLanguage('Spanish');
      }
    }else{
      setTimeout(() => {
        const languages = localStorage.getItem('OUTPUT_LANGUAGE')  || "";
        const languageArr = JSON.parse(languages);
        setLanguageList(languageArr['options']);
        if(!language){
          setLanguage('Spanish');
        }
      }, 2000)
    }
  }, [])

  return (
    <div className="flex items-center w-full">
      <Select
        aria-label="Output language"
        label={t('output_language')}
        selectedKeys={new Set([language])}
        onOpenChange={setOpenLanguage}
        onChange={(e) => handleChangeLanguage((e.target as HTMLSelectElement).value)}
        className="min-w-[200px]"
        size="sm"
      >
        {languageList.map((item: any, index: number) => (
          <SelectItem key={item['value']} value={item['value']}>
            {item['value']}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}
