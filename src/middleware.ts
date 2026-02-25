import { isHomePage } from '@/util/api'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales } from './i18n.config'

// 创建 next-intl 中间件
const intlMiddleware = createMiddleware({
  defaultLocale: 'en',
  locales,
  localeDetection: false,
  localePrefix: 'as-needed',
})

const excludePath = (pathname: string) => {
  const list = [
    '/en',
    '/ai-rewriter',
    '/ai-detector',
    '/ai-to-human-text-converter',
    '/ai-translator',
    '/bypass-ai',
    '/pricing',
    '/about-us',
    '/term-and-services',
    '/privacy-policy',
    '/refund-policy',
    '/contact-us',
    '/checkout',
    '/login',
    '/article',
  ]
  for (let i = 0; i < locales.length; i++) {
    const lan = locales[i]
    const arr = pathname.split('/')
    if (arr.length === 3) {
      if (arr[1] === lan && list.includes(`/${arr[2]}`)) {
        return true
      }
    }
  }
  return list.includes(pathname)
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.href
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'Unknown IP'
  const { pathname } = req.nextUrl

  console.log(`[访问日志] IP: ${ip}, URL: ${url}, 时间: ${new Date().toISOString()}`)

  const cloakEnabled = (process.env.CLOAK_ENABLED || '').toLowerCase() === 'true'
  const cloakRedirectDomain = (process.env.CLOAK_REDIRECT_DOMAIN || '').trim()
  // 斗篷逻辑：必须配置跳转域名
  if (cloakEnabled && cloakRedirectDomain) {
    const coreApiBaseUrl = (process.env.CORE_API_BASE_URL || '').trim()
    if (!coreApiBaseUrl) {
      return intlMiddleware(req)
    }

    try {
      // 检查是否已有 cookie 记录，如果有则跳过接口调用
      const visitAuthCookie = req.cookies.get('visit_auth_checked')
      let shouldSetCookie = false

      if (visitAuthCookie?.value === 'false') {
        console.log('[cloak] Using cached visit auth result (false), skipping API call')
        // 如果 cookie 存在且值为 false，说明之前已经验证过不需要跳转，直接继续
        // 继续执行后续逻辑，不跳转
      } else {
        // 使用字符串拼接保留 baseUrl 的路径部分（如 /api）
        const visitauthUrl = new URL(`${coreApiBaseUrl}/auth/visit`)

        const referer = req.headers.get('referer') || ''
        const userAgent = req.headers.get('user-agent') || ''
        const cookie = req.headers.get('cookie') || ''
        const secChUa = req.headers.get('sec-ch-ua') || ''
        const cfIpCountry = req.headers.get('cf-ipcountry') || ''
        
        // 构建请求URL（仅包含路径和查询参数，不包含协议和域名）
        const requestUrl = req.nextUrl.pathname + req.nextUrl.search
        console.log('[cloak] requestUrl:' + new Date().toISOString(), requestUrl)
        const visitauthResp = await fetch(visitauthUrl.toString(), {
          method: 'POST',
          headers: {
            "X-USER-IP": typeof ip === 'string' ? ip : String(ip),
            'X-IP-COUNTRY': cfIpCountry,
            'X-Request-URL': requestUrl,
            referer,
            'user-agent': userAgent,
            cookie,
            'sec-ch-ua': secChUa,
          },
          cache: 'no-store',
        })

        if (!visitauthResp.ok) {
          throw new Error(`Request failed: ${visitauthResp.status}`)
        }

        const payload: any = await visitauthResp.json()
        console.log('[cloak] visitauthResp:' + new Date().toISOString(), payload)
        const shouldRedirect = payload?.data?.result === true

        if (shouldRedirect) {
          // 构建重定向 URL，保留原始请求的查询参数
          const redirectUrl = new URL(cloakRedirectDomain)
          // 将当前请求的查询参数复制到重定向 URL
          req.nextUrl.searchParams.forEach((value, key) => {
            redirectUrl.searchParams.set(key, value)
          })
          return NextResponse.redirect(redirectUrl.toString(), { status: 302 })
        }

        // 如果接口返回 false，标记需要设置 cookie
        shouldSetCookie = true
      }

      // 执行 intlMiddleware，如果需要设置 cookie 则在响应中设置
      const response = intlMiddleware(req)
      if (shouldSetCookie) {
        response.cookies.set('visit_auth_checked', 'false', {
          maxAge: 60 * 60 * 24 * 30, // 30 天
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        })
      }
      return response
    } catch (error) {
      console.error('[cloak] /auth/visit failed:', error)
    }
  }

  if (!isHomePage(pathname) && !excludePath(pathname)) {
    // return NextResponse.rewrite(new URL('/', url))
    // const response = NextResponse.json({ body: '404 - Page Not Found' }, { status: 404 })
    // return response
  }

  // 运行 next-intl 的中间件
  return intlMiddleware(req)
}

// 适用于指定的路由
export const config = {
  matcher: [
    // 排除静态文件和API路由
    '/((?!api|_next|_vercel|.*\\.(?!html$)[^.]+$).*)',
    '/([\\w-]+)?/hub/(.+)',
  ],
}
