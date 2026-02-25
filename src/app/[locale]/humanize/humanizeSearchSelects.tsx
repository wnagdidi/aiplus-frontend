'use client'
import { useEffect, useState } from 'react'
import { Button, Select, SelectItem, Popover, Slider } from '@heroui/react'
import { useTranslations } from '@/hooks/useTranslations'
import { isMobile } from "@/util/browser"
import { useLocale } from 'next-intl'

interface HumanizeSearchSelectsProps {
  onPurpose: (name: string, purpose: string) => void,
  onRewriting: (name: string, rewriting: string) => void
}

export default function HumanizeSearchSelects({ onPurpose, onRewriting }: HumanizeSearchSelectsProps) {

  const locale = useLocale()
  const t = useTranslations('Humanize')
  const [purposeList, setPurposeList] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [openPurpose, setOpenPurpose] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [keynote, setKeynote] = useState<number | null>(0)
  const [level, setLevel] = useState<number | number[]>(100)
  const [readabilityList, setReadabilityList] = useState([]);
  const [readability, setReadability] = useState("");
  const [openReadability, setOpenReadability] = useState(false);
  const [keynoteList, setKeynoteList] = useState<String[]>([]);
  const openRewrite = Boolean(anchorEl);

  // const keynoteList = !isMobile() ? ['general_writing', 'essays', 'blog_article'] : [];
   useEffect(() => {
    if(!isMobile()) {
      setKeynoteList(['general_writing', 'essays', 'blog_article']);
    }else {
      setKeynoteList([]);
    }
   }, [])
   

  const marks = [
      {value:50, label:'50%', key: 'Minor Word Adjustments'},
      {value:75, label:'75%', key: 'Partial Sentence Restructuring'},
      {value:100, label:'100%', key: 'Complete Narrative Rewrite'}
  ];
  
  const handleChangeReadability = (value: string) => {
    setReadability(value);
    setKeynote(null)
  };
  const handleCloseReadability = () => {
    setOpenReadability(false);
  };
  const handleOpenReadability = () => {
    setOpenReadability(true);
  };

  const handleChangePurpose = (value: string) => {
    setPurpose(value);
    onPurpose('purpose', value);
    setKeynote(null);
  };
  const handleClosePurpose = () => {
    setOpenPurpose(false);
  };
  const handleOpenPurpose = () => {
    setOpenPurpose(true);
  };

  const handleRewriteOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleRewriteClose = () => {
    setAnchorEl(null);
  };
  const handleKeynotePurpose = (index: number, purpose: string) => 
  {
    setKeynote(index)
    onPurpose('purpose', purpose);
    setPurpose("");
  };

  const handleRewritingLevel = (event: Event, value: number | number[])=>
  {
    setLevel(value)
    let rewriting = marks.find(item => item['value'] === value);
    onRewriting('Rewriting Level', rewriting?.key || "");
  }

  useEffect(() => {
    const purposeList = localStorage.getItem('PURPOSE') || "";
    const readabilityList = localStorage.getItem('READABILITY') || "";

    if(purposeList!='' && purposeList!='undefined')
    {
      const purposeArr = JSON.parse(purposeList);
      if(!isMobile())
      {
        const purposelist = purposeArr['options'].filter((item: any) => !keynoteList.includes(item.value));
        setPurposeList(purposelist);
      }else{
        setPurposeList(purposeArr['options']);
        setPurpose(purposeArr['options'][0]['value']);
      }
    }else{
      setTimeout(() => {
        const purposeList = localStorage.getItem('PURPOSE') || "";
        const purposeArr = JSON.parse(purposeList);
        if(!isMobile())
        {
          const purposelist = purposeArr['options'].filter((item: any) => !keynoteList.includes(item.value));
          setPurposeList(purposelist);
        }else{
          setPurposeList(purposeArr['options']);
          setPurpose(purposeArr['options'][0]['value']);
        }
      }, 2000)
    }

    if(readabilityList!='' && readabilityList!='undefined')
    {
      const readabilityArr = JSON.parse(readabilityList);
      setReadabilityList(readabilityArr['options']);
      setReadability(readabilityArr['options'][0]['value']);
    }else{
      setTimeout(() => {
        const readabilityList = localStorage.getItem('READABILITY') || "";
        const readabilityArr = JSON.parse(readabilityList);
        setReadabilityList(readabilityArr['options']);
        setReadability(readabilityArr['options'][0]['value']);
      }, 2000)
    }
  }, [])
  
  return (
    <Box className="raised-select" 
        sx={{width: '100%', display: 'flex', gap: 0, alignItems: 'center', justifyContent: {sm: 'flex-end', xs: 'space-between'}, m: 0}}>
        <Box sx={{ display: 'flex', width: '100%', justifyContent:  {sm: 'flex-end', xs: 'space-between'}, whiteSpace: 'nowrap'}}>
          {keynoteList.map((value, index) => (
            <Button component="label" sx={{fontSize: '14px', color: '#375375'}}
              onClick={()=>handleKeynotePurpose(index, value)} 
              className={keynote==index ? 'button-background' : ''}  
              key={index}>
              {t(value)}
            </Button>
          ))}
          <Select
            defaultValue=""
            displayEmpty
            open={openPurpose}
            onClose={handleClosePurpose}
            onOpen={handleOpenPurpose}
            value={purpose}
            onChange={handleChangePurpose}
            sx={{
              height: '35px', maxWidth: '164px !important', border: 'none', textAlign: 'center', 
              fontWeight: purpose && '700',
              background: purpose && 'radial-gradient(ellipse at left, #914BEC, #3B7EFF)',
              webkitBackgroundClip: purpose && 'text',
              color: purpose && 'transparent !important',
              backgroundClip: purpose && 'text'
            }}
            inputProps={{'aria-label': 'Without label'}}
            input={<OutlinedInput />}
            MenuProps={{
              anchorOrigin: isMobile() ? {vertical: 0, horizontal: 0}: {vertical: 44, horizontal: -20},
              className: isMobile() ? 'purpose-select'  : '',
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              PaperProps: {
                style: {
                  position: 'absolute',
                  width: isMobile() ? 736 : 250,
                  height: isMobile() ? '100%' : 488,
                  borderRadius: 12,
                  scrollbarWidth: 'thin'
                }
              }
            }}
            IconComponent={() => <KeyboardArrowDownIcon 
            sx={{ fontSize:20, position:'absolute', top: 'calc(50% - .5em)', right:'7px', color: '#375375'}} />}>
            {isMobile() && (
              <ListSubheader disableSticky={true} sx={{textAlign: 'center', justifyContent: 'center', fontSize: '16px'}}>请选择目的</ListSubheader>
            )}
            {!isMobile() && (
              <MenuItem value="" disabled>More</MenuItem>
            )}
            {purposeList.map((item, index) => (
              <MenuItem value={item['value']} key={index}>{item['value']}</MenuItem>
            ))}
          </Select>
        </Box>
 
        <Box sx={{ display: 'flex', width: {sm: '100%'}, alignItems: 'center', justifyContent: {sm: 'flex-end', xs: 'space-between'}}}>
            <Button
              sx={{width: locale=='en' ? '134px' : '160px', color: '#375375'}}
              component="label"
              id="rewrite-button"
              disableElevation
              onClick={handleRewriteOpen}
              endIcon={<KeyboardArrowDownIcon />}
            >
              {t('rewrite')} {level}%
            </Button>
            <Popover
              open={openRewrite}
              anchorEl={anchorEl}
              anchorOrigin={{vertical: 'top', horizontal: 'center'}}
              transformOrigin={{vertical: 'center', horizontal: 'center'}}
              onClose={handleRewriteClose}
              disableRestoreFocus
              disableScrollLock={false}
              className='rewrite-popover'
            >
              <Box sx={{width: '200px', pt:2, pl:3, pr:3}}>
                <Typography sx={{fontSize: '14px'}}>{t('rewrite_level')}</Typography>
                <Slider
                  value={level}
                  marks={marks}
                  onChange={handleRewritingLevel}
                  aria-label="Temperature"
                  defaultValue={100}
                  valueLabelDisplay="auto"
                  shiftStep={25}
                  step={25}
                  min={50}
                  max={100}
                  sx={{'& .MuiSlider-thumb': {height: 15, width: 15, color: '#914BEC'}, '& .MuiSlider-track': {backgroundColor: '#914BEC'}}}
                />
              </Box>
            </Popover>
        </Box>
    </Box>
  )
}
