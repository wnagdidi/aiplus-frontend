This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

prepare environments:
```
node 18.x
pnpm 9.x
```

First, install dependencies
```bash
pnpm install
```

Then, run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Directory Structure

```
project/
├── src/                                # 项目源代码目录
│   ├── app/                            # App Router 主目录
│   │   ├── [locale]/                   # i18n 路由
│   │   │   ├── layout.ts               # 应用的根布局文件（所有页面都会使用这个布局）
│   │   │   ├── page.ts                 # 应用的首页（对应 "/" 路由）
│   │   │   ├── globals.css             # 全局 CSS 文件
│   │   │   └── pricing/                # 子路由 /pricing
│   │   │       └── page.ts             # Pricing 页面（对应 "/pricing" 路由）
│   │   ├── api/                        # API 路由 
│   │   │   └── auth/                   # Next-Auth API 子路由 /api/auth
│   │   │       └── [...nextauth]/      # Next-Auth API 子路由 /api/auth/{}
│   │   │           └── route.ts        # Next-Auth 处理逻辑   /api/auth/{}
│   │   ├── robots.ts                   # 生成网站 robots 信息 (SEO优化)
│   │   └── sitemap.ts                  # 生成网站 sitemap 信息 (SEO优化)
│   │ 
│   ├── api/                            # http client 目录
│   │   ├── client/                     # 客户端 api （从客户端发起的请求）
│   │   │   ├── billingApi.ts           # Billing 模块的 api
│   │   │   ├── billingApi.interface.ts # Billing 模块的 api 的类型（会被外部引用类型放在这里）
│   │   │   └── clientApiClient.ts      # 客户端 api 的 axios 封装 
│   │   ├── server/                     # 服务端 api（从服务端 SSR 发起的请求）
│   │   │   ├── userApi.ts              # User 模块的 api
│   │   │   ├── userApi.interface.ts    # User 模块的 api 的类型（会被外部引用类型放在这里）
│   │   │   └── serverApiClient.ts      # 服务端 api 的 axios 封装 
│   │   ├── core/                       # 客户端服务端api共用的部分
│   │   │   └── billing.ts              # 客户端服务端共用的逻辑，通常是一些共用的类型
│   │   └── strapi/                     # 客户端服务端api共用的部分
│   │       └── articleApi.ts           # Strapi article api，也是从服务端发起的请求
│   │
│   ├── components/                     # 可复用的组件
│   │   ├── MainButton.ts               # 网站主按钮封装（渐变色的那个）
│   │   └── ArrowRightCircleIcon.ts     # MUI Icons 不支持的，自定义的 SVG ICON
│   ├── context/                        # React Context (provider)
│   │   └── GTMContext.ts               # 封装 GTM 工具类，在这个 context 下的所有页面都可以使用该 context 提供的方法
│   ├── provider/                       # React Context provider 目录（deprecated，使用 context 目录）
│   ├── hooks/                          # 自定义 hook
│   │   ├── getTranslations.ts          # i18n 翻译 hook （服务端使用）
│   │   └── useTranslations.ts          # i18n 翻译 hook （客户端使用）
│   ├── messages/                       # i18n 文案所在目录
│   │   ├── en.json                     # 英文文案，一般我们先修改这个文件
│   │   ├── change.json                 # 变更的文案，除了 en 外，其他语言目前都是机器翻译（/translate-i18n.sh) 执行翻译时，会仅翻译和更新change.json 里头的文本
│   │   └── zh.json                     # 简体中文翻译，由翻译脚本维护，必要时也可手动修正
│   └── util/                           # 自定义工具类
│
├── public/                             # 静态文件（图片、字体等）
├── .env                                # 默认的环境变量
├── .env.local                          # 本地覆盖的环境变量
├── .env.production                     # 生产环境覆盖的环境变量
├── next.config.mjs                     # Next.js 配置文件
├── package.json                        # 项目依赖和脚本
├── .eslintrc.js                        # ESLint 配置
├── translate-i18n.sh                   # i18n 翻译脚本，在 change.json 中准备好要翻译的文本 以及 translate.config.js 中设置好要翻译的语言后执行此脚本进行翻译，执行完成后 messages 中的翻译文件将会更新
├── translate.config.js                 # i18n 翻译配置，由于google翻译api 有频率限制，建议在文本数量多的情况下，分批（每批几个语言）去翻译。否则触发了 google的请求限制后，需要等很长时间才能继续用
└── README.md                           # 项目说明文档

```

## i18n flow

all texts should be localized.

1. define your text in `/src/messages/en.json`, for example
```json
{
    "Billing": {
        "full_name_on_card": "Full name on card",
        "subscribe_plan": "Subscribe to {planName}"
    }
}
```
you can define variables in the text with `{` `}`

2. use hooks useTranslations for client, getTranslations for server
```tsx
import { useTranslations } from '@/hooks/useTranslations'

export default function Page() {
  const t = useTranslations()
  const tBilling = useTranslations('Billing')
}

```
3. render text using the hook and text key
```tsx
<div>
  {tBilling('full_name_on_card')}
</div>
<div>
  {tBilling('subscribe_plan', { planName: 'Unlimited' })}
</div>

// or

<div>
{t('Billing.full_name_on_card')}
</div>

```
4. clear `/src/messages/change.json` and copy text changes to `/src/messages/change.json`
5. modify `translate.config.js`, all locales are skipped by default. translate tool uses Google translate which has limited the request rate. So suggest to translate 5-8 locales one time.
6. run `sh translate-i18n.sh`, wait for the process done. Once done, the corresponding json file will be updated. 

## Data Tracking
Currently, we use GTM to distribute events to third party systems (e.g. Google Analysis, PostHog, Facebook Meta, Google AD)

### Init GTM
GoogleTagManager is a class provided by next.js third parties lib. It init GTM using gtmId when dom ready.
```typescript jsx
// layout.ts

import {GoogleTagManager} from '@next/third-parties/google';

<GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
```

### GTMContext
GTM Context use React Context to provide a unified interface to send event to GTM
```typescript jsx
// layout.ts
<GTMProvider>
  ...
</GTMProvider>
```

```typescript jsx
// GTMProvider.ts

import { sendGTMEvent } from '@next/third-parties/google'

const sendEvent = (eventName: string, data?: any) => {
  try {
    sendGTMEvent({
      event: eventName,
      context: getContext(),
      ...data,
    })
  } catch (e) {
    console.error('something wrong sending GTM event', e)
  }
}
```
### Send event
Get `sendEvent` interface from `useGTM` hook provided by GTMContext
```typescript jsx
import {useGTM} from '@/context/GTMContext'

const { sendEvent } = useGTM()
sendEvent('login', { type: LoginType.Email })
```
the parameter `type` will be sent with the event. 

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!