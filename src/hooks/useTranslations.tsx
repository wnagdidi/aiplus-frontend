import { useTranslations as useTranslationsIntl, useMessages } from 'next-intl'
import { createTranslations } from '@/hooks/getTranslations'

export const useTranslations = (namespace?: any) => {
  const t = useTranslationsIntl(namespace)
  const messages = useMessages()

  return createTranslations(namespace, t, messages)
}
