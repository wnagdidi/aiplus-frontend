import MainAppBar from '@/app/[locale]/appBar'
import { getTranslations } from 'next-intl/server'
import AiTranslatorTabSwitcher from './aiTranslatorTabSwitcher'

export default async function AiTranslatorHeader() {
  const t = await getTranslations('TranslationAI')

  return (
    <div 
      className="relative pb-2 overflow-hidden"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: 'var(--ai-translator-bg-image)',
          backgroundSize: 'cover',
          zIndex: 1,
        }}
      />
      
      <MainAppBar isNotBg={true} />
      <div className="relative z-20 pt-37 pb-6 px-6 mx-auto max-w-screen-2xl">
        <div className="flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-center lg:pl-[196px]">
            {t('ai_translate_tittle_1')}
          </h1>
          <div className="hidden lg:block">
            <img src="/translator/Group 298@2x.png" alt="AI translation free trial" className="w-[196px]" />
          </div>
        </div>
        <AiTranslatorTabSwitcher />
      </div>
    </div>
  )
}
