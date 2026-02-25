'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { useSnackbar } from '@/context/SnackbarContext'
import React, { forwardRef, useImperativeHandle } from 'react';
import { ChildKeyWordsRef } from '@/api/client/humanizeApi.interface'
import { isMobile } from "@/util/browser"
import { Textarea } from '@heroui/react'

interface HumanizeSeoDialogProps {
  onKeywords: (keywords: string) => void
  onPersonal: (personal: string) => void
  from: string | undefined
}

// 移除自定义 Box/Typo，改用原生 + Tailwind

const HumanizeSeo = forwardRef((props: HumanizeSeoDialogProps, ref: React.Ref<ChildKeyWordsRef>) => 
{
  const { onKeywords, onPersonal, from } = props;
  const [error, setError] = useState<string>()
  const [keywords, setKeywords] = useState('')
  const [personal, setPersonal] = useState('')
  const [keywordWords, setKeywordWords] = useState(0)
  const [personalWords, setPersonalWords] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [anchorE2, setAnchorE2] = useState<null | HTMLElement>(null)
  const t = useTranslations('Humanize')
  const { showSnackbar } = useSnackbar()
  const [isKeywords, setIsKeywords] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);
  const [lastKey, setLastKey] = useState('');
  const [anchorOrigin, setAnchorOrigin] = useState({});

  const countWordsNumber = (text: string) =>{
    const chineseRegex = /[\u4e00-\u9fa5]/g; // 匹配汉字
    const englishWordRegex = /\b[a-zA-Z]+\b/g; // 匹配英文单词
    const chineseMatches = text.match(chineseRegex);
    const englishWordMatches = text.match(englishWordRegex);
    const chineseCount = chineseMatches ? chineseMatches.length : 0;
    const englishWordCount = englishWordMatches ? englishWordMatches.length : 0;
    return chineseCount + englishWordCount;
  }

  const truncateToWordLimit = (text: string, limit: number) => {
    const chineseRegex = /[\u4e00-\u9fa5]/g; // 匹配汉字
    const englishWordRegex = /\b[a-zA-Z]+\b/g; // 匹配英文单词
    
    let wordCount = 0;
    let lastValidIndex = 0;
    
    // 遍历文本，按单词计数
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // 检查是否是汉字
      if (chineseRegex.test(char)) {
        wordCount++;
        if (wordCount <= limit) {
          lastValidIndex = i + 1;
        }
      }
      // 检查是否是英文单词的开始
      else if (/\b[a-zA-Z]/.test(char)) {
        // 找到完整的英文单词
        const wordMatch = text.substring(i).match(englishWordRegex);
        if (wordMatch && wordMatch[0]) {
          wordCount++;
          if (wordCount <= limit) {
            lastValidIndex = i + wordMatch[0].length;
          }
          i += wordMatch[0].length - 1; // 跳过整个单词
        }
      }
      
      // 如果超过限制，停止
      if (wordCount > limit) {
        break;
      }
    }
    
    return text.substring(0, lastValidIndex);
  }
  
  const handleKeywordsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleKeywordsClose = () => {
    setAnchorEl(null);
  };

  const handleKeyDown = (event: any) => {
    setLastKey(event.key);
  };
  
  const handleKeywordsChange = (event: any)=>{
    if(isKeywords)
    {
      if(lastKey=='Backspace' || lastKey=='Delete' || lastKey=='x'){
        setIsKeywords(true)
      }else{
        return false;
      }
    }
    let words = event.target.value;
    let wordsCount = countWordsNumber(words);
    if(wordsCount>100){
      setIsKeywords(true)
      words = truncateToWordLimit(words, 100);
      wordsCount = countWordsNumber(words);
    }else{
      setIsKeywords(false)
    }
    
    setKeywords(words)
    setKeywordWords(wordsCount)
    let result = verifySpecialStr(words)
    if(!result){
      showSnackbar('关键词不能含有特殊字符串', 'error')
      return;
    }
    onKeywords(words);
  };
  
  const handleKeywordsSubmit = (event: React.MouseEvent<HTMLButtonElement>)=>
  {
    let result = verifySpecialStr(keywords)
    if(!result){
      showSnackbar('关键词不能含有特殊字符串', 'error')
      return;
    }
    onKeywords(keywords);
    handleKeywordsClose();
  };

  const handlePersonalOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorE2(event.currentTarget);
  };

  const handlePersonalClose = () => {
    setAnchorE2(null);
  };

  const handlePersonalChange = (event:any)=>
  {
    if(isPersonal)
    {
      if(lastKey=='Backspace' || lastKey=='Delete' || lastKey=='x'){
        setIsPersonal(true)
      }else{
        return false;
      }
    }
    let words = event.target.value;
    let wordsCount = countWordsNumber(words);
    if(wordsCount>100){
      setIsPersonal(true)
      words = truncateToWordLimit(words, 100);
      wordsCount = countWordsNumber(words);
    }else{
      setIsPersonal(false)
    }
    setPersonal(words)
    setPersonalWords(wordsCount)
    let result = verifySpecialStr(words)
    if(!result){
      showSnackbar('个性化设置不能含有特殊字符串', 'error')
      return;
    }
    onPersonal(words);
  };

  const verifySpecialStr = (keywords: string)=>
  {
    const regex = /[@#$%^&*]/g;
    const positions: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(keywords)) !== null) {
      positions.push(match.index);
    }
    return positions.length>0 ? false : true;
  }

  const handlePersonalSubmit = (event: React.MouseEvent<HTMLButtonElement>)=>
  {
    let result = verifySpecialStr(keywords)
    if(!result){
      showSnackbar('个性化设置不能含有特殊字符串', 'error')
      return;
    }
    onPersonal(personal);
    handlePersonalClose();
  };

  const handleSetContent = (type: number, content: string) =>{
    type==1 ? setKeywords(content): setPersonal(content);
  }

  useImperativeHandle(ref, () => {
    return {
      handleSetContent
    }
  }, [keywords, personal])

  const open1 = Boolean(anchorEl);
  const open2 = Boolean(anchorE2);

  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="flex-1 py-[15px] border-b border-[#e1e5ea]">
        <span className="block text-[14px] font-medium leading-none mb-2 text-[#375375]">{t('keywords')}:</span>
        <div>
          <Textarea
            className="custom-scrollbar border-none"
            value={keywords}
            onKeyDown={handleKeyDown}
            onChange={handleKeywordsChange}
            placeholder={t('keywords_placeholder')}
            minRows={from === 'article' ? 3 : 7}
            maxRows={from === 'article' ? 3 : 7}
            classNames={{
              base: "bg-white text-black hover:bg-white focus-within:bg-white border-none shadow-none",
              input: "bg-white text-black hover:bg-white focus:bg-white",
              inputWrapper: "bg-white hover:bg-white focus-within:bg-white data-[hover=true]:bg-white data-[focus=true]:bg-white border-none shadow-none"
            }}
          />
        </div>
        <div className="flex w-full items-center relative top-2">
          <span className="text-[14px] text-[#9ba9ba]">{keywordWords}/100 words</span>
        </div>
      </div>
      <div className="flex-1 py-[14px]">
        <span className="block text-[14px] font-medium leading-none mb-2 text-[#375375]">{t('personal_needs')}:</span>
        <div>
          <Textarea 
            value={personal}
            onKeyDown={handleKeyDown}
            onChange={handlePersonalChange}
            placeholder={t('personal_placeholder')}
            minRows={from === 'article' ? 3 : 7}
            maxRows={from === 'article' ? 3 : 7}
            className="border-none"
            classNames={{
              base: "bg-white text-black hover:bg-white focus-within:bg-white border-none shadow-none",
              input: "bg-white text-black hover:bg-white focus:bg-white",
              inputWrapper: "bg-white hover:bg-white focus-within:bg-white data-[hover=true]:bg-white data-[focus=true]:bg-white border-none shadow-none"
            }}
          />
        </div>
        <div className="flex w-full items-center relative top-2">
          <span className="text-[14px] text-[#9ba9ba]">{personalWords}/100 words</span>
        </div>
      </div>
    </div>
  )
})
export default HumanizeSeo;
