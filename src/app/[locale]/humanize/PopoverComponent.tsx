'use client'
import { isMobile } from "@/util/browser"
import { PopoverContext } from '@/context/PopoverContext'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { wordsCounter } from "@/util/humanize"
import { Popover, PopoverTrigger, PopoverContent, Button, Textarea } from '@heroui/react'

const PopoverComponent = () => 
{
  const t = useTranslations('Humanize')
  const [wordsCount, setWordsCount] = useState(0)
  const [lastKey, setLastKey] = useState('');
  const [content, setContent] = useState('')
  const [isEdit, setIsEdit] = useState(false);

  const {anchorEl, message, onClose, onSubmitContent } = useContext(PopoverContext) || {
    anchorEl: null,
    message: null,
    onClose: () => {},
    onSubmitContent: (conetnt: string) => {},
  };
  
  const countWordsNumber = (text: string) =>{
    const chineseRegex = /[\u4e00-\u9fa5]/g; // 匹配汉字
    const englishWordRegex = /\b[a-zA-Z]+\b/g; // 匹配英文单词
    const chineseMatches = text.match(chineseRegex);
    const englishWordMatches = text.match(englishWordRegex);
    const chineseCount = chineseMatches ? chineseMatches.length : 0;
    const englishWordCount = englishWordMatches ? englishWordMatches.length : 0;
    return chineseCount + englishWordCount;
  }
  
  const handleKeywordsClose = () => {
    onClose()
  };

  const handleSubmitContent = (event: React.MouseEvent<HTMLButtonElement>)=>
  {
    if(message?.keywords){
      onSubmitContent(content)
    }
    if(message?.personal){
      onSubmitContent(content)
    }
  };
  
  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    setLastKey(event.key);
  };

  const handleKeywordsChange = (value: string)=>{
    if(isEdit)
    {
      if(lastKey=='Backspace' || lastKey=='Delete' || lastKey=='x'){
        setIsEdit(true)
      }else{
        return false;
      }
    }
    let words = value;
    let wordsCount = countWordsNumber(words);
    if(wordsCount>100){
      setIsEdit(true)
      setContent(words.substring(0, 100));
      setWordsCount(100)
    }else{
      setIsEdit(false)
      setContent(words)
      setWordsCount(wordsCount)
    }
  };

  useEffect(()=>{
    if(message?.keywords){
      setContent(message?.keywords)
      setWordsCount(countWordsNumber(message?.keywords))
    }
    if(message?.personal){
      setContent(message?.personal)
      setWordsCount(countWordsNumber(message?.personal))
    }
  }, [message])

  const open = Boolean(anchorEl);

  return(
    <Popover isOpen={open} onOpenChange={(o)=>{ if(!o) handleKeywordsClose() }} placement={isMobile()? 'top' : 'bottom'}>
      <PopoverTrigger>
        <div />
      </PopoverTrigger>
      <PopoverContent className={isMobile()? '' : 'keywords-popover w-[500px]'}>
        <div className="flex flex-col w-full">
          <div className="flex p-2 m-0 border-b border-[#ccc]">
            <Textarea
              value={content}
              onKeyDown={handleKeyDown}
              onValueChange={handleKeywordsChange}
              placeholder={t('keywords_placeholder')}
              minRows={8}
              className="w-full border-0 text-[14px]"
            />
          </div>
          <div className="flex p-2">
            <div className="flex w-full items-center text-[14px] text-[#D7080C]">{wordsCount}/100 Words</div>
            <div className="flex w-full justify-end">
              <Button onPress={handleSubmitContent} className="h-8 w-[125px] border border-[#E3E6EB] shadow-none bg-gradient-to-r from-[#914BEC26] to-[#507AF626]">
                <span className="bg-gradient-to-r from-[#914BEC] to-[#507AF6] bg-clip-text text-transparent">{t('submit').toUpperCase()}</span>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    );
};

export default PopoverComponent;