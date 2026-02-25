'use client'
import { useTranslations } from 'next-intl'

export default function Index(props: any) {
  const { data, categoryId } = props
  const { article, last, next, also_like_list } = data
  const t = useTranslations('article')
  console.log(data)

  const onOpenDetail = (id: number) => {
    location.href = `/category/detail/id_${id}_category_${categoryId}`
  }

  const onClickMore = () => {
    location.href = `/category/ai-trending_${categoryId}_page1`
  }

  const renderRelated = () => {
    return (
      <div className="related">
        <div className="sub_title" onClick={onClickMore}>
          <span>Related Posts</span>
          <span className="more">
            View More
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        <div className="list">
          {!!also_like_list.length &&
            also_like_list.map((item) => (
              <div
                className="item"
                key={item.id}
                onClick={() => {
                  onOpenDetail(item.blog_id)
                }}
              >
                <div className="name">{item.name}</div>
                <div className="des text-ellipsis-2">{item.short_description}</div>
                <div className="info">
                  <img
                    alt=""
                    src={
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                    }
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{item.author}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="blog-detail">
      <div className="title">{article?.name}</div>
      <div className="publish-info sm:my-12">
        <div className="avatar">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            className="mx-auto size-10 rounded-full"
          />
          <div className="author">
            <div>{t('written_by')}</div>
            <div className="name">{article?.author}</div>
          </div>
        </div>
        <div className="date">
          <span>{t('updated_on')}:</span>
          {article?.updated_at}
        </div>
      </div>
      <div className="descriptions">
        <div dangerouslySetInnerHTML={{ __html: article?.description }} />
      </div>
      <div className="footer" style={{display: 'none'}}>
        <button
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            last.id && onOpenDetail(last.id)
          }}
          disabled={!last.id}
        >
          preview
        </button>
        <button
          className="ml-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            next.id && onOpenDetail(next.id)
          }}
          disabled={!next.id}
        >
          next
        </button>
      </div>
      {renderRelated()}
    </div>
  )
}
