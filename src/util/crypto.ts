import CryptoJS from 'crypto-js'

export const sha256 = (content: string) => {
  return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex)
}

export const md5 = (content?: string) => {
  return CryptoJS.MD5(content || '').toString()
}

export const md5Normalize = (content?: string) => {
  return md5(content?.trim()?.toLowerCase())
}

export const tHash = (t: (k: string) => string, value: string) => {
  const hash = md5Normalize(value)
  const result = t(hash)
  return result.includes(hash) ? value : result
}
