'use client'
import HumanizeControl from '@/app/[locale]/humanize/humanizeControl'
import { useLocale, useTranslations } from 'next-intl'
import process from 'process'
import { Avatar } from '@heroui/react'

export default function Index(props: any) {
  const { data, categoryId } = props
  const locale = useLocale()
  const t = useTranslations('article')
  if (!data) {
    return null
  }
  const { article, last, next, also_like_list } = data

  const onOpenDetail = (id: number) => {
    location.href = `/category/detail/id_${id}_category_${categoryId}`
  }

  const getFullPath = (pathname: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_CHILD_SITE_URL || ''

    if (!pathname) {
      return locale === 'en' ? baseUrl : baseUrl + `/${locale}`
    }
    return locale === 'en' ? baseUrl + `${pathname}` : baseUrl + `/${locale}${pathname}`
  }

  // 保持原有样式与结构，不在此处做布局或数据拉取

  // const renderRelated = () => {
  //   return (
  //     <div className="related">
  //       <div className="sub_title">
  //         <span>Related Posts</span>
  //         <a className="more" href={getFullPath(`/category/${categoryType}`)}>
  //           View More
  //           <EastIcon />
  //         </a>
  //       </div>
  //       <div className="list">
  //         {!!also_like_list.length &&
  //           also_like_list.map((item, index) => (
  //             <a className="item" key={index} href={getFullPath(`${item.url_key}`)}>
  //               <div className="name">{item.name}</div>
  //               <div className="des text-ellipsis-2">{item.short_description}</div>
  //               <div className="info">
  //                 <Avatar sx={{ width: 32, height: 32 }} src={item?.author.head_img} />
  //                 <div className="author">
  //                   <div className="name">{item?.author.name}</div>
  //                 </div>
  //               </div>
  //             </a>
  //           ))}
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="blog-detail">
      <div className="descriptions">
        <div className="mb-2 -mt-2 md:-mt-6">
          <HumanizeControl from="article" />
        </div>
        <h1 className="title">{article?.name}</h1>
        <div className="publish-info sm:my-12">
          <div className="avatar">
            <Avatar src={article?.author.head_img} name={article?.author?.name} className="w-8 h-8" radius="full" />
            <div className="author">
              <div>{t('written_by')}</div>
              <div className="name">{article?.author.name}</div>
            </div>
          </div>
          <div className="date">
            <span>{t('updated_on')}:</span>
            {article?.updated_at}
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: article?.description }} />
      </div>
        {/* Related Posts 移至页面底部（page.tsx）全宽展示 */}
    </div>
  )
}
