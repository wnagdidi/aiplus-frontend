'use client'
import { useEffect, useState, useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useTranslations } from '@/hooks/useTranslations'
import { hoverBackgroundGradient } from '@/theme'
import { useGTM } from '@/context/GTMContext'

interface HumanizeChoosePersonaProps {
  onPersona: (name: string, persona: string) => void
}

export default function HumanizeChooseMode({ onPersona }: HumanizeChoosePersonaProps) {
  const t = useTranslations('Humanize')
	const [currentMode, setCurrentMode] = useState(0);
	const [newMode, setNewMode] = useState<number | null>();
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const { reportEvent } = useGTM()

	const modeList = [
		{ label: t('college'), value: 'college' },
		{ label: t('audience'), value: 'audience' },
		{ label: t('marketing'), value:'marketing' },
		{ label: t('professional'), value: 'professional' }
	];

  const chooseMode = (index: number, name: string) => {
    setCurrentMode(index);
    onPersona('readability', name);
		reportEvent('HumanzieMode', {})
  };

  const handleModeMouseEnter = (newMode: number) => {
    setNewMode(newMode);
  };

  const handleModeMouseLeave = () => {
    setNewMode(null);
    setCurrentMode(currentMode);
  };

  const checkScrollState = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollState();
      container.addEventListener('scroll', checkScrollState);
      return () => container.removeEventListener('scroll', checkScrollState);
    }
  }, []);

	const handleGetBorder = (index: number) :string => {
		if(currentMode === index) {
			return '1px solid #FFFFFF66'
		}else if(newMode === index){
			return '1px solid rgba(157, 66, 255, 0.1)'
		}else{
			return '1px solid transparent'
		}
	}
	const handleGetBackgroundColor = (index: number) :string => {
		if(currentMode === index) {
			// 已选中按钮的 hover 效果：灰色背景
			return newMode === index ? '#dbdfe6' : hoverBackgroundGradient
		}else if(newMode === index){
			// 未选中按钮的 hover 效果：蓝色渐变背景
			return hoverBackgroundGradient
		}else{
			return 'transparent'
		}
	}
	return (
		<div className="flex items-center w-full min-w-0">
			<span className="text-[#375375] font-medium text-[12px] md:text-[14px] mr-1">{t('mode')}:</span>
			<button
				onClick={scrollLeft}
				disabled={!canScrollLeft}
				className={`ml-2 w-6 h-6 p-0 rounded ${canScrollLeft ? 'opacity-100' : 'opacity-30'} hover:bg-black/5`}
				aria-label="scroll left"
			>
				<ChevronLeftIcon className="w-5 h-5 text-[#375375]" />
			</button>

			<div
				ref={scrollContainerRef}
				className="flex-1 min-w-0 max-w-full overflow-x-auto overflow-y-hidden whitespace-nowrap [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				{modeList.map((mode, index) => (
					<span
						key={index}
						onClick={() => chooseMode(index, mode.value)}
						onMouseEnter={() => handleModeMouseEnter(index)}
						onMouseLeave={() => handleModeMouseLeave()}
						className="inline-block mr-2 cursor-pointer text-[14px] font-normal"
						style={{
							color: currentMode === index || newMode === index ? '#fff' : '#375375',
							padding: '4px 12px',
							borderRadius: '45px',
							background: handleGetBackgroundColor(index),
						}}
					>
						{mode.label}
					</span>
				))}
			</div>

			<button
				onClick={scrollRight}
				disabled={!canScrollRight}
				className={`ml-1 w-6 h-6 p-0 rounded ${canScrollRight ? 'opacity-100' : 'opacity-30'} hover:bg-black/5`}
				aria-label="scroll right"
			>
				<ChevronRightIcon className="w-5 h-5 text-[#375375]" />
			</button>
		</div>
	)
}