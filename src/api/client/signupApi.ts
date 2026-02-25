import { ApiResult } from '@/api/core/common'
import clientApiClient from '@/api/client/clientApiClient'

export const checkEmailExistence = async (email: string): Promise<boolean> => {
  const response = await clientApiClient.get<ApiResult<boolean>>(`/users/email/exists?email=${email}`)
  return response.data.data!
}

interface EmailRequest {
  email: string
}

interface RecaptchaRequest {
}

interface SendVerificationCodeRequest extends EmailRequest, RecaptchaRequest {}
export const sendVerificationCode = async (request: SendVerificationCodeRequest): Promise<string> => {
  const response = await clientApiClient.post<ApiResult<string>>('/users/register/verification-code', request)
  return response.data.data!
}

interface VerifyCodeRequest extends EmailRequest {
  verificationCode: string
}
export const verifyCode = async (request: VerifyCodeRequest): Promise<string> => {
  const response = await clientApiClient.post<ApiResult<string>>('/users/register/verify-code', request)
  return response.data!
}

interface SignupUpRequest extends EmailRequest {
  firstName: string
  lastName: string
  password: string
  token: string
}
export const signup = async (request: SignupUpRequest): Promise<string> => {
  const response = await clientApiClient.post<ApiResult<string>>('/users/register', request)
  return response.data.data!
}

export const getGoogleOauthUrl = async (): Promise<string> => {
  const response = await clientApiClient.get<ApiResult<string>>(`/users/google/oauth2/url`)
  return response.data.data!
}

interface ForgotPasswordRequest extends EmailRequest, RecaptchaRequest {}
export const forgotPassword = async (request: ForgotPasswordRequest): Promise<void> => {
  const response = await clientApiClient.post<ApiResult<void>>(`/users/password/reset-request`, request)
  return response.data.data!
}

interface ResetPasswordRequest {
  email: string
  newPassword: string
  token: string
}
export const resetPassword = async (request: ResetPasswordRequest): Promise<void> => {
  const response = await clientApiClient.post<ApiResult<void>>(`/users/password/reset`, request)
  return response.data.data!
}

export const sendBindEmailVerificationCode = async (request: EmailRequest): Promise<string> => {
  const response = await clientApiClient.post<ApiResult<string>>('/users/bind-email/verification-code', request)
  return response.data.data!
}

interface VerifyBindEmailCodeRequest extends EmailRequest {
  verificationCode: string
}
export const verifyBindEmailCode = async (request: VerifyBindEmailCodeRequest): Promise<string> => {
  const response = await clientApiClient.post<ApiResult<string>>('/users//bind-email/verify-code', request)
  return response.data.data!
}
