import { ApiResult } from '@/api/core/common'
import strapiApiClient from '@/api/strapi/strapiApiClient'
import { ArticleApiResponse } from '@/api/strapi/articleApi.interface'

export const getArticleBySlug = async (slug: string): Promise<ArticleApiResponse> => {
  const response = await strapiApiClient.get<ApiResult<ArticleApiResponse>>(
    `/api/articles?filters[slug]=${slug}&populate[authorAvatar]=*&populate[relatedArticles][fields][0]=id&populate[relatedArticles][fields][1]=title&populate[relatedArticles][fields][2]=authorName&populate[relatedArticles][fields][3]=authorTitle&populate[relatedArticles][fields][4]=displayPublishTime&populate[relatedArticles][populate][0]=authorAvatar`,
  )
  return response.data!
}
