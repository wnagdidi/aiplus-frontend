'use client'
import React, { createContext, useState,  ReactNode, useContext } from 'react';
import { useSnackbar } from '@/context/SnackbarContext'
import { messageContext } from '@/api/client/humanizeApi.interface'

interface PopoverContextType {
  anchorEl: HTMLElement | null;
  message: messageContext;
  handleOpen: (event: React.MouseEvent<HTMLElement>, message: messageContext) => void;
  onClose: () => void;
  onSubmitContent: (message: string) => void;
  onClearContent: (type: number) => void;
}

export const PopoverContext = createContext<PopoverContextType | null>(null);

export const PopoverProvider: React.FC<{ children: ReactNode }> = ({ children }) => 
{
  const { showSnackbar } = useSnackbar()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [message, setMessage] = useState<messageContext | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>, message: messageContext) => 
  {
    setMessage(message);
    setAnchorEl(event.currentTarget);
  };

  const handleClearContent = (type: number) => 
  {
    if(type==1){
      setMessage(null)
    }else{
      setMessage(null)
    }
  };

  const handleClose = () => 
  {
    setAnchorEl(null);
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

  const handleSubmitContent = (newContent: string) =>
  {
    let result = verifySpecialStr(newContent)
    if(!result){
      showSnackbar('关键词不能含有特殊字符串', 'error')
      return;
    }
    if(message?.keywords){
      const newParentContent: messageContext = {
        keywords: newContent, 
        personal: message.personal
      };
      setMessage(newParentContent)
    }
    if(message?.personal){
      const newParentContent: messageContext = {
        keywords: message.keywords, 
        personal: newContent
      };
      setMessage(newParentContent)
    }
    handleClose();
  }

  return (
    <PopoverContext.Provider value={{anchorEl, message, handleOpen, onClose: handleClose, onSubmitContent: handleSubmitContent, onClearContent: handleClearContent}}>
    {children}
    </PopoverContext.Provider>
  )
}

export const usePopover = () => {
  return useContext(PopoverContext)
}