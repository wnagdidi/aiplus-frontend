'use client'
import { useEffect, useState } from 'react'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import { useTranslations } from '@/hooks/useTranslations'
import { Box, Typography, Button, Popover, TextField, Alert, Snackbar } from '@mui/material'
import { useSnackbar } from '@/context/SnackbarContext'
import React, { forwardRef, useImperativeHandle } from 'react';
import { ChildKeyWordsRef } from '@/api/client/humanizeApi.interface'
import { isMobile } from "@/util/browser"

interface HumanizeSeoDialogProps {
  onKeywords: (keywords: string) => void
  onPersonal: (personal: string) => void
}

const HumanizeSeoDialog = forwardRef((props: HumanizeSeoDialogProps, ref: React.Ref<ChildKeyWordsRef>) => 
{
  const { onKeywords, onPersonal } = props;
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
  
  const handleKeywordsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleKeywordsClose = () => {
    setAnchorEl(null);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    setLastKey(event.key);
  };
  
  const handleKeywordsChange = (event: React.ChangeEvent<HTMLInputElement>)=>{
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
      setKeywords(words.substring(0, 100));
      setKeywordWords(100)
    }else{
      setIsKeywords(false)
      setKeywords(words)
      setKeywordWords(wordsCount)
    }
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

  const handlePersonalChange = (event:React.ChangeEvent<HTMLInputElement>)=>
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
      words = words.substring(0, 100);
      wordsCount = 100;
    }else{
      setIsPersonal(false)
      setPersonal(words)
      setPersonalWords(wordsCount)
    }
  };

  const verifySpecialStr = (keywords: string)=>
  {
    const regex = /[@#$%^&*]/g;
    const positions = [];
    let match;
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
    <Box sx={{display: 'flex', width: '100%', position: 'relative !important', height: {sm: 40, xs: 60}}}>
      <Button component="label" startIcon={<AddCircleOutline sx={{fontSize: '14px !important', mr: 1}} />} 
        className='button-background' onClick={handleKeywordsOpen}>{t('keywords')}</Button>
      <Button component="label" startIcon={<AddCircleOutline sx={{fontSize: '14px !important', mr: 1}} />} 
        className='button-background' onClick={handlePersonalOpen}>{t('personal_needs')}</Button>
      <Popover
          sx={{backgroundColor: isMobile() ? 'rgb(0, 0, 0, 0.5) !important' : ''}}
          open={open1}
          anchorEl={isMobile() ? null : anchorEl}
          anchorOrigin={isMobile() ? {vertical: 'center', horizontal: 'center'}: {vertical: -148, horizontal: 240}}
          slotProps={{
            paper: {style: {
              width: isMobile() ? '100vw': '500px',
            }}
          }}
          transformOrigin={{vertical: 'center', horizontal: 'center'}}
          onClose={handleKeywordsClose}
          disableRestoreFocus
          disableScrollLock={false}
          className={isMobile() ? '' : 'keywords-popover'}
        >
        <Box sx={{display: 'flex', width: '100%', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', p: 2, m:0, borderBottom: '1px #ccc solid'}}>
              <TextField
                value={keywords}
                onKeyDown={handleKeyDown}
                onChange={handleKeywordsChange}
                placeholder={t('keywords_placeholder')} 
                multiline rows={8} fullWidth variant="standard" 
                InputProps={{disableUnderline: true}} 
                sx={{width:'100%', border: 'none', fontSize:'14px !important'}}
              />
            </Box>
            <Box sx={{display: 'flex', p: 2}}>
              <Box sx={{display: 'flex', width:'100%', alignItems: 'center'}}>
                <Typography sx={{fontSize: '14px', color: '#D7080C'}}>{keywordWords}/100 Words</Typography>
              </Box>
              <Box sx={{display: 'flex', width:'100%', justifyContent: 'flex-end'}}>
                <Button type="submit" variant="contained" onClick={handleKeywordsSubmit}
                  sx={{
                    height: '32px', 
                    width: 'auto !important',
                    border: '1px #E3E6EB solid',
                    boxShadow: 'none',
                    background: 'linear-gradient(to right, #914BEC26, #507AF626)',
                    '&:hover': {boxShadow: 'none', background: 'linear-gradient(to right, rgb(145,75,236, 0.3), rgb(80,122,246, 0.3))'}
                  }}>
                  <Typography sx={{
                    background: 'linear-gradient(to right, #914BEC, #507AF6)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}>{t('submit').toUpperCase()}</Typography>
                  </Button>
              </Box>
            </Box>
        </Box>
      </Popover>

      <Popover
          sx={{backgroundColor: isMobile() ? 'rgb(0, 0, 0, 0.5) !important' : ''}}
          open={open2}
          anchorEl={isMobile() ? null : anchorE2}
          anchorOrigin={isMobile() ? {vertical: 'center', horizontal: 'center'}: {vertical: -148, horizontal: 240}}
          slotProps={{
            paper: {style: {width: isMobile() ? '100vw': '500px'}}
          }}
          transformOrigin={{vertical: 'center', horizontal: 'center'}}
          onClose={handlePersonalClose}
          disableRestoreFocus
          disableScrollLock={false}
          className={isMobile() ? '' : 'keywords-popover'}
        >
        <Box sx={{display: 'flex', width: '100%', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', p: 2, m:0, borderBottom: '1px #ccc solid'}}>
              <TextField 
                value={personal}
                onKeyDown={handleKeyDown}
                onChange={handlePersonalChange}
                placeholder={t('personal_placeholder')} 
                multiline rows={8} fullWidth variant="standard" 
                InputProps={{disableUnderline: true}} 
                sx={{width:'100%', border: 'none', fontSize:'14px !important'}}
              />
            </Box>
            <Box sx={{display: 'flex', p: 2}}>
              <Box sx={{display: 'flex', width:'100%', alignItems: 'center'}}>
                <Typography sx={{fontSize: '14px', color: '#D7080C'}}>{personalWords}/100 Words</Typography>
              </Box>
              <Box sx={{display: 'flex', width:'100%', justifyContent: 'flex-end'}}>
                <Button type="submit" variant="contained" onClick={handlePersonalSubmit}
                  sx={{
                    height: '32px', 
                    width: 'auto !important',
                    border: '1px #E3E6EB solid',
                    boxShadow: 'none',
                    background: 'linear-gradient(to right, #914BEC26, #507AF626)',
                    '&:hover': {boxShadow: 'none', background: 'linear-gradient(to right, rgb(145,75,236, 0.3), rgb(80,122,246, 0.3))'}
                  }}>
                  <Typography sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(to right, #914BEC, #507AF6)',
                    'WebkitBackgroundClip': 'text',
                    color: 'transparent'
                  }}>{t('submit').toUpperCase()}</Typography>
                  </Button>
              </Box>
            </Box>
        </Box>
      </Popover>
    </Box>
  )
})
export default HumanizeSeoDialog;
