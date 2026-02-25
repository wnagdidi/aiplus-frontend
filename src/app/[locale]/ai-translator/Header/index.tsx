// import { Box } from '@mui/material'
// import Container from '@mui/material/Container'
import MainAppBar from '@/app/[locale]/appBar'
import { getTranslations } from 'next-intl/server'
// 已删除干扰的样式导入
// import './index.scss'
import TabSwitcherClient from './TabSwitcherClient'

// 创建服务端组件
export default async function Header() {
  const t = await getTranslations('TranslationAI')

  return (
    <div
      className="relative overflow-hidden pb-2"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'url(/bg_2.png) no-repeat -10px -1px',
          backgroundSize: 'cover',
        }}
      />
      {/* <img src="/translator/header-banner-1.png" className="test" alt="Header Banner" /> */}
      <MainAppBar isNotBg={true} />
      <div className="pt-6 relative z-20 max-w-full px-4">
        <div className="header-title">
          <h1 className="header-title-text">
            {t('ai_translate_tittle_1')}
          </h1>
          <div className="header-title-icon">
            <img src="/translator/Group 298@2x.png" alt="AI translation free trial" />
          </div>
        </div>
        <TabSwitcherClient />
      </div>
    </div>
  )
}
