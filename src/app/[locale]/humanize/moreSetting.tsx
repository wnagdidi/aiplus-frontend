'use client'
import { useTranslations } from '@/hooks/useTranslations'
import { useEffect, useState } from 'react'
import { isMobile } from "@/util/browser"
import { Button, Slider, Switch, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import HumanizeSeo from '@/app/[locale]/humanize/humanizeSeo'

interface MoreSettingProps {
	onPurpose: (name: string, purpose: string) => void,
	onRewriting: (name: string, rewriting: string) => void,
	onFormat: (name: string, format: string) => void,
	onQuality: (quality: number) => void
	onPassing: (passing: number) => void
	onKeywords: (keywords: string) => void
  onPersonal: (personal: string) => void
}

// 移除自定义 Box/Typo，使用原生 + Tailwind

export default function MoreSetting(props: MoreSettingProps) {
	const { onPurpose, onRewriting, onFormat, onQuality, onPassing, onKeywords, onPersonal } = props;

	const t = useTranslations('Humanize')
	const [purposeList, setPurposeList] = useState<any[]>([]);
	const [purposeIndex, setPurposeIndex] = useState(0);
	const [level, setLevel] = useState<number>(100)
	const [formatIndex, setFormatIndex] = useState(0);
	const [formatList, setFormatList] = useState<any[]>([]);
	const [open1, setOpen1] = useState(false);
	const [open2, setOpen2] = useState(false);
	const [passing, setPassing] = useState(false);
	const [quality, setQuality] = useState(false);

	const marks = [
		{value:50, label:'50%', key: 'Minor Word Adjustments'},
		{value:75, label:'75%', key: 'Partial Sentence Restructuring'},
		{value:100, label:'100%', key: 'Complete Narrative Rewrite'}
  ];

	const purposeClickFn = (index: number, value: string) => {
		setPurposeIndex(index);
		onPurpose('purpose', value);
	}

	const formatClickFn = (index: number, value: string) => {
		setFormatIndex(index);
		onFormat('format', value);
	}

	const handleRewritingLevel = (value: number)=> {
		setLevel(value)
		let rewriting = marks.find(item => item['value'] === value);
		onRewriting('Rewriting Level', rewriting?.key || "");
	}

	const handlePassingOpen = () => {
		if(!isMobile()){
			setOpen1(true);
		}
	};

	const handlePassingClose = () => {
		setOpen1(false);
	};

	const handleQualityOpen = () => {
		if(!isMobile()){
			setOpen2(true);
		}
	};

	const handleQualityClose = () => {
		setOpen2(false);
	};

	const handlePassingSwitch = (checked: boolean)=>{
		setPassing(checked)
		onPassing(checked ? 1 : 0);
	}

	const handleQualitySwitch = (checked: boolean)=>{
		setQuality(checked)
		onQuality(checked ? 1 : 0);
	}

	const handleSetKeywords = (keywords: string) => {
		onKeywords(keywords);
	}

	const handleSetPersonal = (personal: string) => {
		onPersonal(personal);
	}

	useEffect(() => {
		const purposeList = localStorage.getItem('PURPOSE') || "";
		if(purposeList!='' && purposeList!='undefined') {
			const purposeArr = JSON.parse(purposeList);
			setPurposeList(purposeArr['options']);
		}else{
			setTimeout(() => {
				const purposeList = localStorage.getItem('PURPOSE') || "";
				const purposeArr = JSON.parse(purposeList);
				setPurposeList(purposeArr['options']);
			}, 2000)
		}

		const format = localStorage.getItem('FORMAT') || "";
    if(format){
      const formatArr = JSON.parse(format);
      setFormatList(formatArr['options']);
    }else{
      setTimeout(() => {
        const format = localStorage.getItem('FORMAT') || "";
        const formatArr = JSON.parse(format);
        setFormatList(formatArr['options']);
      }, 2000)
    }
	}, [])

  return (
    <>
	  	<div className="md:hidden">
				<HumanizeSeo onKeywords={handleSetKeywords} onPersonal={handleSetPersonal} />
			</div>
      <span className="font-medium text-[16px] text-[#375375]">{t('your_content')}</span>
      <div className="mt-[15px]">
        {purposeList.map((item: any, index: number) => (
          <Button 
            key={index}
            className="bg-white shadow-none hover:bg-gray-100 mr-[6px] mb-[10px] text-[14px] rounded-[6px] py-[6px] px-3"
            size="sm"
            onPress={()=>purposeClickFn(index, item['value'])}
            style={{
              color: purposeIndex == index? '#8B59ED' : '#375375',
              border: purposeIndex == index? '1px solid #8B59ED' : '1px solid #37537526'
            }}
          >
            {item['value']}
          </Button>
        ))}
      </div>
      <span className="block mt-[15px] font-medium text-[16px] text-[#375375]">{t('format_of_output')}</span>
      <div className="mt-[15px]">
        {formatList.map((item: any, index: number) => (
          <Button 
            key={index}
            className="bg-white shadow-none hover:bg-gray-100 mr-[6px] mb-[10px] text-[14px] rounded-[6px] py-[6px] px-3"
            size="sm"
            onPress={()=>formatClickFn(index, item['value'])}
            style={{
              color: formatIndex == index? '#8B59ED' : '#375375',
              border: formatIndex == index? '1px solid #8B59ED' : '1px solid #37537526'
            }}
          >
            {item['value']}
          </Button>
        ))}
      </div>
      <span className="block mt-[15px] font-medium text-[16px] text-[#375375]">{t('rewrite_level')}</span>
      <div className="mt-[10px] px-[20px] pr-[25px]">
        <Slider
          value={level}
          onChange={handleRewritingLevel}
          minValue={50}
          maxValue={100}
		  size="sm"
          step={25}
          classNames={{
            track: 'bg-[#8B59ED26]',
            filler: 'bg-[#8B59ED]',
            thumb: 'bg-[#8B59ED] border-[#8B59ED]'
          }}
        />
        <div className="flex justify-between text-xs mt-1 px-1">
          {marks.map(m => (
            <span key={m.value}>{m.label}</span>
          ))}
        </div>
      </div>
      <div className="mt-[15px] flex flex-col gap-1 items-start w-full">
				<Popover isOpen={open1} placement="bottom-start">
					<PopoverTrigger>
						<div onMouseEnter={handlePassingOpen} onMouseLeave={handlePassingClose} className="flex text-[#375375] flex-row items-center gap-2">
							<span className="text-[16px]">{t('passing_rate')}</span>
							<Switch
								size="sm"
								isSelected={passing} 
								onValueChange={handlePassingSwitch}
								classNames={{
									wrapper: 'bg-[#e6e6f5] group-data-[selected=true]:bg-[#914BEC]',
									thumb: 'bg-white'
								}}
							/>
							<span className={`text-[16px] text-right ${passing ? 'text-[#914BEC]' : ''}`}>{passing ? t('height') : t('normal')}</span>
						</div>
					</PopoverTrigger>
					<PopoverContent>
						<span className="block p-1 w-[300px]">{t('hight_passing_tip')}</span>
					</PopoverContent>
				</Popover>
				<Popover isOpen={open2} placement="bottom-start">
					<PopoverTrigger>
						<div onMouseEnter={handleQualityOpen} onMouseLeave={handleQualityClose} className="flex text-[#375375] flex-row items-center gap-2">
							<span className="text-[16px] min-w-[55px]">{t('quality')}</span>
							<Switch
								size="sm"
								isSelected={quality} 
								onValueChange={handleQualitySwitch}
								classNames={{
									wrapper: 'bg-[#e6e6f5] group-data-[selected=true]:bg-[#914BEC]',
									thumb: 'bg-white'
								}}
							/>
							<span className={`text-[16px] text-right ${quality ? 'text-[#914BEC]' : ''}`}>{quality ? t('height') : t('normal')}</span>
						</div>
					</PopoverTrigger>
					<PopoverContent>
						<span className="block p-1 w-[300px]">{t('hight_quality_tip')}</span>
					</PopoverContent>
				</Popover>
			</div>
		</>
  )
}