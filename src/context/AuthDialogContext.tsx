'use client'
import { createContext, useState } from 'react'
import { EventEntry, useGTM } from '@/context/GTMContext'
import { AnalyticsEventType } from '@/utils/events/analytics'

export enum DialogType {
  RICH_SIGNUP,
  SIGNUP,
  LOGIN,
  FORGOT_PASSWORD,
}

export const AuthDialogContext = createContext({
  type: DialogType.LOGIN,
  isOpen: false,
  toggleRichSignupDialog: (forceOpen?: any, entry?: EventEntry, notReport?: boolean) => {},
  toggleSignupDialog: (forceOpen?: any, entry?: EventEntry) => {},
  toggleLoginDialog: (forceOpen?: any, entry?: EventEntry) => {},
  toggleForgotPasswordDialog: (forceOpen?: any) => {},
  closeDialog: () => {},
})

export const AuthDialogProvider = ({ children }: any) => {
  const [type, setType] = useState(DialogType.LOGIN)
  const [isOpen, setIsOpen] = useState(false)
  const { sendEvent, reportEvent } = useGTM()

  const toggleOpen = (forceOpen: any) => {
    if (typeof forceOpen === 'boolean' && forceOpen) {
      setIsOpen(true)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const toggleRichSignupDialog = (forceOpen: any, entry?: EventEntry, notReport = false) => {
    setType(DialogType.RICH_SIGNUP)
    toggleOpen(forceOpen)
    if (entry) {
      console.log('展示注册界面！！！！！！！！！！！！！！！！！！！！！')
      if (!notReport) {
        reportEvent('ClickRegister', {})
      }
      reportEvent(AnalyticsEventType.CLICK_LOGIN, {
        custom_data: {
          currency: 'USD',
          value: 1,
          trigger_point: 3
        },
      })
      sendEvent('show_sign_up', { entry })
    }
  }

  const toggleSignupDialog = (forceOpen: any, entry?: EventEntry) => {
    setType(DialogType.SIGNUP)
    toggleOpen(forceOpen)
    if (entry) {
      console.log('展示注册界面！！！！！！！！！！！！！！！！！！！！！')
      reportEvent('ClickRegister', {})
      reportEvent(AnalyticsEventType.CLICK_LOGIN, {
        custom_data: {
          currency: 'USD',
          value: 1,
          trigger_point: 2
        },
      })
      sendEvent('show_sign_up', { entry })
    }
  }

  const toggleLoginDialog = (forceOpen: any, entry?: EventEntry) => {
    setType(DialogType.LOGIN)
    toggleOpen(forceOpen)
    if (entry) {
      sendEvent('show_login', { entry })
      let location = 0
      switch (entry) {
        case EventEntry.HeaderLoginButton:
          location = 1
          break
        case EventEntry.LoginPositionTryFree:
        case EventEntry.HeaderTryForFreeButton:
          location = 2
          break
        case EventEntry.LoginPositionGetFree:
          location = 3
          break
        case EventEntry.GeneralRecommendCTA:
        case EventEntry.DetectorsCTA:
          location = 4
          break
        case EventEntry.LoginPositionPageBottom:
          location = 5
          break
        case EventEntry.LoginPositionDetectorBottom:
          location = 6
          break
      }
      if (location > 0) {
        reportEvent(AnalyticsEventType.CLICK_LOGIN, {
          custom_data: {
            currency: 'USD',
            value: 1,
            trigger_point: location
          },
        })
      }

    }
  }

  const toggleForgotPasswordDialog = (forceOpen: any) => {
    setType(DialogType.FORGOT_PASSWORD)
    toggleOpen(forceOpen)
  }

  const closeDialog = () => {
    setType(DialogType.LOGIN)
    setIsOpen(false)
  }

  return (
    <AuthDialogContext.Provider
      value={{
        type,
        isOpen,
        toggleRichSignupDialog,
        toggleSignupDialog,
        toggleLoginDialog,
        toggleForgotPasswordDialog,
        closeDialog,
      }}
    >
      {children}
    </AuthDialogContext.Provider>
  )
}
