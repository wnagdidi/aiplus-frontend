import clientApiClient from '@/api/client/clientApiClient'
import {
  DetectResult,
  GetChatMessagePosponse,
  GetChatsHistoryResponse,
  HumanizeInfo,
  HumanizeRequest,
  HumanizeResult,
  HumanizeStatus,
  MessageResponse,
  Variable,
} from '@/api/client/humanizeApi.interface'
import { ApiResult, ResultCode } from '@/api/core/common'

export const humanize = async (request: HumanizeRequest): Promise<HumanizeInfo> => {
  const response = await clientApiClient.post<ApiResult<HumanizeInfo>>('/humanize/rewrite', request)
  let result = response.data.data!
  if (!result) {
    result = {
      id: '',
      message: response?.data?.message || '',
      requestID: response?.data?.requestID || '',
    }
  } else {
    result.message = response?.data?.message || ''
    result.requestID = response?.data?.requestID || ''
  }
  /*if (!result.success) {
    throw new CoreApiError('something wrong', ResultCode.HUMANIZE_API_ERROR, response.data.requestID)
  }*/
  return result
}

export const getSample = async (): Promise<string> => {
  const response = await clientApiClient.get<ApiResult<string>>('/humanize/sample')
  return response.data.data!
}

export const getHumanizeResult = async (id: string): Promise<HumanizeResult> => {
  const response = await clientApiClient.get<ApiResult<HumanizeResult>>('/humanize/rewrite/result?id=' + id)
  let result = response.data.data!
  if (!result) {
    result = {
      id: '',
      result: '',
      status: HumanizeStatus.FAILED,
      errorMsg: response?.data?.message || '',
      requestID: response?.data?.requestID || '',
    }
  } else {
    result.errorMsg = response?.data?.message || ''
    result.requestID = response?.data?.requestID || ''
  }
  return result
}

export const getDetectResults = async (id: string): Promise<DetectResult[]> => {
  const response = await clientApiClient.get<ApiResult<DetectResult[]>>('/humanize/result/detectors?id=' + id)
  return response.data.data!
}

export const getVariables = async (preview?: boolean): Promise<Variable[]> => {
  const response = await clientApiClient.get<ApiResult<Variable[]>>(
    '/humanize/variables?' + (preview ? 'preview=true' : ''),
  )
  return response.data.data!
}
// 通过此接口可以向指定的聊天ID发送消息
export const createChat = async (data?: {}): Promise<ApiResult<string>> => {
  const response = await clientApiClient.get<ApiResult<string>>('/agent/chat/create')
  return response.data
}

// 通过此接口可以向指定的聊天ID发送消息
export const sendMessage = async (data?: {
  chatId?: string
  message?: string
}): Promise<ApiResult<MessageResponse>> => {
  const response = await clientApiClient.post<ApiResult<MessageResponse>>('/agent/message/send', data)
  return response.data
}

//获取会话所有消息
export const getChatMessages = async (data?: { chatId?: string }): Promise<ApiResult<GetChatMessagePosponse>> => {
  const response = await clientApiClient.get<ApiResult<GetChatMessagePosponse>>(
    '/agent/message/list?chatId=' + data?.chatId,
  )
  return response.data
}

//获取所有历史会话
export const getChatsHistory = async (data?: {}): Promise<ApiResult<GetChatsHistoryResponse[]>> => {
  const response = await clientApiClient.get<ApiResult<GetChatsHistoryResponse[]>>('/agent/chat/list')
  return response.data
}
//删除会话
export const deleteChat = async (data?: { chatId: string }): Promise<ApiResult<{}>> => {
  const response = await clientApiClient.get<ApiResult<{}>>('/agent/chat/delete?chatId=' + data?.chatId)
  return response.data
}

//修改会话名称
export const setChatName = async (data?: { chatId: string; chatName: string }): Promise<ApiResult<{}>> => {
  const response = await clientApiClient.post<ApiResult<{}>>('/agent/chat/name/modify', data)
  return response.data
}

// 对话评分
export const setChatRating = async (data?: { token: string; rate: number }): Promise<ApiResult<{}>> => {
  const response = await clientApiClient.post<ApiResult<{}>>('/humanize/rate', data)
  return response.data
}

export const getHumanScore = async (data: {
  content: string
  language: string
}): Promise<ApiResult<MessageResponse>> => {
  try {
    const response = await clientApiClient.post<ApiResult<MessageResponse>>('/human/score/result', data)
    return response.data
  } catch (error) {
    console.error('Error getting human score:', error)
    return {
      code: ResultCode.INTERNAL_ERROR,
      message: 'Failed to detector now!',
      requestID: '',
    }
  }
}

// ai delector sample
export const scoreSample = async (): Promise<any> => {
  const response: any = await clientApiClient.get<any>('/human/score/sample')
  return response.data
}
