import { type BlocksContent } from '@strapi/blocks-react-renderer'

interface ImageFormats {
  large: ImageFormat
  small: ImageFormat
  medium: ImageFormat
  thumbnail: ImageFormat
}

interface ImageFormat {
  ext: string
  url: string
  hash: string
  mime: string
  name: string
  size: number
  width: number
  height: number
  sizeInBytes: number
}

interface Image {
  ext: string
  url: string
  hash: string
  mime: string
  name: string
  size: number
  width: number
  height: number
  caption: string | null
  formats: ImageFormats
  provider: string
  createdAt: string
  updatedAt: string
  previewUrl: string | null
  alternativeText: string
  provider_metadata: string | null
}

interface ArticleAttributes {
  title: string
  content: BlocksContent
  authorName: string
  authorTitle: string
  displayPublishTime: string
  slug: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  authorAvatar: {
    data: {
      id: number
      attributes: {
        name: string
        alternativeText: string | null
        caption: string | null
        width: number
        height: number
        formats: null
        hash: string
        ext: string
        mime: string
        size: number
        url: string
        previewUrl: string | null
        provider: string
        provider_metadata: string | null
        createdAt: string
        updatedAt: string
      }
    }
  }
  relatedArticles: {
    data: ArticleData[] // Assuming related articles can have any structure or empty
  }
}

interface Content {
  type: string
  children: ContentChild[]
  format?: string
  image?: Image
}

interface ContentChild {
  text: string
  type: string
  url?: string
  children?: ContentChild[]
}

export interface ArticleData {
  id: number
  attributes: ArticleAttributes
}

interface Pagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

interface Meta {
  pagination: Pagination
}

export interface ArticleApiResponse {
  data: ArticleData[]
  meta: Meta
}
