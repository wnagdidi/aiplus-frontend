import clientApiClient from '@/api/client/clientApiClient'
import { ApiResult } from '../core/common'
import { EventData } from './humanizeApi.interface'

export const sendServeEvent = async (eventData:EventData): Promise<{code: string}> => {
  const response:any = await clientApiClient.post<ApiResult<EventData>>('/behavior/event/facebook/send', eventData)
  return response.data
}

export const saveEventLogFrontend = async (eventData:any) => {
  const response:any = await clientApiClient.post('event/log/add',eventData)
  return response
}
