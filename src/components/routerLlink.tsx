import { useRouter } from '@/components/next-intl-progress-bar'

export default function Link({ href, children, ...props }: any) {
  const router = useRouter()

  const handleClick = (event) => {
    event.preventDefault() // 防止默认的 <a> 标签行为
    if (href !== '#') {
      router.push(href)
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}
