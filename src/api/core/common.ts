import { AxiosResponse } from 'axios'
import CoreApiError from '@/api/core/coreApiError'
import { signOut } from 'next-auth/react'

export enum ResultCode {
  SUCCESS = 'SUCCESS',
  PARAM_INVALID = 'PARAM_INVALID',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SEND_EMAIL_ERROR = 'SEND_EMAIL_ERROR',
  REGISTER_EMAIL_EXISTS = 'REGISTER_EMAIL_EXISTS',
  VERIFICATION_CODE_ERROR = 'VERIFICATION_CODE_ERROR',
  TOKEN_ERROR = 'TOKEN_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RECAPTCHA_CHECK_ERROR = 'RECAPTCHA_CHECK_ERROR',
  USER_LOGIN_ERROR = 'USER_LOGIN_ERROR',
  OLD_PASSWORD_INVALID = 'OLD_PASSWORD_INVALID',
  NEW_PASSWORD_EQUAL_OLD_PASSWORD = 'NEW_PASSWORD_EQUAL_OLD_PASSWORD',
  RESET_PASSWORD_REQUEST_INVALID = 'RESET_PASSWORD_REQUEST_INVALID',
  USER_NOT_EXISTS = 'USER_NOT_EXISTS',
  HUMANIZE_API_ERROR = 'HUMANIZE_API_ERROR',
  TOKEN_INVALID_OR_EXPIRED = 'TOKEN_INVALID_OR_EXPIRED',
}

export interface ApiResult<D> {
  code: ResultCode
  message?: string
  data?: D
  requestID: string
}

export const onResponseFulfilled = (response: AxiosResponse<ApiResult<any>>) => {
  const apiResult = response.data
  if (apiResult.code === ResultCode.SUCCESS) {
    return response
  }
  if (apiResult.code === ResultCode.TOKEN_INVALID_OR_EXPIRED) {
    console.warn(new Date(), 'WARN', response.config.metadata?.requestId || '', apiResult.code, apiResult.requestID)
    signOut({ redirect: false, callbackUrl: '/' })
  } else {
    console.error(
      new Date(),
      'ERROR',
      response.config.metadata?.requestId || '',
      response.config.method,
      response.config.url,
      apiResult,
    )
    return response
  }
  throw new CoreApiError(apiResult.message!, apiResult.code, apiResult.requestID)
}

export const onResponseRejected = (error) => {
  return Promise.reject(error)
}

export const getErrorMessage = (t, error) => {
  if (error instanceof CoreApiError) {
    return t(error.code, error.context())
  } else {
    return error.message
  }
}

export const logError = (error, data, e) => {
  if (typeof window === 'undefined') {
    return
  }
  fetch('/log/error', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error,
      data,
      errorMsg: e?.message,
      stack: e?.stack,
    }),
  }).catch((ex) => {
    console.warn('Error log exception:', ex)
  })
}

export const logInfo = (msg: string, data: any) => {
  if (typeof window === 'undefined') {
    return
  }
  fetch('/log/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      msg,
      data,
    }),
  }).catch((ex) => {
    console.warn('Error log info:', ex)
  })
}
