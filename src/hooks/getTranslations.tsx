import { getTranslations as getTranslationsIntl, getMessages } from 'next-intl/server'
import get from 'lodash/get'

export const getGlobalVariables = () => ({
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
})

export const createTranslations = (namespace: string, t: any, messages: any) => {
  return (key: any, params = {}, rebrand?: boolean) => {
    const values = { ...getGlobalVariables(), ...params }
    if (rebrand) {
      const brandKey = `${key}.${process.env.NEXT_PUBLIC_BRAND_NAME}`
      const brandKeyWithNamespace = `${namespace ? namespace + '.' : ''}${brandKey}`
      const defaultKey = `${key}.default`
      return t(get(messages, brandKeyWithNamespace) ? brandKey : defaultKey, values)
    } else {
      return t(key, values)
    }
  }
}

export const getTranslations = async (namespace?: any) => {
  const t = await getTranslationsIntl(namespace)
  const messages = await getMessages()

  return createTranslations(namespace, t, messages)
}
