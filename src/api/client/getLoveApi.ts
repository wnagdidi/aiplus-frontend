import clientApiClient from '@/api/client/clientApiClient'
import { ApiResult, ResultCode } from '@/api/core/common'
import {
  BreastSize,
  GenerationModel,
  GenerationStatus,
  GetGenerationStatusResponse,
  GetTagsResponse,
  GetVideoGenerationsRequest,
  GetVideoGenerationsResponse,
  Resolution,
  TagGroup,
  UploadImageRequest,
  UploadImageResponse,
  UserCreditsResponse,
  VideoGenerationRecord,
} from '@/api/client/feeLoveApi.interface'

/**
 * 上传图片
 * @param file 图片文件
 * @returns 上传后的图片 URL
 */
export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  // axios 会自动处理 FormData，不需要手动设置 Content-Type
  const response = await clientApiClient.post<ApiResult<UploadImageResponse>>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Upload failed')
  }

  // 兼容后端可能返回的格式
  const data = response.data.data
  return {
    url: data.url,
    id: data.id,
    filename: data.filename,
    success: data.success,
  }
}

/**
 * 查询生成状态
 * @param id 生成任务ID
 * @returns 生成状态信息
 */
export const getGenerationStatus = async (id: string): Promise<GetGenerationStatusResponse> => {
  const response = await clientApiClient.get<ApiResult<GetGenerationStatusResponse>>(
    `/images/status/${id}`,
  )

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get generation status')
  }

  return response.data.data
}

/**
 * 获取用户积分
 * @returns 用户积分信息
 */
export const getUserCredits = async (): Promise<UserCreditsResponse> => {
  const response = await clientApiClient.get<ApiResult<UserCreditsResponse>>('/user/credits')

  if (!response.data.data) {
    // 如果后端返回失败，返回默认值
    return {
      totalCredits: 0,
      isGuest: true,
    }
  }

  return response.data.data
}

/**
 * 获取所有视频生成记录
 * @param params 查询参数
 * @returns 视频生成记录列表
 */
export const getVideoGenerations = async (
  params?: GetVideoGenerationsRequest,
): Promise<GetVideoGenerationsResponse> => {
  const queryParams = new URLSearchParams()
  if (params?.status && params.status !== 'ALL') {
    queryParams.append('status', params.status)
  }
  if (params?.sortOrder) {
    queryParams.append('sortOrder', params.sortOrder)
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString())
  }
  if (params?.offset) {
    queryParams.append('offset', params.offset.toString())
  }

  const queryString = queryParams.toString()
  const url = `/video-generations${queryString ? `?${queryString}` : ''}`

  const response = await clientApiClient.get<ApiResult<GetVideoGenerationsResponse>>(url)

  if (!response.data.data) {
    return {
      items: [],
      total: 0,
    }
  }

  return response.data.data
}

/**
 * 获取标签列表
 * @returns 标签组列表
 */
export const getTags = async (): Promise<GetTagsResponse> => {
  const response = await clientApiClient.get<ApiResult<TagGroup[]>>('/aiplus/tags')

  if (!response.data.data) {
    return []
  }

  return response.data.data
}

/**
 * 获取图片模板
 * @param characterId 角色ID
 * @returns 图片模板数据
 */
export const getImageTemplate = async (characterId: string): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/aiplus/image_template', {
    params: {
      characterId,
    },
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get image template')
  }

  return response.data.data
}

/**
 * 生成图片
 * @param characterId 角色ID（必传）
 * @param params 其他可选参数（键值对形式）
 * @returns 生成结果数据
 */
export const imageGenerate = async (
  characterId: string,
  params?: Record<string, string | number | boolean>
): Promise<any> => {
  const payload: Record<string, string | number | boolean> = {
    characterId,
    ...params,
  }

  // 根据环境变量 NEXT_PUBLIC_CLOAK 选择接口路径
  const endpoint = process.env.NEXT_PUBLIC_CLOAK === 'true' 
    ? '/aiplus/image-generate-fal' 
    : '/aiplus/image-generate'

  // 改为 POST：后端期望从 body 读取参数（避免 query 超长、也更符合"生成"语义）
  const response = await clientApiClient.post<ApiResult<any>>(endpoint, payload)

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to generate image')
  }

  return response.data.data
}

/**
 * 获取视频预设
 * @returns 视频预设数据
 */
export const getVideosPresets = async (): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/aiplus/videos-presets')

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get videos presets')
  }

  return response.data.data
}

/**
 * 获取精选视频
 * @returns 精选视频数据
 */
export const getFeaturedVideos = async (): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/aiplus/featured-videos')

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get featured videos')
  }

  return response.data.data
}

/**
 * 获取角色列表
 * @param tags 标签（可选），传给后端用于过滤
 * @param page 页码（可选）
 * @param pageSize 每页数量（可选）
 * @param q 搜索关键词（可选），用于搜索角色
 * @returns 角色数据
 */
export const getCharacters = async (tags?: string, page?: number, pageSize?: number, q?: string): Promise<any> => {
  const params: Record<string, string | number> = {}
  
  if (tags) {
    params.tags = tags
  }
  if (page !== undefined) {
    params.page = page
  }
  if (pageSize !== undefined) {
    params.pageSize = pageSize
  }
  if (q) {
    params.q = q
  }

  const response = await clientApiClient.get<ApiResult<any>>('/aiplus/characters', {
    params,
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get characters')
  }

  return response.data.data
}

/**
 * 创建结账会话
 * @param type 支付类型
 * @param planId 计划ID（字符串或数字）
 * @returns 结账会话数据
 */
export const createCheckout = async (type: string, planId: string | number): Promise<any> => {
  const response = await clientApiClient.post<ApiResult<any>>('/checkout/create', {
    type,
    planId,
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to create checkout')
  }

  return response.data.data
}

/**
 * 获取结账详情
 * @param checkoutId 结账ID
 * @returns 结账详情数据
 */
export const getCheckoutDetail = async (checkoutId: string): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/checkout/detail', {
    params: {
      checkout_id: checkoutId,
    },
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get checkout detail')
  }

  return response.data.data
}

/**
 * 获取支付方式列表
 * @returns 支付方式列表数据
 */
export const getPaymentMethods = async (): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/payment-methods')

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get payment methods')
  }

  return response.data.data
}

/**
 * 获取支付意图
 * @param planId 计划ID（字符串或数字）
 * @param paymentMethodCode 支付方式代码（字符串）
 * @param checkoutId 结账ID（字符串）
 * @returns 支付意图数据
 */
export const getPaymentIntent = async (
  planId: string | number,
  paymentMethodCode: string,
  checkoutId: string
): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/subscribe/a/order/payment/intent', {
    params: {
      planId,
      paymentMethodCode: paymentMethodCode,
      checkoutId: checkoutId,
    },
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get payment intent')
  }

  return response.data.data
}

/**
 * 获取生成状态
 * @param requestId 请求ID（字符串或数字）
 * @returns 生成状态数据
 */
export const getGenerateStatus = async (requestId: string | number): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/aiplus/get-generate-status', {
    params: {
      request_id: requestId,
    },
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get generate status')
  }

  return response.data.data
}

/**
 * 获取视频生成记录
 * @param params 查询参数（全部可选）
 * @param params.page 页码（数字）
 * @param params.pageSize 每页数量（数字）
 * @param params.sort 排序方式（字符串）
 * @param params.resolution 分辨率（字符串）
 * @param params.status 状态（字符串）
 * @returns 视频生成记录数据
 */
export const getVideoGenerationsList = async (params?: {
  page?: number
  pageSize?: number
  sort?: string
  resolution?: string
  status?: string
}): Promise<any> => {
  const queryParams: Record<string, string | number> = {}
  
  if (params?.page !== undefined) {
    queryParams.page = params.page
  }
  if (params?.pageSize !== undefined) {
    queryParams.pageSize = params.pageSize
  }
  if (params?.sort) {
    queryParams.sort = params.sort
  }
  if (params?.resolution) {
    queryParams.resolution = params.resolution
  }
  if (params?.status) {
    queryParams.status = params.status
  }

  const response = await clientApiClient.get<ApiResult<any>>('/aiplus/video-generations', {
    params: queryParams,
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get video generations')
  }

  return response.data.data
}

/**
 * 获取图片生成记录
 * @param params 查询参数（全部可选）
 * @param params.page 页码（数字）
 * @param params.pageSize 每页数量（数字）
 * @param params.sort 排序方式（字符串）
 * @param params.status 状态（字符串）
 * @returns 图片生成记录数据
 */
export const getImageGenerationsList = async (params?: {
  page?: number
  pageSize?: number
  sort?: string
  status?: string
}): Promise<any> => {
  const queryParams: Record<string, string | number> = {}

  if (params?.page !== undefined) {
    queryParams.page = params.page
  }
  if (params?.pageSize !== undefined) {
    queryParams.pageSize = params.pageSize
  }
  if (params?.sort) {
    queryParams.sort = params.sort
  }
  if (params?.status) {
    queryParams.status = params.status
  }

  const response = await clientApiClient.get<ApiResult<any>>('/aiplus/image-generations', {
    params: queryParams,
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get image generations')
  }

  return response.data.data
}

/**
 * 下载图片生成结果
 * @param id 生成记录ID
 * @param filename 可选文件名
 */
export const downloadImageGeneration = async (id: string | number, filename?: string): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('Download is only available in browser environment')
  }

  const response = await clientApiClient.get<ArrayBuffer>(`/aiplus/image-generations/${id}/download`, {
    responseType: 'arraybuffer',
  })

  const contentType = response.headers['content-type'] || 'application/octet-stream'
  const blob = new Blob([response.data], { type: contentType })
  const objectUrl = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = objectUrl

  const contentDisposition = response.headers['content-disposition']
  const fallbackName = filename?.trim() || `image-${id}`
  let finalName = fallbackName
  if (contentDisposition) {
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
    if (match && match[1]) {
      finalName = decodeURIComponent(match[1].replace(/['"]/g, ''))
    }
  }

  link.download = finalName
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(objectUrl)
}

/**
 * 删除生成记录
 * @param id 生成记录ID
 */
export const deleteGeneration = async (id: string | number): Promise<ApiResult<any>> => {
  const response = await clientApiClient.post<ApiResult<any>>(`/aiplus/generations/${id}/delete`)
  return response.data
}

/**
 * 更新用户密码
 * @param oldPassword 当前密码
 * @param newPassword 新密码
 */
export const updateUserPassword = async (oldPassword: string, newPassword: string): Promise<ApiResult<any>> => {
  const response = await clientApiClient.post<ApiResult<any>>('/users/password/update', {
    oldPassword,
    newPassword,
  })

  return response.data
}

/**
 * 获取用户积分历史记录
 * @param page 页码（数字）
 * @param pageSize 每页数量（数字）
 * @returns 积分历史记录数据
 */
export const getCreditsHistory = async (page: number, pageSize: number): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/users/credits/history', {
    params: {
      page,
      pageSize,
    },
  })

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get credits history')
  }

  return response.data.data
}

/**
 * 获取用户创作统计信息
 * @returns 创作统计数据
 */
export const getCreationsStatistics = async (): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/users/creations-statistics')

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get creations statistics')
  }

  return response.data.data
}

/**
 * 获取用户资料
 * @returns 用户资料数据
 */
export const getUserProfile = async (): Promise<any> => {
  const response = await clientApiClient.get<ApiResult<any>>('/users/profile')

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to get user profile')
  }

  return response.data.data
}

/**
 * 生成视频
 * @param payload 请求参数
 * @param payload.prompt 提示词（必填）
 * @param payload.posterId 海报ID（可选，字符串或数字）
 * @param payload.characterId 角色ID（可选，字符串）
 * @returns 生成结果数据
 */
export const videoGenerate = async (payload: {
  prompt: string
  posterId?: number
  characterId?: string
}): Promise<any> => {
  const response = await clientApiClient.post<ApiResult<any>>('/aiplus/video-generate', payload)

  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to generate video')
  }

  return response.data.data
}
