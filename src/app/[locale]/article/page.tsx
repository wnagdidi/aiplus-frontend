import MainAppBar from '@/app/[locale]/appBar'
import dynamic from 'next/dynamic'
const Footer = dynamic(() => import('@/app/[locale]/home/footer'))
import Content from './content'
import RightItem from './rightItem'
import RightSideTags from './rightSideTags'
import RightSideKeywords from './rightSideKeywords'
import BlogApi from '@/api/server/blogApi'
import { getLocale, getTranslations } from 'next-intl/server'
import './index.scss'
import { notFound } from 'next/navigation'
import { localesWithName } from '@/i18n.config'

export async function generateMetadata({ params }: { params: { slug: string; locale?: string } }) {
	const blogApi = new BlogApi('')
	let pathname: any = []
	if (params && params.slug) {
	  pathname = params.slug.split('_')
	}
	const page = pathname[2] ? pathname[2].slice(4) : 1
	let lang = 'en'
	if (params && params.locale) {
	  lang = params.locale
	}
	let categoryType = ''
	if (pathname[0]) {
	  categoryType = pathname[0]
	}
  
	// 博客列表（仅当存在有效分类时才传 url_key）
	let pageInfo = { page, page_size: 20 } as { [key: string]: any; page: any; page_size: number };
	if (categoryType && categoryType !== 'ai-trending') {
	  pageInfo['url_key'] = categoryType
	}
	const blogData = await blogApi.getBlogData(undefined, undefined, params.locale)
	if (blogData && blogData.code === 404) {
	  notFound();
	}
  
	const locale = await getLocale()
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
	const canonicalPath = locale === 'en'
	  ? (categoryType ? '/article/'+categoryType : '/article')
	  : (categoryType ? `/${locale}/article/`+categoryType : `/${locale}/article`)
  
	// Generate alternate links for each language
	const languageAlternates: any = {}
	localesWithName.forEach(({ locale: lang }: { locale: string } ) => {
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

export default async function CategoryPage({ params }: { params: { locale: string } }) {

  const blogApi = new BlogApi('')
  // 查询分类数据
  console.log('params.locale', params.locale)
  const blogData = await blogApi.getBlogData(undefined, undefined, params.locale)
  const t = await getTranslations('article')
  
  const pageTitle = blogData.data.h1_text|| ''
  const pageDesc = blogData.data.h1_text_desc || ''
  const bannerImagePc = blogData.data.banner_image || ''
  const bannerImageMobile = blogData.data.banner_image_m || ''
  const categoryList = blogData.data.category_list || []
  const mostView = blogData.data.top_visit_list || []
  const latest = blogData.data.newest_list || []
  const popularTags = blogData.data.hot_tag_list || []
  const hotKeywords = blogData.data.newest_juhe_list || []

  return (
    <div className="bg-gray-50">
      <MainAppBar />
      <div className="blog-list pt-[45px] md:pt-[60px]">
        <div 
          className="banner bg-cover bg-no-repeat bg-center w-full h-[220px] relative flex flex-col justify-center items-center"
          style={{
            backgroundImage: `url(${bannerImagePc})`
          }}
        >
          <h1 className="text-white text-center font-normal text-4xl">{pageTitle}</h1>
          <p className="text-white text-center font-normal text-base mt-5">{pageDesc}</p>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="main-content">
            <Content categoryList={categoryList} />
            <div className="right-side">
              <RightItem title={t('most_view')} list={mostView} />
              <RightItem title={t('latest')} list={latest} />
              {/* <RightSideTags title="Popular Tags" tags={popularTags} />
              <RightSideKeywords title="Hot Keywords" keywords={hotKeywords} /> */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const revalidate = 300
