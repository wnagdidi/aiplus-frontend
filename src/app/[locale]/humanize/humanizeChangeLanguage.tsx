'use client'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { Locale } from '@/i18n.config'
import { useLocale } from 'next-intl'

interface HumanizeChangeLanguageProps {
  onLanguage: (name: string, language: string) => void
}

export default function HumanizeChangeLanguage({ onLanguage }: HumanizeChangeLanguageProps) {
    const localesWithLanguages = [
			{ locale: 'en', name: 'English' },
			{ locale: 'es', name: 'Spanish' },
			{ locale: 'fr', name: 'French' },
			{ locale: 'pt', name: 'Portuguese' },
			{ locale: 'it', name: 'Italian' },
			{ locale: 'ja', name: 'Japanese' },
			{ locale: 'th', name: 'Thai' },
			{ locale: 'pl', name: 'Polish' },
			{ locale: 'ko', name: 'Korean' },
			{ locale: 'de', name: 'German' },
			{ locale: 'ru', name: 'Russian' },
			{ locale: 'da', name: 'Danish' },
			{ locale: 'ar', name: 'Arabic' },
			{ locale: 'no', name: 'Norwegian' },
			{ locale: 'nl', name: 'Dutch' },
			{ locale: 'id', name: 'Indonesian' },
			{ locale: 'zh-hant', name: 'Chinese (Traditional)' },
			{ locale: 'zh-hans', name: 'Chinese (Simplified)' },
			{ locale: 'tr', name: 'Turkish' },
		]
		const t = useTranslations('Humanize')
		const locale = useLocale() as Locale
		const currentLanguage = localesWithLanguages.find(item => item.locale === locale) || { locale: 'en', name: 'English' }
		const [language, setLanguage] = useState(currentLanguage.name);
		const [openLanguage, setOpenLanguage] = useState(false);
		const [languageList, setLanguageList] = useState<any[]>([]);
		const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [dropdownRect, setDropdownRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
    const [animate, setAnimate] = useState(false)

    // 计算右侧列的矩形信息（用于定位弹层），需要在多个地方调用
    const computeRect = () => {
      const el = containerRef.current
      if (!el) return
      const header = (el.closest('.raised-select-out') as HTMLElement) || el
      const rightCol = (header.parentElement as HTMLElement) || header
      const rect = rightCol.getBoundingClientRect()
      setDropdownRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    }

		const getDisplayName = (item: any) => {
			if (item == null) return ''
			if (typeof item === 'string') return item
			return item.name || item.label || item.text || item.title || ''
		}

		const safeParse = (str: string) => {
			try { return JSON.parse(str) } catch { return null }
		}

		const getLanguageCode = (item: any) => {
			if (item == null) return ''
			if (typeof item === 'string') return item
			return item.locale || item.code || item.value || getDisplayName(item)
		}

		const handleSelect = (item: any) => {
			const name = getDisplayName(item)
			const code = getLanguageCode(item)
			setLanguage(name)
			setOpenLanguage(false)
			try { onLanguage && onLanguage('Output Language', code) } catch {}
		}

		const { columns, col1, col2, col3 } = useMemo(() => {
			const rawList: any[] = Array.isArray(languageList) ? languageList : []
			const normalized = (searchTerm || '').trim().toLowerCase()
			const filtered = normalized
				? rawList.filter((item: any) => (getDisplayName(item) || '').toLowerCase().includes(normalized))
				: rawList

			const n = filtered.length
			let cols = 1
			if (n > 5 && n <= 10) cols = 2
			else if (n > 10) cols = 3

			if (n === 0) return { columns: cols, col1: [], col2: [], col3: [] }

			if (cols === 1) {
				return { columns: 1, col1: filtered, col2: [], col3: [] }
			}

			if (cols === 2) {
				const base = Math.floor(n / 2)
				const rem = n % 2
				const size1 = base + (rem > 0 ? 1 : 0)
				const size2 = n - size1
				return {
					columns: 2,
					col1: filtered.slice(0, size1),
					col2: filtered.slice(size1, size1 + size2),
					col3: []
				}
			}

			const base = Math.floor(n / 3)
			const rem = n % 3
			const size1 = base + (rem > 0 ? 1 : 0)
			const size2 = base + (rem > 1 ? 1 : 0)
			const size3 = n - size1 - size2
			return {
				columns: 3,
				col1: filtered.slice(0, size1),
				col2: filtered.slice(size1, size1 + size2),
				col3: filtered.slice(size1 + size2, size1 + size2 + size3)
			}
		}, [languageList, searchTerm])

		useEffect(() => 
		{
			const languages = localStorage.getItem('OUTPUT_LANGUAGE')  || "";
			if(languages!='' && languages!='undefined')
			{
				const languageArr = safeParse(languages) || {} as any;
				setLanguageList((languageArr as any)['options'] || []);
				const currentLanguage = languageArr.options.find((item: any) => item.label === language)
				onLanguage && onLanguage('Output Language', currentLanguage.value)
				if(!language){ setLanguage('Spanish'); }
			}else{
				setTimeout(() => {
					const languages = localStorage.getItem('OUTPUT_LANGUAGE')  || "";
					const languageArr = safeParse(languages) || {} as any;
					setLanguageList((languageArr as any)['options'] || []);
					const currentLanguage = languageArr.options.find((item: any) => item.label === language)
					onLanguage && onLanguage('Output Language', currentLanguage.value)
					if(!language){ setLanguage('Spanish'); }
				}, 2000)
			}
		}, [])

		useEffect(() => {
        if (!openLanguage) return
        const handleClickOutside = (e: MouseEvent) => {
				const container = containerRef.current
            const dropdown = dropdownRef.current
            const target = e.target as Node
            if (
              container && !container.contains(target) &&
              (!dropdown || !dropdown.contains(target))
            ) {
					setOpenLanguage(false)
				}
			}

        const updateRect = () => computeRect()
        computeRect()
        window.addEventListener('resize', updateRect)
        window.addEventListener('scroll', updateRect, true)
			document.addEventListener('mousedown', handleClickOutside, true)
			return () => {
				document.removeEventListener('mousedown', handleClickOutside, true)
				window.removeEventListener('resize', updateRect)
				window.removeEventListener('scroll', updateRect, true)
			}
		}, [openLanguage])

		return (
            <div ref={containerRef} className="relative">
				<button
					className="btn-language cursor-pointer"
                    onClick={() => {
                        if (!openLanguage) {
                            computeRect();
                            setAnimate(false);
                            setOpenLanguage(true);
                            requestAnimationFrame(() => setAnimate(true));
                        } else {
                            setOpenLanguage(false);
                            setAnimate(false);
                        }
                    }}
					aria-expanded={openLanguage}
					aria-haspopup="listbox"
				>
					<span className="inline-flex text-[#375375] items-center gap-1">
						<span>{language}</span>
						<ChevronDownIcon className={`w-4 h-4 text-[#9aa4b2] transition-transform ${openLanguage ? 'rotate-180' : ''}`} />
					</span>
				</button>
            <div
                ref={dropdownRef}
                className={`language-dropdown fixed z-50 rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${animate ? 'transition-all' : ''}`}
					style={{
						left: dropdownRect?.left ?? 0,
						top: dropdownRect?.top ?? 0,
						width: dropdownRect?.width ?? 'auto',
						height: dropdownRect?.height ?? 'auto',
                    opacity: openLanguage ? 1 : 0,
                    transform: openLanguage ? 'translateY(0)' : (animate ? 'translateY(-6px)' : 'none'),
						visibility: openLanguage ? 'visible' : 'hidden',
                pointerEvents: openLanguage ? 'auto' : 'none',
                overflowY: 'hidden'
					}}
				>
					<div className="language-input w-full h-[38px] rounded-full border border-[#37537514] bg-[#f3f5f7] px-2 flex items-center">
						<input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full text-[#375375] h-full bg-transparent outline-none px-3 text-sm"
						/>
						<MagnifyingGlassIcon className="w-4 h-4 text-[#9aa4b2]" />
					</div>
                    <div className="mt-3 overflow-y-auto overflow-x-auto sm:overflow-x-visible custom-scroll" style={{ height: (dropdownRect ? dropdownRect.height - 46 - 16 - 16 : 458) }}>
						<div
							className="language-list rounded-xl border border-[#37537526] p-2 grid gap-2 mr-2"
							style={{ gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))` }}
						>
							{columns >= 1 && (
								<div>
									{col1.map((item: any, idx: number) => (
										<div
											key={`col1-${idx}`}
											className="px-2 py-1 text-[#375375] rounded hover:bg-[#f3f5f7] cursor-pointer whitespace-nowrap sm:whitespace-normal overflow-hidden text-ellipsis"
											onClick={() => handleSelect(item)}
											role="option"
										>
											{getDisplayName(item)}
										</div>
									))}
								</div>
							)}
							{columns >= 2 && (
								<div>
									{col2.map((item: any, idx: number) => (
										<div
											key={`col2-${idx}`}
											className="px-2 py-1 text-[#375375] rounded hover:bg-[#f3f5f7] cursor-pointer whitespace-nowrap sm:whitespace-normal overflow-hidden text-ellipsis"
											onClick={() => handleSelect(item)}
											role="option"
										>
											{getDisplayName(item)}
										</div>
									))}
								</div>
							)}
							{columns >= 3 && (
								<div>
									{col3.map((item: any, idx: number) => (
										<div
											key={`col3-${idx}`}
											className="px-2 py-1 text-[#375375] rounded hover:bg-[#f3f5f7] cursor-pointer whitespace-nowrap sm:whitespace-normal overflow-hidden text-ellipsis"
											onClick={() => handleSelect(item)}
											role="option"
										>
											{getDisplayName(item)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		)
}