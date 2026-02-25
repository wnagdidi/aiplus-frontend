'use client'  // 声明这是一个客户端组件

// 导入必要的依赖
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Plan } from '@/api/core/billing'  // 定价计划类型
import { getPlans } from '@/api/client/billingApi'  // 获取定价计划的API
import { useSnackbar } from '@/context/SnackbarContext'  // 提示消息上下文
import CoreApiError from '@/api/core/coreApiError'  // 核心API错误类型
import {useTranslations} from '@/hooks/useTranslations'  // 国际化hook
import { useSession } from 'next-auth/react'  // 会话管理
import { AuthDialogContext } from '@/context/AuthDialogContext'  // 认证对话框上下文
import { EventEntry, useGTM } from '@/context/GTMContext'  // GTM事件追踪

// 创建定价对话框上下文
// 定义了管理定价对话框状态和行为的接口
export const PricingDialogContext = createContext({
  isOpen: false,  // 对话框是否打开
  openDialog: (entry: EventEntry) => {},  // 打开对话框的方法，接收事件入口参数
  openDialogWithPlanToBuy: (plan: Plan, isCanBuy?: boolean) => {},  // 打开对话框并设置要购买的计划
  openDialogIfLogged: (entry: EventEntry) => {},  // 仅在用户登录时打开对话框
  closeDialog: () => {},  // 关闭对话框
  plans: undefined as Plan[] | undefined,  // 可用的定价计划列表
  planToBuy: undefined as Plan | undefined,  // 当前选择要购买的计划
  planToBuyCanBuy: undefined as boolean | undefined,  // 当前计划是否可以购买
  setPlanToBuy: (plan?: Plan, isCanBuy?: boolean) => {},  // 设置要购买的计划
  lastOpenEntry: undefined as EventEntry | undefined, // 最近一次打开来源
})

// 定价对话框上下文提供者组件
export const PricingDialogProvider = ({ children }: any) => {
  // Hooks
  const tError = useTranslations('Error')  // 错误信息国际化
  const [isOpen, setIsOpen] = useState(false)  // 对话框开关状态
  const [planToBuy, setPlanToBuy] = useState<Plan>()  // 要购买的计划状态
  const [planToBuyCanBuy, setPlanToBuyCanBuy] = useState<boolean>()  // 计划是否可以购买
  const [plans, setPlans] = useState<Plan[]>()  // 所有可用计划列表
  const [lastOpenEntry, setLastOpenEntry] = useState<EventEntry | undefined>(undefined) // 记录最近一次打开来源
  const [pendingPlanAfterLogin, setPendingPlanAfterLogin] = useState<{plan: Plan, isCanBuy?: boolean} | null>(null) // 登录后待处理的计划
  const { showSnackbar } = useSnackbar()  // 提示消息控制
  const { data: session } = useSession()  // 用户会话信息
  const { toggleLoginDialog, toggleSignupDialog } = useContext(AuthDialogContext)  // 登录对话框控制
  const { sendEvent } = useGTM()  // GTM事件发送器

  // 打开定价对话框
  // 如果提供了事件入口，会触发购物车事件
  const openDialog = (entry: EventEntry) => {
    console.log('open price dialog:')
    console.log(entry)
    if (isOpen) {
      return  // 如果已经打开则不重复操作
    }
    setPlanToBuy(undefined)  // 重置选择的计划
    setIsOpen(true)  // 打开对话框
    setLastOpenEntry(entry) // 记录来源
    // 只有当不是定时任务触发时才发送事件
    let location = 0
    if (entry) {
      if (entry === EventEntry.HumanizeExceedWordLimitPerRequestUpgradeButton) {
        location = 2
      }else if (entry === EventEntry.HumanizeMonthlyUsageGetMoreButton) {
        location = 3
      }else if (entry === EventEntry.DetectorsCTA) { // 检测工具底部
        location = 7
      }else if (entry === EventEntry.RecommendPricingTimer) { // 页面底部
        location = 5
      }else if (entry === EventEntry.GeneralRecommendCTA) { // 页面底部
        location = 4
      }else if (planToBuy) { // 价格模块
        location = 8
      }
      const planId = plans?.map((item) => item.id)
      const planName = plans?.map((item) => item.name)
      // 发送添加到购物车事件，使用计划的价格
      sendEvent('add_to_cart', {
        custom_data: {
          value: planToBuy?.totalPrice || 1, // 使用选中计划的价格，如果没有则默认为1
          // location: location
        }
      })
    }
  }

  // 打开对话框并设置要购买的计划
  const openDialogWithPlanToBuy = (plan: Plan, isCanBuy?: boolean) => {
    console.log('PricingDialogContext openDialogWithPlanToBuy called with plan:', plan, 'isCanBuy:', isCanBuy)
    
    // 如果用户未登录，先打开注册弹窗，不打开定价弹窗
    if (!session) {
      console.log('User not logged in, opening signup dialog instead')
      // 保存计划信息，登录成功后可以继续购买流程
      setPendingPlanAfterLogin({ plan, isCanBuy })
      // 不打开定价弹窗，而是打开注册弹窗
      toggleSignupDialog(null, EventEntry.PricingDialog)
      return
    }
    
    // 用户已登录，正常打开定价弹窗
    // 批量更新状态，避免中间状态导致的闪烁
    setPlanToBuy(plan)
    setPlanToBuyCanBuy(isCanBuy)
    setIsOpen(true)
    console.log('PricingDialogContext setPlanToBuyCanBuy:', isCanBuy)
  }

  // 仅在用户已登录时打开对话框
  // 如果未登录，则打开登录对话框
  const openDialogIfLogged = (entry: EventEntry) => {
    if (session) {
      openDialog(entry)
    } else {
      if (!entry) {
        localStorage.setItem('loginPosition', "7");
      }
      toggleSignupDialog(null, entry)
    }
  }

  // 关闭对话框
  const closeDialog = () => {
    setIsOpen(false)
    setPlanToBuy(undefined)
    setPlanToBuyCanBuy(undefined)
    setLastOpenEntry(undefined)
  }

  // 在组件挂载时获取定价计划列表
  useEffect(() => {
    if (plans) {
      return  // 如果已有计划数据则不重复获取
    }
    getPlans()
      .then(setPlans)  // 成功获取后设置计划列表
      .catch((e) => {
        // 错误处理
        if (e instanceof CoreApiError) {
          // 处理核心API错误
          showSnackbar(tError(e.code, e.context()), 'error')
        } else {
          // 处理其他错误
          showSnackbar(e.message, 'error')
        }
      })
  }, [plans])  // 仅在plans变化时重新获取

  // 调试：监听 planToBuyCanBuy 变化
  useEffect(() => {
    console.log('PricingDialogContext planToBuyCanBuy changed:', planToBuyCanBuy)
  }, [planToBuyCanBuy])

  // 监听登录状态变化，登录成功后处理待购买的计划
  useEffect(() => {
    if (session && pendingPlanAfterLogin) {
      console.log('User logged in, opening pricing dialog with pending plan:', pendingPlanAfterLogin)
      // 用户已登录且有待处理的计划，打开定价弹窗
      const { plan, isCanBuy } = pendingPlanAfterLogin
      setPlanToBuy(plan)
      setPlanToBuyCanBuy(isCanBuy)
      setIsOpen(true)
      // 清除待处理的计划
      setPendingPlanAfterLogin(null)
    }
  }, [session, pendingPlanAfterLogin])

  // 提供上下文值给子组件
  console.log('PricingDialogContext.Provider value:', { isOpen, planToBuy, planToBuyCanBuy })
  return (
    <PricingDialogContext.Provider
      value={{
        isOpen,
        openDialog,
        openDialogWithPlanToBuy,
        closeDialog,
        openDialogIfLogged,
        plans,
        planToBuy,
        planToBuyCanBuy,
        setPlanToBuy: (plan?: Plan, isCanBuy?: boolean) => {
          setPlanToBuy(plan)
          setPlanToBuyCanBuy(isCanBuy)
        },
        lastOpenEntry,
      }}
    >
      {children}
    </PricingDialogContext.Provider>
  )
}

// 自定义Hook，用于在组件中方便地使用定价对话框上下文
export const usePricingDialog = () => {
  return useContext(PricingDialogContext)
}
