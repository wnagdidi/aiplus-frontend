import { Lang } from 'language-translate/types';
import { defineConfig } from 'language-translate/utils';

const locales = [
  'es',
  'fr',
  'pt',
  'it',
  'ja',
  'th',
  'pl',
  'ko',
  'de',
  'ru',
  'da',
  'ar',
  'no', // not supported by baidu
  'nl',
  'id', // not supported by baidu
  ['zh-TW', 'tw','zh-hant'],
  ['zh-CN', 'zh','zh-hans'],
  'tr', // not supported by baidu
]

export default defineConfig({
  proxy: {
    host: '127.0.0.1',
    port: 7890,
  },
  fromLang: Lang.en,
  // fromPath: 'src/messages/en.json',
  fromPath: 'src/messages/change.json',
  translateRuntimeMergeEnabled: false,
  translateRuntimeDelay: 500,
  translate: [
    {
      targetConfig: locales.map(locale => ({
        targetLang: Lang[typeof locale === 'object' ? locale[0] : locale],
        outPath: `src/messages/${typeof locale === 'object' ? locale[1] : locale}.json`,
      }))
    }
  ],
  apiKeyConfig: {
    type: 'google',
    baidu: {
      appId: '20240905002142265',
      appKey: '4hAPMtRfKG7eyuirLu6Z'
    }
  }
})
