import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const isRobotsOpen = process.env.NEXT_PUBLIC_ROBOTS_IS_OPEN === 'true'

  if (!isRobotsOpen) {
    // 如果 NEXT_PUBLIC_ROBOTS_IS_OPEN 不是 true，则禁止所有搜索引擎抓取
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: undefined,
    }
  }

  // 如果 NEXT_PUBLIC_ROBOTS_IS_OPEN 是 true，则允许搜索引擎抓取
  return {
    rules: {
      userAgent: '*',
      disallow: '/api/*'
    },
    //sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://avoid.ai'}/sitemap.xml`,
  }
}
