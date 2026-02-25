import clientApiClient from '@/api/client/clientApiClient'

type translateExecuteType = {
  content: string
  language?: string
  outputLanguage: string
  industryModel: string
  localLanguage: string
}

// 获取翻译 taskId
export const translateExecute = async (eventData: translateExecuteType): Promise<any> => {
  const response: any = await clientApiClient.post<translateExecuteType>('/translate/execute', eventData)
  return response.data
}

// 查询翻译打分
export const translateExecuteRateGet = async (taskId: string) => {
  const response: any = await clientApiClient.get(`/translate/execute/scoring/${taskId}`)
  return response
}

// 翻译
export const translateExecuteGet = async (taskId: string) => {
  const response: any = await clientApiClient.get(`/translate/execute/result/${taskId}`)
  return response
}

// 评分
export const translateRate = async (eventData: any): Promise<any> => {
  const response: any = await clientApiClient.post<any>('/translate/rate', eventData)
  return response.data
}

// 工具评分结果
export const translateGetRate = async (): Promise<any> => {
  const response: any = await clientApiClient.get<any>('/translate/tool/getrate')
  return response.data
}

// 工具评分
export const translateExecuteRate = async (eventData: any): Promise<any> => {
  const response: any = await clientApiClient.post<any>('/translate/tool/execute/rate', eventData)
  return response.data
}
