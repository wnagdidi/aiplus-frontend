// 导入必要的React和Material-UI组件
import * as React from 'react'
import { useState } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import SignupAgreement from '@/app/[locale]/auth/signupAgreement'
import { Button, Input } from '@heroui/react'
import Link from 'next/link'
import { signup } from '@/api/client/signupApi'
import CoreApiError from '@/api/core/coreApiError'
import { signIn } from 'next-auth/react'
import { useSnackbar } from '@/context/SnackbarContext'
import PasswordWithConfirmFormItems from '@/components/PasswordWithConfirm'
import { LoginType, useGTM } from '@/context/GTMContext'
import { getStoredTracking } from '@/util/tracking'
import { AnalyticsEventType } from '@/utils/events/analytics'

// 定义组件的属性接口，使用TypeScript进行类型检查
interface SignupEmailCreateAccountFormProps {
  email: string // 用户邮箱
  token: string // 验证token
  onCreate: () => void // 创建成功后的回调函数
}

// 导出默认组件：邮箱注册创建账号表单
// 使用TypeScript的函数组件语法，接收props并进行解构
export default function SignupEmailCreateAccountForm({ email, token, onCreate }: SignupEmailCreateAccountFormProps) {
  // 使用useTranslations钩子获取翻译函数
  const t = useTranslations('Auth')
  const tError = useTranslations('Error')

  // 使用useState钩子管理组件状态
  const [error, setError] = useState<any>(null) // 错误信息状态
  const [creating, setCreating] = useState(false) // 创建账号的加载状态
  const [passwordErrors, setPasswordErrors] = useState<any>(null) // 密码错误状态

  // 使用自定义钩子获取上下文
  const { showSnackbar } = useSnackbar() // 获取消息提示函数
  const { sendEvent, reportEvent } = useGTM() // 获取GTM事件发送函数

  // 表单提交处理函数
  // 使用async/await处理异步操作
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // 阻止表单默认提交行为

    // 如果存在密码错误，直接返回
    if (passwordErrors?.password || passwordErrors?.confirmPassword) {
      return
    }

    // 获取表单数据
    const data = new FormData(event.currentTarget)
    const firstName = data.get('firstName') as string
    const lastName = data.get('lastName') as string
    const password = data.get('password') as string

    setCreating(true) // 设置创建状态为true
    try {
      // 调用注册API
      await signup({
        email: email.trim().toLowerCase(),
        token,
        firstName,
        lastName,
        password,
      })

      // 注册成功后自动登录
      const result = await signIn('login-username', {
        redirect: false,
        username: email.trim().toLowerCase(),
        password: password,
      })

      // 处理登录结果
      if ((result as any).ok) {
        showSnackbar(t('sign_up_success')) // 显示成功提示

        // 发送GTM事件
        sendEvent('sign_up', {
          type: LoginType.Email,
          custom_data: { currency: 'USD', value: 1, method: 'email' },
          email: email.trim().toLowerCase(),
          first_name: firstName,
          last_name: lastName,
        })
      } else {
        reportEvent(AnalyticsEventType.MAIL_REGISTER_FAILED, {
          type: LoginType.Email,
          custom_data: { currency: 'USD', value: 1, type: 'email' },
        })
        showSnackbar("There's something wrong sign you in, please sign in manually", 'warning')
      }
      onCreate() // 调用创建成功的回调
    } catch (e: any) {
      // 错误处理
      if (e instanceof CoreApiError) {
        setError(tError(e.code, e.context())) // 设置API错误信息
      } else {
        setError(e.message) // 设置一般错误信息
      }
    } finally {
      setCreating(false) // 重置创建状态
    }
  }

  // 组件渲染JSX
  return (
    <>
      {/* 标题部分 */}
      <h2 className="text-2xl font-semibold">{t('sign_up_email_create_account_title')}</h2>
      <p className="mt-1 text-sm">{t('sign_up_email_create_account_subtitle')}</p>

      {/* 表单容器 */}
      <div className="mt-2 text-left max-w-[360px]">
        {/* 错误提示 */}
        {error && <div className="mb-1 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          {/* 姓名输入网格 */}
          <div className="grid grid-cols-2 gap-2">
            {/* 名字输入框 */}
            <Input
              isRequired
              id="firstName"
              label={t('first_name')}
              name="firstName"
              autoComplete="username"
              autoFocus
            />
            {/* 姓氏输入框 */}
            <Input
              isRequired
              id="lastName"
              label={t('last_name')}
              name="lastName"
              autoComplete="username"
            />
          </div>

          {/* 密码输入组件 */}
          <PasswordWithConfirmFormItems onErrors={setPasswordErrors} />

          {/* 服务条款同意复选框 */}
          <div className="mt-1">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" required className="accent-primary" />
              <span>
                {t('accept_the') + '  '}
                <Link href="/term-and-services" target="_blank" className="text-primary">
                  {t('terms_and_conditions')}
                </Link>
              </span>
            </label>
          </div>

          {/* 提交按钮 */}
          <Button type="submit" isLoading={creating} fullWidth color="primary" size="lg" className="mt-2">
            {t('create_account')}
          </Button>
        </form>
      </div>

      {/* 注册协议组件 */}
      <div className="mt-4">
        <SignupAgreement />
      </div>
    </>
  )
}
