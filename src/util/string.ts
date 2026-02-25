const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email: string) => EMAIL_PATTERN.test(email)

export const trimLowerCase = (text?: any) => text?.trim()?.toLowerCase()

export const toHeadingId = (text: string) => {
  return trimLowerCase(text)?.replace(/\s+/g, '-');
}
