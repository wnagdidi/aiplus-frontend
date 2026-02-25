import BlogApi from '@/api/server/blogApi'
import MainAppBar from '@/app/[locale]/appBar'
import Footer from '@/app/[locale]/home/footer'
import { localesWithName } from '@/i18n.config'
import { getLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'
const List = dynamic(() => import('../list'))
const RightItem = dynamic(() => import('../rightItem'))
import RightSideTags from '../rightSideTags'
import RightSideKeywords from '../rightSideKeywords'
import { notFound } from 'next/navigation'
import '../index.scss'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string; locale?: string } }) {
  const blogApi = new BlogApi('')
  let pathname: any = []
  if (params && params.slug) {
    pathname = params.slug.split('_')
  }
  const page = pathname[2] ? pathname[2].slice(4) : 1
  let categoryType = ''
  let categoryId = pathname[1]
  if (pathname[0]) {
    categoryType = 'c/'+ pathname[0]+'_'+categoryId
  }

  // 查询分类数据
  const blogData = await blogApi.getBlogData(categoryId, page, params.locale)
  if (blogData && blogData.code === 404) {
    notFound();
  }

  console.log('blogData', blogData)
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_CHILD_SITE_URL || 'https://byecheck.com'
  const canonicalPath = locale === 'en'
    ? (categoryType ? '/article/'+categoryType : '/article')
    : (categoryType ? `/${locale}/article/`+categoryType : `/${locale}/article`)

  // Generate alternate links for each language
  const languageAlternates: any = {}
  localesWithName.forEach(({ locale: lang }: { locale: string }) => {
    const path = lang === 'en'
      ? (categoryType ? '/article/'+categoryType : '/article')
      : (categoryType ? `/${lang}/article/`+categoryType : `/${lang}/article`)
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}` + (categoryType ? `/article/${categoryType}` : '/article')

  return {
    title: blogData.data.meta_title,
    description: blogData.data.meta_description,
    keywords: blogData.data.meta_keywords,
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages: languageAlternates,
    },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string; locale: string } }) {
  let pathname: any = []
  if (params && params.slug) {
    pathname = params.slug.split('_')
  }
  const page = pathname[2] ? pathname[2].slice(4) : 1
  let categoryType = ''
  let categoryId = pathname[1]
  if (pathname[0]) {
    categoryType = pathname[0]
  }

  // 查询分类数据
  const blogApi = new BlogApi('')
  const blogData = await blogApi.getBlogData(categoryId, page, params.locale)

  const blogList = blogData.data.blog_list
  const pageCount = blogData.data.blog_count
  // 右侧栏数据（字段名参考另一个项目；此处做兼容，接口接好后替换映射）
  // 字段映射（严格参考 nereus-vision-front 的约定）
  // most view / latest: 数组元素至少包含 { name, url_key }
  const mostView = blogData.data.top_visit_list || []
  const latest = blogData.data.newest_list || []
  // popular tags / hot keywords: 字符串数组
  const popularTags = blogData.data.hot_tag_list || []
  const hotKeywords = blogData.data.newest_juhe_list || []

  const renderList = () => {
    return (
      <div className="blog-list">
        <div className="bg-white">
          <div className="header">Resource Hub</div>
          <div className="main-content">
            {/* 隐藏左侧分类，仅保留列表与右侧栏 */}
            <div className="wrapper-right">
              <List
              rightData={blogList}
              total={pageCount}
              page={page}
              categoryId={categoryId}
              categoryType={categoryType}
              />
            </div>
            <div className="right-side">
              <RightItem title="Most view" list={mostView} />
              <RightItem title="Latest" list={latest} />
              {/* <RightSideTags title="Popular Tags" tags={popularTags} />
              <RightSideKeywords title="Hot Keywords" keywords={hotKeywords} /> */}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <MainAppBar />
      {renderList()}
      <div className="border-t border-gray-200"></div>
      <Footer />
    </>
  )
}
