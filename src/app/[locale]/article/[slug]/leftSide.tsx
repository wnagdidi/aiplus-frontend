'use client'
import { useLocale } from 'next-intl'
export default function Index(props: any) {
  const { list, currentId } = props
  const locale = useLocale()

  const getFullPath = (pathname: string) => {
    const baseUrl = ''

    if (!pathname) {
      return locale === 'en' ? baseUrl : baseUrl + `/${locale}`
    }
    return locale === 'en' ? baseUrl + `/${pathname}` : baseUrl + `/${locale}/${pathname}`
  }

  return (
    <div className="left-side">
      <div className="title">Table of Content</div>
      <div className="list">
        {list.map((item, index) => (
          <div className="item" key={index}>
            <a
              className={`name text-ellipsis-2 ${currentId == item.id && 'active'}`}
              href={getFullPath(`category/${item.url_key}`)}
            >
              {item.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
