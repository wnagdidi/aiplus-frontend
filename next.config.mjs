import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // 关闭构建时的 ESLint 检查
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 关闭构建时的 TypeScript 检查
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path((?!auth).*)",
        destination: `${process.env.CORE_API_BASE_URL}/:path*`, // Proxy to Backend
      },
      // 添加 favicon 重写规则
      {
        source: '/favicon.ico',
        destination: `/${process.env.NEXT_PUBLIC_BRAND_NAME.toLowerCase().replace(' ','')+'/favicon.ico'}`,
      },
      // 添加 *.html 重写规则
      {
        source: '/:path*.html',
        destination: '/:path*',
      }
    ]
  },
  // 添加 favicon 配置
  async headers() {
    return [
      {
        source: `/${process.env.NEXT_PUBLIC_BRAND_NAME.toLowerCase().replace(' ','')+'/favicon.ico'}`,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
