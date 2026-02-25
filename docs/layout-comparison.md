# 布局组件功能对比说明

## 两个布局组件的区别

### 1. `layout.tsx` (根布局组件)

**位置**: `src/app/[locale]/layout.tsx`

**功能**:
- Next.js 的**根布局组件**，所有页面都会使用它
- 提供**全局 Context Providers**（用户会话、订阅、国际化等）
- 渲染 HTML 结构和 `<head>` 标签
- 包含全局组件（AuthDialog, PricingDialog, ProgressBar 等）

**关键 Context Providers**:
- `NextIntlClientProvider` - 国际化
- `ClientSessionProvider` - 用户会话（NextAuth）
- `ActiveSubscriptionProvider` - 订阅信息
- `SnackbarProvider` - 消息提示
- `GTMProvider` - Google Tag Manager
- `AuthDialogProvider` - 登录/注册对话框
- `PricingDialogProvider` - 定价对话框
- `BannerContextProvider` - Banner 控制
- 等其他 Providers

### 2. `FeeLoveLayout.tsx` (页面布局组件)

**位置**: `src/components/layout/FeeLoveLayout.tsx`

**功能**:
- **页面级别的布局组件**，用于特定页面
- 提供**视觉布局结构**（侧边栏 + Header + 内容区）
- 管理侧边栏的折叠状态
- 在 `layout.tsx` 的 `{children}` 内部渲染

**重要**: 由于 `FeeLoveLayout` 是在 `layout.tsx` 的 Context Providers **内部**渲染的，因此：
- ✅ **可以访问所有 Context**（用户信息、订阅数据等）
- ✅ 所有子组件也可以访问这些 Context
- ✅ `MainAppBar` 已经使用了 `useSession()` 等 Context

## 数据访问说明

### ✅ FeeLoveLayout 可以访问的数据

由于 React Context 的特性，所有嵌套在 Provider 内部的组件都可以访问这些 Context，不管嵌套层级多深。

```tsx
// 在 FeeLoveLayout 或其子组件中可以使用：

import { useSession } from 'next-auth/react'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { useBanner } from '@/context/BannerContext'
import { useGTM } from '@/context/GTMContext'
import { useContext as useAuthDialog } from '@/context/AuthDialogContext'
import { useTranslations } from '@/hooks/useTranslations'

// 使用示例：
const { data: session } = useSession()  // 用户会话
const { subscription, isPaid, isFree } = useActiveSubscription()  // 订阅信息
const { showSnackbar } = useSnackbar()  // 消息提示
```

### 组件层级关系

```
layout.tsx (根布局)
├─ NextIntlClientProvider
├─ ClientSessionProvider
├─ ActiveSubscriptionProvider
├─ SnackbarProvider
├─ GTMProvider
├─ AuthDialogProvider
├─ PricingDialogProvider
├─ BannerContextProvider
└─ {children}  ← 所有页面内容都在这里
    └─ FeeLoveLayout (页面布局)
        ├─ Sidebar
        ├─ MainAppBar (已使用 useSession 等)
        └─ {children} (页面内容)
            └─ 你的页面组件 (可以使用所有 Context)
```

## 实际使用示例

### 在页面组件中使用订阅信息

```tsx
// src/app/[locale]/feelove/page.tsx
'use client'

import FeeLoveLayout from '@/components/layout/FeeLoveLayout'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'
import { useSession } from 'next-auth/react'
import { Button } from '@heroui/react'

export default function FeeLovePage() {
  const { data: session } = useSession()
  const { subscription, isPaid, isLoading } = useActiveSubscription()

  return (
    <FeeLoveLayout>
      <div>
        <h1>欢迎, {session?.user?.name || '游客'}</h1>
        {isLoading ? (
          <p>加载中...</p>
        ) : isPaid ? (
          <p>您有活跃的订阅: {subscription?.plan?.name}</p>
        ) : (
          <Button>升级到付费版</Button>
        )}
      </div>
    </FeeLoveLayout>
  )
}
```

### 在 Sidebar 中使用用户信息

```tsx
// src/components/layout/Sidebar.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useActiveSubscription } from '@/context/ActiveSubscriptionContext'

export default function Sidebar() {
  const { data: session } = useSession()
  const { isPaid } = useActiveSubscription()

  return (
    <aside>
      {session && (
        <div>
          <p>{session.user?.name}</p>
          {isPaid && <Badge>PRO</Badge>}
        </div>
      )}
      {/* ... */}
    </aside>
  )
}
```

## 总结

| 特性 | layout.tsx | FeeLoveLayout.tsx |
|------|------------|-------------------|
| 层级 | 根布局 | 页面布局 |
| Context Providers | ✅ 提供所有全局 Context | ❌ 不提供（使用父级的） |
| 访问 Context | ✅ 可以访问 | ✅ **可以访问所有 Context** |
| HTML 结构 | ✅ 包含 `<html>`, `<head>`, `<body>` | ❌ 不包含 |
| 视觉布局 | ❌ 不负责 | ✅ 负责侧边栏、Header、内容区布局 |
| 使用范围 | 全局（所有页面） | 特定页面（需要时使用） |

**结论**: `FeeLoveLayout` 完全可以访问用户信息和订阅数据，因为它是在所有 Context Providers 内部渲染的。你可以在 `FeeLoveLayout` 及其任何子组件中使用 `useSession()` 和 `useActiveSubscription()` 等 Hook。
