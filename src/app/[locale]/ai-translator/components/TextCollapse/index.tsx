'use client'
// import Banner from "@/app/[locale]/home/multilingual-translation/Text/components/Banner"
// import CustomCollapse from "@/app/[locale]/home/multilingual-translation/Text/components/CustomCollapse"
import { useTranslations } from "next-intl"

const TextCollapse = () => {
  const t = useTranslations('TranslationAI')

  return <>
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('translate_bottom_banner_1')}</h2>
            <p className="text-gray-600 mb-6">{t('translate_bottom_banner_2')}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
              {t('translate_bottom_banner_button_1')}
            </button>
          </div>
  </>
}

export default TextCollapse
