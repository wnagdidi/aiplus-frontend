import {useTranslations} from '@/hooks/useTranslations'

export default function MainTitle(props: any) {
  const { routeName } = props
  const t = useTranslations('Home')

  const getTitle = () => {
    const fullpath = !routeName ? 'main_title' : `main_title_${routeName}`;
    return t(fullpath, {}, true)
  }

  return (
    <>
      <h1 className={`text-3xl sm:text-4xl font-bold text-center mb-13`}>
        {getTitle()}
      </h1>
      {/*<h3 className="text-lg text-center text-gray-600">{t('sub_title', {}, true)}</h3>*/}
    </>
  )
}
