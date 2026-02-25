'use client'
import dynamic from 'next/dynamic';
import { Box, Stack, Button, Typography } from '@mui/material'
import React, { useRef, useEffect, useState, useContext } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTranslations } from '@/hooks/useTranslations'
import { PopoverProvider, PopoverContext } from '@/context/PopoverContext'
import PopoverComponent from '@/app/[locale]/humanize/PopoverComponent'
import { messageContext } from '@/api/client/humanizeApi.interface'
import './page.css'

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: true });

interface HumanizeInputProps {
  defaultContent: string
  onChange: (text: string) => void
  onInit: () => void
  onSetKeywords: (keywords: string) => void
  onSetPersonal: (personal: string) => void
  maxWords: number
  clearFlag: number
  keywords: string
  personal: string
}

export default function HumanizeInput({ defaultContent, onChange, onInit, maxWords, clearFlag, onSetKeywords, onSetPersonal, keywords, personal }: HumanizeInputProps) {
  const t = useTranslations('Humanize')
  const [keywordsShow, setKeywordsShow] = useState(false)
  const [personalShow, setPersonalShow] = useState(false)
  const context = useContext(PopoverContext)

  const [message, setMessage] = useState<messageContext>({
    keywords: '',
    personal: ''
  })
  
  const [newKeywords, setNewkeywords] = useState('')
  const [newPersonal, setNewPersonal] = useState('')
  
  const handleKeywordsMouseEnter = () => {
    setKeywordsShow(true);
  };
  const handleKeywordsMouseLeave = () => {
    setKeywordsShow(false);
  };

  const handlePersonalMouseEnter = () => {
    setPersonalShow(true);
  };
  const handlePersonalMouseLeave = () => {
    setPersonalShow(false);
  };

  const handleClearKeywords = () => {
    onSetKeywords('')
    setKeywordsShow(false)
    setNewkeywords('')
    context?.onClearContent(1)
  };
  
  const handleClearPersonal = () => {
    onSetPersonal('')
    setPersonalShow(false);
    setNewPersonal('')
    context?.onClearContent(2)
  };
  
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>, content: string, type: number) => 
  {
    if(context)
    {
      if(type==1)
      {
        const message: messageContext = {keywords: content, personal: ''};
        setMessage(message)
        context.handleOpen(event, message);
      }else{
        const message: messageContext = {keywords: '', personal: content};
        setMessage(message)
        context.handleOpen(event, message);
      }
    }
  };

  useEffect(() => {
    if (context && context.message) 
    {
      const { keywords = '',  personal =''} = context.message;
      console.log(keywords, personal);
      if(keywords){
        onSetKeywords(keywords)
        setNewkeywords(keywords)
      }
      if(personal){
        onSetPersonal(personal)
        setNewPersonal(personal)
      }
    }else{
      setNewkeywords(keywords)
      setNewPersonal(personal)
    }
  },[keywords, personal, context])

  return (
    <>
      {/* <Box>
        {keywords && (
          <Stack
            sx={{m:2, mb:0, p:1, position: 'relative', background: keywordsShow ? '#ECF2FE':'#F5F6F8', borderRadius: '8px'}}>
            <Typography 
              sx={{fontSize:'14px', maxHeight: '76px', textWrap: 'wrap', wordBreak: 'break-all', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>
              {t('keywords')}：{newKeywords}
            </Typography>
            <Stack direction="row" sx={{position:'absolute', right: '-6px', top: '-4px'}}>
            <Button className='edit-button' startIcon={<EditIcon className='edit-icon' />} 
              onClick={(e)=>handleOpenPopover(e, newKeywords, 1)}></Button>
            <Button className='delete-button' startIcon={<DeleteIcon className='delete-icon'/>} onClick={handleClearKeywords}></Button>
            </Stack>
          </Stack>
        )}
        
        {personal && (
          <Stack onMouseEnter={handlePersonalMouseEnter} onMouseLeave={handlePersonalMouseLeave} 
              sx={{m:2, mb:0, p:1, position: 'relative', background: personalShow ? '#ECF2FE':'#F5F6F8', borderRadius: '8px'}}>
              <Typography onMouseEnter={handleKeywordsMouseEnter} onMouseLeave={handleKeywordsMouseLeave} 
                sx={{fontSize:'14px', maxHeight: '76px', textWrap: 'wrap', wordBreak: 'break-all', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>
                {t('personal_needs')}：{newPersonal}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{position:'absolute', right: '-6px', top: '-4px'}}>
                <PopoverProvider>
                  <Button className='edit-button' startIcon={<EditIcon className='edit-icon' />} onClick={(e)=>handleOpenPopover(e, newPersonal, 2)}></Button>
                  <PopoverComponent />
                </PopoverProvider>
                <Button className='delete-button' startIcon={<DeleteIcon className='delete-icon'/>} onClick={handleClearPersonal}></Button>
              </Stack>
          </Stack>
        )}
      </Box> */}
      <TiptapEditor key={maxWords} defaultContent={defaultContent} onInit={onInit} onChange={onChange} maxWords={maxWords} clearFlag={clearFlag} />
    </>
  )
}


