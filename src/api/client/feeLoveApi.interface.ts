// Image Generator API 接口类型定义

// 生成状态枚举
export enum GenerationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  IN_QUEUE = 'IN_QUEUE',
}

// 胸部尺寸类型
export type BreastSize = 'small' | 'medium' | 'large' | 'huge' | 'enormous'

// 分辨率类型
export type Resolution = '2k' | '4k' | '2K' | '4K'

// 生成模型类型
export type GenerationModel = 'inpaint' | 'pulid' | 'ip-adapter' | 'legacy' | 'z-image' | 'comfy' | 'comfyui'

// 上传图片请求
export interface UploadImageRequest {
  file: File
}

// 上传图片响应
export interface UploadImageResponse {
  url: string
  filename?: string
  success?: boolean
  id?:any
}

// 查询生成状态请求
export interface GetGenerationStatusRequest {
  id: string
}

// 查询生成状态响应
export interface GetGenerationStatusResponse {
  status: GenerationStatus
  imageUrl?: string
  error?: string
  requestId?: string
}

// 获取用户积分响应
export interface UserCreditsResponse {
  totalCredits: number
  isGuest?: boolean
}

// 视频生成记录
export interface VideoGenerationRecord {
  id: string
  userId: string
  sourceImageUrl: string
  videoUrl: string | null
  templateId?: string
  prompt?: string
  status: GenerationStatus
  creditCost: number
  createdAt: string
  updatedAt: string
}

// 获取所有视频生成记录请求参数
export interface GetVideoGenerationsRequest {
  status?: GenerationStatus | 'ALL'
  sortOrder?: 'newest' | 'oldest'
  limit?: number
  offset?: number
}

// 获取所有视频生成记录响应
export interface GetVideoGenerationsResponse {
  items: VideoGenerationRecord[]
  total: number
}

// Tag 标签
export interface Tag {
  id: string
  slug: string
  name: string
  groupId: string
  isFeatured: boolean
  sortOrder: number
}

// Tag Group 标签组
export interface TagGroup {
  id: string
  key: string
  name: string
  singleSelect: boolean
  sortOrder: number
  tags: Tag[]
}

// 获取标签列表响应（直接返回 TagGroup 数组）
export type GetTagsResponse = TagGroup[]
