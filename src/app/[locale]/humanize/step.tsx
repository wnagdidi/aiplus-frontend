'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import "intro.js/introjs.css";
import styles from "./step.module.css";
import "./step.css"
import dynamic from "next/dynamic";

const Steps = dynamic(() => import("intro.js-react").then((mod: any) => mod.Steps), {
  ssr: false,
});


export default function step(props: any) {
  const t = useTranslations('UsageTips')
const stepList = [
  {
      element: "#trySample",
      title: `${t('title1')}`,
      intro: `${t('content1')}`,
  },
  {
      element: "#humanizeButton",
      title: `${t('title2')}`,
      intro: `${t('content2')}`,
  },
  {
      element: "#drawerButton",
      title: `${t('title3')}`,
      intro: `${t('content3')}`,
  },
];
    const [enabled, setEnabled] = useState(false)
    const [pageHasLoad, setPageHasLoad] = useState(false)
    const [nextStep, setNextStep] = useState(0);
    const [curType, setCurType] = useState("home");
    const [exitWarn, setExitWarn] = useState(true);
    const [hasAnchoredFirst, setHasAnchoredFirst] = useState(false);

    // 等待关键元素可见后再启动向导
    useEffect(() => {
      console.log("等待页面元素准备就绪")
      let tries = 0
      const maxTries = 10 // ~7.5s
      const isVisible = (el: HTMLElement) => {
        const cs = getComputedStyle(el)
        return (
          cs.display !== 'none' &&
          cs.visibility !== 'hidden' &&
          parseFloat(cs.opacity || '1') > 0
        )
      }
      
      const checkAllElements = () => {
        const drawerButton = document.querySelector('#drawerButton') as HTMLElement | null
        const settingIcon = document.querySelector('#settingIcon') as HTMLElement | null
        const trySample = document.querySelector('#trySample') as HTMLElement | null
        
        return drawerButton && settingIcon && trySample
      }
      
      const timer = setInterval(() => {
        tries++
        const first = document.querySelector('#drawerButton') as HTMLElement | null
        if (first && isVisible(first) && checkAllElements()) {
          console.log("所有元素已准备就绪，启动向导")
          let enabled = false
          if(props.isNeedGuide == 1) {
            enabled = true
          }
          setEnabled(enabled)
          setPageHasLoad(true)
          clearInterval(timer)
        } else if (tries >= maxTries) {
          console.log("超时启动向导")
          let enabled = false
          if(props.isNeedGuide == 1) {
            enabled = true
          }
          setEnabled(enabled)
          setPageHasLoad(true)
          clearInterval(timer)
        }
      }, 150)
      return () => clearInterval(timer)
    }, [props.isNeedGuide])

    // 重启页面指引
    const handleRelaod = (e: string) => {
      setCurType(e);
      setExitWarn(false);
      setPageHasLoad(false);
      setTimeout(() => {
        setPageHasLoad(true);
      }, 1000);
    };

    return (
        <Steps
            //@ts-ignore
            enabled={enabled && pageHasLoad}
            steps={stepList}
            initialStep={0}
            options={{
              showProgress: false,
              showBullets: false,
              exitOnOverlayClick: false,
              exitOnEsc: true,
              nextLabel: 'Next',
              prevLabel: 'Back',
              doneLabel: 'Finish',
              skipLabel: '',
              hidePrev: false,
              hideNext: false,
              tooltipPosition: 'bottom',
              showStepNumbers: false,
              keyboardNavigation: true,
              disableInteraction: false,
              // tooltipClass: styles.tooltip,
              // buttonClass: styles.btn,
              // highlightClass: styles.highlight
            }}
            onExit={(e: any) => {
              if (exitWarn) {
                console.log("退出时的操作");
              }
            }}
            onBeforeExit={() => {
              if (exitWarn) {
                // return confirm("提示是否要关闭弹窗");
              }
            }}
            onChange={(params: any) => {
              console.log("onChange 原始参数:", params, "类型:", typeof params);
              let stepIndex: number | undefined = typeof params === 'number'
                ? params
                : (params && typeof (params as any).step === 'number')
                  ? (params as any).step
                  : (params && typeof (params as any).index === 'number')
                    ? (params as any).index
                    : undefined;

              console.log("onChange 提取的步骤索引:", stepIndex);
              if (typeof stepIndex === 'number' && stepIndex >= 0 && stepIndex < stepList.length) {
                setNextStep(stepIndex);
              }
            }}
            onBeforeChange={(params: any) => {
              console.log("onBeforeChange 原始参数:", params, "类型:", typeof params);

              // 首次 undefined：锚定在第1步，避免直接跳到第2步
              if ((params === undefined || params === null)) {
                if (!hasAnchoredFirst) {
                  console.log("onBeforeChange 首次参数缺失，锚定在第1步");
                  setHasAnchoredFirst(true);
                return false;
              }
                // 后续若仍为 undefined，不再阻塞，放行
                return true;
              }

              // 仅处理数字索引，无法解析则放行，避免阻塞“下一步”
              const stepIndex: number | undefined = typeof params === 'number'
                ? params
                : (params && typeof (params as any).step === 'number')
                  ? (params as any).step
                  : (params && typeof (params as any).index === 'number')
                    ? (params as any).index
                    : undefined;

              if (typeof stepIndex !== 'number') return true;

              if (stepIndex < 0 || stepIndex >= stepList.length) return false;

              const selector = stepList[stepIndex]?.element as string | undefined;
              if (!selector) return false;

              const el = document.querySelector(selector);
              return !!el;
            }}
            onStart={() => {
              console.log("向导开始，强制重置到第一步");
              setNextStep(0);
            }}
          />
    )
}
