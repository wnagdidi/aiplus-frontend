import BlogApi from '@/api/server/blogApi'
import MainAppBar from '@/app/[locale]/appBar'
import RightItem from '@/app/[locale]/article/rightItem'
import RightSideTags from '@/app/[locale]/article/rightSideTags'
import RightSideKeywords from '@/app/[locale]/article/rightSideKeywords'
import Footer from '@/app/[locale]/home/footer'
import { localesWithName } from '@/i18n.config'
// MUI 组件替换为原生 + Tailwind，避免 SSR/hydration 相关报错
import { getLocale, getTranslations } from 'next-intl/server'
import Detail from './detail'

import '@/app/[locale]/article/index.scss'
import { notFound } from 'next/navigation'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string; detail: string; locale: string } }) {
  // detail ----- microsoft-stakes-out-an-ai-future-at-50th-anniversary-event_48
  const blogApi = new BlogApi('')
  const id = params.detail.slice(params.detail.indexOf('_') + 1)
  const pathname = `/d/${params.detail}.html`

  const lang = params.locale

  //查询详情
  const data = await blogApi.getBlogDetail(id, lang)

  if (data && data.code === 404) {
    notFound();
  }
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const canonicalPath = locale === 'en' ? pathname : `/${locale}${pathname}`

  // Generate alternate links for each language
  const languageAlternates: any = {}
  localesWithName.forEach(({ locale: lang }: { locale: string }) => {
    const path = lang === 'en' ? pathname : `/${lang}${pathname}`
    languageAlternates[lang] = `${baseUrl}${path}`
  })
  // Add x-default alternate link
  languageAlternates['x-default'] = `${baseUrl}${pathname}`

  return {
    title: data.data.article.meta_title,
    description: data.data.article.meta_description,
    keywords: data.data.article.meta_keywords,
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages: languageAlternates,
    },
  }
}

export default async function Index({ params }: { params: { slug: string; detail: string; locale: string } }) {
  // detail ----- microsoft-stakes-out-an-ai-future-at-50th-anniversary-event_48
  const blogApi = new BlogApi('')
  const id = params.detail.slice(params.detail.indexOf('_') + 1)
  const locale = await getLocale()
  const t = await getTranslations('article')

  // 查询分类数据
  // const res = await blogApi.getCategoryList(lang)
  // let leftData = []
  // let category: any = {}
  // if (res && res.category_list && res.category_list.length) {
  //   leftData = res.category_list.filter((item) => !!item.name) || []
  // }
  let categoryId = ''

  //查询详情
  const data = await blogApi.getBlogDetail(id, locale)

  if (data && data.code === 404) {
    notFound();
  }

  if (data.data && data.data.article) {
    categoryId = data.data.article.master_category_id
    // category = leftData.find((item) => item.id == categoryId)
  }
  // 右侧栏数据（按分类取）
  const breadcrumbs = data.data.breadcrumbs
  console.log('breadcrumbs', breadcrumbs)
  const mostView = data?.data?.top_visit_list || []
  const latest = data?.data?.newest_list || []
  const popularTags = data?.data?.hot_tag_list || []
  const hotKeywords = data?.data?.newest_juhe_list || []
  const relatedList = data?.data?.also_like_list || []
  let currentNav = ''
  if (data.data && data.data.article) {
    currentNav = data?.data?.article?.name || ''
    // 通过正则将data.data.article.description中的pre标签替换为p标签
    data.data.article.description = data.data.article.description.replace(/<pre/g, '<p').replace(/<\/pre>/g, '</p>')
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

  const renderList = () => {
    return (
        <div style={{backgroundColor: '#f8f8f8', paddingBottom: 8}}>
          <div className="blog-list">
            <div className="max-w-7xl pt-30 mx-auto px-4">
              {/* <div className="header">Resource Hub</div> */}
              <div className="mt-2 text-sm w-full whitespace-nowrap overflow-hidden flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {breadcrumbs.slice(0, -1).map((item: any, idx: number) => {
                  const key = String(item.name || '').trim().replace(/\s+/g, '_').toLowerCase()
                  let text = item.name as string
                  try {
                    const translated = t(key)
                    if (translated && !/^article\./.test(translated)) {
                      text = translated
                    }
                  } catch (e) {
                    text = item.name
                  }
                  return (
                    <span key={idx} className="flex items-center flex-shrink-0">
                      <a href={getFullPath(`${item.url}`)} className="text-gray-600 hover:text-gray-900">{text}</a>
                      <span className="mx-2 text-gray-400">/</span>
                    </span>
                  )
                })}
                <span className="text-gray-900 truncate">{currentNav}</span>
              </div>
              <div className="main-content">
                {/* <LeftSide list={leftData} currentId={categoryId} /> */}
                <div className="wrapper-right" style={{backgroundColor: 'transparent', padding: '0'}}>
                  <Detail 
                    data={data.data} 
                    categoryId={categoryId}
                  />
                </div>
                <div className="right-side">
                  <RightItem title={t('most_view')} list={mostView} locale={params.locale} />
                  <RightItem title={t('related_posts')} list={relatedList} locale={params.locale} />
                  {/* <RightItem title="Latest" list={latest} locale={params.locale} /> */}
                  {/* <RightSideTags title="Popular Tags" tags={popularTags} />
                  <RightSideKeywords title="Hot Keywords" keywords={hotKeywords} /> */}
                </div>
              </div>

              {/* 全宽 Related Posts：放在页面下方，保持原有样式结构 */}
              {/* {Boolean(relatedList?.length) && (
                <div className="blog-detail">
                  <div className="related">
                    <div className="sub_title">
                      <span>Related Posts</span>
                      <a className="more" href={getFullPath(`article/c/${category?.url_key}_${category?.id}`)}>
                        View More
                        <EastIcon />
                      </a>
                    </div>
                    <div className="list">
                      {relatedList.map((item: any, index: number) => (
                        <a className="item" key={index} href={getFullPath(`${item.url_key}`)}>
                          <div className="name">{item.name}</div>
                          <div className="des text-ellipsis-2">{item.short_description}</div>
                          <div className="info">
                            <Avatar sx={{ width: 32, height: 32 }} src={item?.author?.head_img} />
                            <div className="author">
                              <div className="name">{item?.author?.name}</div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
    )
  }

  return (
    <>
      <MainAppBar />
      {renderList()}
      <Footer />
    </>
  )
}
