'use client'
import { useState, useEffect } from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import { isMobile } from "@/util/browser"
import { Select, SelectItem } from '@heroui/react'

interface HumanizeToolFormatProps {
  onFormat: (name: string, format: string) => void
}

export default function humanizeToolFormat({ onFormat }: HumanizeToolFormatProps) 
{
  const t = useTranslations('Humanize')
  const [format, setFormat] = useState("");
  const [openFormat, setOpenFormat] = useState(false);
  const [formatList, setFormatList] = useState([]);

  const handleChangeFormat = (value: string) => {
    setFormat(value);
    onFormat('Format', value);
  };

  const handleCloseFormat = () => {
    setOpenFormat(false);
  };

  const handleOpenFormat = () => {
    setOpenFormat(true);
  };
  
  useEffect(() => 
  {
    const format = localStorage.getItem('FORMAT') || "";
    if(format){
      const formatArr = JSON.parse(format);
      setFormatList(formatArr['options']);
      setFormat(formatArr['options'][0]['value']);
    }else{
      setTimeout(() => {
        const format = localStorage.getItem('FORMAT') || "";
        const formatArr = JSON.parse(format);
        setFormatList(formatArr['options']);
        setFormat(formatArr['options'][0]['value']);
      }, 2000)
    }
  }, [])
  
  return (
    <div className="flex items-center justify-end w-full">
      <Select
        aria-label="Format"
        label={t('Please_select_output_format')}
        selectedKeys={new Set([format])}
        onOpenChange={setOpenFormat}
        onChange={(e) => handleChangeFormat((e.target as HTMLSelectElement).value)}
        className="min-w-[160px]"
        size="sm"
      >
        {formatList.map((item: any, index: number) => (
          <SelectItem key={item['value']} value={item['value']}>
            {item['value']}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}
