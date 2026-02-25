import { getLocale, getTranslations } from 'next-intl/server'
import RightIcon from '@/components/RightIcon'
import Link from 'next/link'
import './index.scss'

export default async function Content({ categoryList }: { categoryList: any }) {
	const locale = await getLocale()
	const t = await getTranslations('article')
	const getFullPath = (pathname?: string, type?: string) => {
		const baseUrl = ''
		if (!pathname) return '#'
		let path = pathname
		if (type === 'category') {
			// 在pathname前面加上/category/
			path = `/article${path}`
		}
		return locale === 'en' ? baseUrl + `${path}` : baseUrl + `/${locale}${path.startsWith('/') ? path : '/' + path}`
	}
	return (
		<div className="wrapper-right">
			{
				categoryList.map((item: any, index: number) => (
					<div key={index} className="category-cell">
					<div className="title-box flex items-center justify-between flex-wrap md:flex-nowrap">
						<h2 className="category-title">{item.name}</h2>
						{/* More：移动端第一行右侧；桌面端排在子分类之后并靠右 */}
						<Link 
							href={getFullPath(`${item.url_key || ''}`, 'category')} 
							className="more-link order-1 md:order-2 flex items-center"
							style={{ display: 'flex' }}
						>
							<span>{t('more')}</span>
							<RightIcon className="text-xs ml-0.5" />
						</Link>
						{/* 子分类在移动端换到下一行并独占一行 */}
						<div className="sub-category-list flex gap-4 justify-start md:justify-end w-full md:w-auto order-2 md:order-1 ml-0 md:ml-auto mt-1.5 md:mt-0">
							{item.child && item.child.map((child: any, childIndex: number) => (
								<Link 
									key={childIndex}
									className="sub-category-anchor" 
									href={getFullPath(`${child.url_key || ''}`, 'category')}
									style={{ display: 'inline-block' }}
								>
									<span className="sub-category-link">{child.name}</span>
								</Link>
							))}
						</div>
					</div>
						<div className="border-t border-gray-200 mt-3 mb-3"></div>
                        <div className="first-row">
                            {item.blog_list[0]?.banner_image && (
                              <img
                                className="mr-8"
                                src={item.blog_list[0].banner_image}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                width="180"
                                height="120"
                              />
                            )}
							<div className="blog-info">
								<a href={getFullPath(`${item.blog_list[0].url_key || ''}`, 'blog')}>
									<h3 className="blog-title">{item.blog_list[0]?.name}</h3>
								</a>
								<div className="blog-desc">{item.blog_list[0]?.short_description}</div>
							</div>
						</div>
						<div className="blog-box">
							{item.blog_list.slice(1).map((blog: any, blogIndex: number) => (
								<div key={blogIndex} className="blog-item">
									<span className="text">•</span>
									<a style={{ flex: 1, minWidth: 0 }} href={getFullPath(`${blog.url_key || ''}`, 'blog')}>
										<h3 className="text blog-title">{blog.name}</h3>
									</a>
									<span className="text" style={{ flex: '0 0 auto', marginLeft: '8px', whiteSpace: 'nowrap' }}>{blog.created_at}</span>
								</div>
							))}
						</div>
					</div>
				))
			}
		</div>
	)
}