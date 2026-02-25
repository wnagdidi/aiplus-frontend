import { ApiResult } from '@/api/core/common'
import serverApiClient from '@/api/server/serverApiClient'

interface LoginRequest {
  email: string
  password: string
}

export const login = async (request: LoginRequest): Promise<string> => {
  const response = await serverApiClient.post<ApiResult<string>>('/users/email/login', request)
  return response.data.data!
}

interface LoginByGoogleOauthRequest {
  code: string
  auth_code: string
  state: string
  authorization_code: string
  oauth_token: string
  oauth_verifier: string
}
interface LoginResponse {
  token: string
  newUser: boolean
}
export const loginByGoogleOauth = async (request: LoginByGoogleOauthRequest): Promise<LoginResponse> => {
  const query = Object.keys(request)
    .map((key) => `${key}=${request[key] || ''}`)
    .join('&')
  const response = await serverApiClient.get<ApiResult<LoginResponse>>('/users/google/oauth/callback?' + query)
  return response.data.data!
}

interface LoginByGoogleOneTapRequest {
  credential: string
}
export const loginByGoogleOneTap = async (request: LoginByGoogleOneTapRequest): Promise<LoginResponse> => {
  const response = await serverApiClient.post<ApiResult<LoginResponse>>('/users/google/credential/login', request)
  return response.data.data!
}

interface LoginByFacebookAccessTokenRequest {
  credential: string
}
export const loginByFacebookAccessToken = async (request: LoginByFacebookAccessTokenRequest): Promise<LoginResponse> => {
  const response = await serverApiClient.post<ApiResult<LoginResponse>>('/users/facebook/access-token/login', request)
  return response.data.data!
}

interface LoginByFacebookCodeRequest {
  code: string
}
export const loginByFacebookCode = async (request: LoginByFacebookCodeRequest): Promise<LoginResponse> => {
  const response = await serverApiClient.get<ApiResult<LoginResponse>>('/users/facebook/oauth/callback?code=' + request.code)
  return response.data.data!
}
