import BlogApi from '@/api/server/blogApi'
import MainAppBar from '@/app/[locale]/appBar'
import Footer from '@/app/[locale]/home/footer'
import RightItem from '../../rightItem'
import RightSideTags from '../../rightSideTags'
import RightSideKeywords from '../../rightSideKeywords'
import { getLocale, getTranslations } from 'next-intl/server'
import Content from '../../content'
import List from '../../list'
import { Link } from '@heroui/react'
import '../../index.scss'
import { localesWithName } from '@/i18n.config'
import { notFound } from 'next/navigation'

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
		categoryType = 'c/'+pathname[0]+'_'+categoryId
	}

	// 查询分类数据
	const blogData = await blogApi.getBlogData(categoryId, page, params.locale)
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
	localesWithName.forEach(({ locale: lang }) => {
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

export default async function CategoryList({ params }: { params: { slug: string; locale: string } }) {
	const locale = await getLocale()
  const t = await getTranslations('article')
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

	const getFullPath = (pathname: string) => {
		const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
		if (pathname.endsWith('/')) {
			pathname = pathname.slice(0, -1)
		  }
		if (!pathname) {
		return locale === 'en' ? baseUrl : baseUrl + `/${locale}`
		}
		if(pathname != 'article') {
			pathname = 'article' + pathname;
		  }
		return locale === 'en' ? baseUrl + `/${pathname}` : baseUrl + `/${locale}/${pathname}`
	}

	// 查询分类数据
	const blogApi = new BlogApi('')
	const blogData = await blogApi.getBlogData(categoryId, page, params.locale)

	const breadcrumbs = blogData.data.breadcrumbs
	const blogList = blogData.data.blog_list
    const pageCount = blogData.data.blog_count
	const categoryList = blogData.data.category_list || []
	const mostView = blogData.data.top_visit_list || []
	const latest = blogData.data.newest_list || []
	const popularTags = blogData.data.hot_tag_list || []
	const hotKeywords = blogData.data.newest_juhe_list || []
	const categoryDisplayMode = blogData.data.category_display_mode

	return (
		<div className="bg-gray-50">
			<MainAppBar />
			<div className="blog-list">
				<div className="max-w-7xl pt-30 mx-auto px-4">
					<nav className="mt-2 text-sm" aria-label="breadcrumb">
						<ol className="flex flex-wrap items-center gap-2">
							{breadcrumbs.slice(0, -1).map((item: any, index: number) => {
								const key = String(item.name || '').trim().replace(/\s+/g, '_').toLowerCase()
								let text = item.name as string
								try {
									const translated = t(key)
									// 防止返回命名空间路径等意外值
									if (translated && !/^article\./.test(translated)) {
										text = translated
									}
								} catch (e) {
									text = item.name
								}
								return (
									<li key={index} className="flex items-center">
										<Link href={getFullPath(`${item.url}`)} className="text-gray-600 text-sm hover:text-gray-900">{text}</Link>
										<span className="mx-2 text-gray-400">/</span>
									</li>
								)
							})}
							<li className="text-gray-900 truncate">{breadcrumbs[breadcrumbs.length - 1].name}</li>
						</ol>
					</nav>
					<h1 className="text-3xl mt-4">{breadcrumbs[breadcrumbs.length - 1].name}</h1>
					<div className="main-content">
						{categoryDisplayMode == 1 && (<Content categoryList={categoryList} />)}
						{categoryDisplayMode == 2 && (
							<List 
								blogList={blogList}
								total={pageCount}
								page={page}
								categoryId={categoryId}
								categoryType={categoryType}
							/>
						)}
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
