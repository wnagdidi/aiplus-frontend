export type LanguageOption = {
  label: string
  value: string
}
export type LanguagesType = {
  groupName: string
  groupList: LanguageOption[]
}

export const MAX_COUNT = 1500 // 最大字数限制

export const MIN_COUNT = 1

export const languageList: LanguagesType[] = [
  {
    groupName: 'A',
    groupList: [
      { label: 'Afrikaans', value: 'af' },
      { label: 'Albanian', value: 'sq' },
      { label: 'Amharic', value: 'am' },
      { label: 'Arabic', value: 'ar' },
      { label: 'Armenian', value: 'hy' },
      { label: 'Azerbaijani', value: 'az' },
    ],
  },
  {
    groupName: 'B',
    groupList: [
      { label: 'Basque', value: 'eu' },
      { label: 'Belarusian', value: 'be' },
      { label: 'Bengali', value: 'bn' },
      { label: 'Bosnian', value: 'bs' },
      { label: 'Bulgarian', value: 'bg' },
      { label: 'Burmese', value: 'my' },
    ],
  },
  {
    groupName: 'C',
    groupList: [
      { label: 'Catalan', value: 'ca' },
      { label: 'Cebuano', value: 'ceb' },
      { label: 'Chichewa', value: 'ny' },
      { label: 'Corsican', value: 'co' },
      { label: 'Croatian', value: 'hr' },
      { label: 'Czech', value: 'cs' },
    ],
  },
  {
    groupName: 'D',
    groupList: [
      { label: 'Danish', value: 'da' },
      { label: 'Dutch', value: 'nl' },
    ],
  },
  {
    groupName: 'E',
    groupList: [
      { label: 'English', value: 'en' },
      { label: 'Esperanto', value: 'eo' },
      { label: 'Estonian', value: 'et' },
    ],
  },
  {
    groupName: 'F',
    groupList: [
      { label: 'Filipino (Tagalog)', value: 'tl' },
      { label: 'Finnish', value: 'fi' },
      { label: 'French', value: 'fr' },
      { label: 'Frisian', value: 'fy' },
    ],
  },
  {
    groupName: 'G',
    groupList: [
      { label: 'Galician', value: 'gl' },
      { label: 'Georgian', value: 'ka' },
      { label: 'German', value: 'de' },
      { label: 'Greek', value: 'el' },
      { label: 'Gujarati', value: 'gu' },
    ],
  },
  {
    groupName: 'H',
    groupList: [
      { label: 'Haitian Creole', value: 'ht' },
      { label: 'Hausa', value: 'ha' },
      { label: 'Hawaiian', value: 'haw' },
      { label: 'Hebrew', value: 'he' },
      { label: 'Hindi', value: 'hi' },
      { label: 'Hmong', value: 'hmn' },
      { label: 'Hungarian', value: 'hu' },
    ],
  },
  {
    groupName: 'I',
    groupList: [
      { label: 'Icelandic', value: 'is' },
      { label: 'Igbo', value: 'ig' },
      { label: 'Indonesian', value: 'id' },
      { label: 'Irish', value: 'ga' },
      { label: 'Italian', value: 'it' },
    ],
  },
  {
    groupName: 'J',
    groupList: [
      { label: 'Japanese', value: 'ja' },
      { label: 'Javanese', value: 'jv' },
    ],
  },
  {
    groupName: 'K',
    groupList: [
      { label: 'Kannada', value: 'kn' },
      { label: 'Kazakh', value: 'kk' },
      { label: 'Khmer', value: 'km' },
      { label: 'Kinyarwanda', value: 'rw' },
      { label: 'Korean', value: 'ko' },
      { label: 'Kurdish (Kurmanji)', value: 'ku' },
      { label: 'Kyrgyz', value: 'ky' },
    ],
  },
  {
    groupName: 'L',
    groupList: [
      { label: 'Lao', value: 'lo' },
      { label: 'Latin', value: 'la' },
      { label: 'Latvian', value: 'lv' },
      { label: 'Lithuanian', value: 'lt' },
      { label: 'Luxembourgish', value: 'lb' },
    ],
  },
  {
    groupName: 'M',
    groupList: [
      { label: 'Macedonian', value: 'mk' },
      { label: 'Malagasy', value: 'mg' },
      { label: 'Malay', value: 'ms' },
      { label: 'Malayalam', value: 'ml' },
      { label: 'Maltese', value: 'mt' },
      { label: 'Maori', value: 'mi' },
      { label: 'Marathi', value: 'mr' },
      { label: 'Mongolian', value: 'mn' },
    ],
  },
  {
    groupName: 'N',
    groupList: [
      { label: 'Nepali', value: 'ne' },
      { label: 'Norwegian', value: 'no' },
    ],
  },
  {
    groupName: 'O',
    groupList: [{ label: 'Odia (Oriya)', value: 'or' }],
  },
  {
    groupName: 'P',
    groupList: [
      { label: 'Pashto', value: 'ps' },
      { label: 'Persian (Farsi)', value: 'fa' },
      { label: 'Polish', value: 'pl' },
      { label: 'Portuguese (Portugal)', value: 'pt-PT' },
      { label: 'Portuguese (Brazil)', value: 'pt-BR' },
      { label: 'Punjabi', value: 'pa' },
    ],
  },
  {
    groupName: 'R',
    groupList: [
      { label: 'Romanian', value: 'ro' },
      { label: 'Russian', value: 'ru' },
    ],
  },
  {
    groupName: 'S',
    groupList: [
      { label: 'Samoan', value: 'sm' },
      { label: 'Scots Gaelic', value: 'gd' },
      { label: 'Serbian', value: 'sr' },
      { label: 'Sesotho', value: 'st' },
      { label: 'Shona', value: 'sn' },
      { label: 'Sindhi', value: 'sd' },
      { label: 'Sinhala', value: 'si' },
      { label: 'Slovak', value: 'sk' },
      { label: 'Slovenian', value: 'sl' },
      { label: 'Somali', value: 'so' },
      { label: 'Spanish', value: 'es' },
      { label: 'Sundanese', value: 'su' },
      { label: 'Swahili', value: 'sw' },
      { label: 'Swedish', value: 'sv' },
      { label: 'Simplified Chinese', value: 'zh-CN' },
    ],
  },
  {
    groupName: 'T',
    groupList: [
      { label: 'Tajik', value: 'tg' },
      { label: 'Tamil', value: 'ta' },
      { label: 'Tatar', value: 'tt' },
      { label: 'Telugu', value: 'te' },
      { label: 'Thai', value: 'th' },
      { label: 'Traditional Chinese', value: 'zh-TW' },
      { label: 'Turkish', value: 'tr' },
      { label: 'Turkmen', value: 'tk' },
    ],
  },
  {
    groupName: 'U',
    groupList: [
      { label: 'Ukrainian', value: 'uk' },
      { label: 'Urdu', value: 'ur' },
      { label: 'Uyghur', value: 'ug' },
      { label: 'Uzbek', value: 'uz' },
    ],
  },
  {
    groupName: 'V',
    groupList: [{ label: 'Vietnamese', value: 'vi' }],
  },
  {
    groupName: 'W',
    groupList: [{ label: 'Welsh', value: 'cy' }],
  },
  {
    groupName: 'X',
    groupList: [{ label: 'Xhosa', value: 'xh' }],
  },
  {
    groupName: 'Y',
    groupList: [
      { label: 'Yiddish', value: 'yi' },
      { label: 'Yoruba', value: 'yo' },
    ],
  },
  {
    groupName: 'Z',
    groupList: [{ label: 'Zulu', value: 'zu' }],
  },
]

export const truncateMultilaneText = (text: string[], maxUnits = 300) => {
  const chars = [...text]
  const result = []
  let count = 0

  for (let i = 0; i < chars.length && count < maxUnits; i++) {
    const ch = chars[i]

    // 跳过空白或标点，不计入单位
    if (/\s/.test(ch) || /[.,!?，。！？、：；""''"'()【】[\]{}《》<>]/.test(ch)) {
      result.push(ch)
      continue
    }

    // 英文单词（包括数字）按一个单位计
    if (/[a-zA-Z0-9]/.test(ch)) {
      let word = ch
      while (i + 1 < chars.length && /[a-zA-Z0-9]/.test(chars[i + 1])) {
        word += chars[++i]
      }
      result.push(word)
      count++
    }
    // 其他语言字符（中日韩阿拉伯）每个字符算一个单位
    else {
      result.push(ch)
      count++
    }
  }

  return { limitedText: result.join(''), unitUsed: count }
}

// 映射表: 将 franc 返回的 ISO 639-3 语言代码 映射到你自定义的语言签名
export const francToLanguageValueMap = {
  afr: 'af',
  am: 'am',
  ara: 'ar',
  aze: 'az',
  bel: 'be',
  ben: 'bn',
  bos: 'bs',
  bul: 'bg',
  cat: 'ca',
  ceb: 'ceb',
  ces: 'cs',
  cmn: 'zh-CN',
  cos: 'co',
  cym: 'cy',
  dan: 'da',
  deu: 'de',
  ell: 'el',
  eng: 'en',
  epo: 'eo',
  est: 'et',
  eus: 'eu',
  fas: 'fa',
  fin: 'fi',
  fra: 'fr',
  fry: 'fy',
  gla: 'gd',
  gle: 'ga',
  glg: 'gl',
  guj: 'gu',
  hat: 'ht',
  hau: 'ha',
  haw: 'haw',
  heb: 'he',
  hin: 'hi',
  hmn: 'hmn',
  hrv: 'hr',
  hun: 'hu',
  hye: 'hy',
  ibo: 'ig',
  ind: 'id',
  isl: 'is',
  ita: 'it',
  jav: 'jv',
  jpn: 'ja',
  kan: 'kn',
  kat: 'ka',
  kaz: 'kk',
  khm: 'km',
  kin: 'rw',
  kir: 'ky',
  kor: 'ko',
  kur: 'ku',
  lao: 'lo',
  lat: 'la',
  lav: 'lv',
  lit: 'lt',
  ltz: 'lb',
  mal: 'ml',
  mar: 'mr',
  mkd: 'mk',
  mlg: 'mg',
  mlt: 'mt',
  mon: 'mn',
  mri: 'mi',
  msa: 'ms',
  mya: 'my',
  nep: 'ne',
  nld: 'nl',
  nob: 'no',
  nya: 'ny',
  ori: 'or',
  pan: 'pa',
  pol: 'pl',
  por: 'pt-BR',
  pus: 'ps',
  ron: 'ro',
  rus: 'ru',
  sin: 'si',
  slk: 'sk',
  slv: 'sl',
  smo: 'sm',
  sna: 'sn',
  snd: 'sd',
  som: 'so',
  sot: 'st',
  spa: 'es',
  sqi: 'sq',
  srp: 'sr',
  sun: 'su',
  swa: 'sw',
  swe: 'sv',
  tam: 'ta',
  tat: 'tt',
  tel: 'te',
  tgk: 'tg',
  tgl: 'tl',
  tha: 'th',
  tuk: 'tk',
  tur: 'tr',
  uig: 'ug',
  ukr: 'uk',
  urd: 'ur',
  uzb: 'uz',
  vie: 'vi',
  xho: 'xh',
  yid: 'yi',
  yor: 'yo',
  zho: 'zh-TW',
  zul: 'zu',
}

export const findLabelByValue = (value: string): LanguageOption | undefined => {
  for (const group of languageList) {
    for (const language of group.groupList) {
      if (language.value === value) {
        return language
      }
    }
  }
  return undefined
}
