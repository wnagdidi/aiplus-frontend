// 中文字符范围: 一个字 汉字、平假名、片假名、罗马字、韩文音节、汉字、数字
// 英文单词范围: [a-zA-Z0-9]+  一个或多个字符组成的单词
const defaultWordsPattern =
  /\b[\u0900-\u097F]+\b|[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u3131-\u318e\u1100-\u11ff]|[a-zA-Z\d.,!?;:'"-]+|\b\w+\b/g
const vietnamesePattern = /[\w\u00C0-\u00FF]+/g

const vietnameseChars = 'àảãáạăằẳẵặâầẫẩậăẵặèẻẹéêềểễệìỉịíòỏọõọôồổỗộộơờởỡợùủụúừửữựữựỳỷỵýđđ'

function isVietnamese(text: string): boolean {
  if (!text) {
    return false
  }
  for (const char of vietnameseChars) {
    if (text.includes(char)) {
      return true
    }
  }
  return false
}

export const wordsCounter = (text: string): number => {
  return extractWords(text)?.length || 0
}

export const extractWords = (text: string): RegExpMatchArray | null => {
  const pattern = isVietnamese(text) ? vietnamesePattern : defaultWordsPattern
  return text.match(pattern)
}

export const wordsPattern = (text: string) => (isVietnamese(text) ? vietnamesePattern : defaultWordsPattern)

export const truncateWords = (text: string, maxWords: number): string => {
  const words = extractWords(text)
  if (!words || words.length <= maxWords) {
    return text
  }
  return words.slice(0, maxWords).join(' ')
}
