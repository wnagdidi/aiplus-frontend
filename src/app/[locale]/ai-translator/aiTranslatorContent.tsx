'use client'
import { useTranslations } from 'next-intl'
import { Button } from '@heroui/react'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import { useContext } from 'react'
import { useSession } from 'next-auth/react'
import { EventEntry } from '@/context/GTMContext'

export default function AiTranslatorContent() {
  const t = useTranslations('TranslationAI')
  const { toggleLoginDialog, toggleSignupDialog } = useContext(AuthDialogContext)
  const { data: session } = useSession()

  const onScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onClick = () => {
    if (!session) {
      toggleSignupDialog(true, EventEntry.RichSignupDialog)
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // TextTheEarth 组件
  const TextTheEarth = () => {
    return (
      <>
        <div className="flex justify-center px-6 pb-10 pt-20">
          <div className="flex flex-col lg:flex-row lg:justify-between w-full max-w-7xl gap-5">
            <div className="flex flex-col justify-between w-full lg:w-[55%] lg:max-w-[600px]">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black">
                  <span className="text-[#375375]">{t('product_introduction_tittle_1')}</span>
                  <span className="text-[#3562EC] ml-2">{t('product_introduction_tittle_2')}</span>
                </h2>
                <p className="text-[#375375] text-sm md:text-base leading-5 font-normal mt-5">
                  {t('product_introduction_tittle_3')}
                </p>
              </div>

              <ul className="bg-[#F4F5F9] rounded-2xl p-4 md:p-6 lg:p-7 mt-8">
                <li className="flex gap-4">
                  <div className="w-6 h-6 flex-shrink-0">
                    <img src="/translator/Frame 1027@2x.png" alt="" className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[#3562EC] text-sm md:text-base font-medium mb-2">{t('product_introduction_content_1')}</h3>
                    <p className="text-[#375375] text-sm md:text-base leading-5 font-normal">{t('product_introduction_content_2')}</p>
                  </div>
                </li>

                <li className="flex gap-4 my-5">
                  <div className="w-6 h-6 flex-shrink-0">
                    <img src="/translator/Frame 1027@2x.png" alt="" className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[#3562EC] text-sm md:text-base font-medium mb-2">{t('product_introduction_content_3')}</h3>
                    <p className="text-[#375375] text-sm md:text-base leading-5 font-normal">{t('product_introduction_content_4')}</p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="w-6 h-6 flex-shrink-0">
                    <img src="/translator/Frame 1027@2x.png" alt="" className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[#3562EC] text-sm md:text-base font-medium mb-2">{t('product_introduction_content_5')}</h3>
                    <p className="text-[#375375] text-sm md:text-base leading-5 font-normal">{t('product_introduction_content_6')}</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex mt-5 justify-center items-center bg-[#EDF4FF] rounded-2xl w-full lg:w-[45%] lg:max-w-[500px] h-[300px] md:h-[400px] lg:h-[450px]">
              <img src="/translator/text/Frame 183@2x.png" alt="AI translator" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        <div className="flex justify-center px-4">
          <Button
            onClick={onScrollTop}
            className="bg-primary text-white px-8 py-3 hover:bg-primary-600 transition-colors"
            size="lg"
          >
            {t('product_introduction_button_1')}
          </Button>
        </div>
      </>
    )
  }

  // TextCustomer 组件
  const TextCustomer = () => {
    return (
      <div className="flex justify-center px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:justify-between w-full max-w-7xl gap-8 lg:gap-12">
          <div className="flex-shrink-0 w-full lg:w-[45%] lg:max-w-[500px] h-[250px] md:h-[300px] lg:h-[360px]">
            <img src="/translator/text/Frame 183@2x copy.png" alt="accurate Al translation" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center w-full lg:w-[55%] lg:max-w-[600px]">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#3562EC]">
              {t('product_introduction_tittle_4')}
            </h2>
            <p className="text-[#375375] text-sm md:text-base font-normal leading-5 mt-5">
              {t('product_introduction_tittle_5')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // TextSwiper 组件
  const TextSwiper = () => {
    return (
      <div className="pt-10 px-6 bg-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('crowd_introduction_1')}
            <span className="text-primary ml-2">{t('crowd_introduction_2')}</span>
          </h2>
        </div>
      </div>
    )
  }

  // TextQuantity 组件
  const TextQuantity = () => {
    return (
      <div className="flex justify-center px-6 py-10">
        <ul className="grid grid-cols-2 lg:flex lg:justify-between w-full max-w-7xl gap-4 lg:gap-6">
          <li className="flex flex-col items-center justify-center w-full lg:w-[22%]">
            <div className="text-[#3562EC] text-4xl md:text-5xl lg:text-6xl font-black leading-tight">110+</div>
            <div className="w-full flex justify-center relative">
              <h3 className="text-[#375375] text-lg md:text-xl lg:text-2xl font-medium leading-8">{t('data_display_1')}</h3>
            </div>
            <p className="text-center mt-4 lg:mt-6 text-[#375375] text-xs md:text-sm font-normal leading-5">{t('data_display_content_1')}</p>
          </li>

          <li className="flex flex-col items-center justify-center w-full lg:w-[22%]">
            <div className="text-[#3562EC] text-4xl md:text-5xl lg:text-6xl font-black leading-tight">50+</div>
            <div className="w-full flex justify-center relative">
              <h3 className="text-[#375375] text-lg md:text-xl lg:text-2xl font-medium leading-8">{t('data_display_2')}</h3>
            </div>
            <p className="text-center mt-4 lg:mt-6 text-[#375375] text-xs md:text-sm font-normal leading-5" dangerouslySetInnerHTML={{ __html: t('data_display_content_2') }}></p>
          </li>

          <li className="flex flex-col items-center justify-center w-full lg:w-[22%]">
            <div className="text-[#3562EC] text-4xl md:text-5xl lg:text-6xl font-black leading-tight">78%</div>
            <div className="w-full flex justify-center relative">
              <h3 className="text-[#375375] text-lg md:text-xl lg:text-2xl font-medium leading-8">{t('data_display_3')}</h3>
            </div>
            <p className="text-center mt-4 lg:mt-6 text-[#375375] text-xs md:text-sm font-normal leading-5">{t('data_display_content_3')}</p>
          </li>

          <li className="flex flex-col items-center justify-center w-full lg:w-[22%]">
            <div className="text-[#3562EC] text-4xl md:text-5xl lg:text-6xl font-black leading-tight">85%</div>
            <div className="w-full flex justify-center relative">
              <h3 className="text-[#375375] text-lg md:text-xl lg:text-2xl font-medium leading-8">{t('data_display_4')}</h3>
            </div>
            <p className="text-center mt-4 lg:mt-6 text-[#375375] text-xs md:text-sm font-normal leading-5">{t('data_display_content_4')}</p>
          </li>
        </ul>
      </div>
    )
  }

  // TextStepArrow 组件
  const TextStepArrow = () => {
    return (
      <div className="py-10 px-6 bg-[#F4F5F9]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 md:mb-12">
            <span className="text-[#375375]">{t('how_to_1')}</span>
            <span className="text-[#3562EC] ml-2">{t('how_to_2')}</span>
          </h2>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 w-full lg:w-[280px] h-[160px] flex flex-col justify-start text-left">
              <h3 className="text-[#375375] text-lg font-semibold mb-3 text-center">{t('how_to_3')}</h3>
              <p className="text-[#375375] text-sm leading-5 flex-1">
                {t('how_to_6')}
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden lg:block">
              <img src="/translator/text/icon@2x.png" alt="arrow" className="w-8 h-8" />
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 w-full lg:w-[280px] h-[160px] flex flex-col justify-start text-left">
              <h3 className="text-[#375375] text-lg font-semibold mb-3 text-center">{t('how_to_4')}</h3>
              <p className="text-[#375375] text-sm leading-5 flex-1">
                {t('how_to_7')}
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden lg:block">
              <img src="/translator/text/icon@2x.png" alt="arrow" className="w-8 h-8" />
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 w-full lg:w-[280px] h-[160px] flex flex-col justify-start text-left">
              <h3 className="text-[#375375] text-lg font-semibold mb-3 text-center">{t('how_to_5')}</h3>
              <p className="text-[#375375] text-sm leading-5 flex-1">
                {t('how_to_8')}
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8 md:mt-12">
            <Button
              onClick={onScrollTop}
              className="bg-primary text-white px-6 md:px-8 py-2 md:py-3 hover:bg-primary-600 transition-colors"
              size="lg"
            >
              {t('how_to_button_1')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // TextTitle 组件
  const TextTitle = () => {
    return (
      <div className="pt-10 px-6 bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            {t('product_introduction_tittle_6')}
            <span className="text-primary ml-2">{t('product_introduction_tittle_7')}</span>
          </h2>
        </div>
      </div>
    )
  }

  // TextAiRobot 组件
  const TextAiRobot = () => {
    return (
      <div className="py-10 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img src="/translator/text/Frame 183@2x copy.png" alt="accurate Al translation" className="w-full h-auto" />
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
                {t('value_point_introduction_1')} <span className="text-primary">{t('value_point_introduction_1_2')}</span>
              </h3>
              <p className="text-lg text-default-500 leading-relaxed">
                {t('value_point_introduction_3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TextCloud 组件
  const TextCloud = () => {
    return (
      <div className="py-10 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
                {t('value_point_introduction_2')} <span className="text-primary">{t('value_point_introduction_2_1')}</span>
              </h3>
              <p className="text-lg text-default-500 mb-6 md:mb-8 leading-relaxed">
                {t('value_point_introduction_4')}
              </p>
              <Button
                onClick={onScrollTop}
                className="bg-primary text-white px-6 md:px-8 py-2 md:py-3 hover:bg-primary-600 transition-colors"
                size="lg"
              >
                {t('value_point_introduction_button_1')}
              </Button>
            </div>
            <div className="order-1 lg:order-2">
              <img src="/translator/text/Frame 183.png" alt="humanized AI Translation" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TextAccess 组件
  const TextAccess = () => {
    return (
      <div className="py-10 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <img src="/translator/text/Frame 1046@2x.png" alt="online Al Translator" className="w-full h-auto" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
                {t('value_point_introduction_5')}<span className="text-primary">{t('value_point_introduction_6')}</span>
              </h3>
              <p className="text-lg text-default-500 leading-relaxed">
                {t('value_point_introduction_6_1')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TextMoreLanguage 组件
  const TextMoreLanguage = () => {
    const list = [
      { label: t("language_pairs_1") },
      { label: t("language_pairs_2") },
      { label: t("language_pairs_3") },
      { label: t("language_pairs_4") },
      { label: t("language_pairs_5") },
      { label: t("language_pairs_6") },
      { label: t("language_pairs_7") },
      { label: t("language_pairs_8") },
      { label: t("language_pairs_9") },
      { label: t("language_pairs_10") },
      { label: t("language_pairs_11") },
      { label: t("language_pairs_12") },
      { label: t("language_pairs_13") },
      { label: t("language_pairs_14") },
      { label: t("language_pairs_15") },
      { label: t("language_pairs_16") },
      { label: t("language_pairs_17") },
      { label: t("language_pairs_18") },
      { label: t("language_pairs_19") },
      { label: t("language_pairs_20") },
      { label: t("language_pairs_21") },
      { label: t("language_pairs_22") },
      { label: t("language_pairs_23") },
      { label: t("language_pairs_24") },
      { label: t("language_pairs_25") },
      { label: t("language_pairs_26") },
      { label: t("language_pairs_27") },
      { label: t("language_pairs_28") },
      { label: t("language_pairs_29") },
      { label: t("language_pairs_30") },
      { label: t("language_pairs_31") },
      { label: t("language_pairs_32") },
      { label: t("language_pairs_33") },
      { label: t("language_pairs_34") },
      { label: t("language_pairs_35") },
      { label: t("language_pairs_36") },
      { label: t("language_pairs_37") },
      { label: t("language_pairs_38") },
      { label: t("language_pairs_39") },
      { label: t("language_pairs_40") },
    ]

    return (
      <div className="flex justify-center px-6 py-10">
        <div className="w-full max-w-7xl lg:w-[1440px]">
          <h2 className="text-[#375375] text-3xl md:text-4xl font-black text-center mb-8 md:mb-12 lg:mb-15">
            {t('value_point_introduction_7')}<span className="text-[#3562EC]">{t('value_point_introduction_7_1')}</span>{t('value_point_introduction_7_2')}
          </h2>
          
          <div className="bg-[#FAFBFD] rounded-2xl p-4">
            <ul className="flex flex-wrap gap-x-6 gap-y-5">
              {list.map((item, index) => (
                <li 
                  key={index} 
                  className="cursor-pointer w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[268px] text-[#375375] text-sm font-normal leading-5"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // TextCollapse 组件
  const TextCollapse = () => {
    return (
      <div 
        className="flex items-center justify-center cursor-pointer h-[400px] md:h-[450px] lg:h-[521px] bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: 'url(/translator/text/background@2x.png)',
          backgroundSize: 'cover'
        }}
        onClick={onClick}
      >
        <div className="flex flex-col justify-center items-center w-full max-w-4xl lg:w-[873px] px-4">
          <h2 className="text-center text-[#507AF6] text-3xl md:text-4xl lg:text-5xl font-black">
            {t('translate_bottom_banner_1')}
          </h2>
          
          <p className="w-full max-w-3xl lg:w-[765px] text-white text-sm font-normal mt-3 md:mt-4 lg:mt-3 mb-12 md:mb-16 lg:mb-20 text-center">
            {t('translate_bottom_banner_2')}
          </p>
          
          <div 
            className="flex items-center gap-2 px-8 md:px-10 lg:px-12 h-10 md:h-11 lg:h-12"
            style={{
              background: 'linear-gradient(90deg, #5AE6FF 0%, #3750E1 100%)',
              borderTopLeftRadius: '40px',
              borderTopRightRadius: '10px',
              borderBottomLeftRadius: '10px',
              borderBottomRightRadius: '40px'
            }}
          >
            <span className="font-medium text-base text-white">
              {t('translate_bottom_banner_button_1')}
            </span>
            <img src="/translator/text/Frame 199@2x.png" alt="" className="w-3 md:w-3.5 lg:w-3.5" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <TextTheEarth />
      <TextCustomer />
      <TextSwiper />
      <TextQuantity />
      <TextStepArrow />
      <TextTitle />
      <TextAiRobot />
      <TextCloud />
      <TextAccess />
      <TextMoreLanguage />
      <TextCollapse />
    </>
  )
}
