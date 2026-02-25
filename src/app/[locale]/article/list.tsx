'use client'
import { Pagination } from '@heroui/react'
import { useLocale } from 'next-intl'

const pageSize = 20
export default function Index(props: any) {
  const { blogList, total, page, categoryType } = props
  const locale = useLocale()

  const onPageChange = (page: any) => {
    // 判断是否有 _page 后缀，有的话就替换掉
    const url = location.href.replace(/_page\d+/, `_page${page}`)
    // 没有的话就加上
    if (!url.includes('_page')) {
      location.href = `${url}_page${page}`
    } else {
      location.href = url
    }
  }

  const getFullPath = (pathname: string) => {
    const baseUrl = ''

    if (!pathname) {
      return locale === 'en' ? baseUrl : baseUrl + `/${locale}`
    }
    return locale === 'en' ? baseUrl + `${pathname}` : baseUrl + `/${locale}${pathname}`
  }

  return (
    <div>
      {blogList.length > 0 && (
        <>
          <div className="list">
            {blogList.map((item: any, index: number) => (
              <a href={getFullPath(`${item.url_key}`)} key={index}>
                <div className="item" key={index}>
                  <h3 className="title">{item.name}</h3>
                  <div className="des text-ellipsis-2 ">{item.short_description}</div>
                </div>
              </a>
            ))}
          </div>
          <div className="footer">
            <Pagination
              total={Math.ceil(total / pageSize)}
              page={Number.parseInt(page)}
              onChange={onPageChange}
              showControls
              showShadow
              color="primary"
            />
          </div>
        </>
      )}
    </div>
  )
}
