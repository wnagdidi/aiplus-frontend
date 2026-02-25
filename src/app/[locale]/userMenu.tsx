import * as React from "react"
import { useState } from "react"
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Divider } from "@heroui/react"
import { 
  ArrowRightOnRectangleIcon, 
  UserIcon, 
  ChatBubbleLeftRightIcon, 
  SparklesIcon,
  CreditCardIcon,
  ClockIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline"
import { useTranslations } from "@/hooks/useTranslations"
import { signOut, useSession } from "next-auth/react"
import { useSnackbar } from "@/context/SnackbarContext"
import MainButton from "@/components/MainButton"
import PremiumIcon from "@/components/PremiumIcon"
import { usePricingDialog } from "@/context/PricingDialogContext"
import { useActiveSubscription } from "@/context/ActiveSubscriptionContext"
import { useRouter } from "@/components/next-intl-progress-bar"
import UserDialog from "@/app/[locale]/userDialog"
import { EventEntry } from "@/context/GTMContext"
import { isMobile } from "@/util/browser"
import { useParams } from "next/navigation"
import { useEffect, useContext } from "react"
import { getLocalStorage, removeLocalStorage } from "@/util/localStorage"
import { AuthDialogContext } from "@/context/AuthDialogContext"

export interface UserMenuProps {
  disabeldUpgrade?: Boolean
}
export default function UserMenu(props?: UserMenuProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const { showSnackbar } = useSnackbar()
  const t = useTranslations("Common")
  const { openDialog: openPricingDialog } = usePricingDialog()
  const { subscription } = useActiveSubscription()
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [guestSession, setGuestSession] = useState<any>(null)
  const { toggleSignupDialog } = useContext(AuthDialogContext)

  // 检查访客 session
  useEffect(() => {
    const updateGuestSession = () => {
      // 如果 NextAuth session 中有访客用户信息，不需要从 localStorage 读取
      if (session?.user?.isGuest) {
        // NextAuth session 中已有访客信息，不需要 guestSession
        setGuestSession(null)
        return
      }
      
      // 如果没有 NextAuth session，检查 localStorage 中的访客 session
      if (!session) {
        try {
          const storedSession = getLocalStorage<any>('AVOID_AI_SESSION')
          if (storedSession?.user?.accessToken && storedSession.user.isGuest) {
            setGuestSession(storedSession)
          } else {
            setGuestSession(null)
          }
        } catch (error) {
          setGuestSession(null)
        }
      } else {
        // 有 NextAuth session 但不是访客用户，清除 guestSession
        setGuestSession(null)
      }
    }

    // 初始检查
    updateGuestSession()

    // 监听访客 session 更新事件
    const handleGuestSessionUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ session: any }>
      if (customEvent.detail?.session) {
        setGuestSession(customEvent.detail.session)
      } else {
        // 如果没有 session，重新检查 localStorage
        updateGuestSession()
      }
    }

    // 监听 localStorage 变化（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'AVOID_AI_SESSION' && !session) {
        updateGuestSession()
      }
    }

    window.addEventListener('guestSessionUpdated', handleGuestSessionUpdated)
    window.addEventListener('storage', handleStorageChange)
    
    // 监听 NextAuth session 变化（当访客用户通过 signIn 创建 session 后）
    // 由于 useSession 会自动更新，这里主要是确保 guestSession 状态正确

    return () => {
      window.removeEventListener('guestSessionUpdated', handleGuestSessionUpdated)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [session])

  // 获取当前用户信息（登录用户或访客用户）
  const currentUser = session?.user || guestSession?.user
  // 判断是否为访客用户（从 NextAuth session 或 localStorage）
  const isGuest = session?.user?.isGuest || guestSession?.user?.isGuest

  const handleLogout = async () => {
    // 如果是访客用户，清除 localStorage 中的 session
    const isGuestUser = session?.user?.isGuest || guestSession?.user?.isGuest
    if (isGuestUser) {
      removeLocalStorage('AVOID_AI_SESSION')
      setGuestSession(null)
      // 如果 NextAuth session 中有访客信息，也需要登出
      if (session?.user?.isGuest) {
        await signOut({ callbackUrl: "/" })
      }
      showSnackbar(t("logout_success"))
      return
    }
    // 登录用户使用 NextAuth 登出
    await signOut({ callbackUrl: "/login" })
    showSnackbar(t("logout_success"))
    if (window.FB) {
      window.FB.logout()
    }
  }

  const handleNavigateToMyAi = (tab: string) => {
    const locale = params?.locale || 'en'
    router.push(`/${locale}/my-ai?tab=${encodeURIComponent(tab)}`)
  }
  return (
    <React.Fragment>
      <div className="flex items-center space-x-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="light"
              className="p-0 min-w-0 h-auto"
              aria-label="User menu"
            >
              <div className="flex items-center space-x-2">
                <Avatar
                  size="sm"
                  src={currentUser?.avatar}
                  alt={currentUser?.name || 'Guest'}
                  className="w-7 h-7 md:w-8 md:h-8"
                />
                {/* <span className="text-foreground text-sm">{currentUser?.name}</span> */}
              </div>
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="User menu"
            classNames={{
              base: "min-w-[12rem] sm:min-w-[14rem] border border-white/20 rounded-md"
            }}
          >
            {/* User Info Section */}
            <DropdownItem
              key="user-info"
              isReadOnly
              className="h-auto cursor-default"
              textValue="user-info"
            >
              <div className="flex flex-col space-y-1 px-2 py-1.5">
                <p className="text-sm font-medium leading-none text-gray-400">
                  {isGuest 
                    ? (currentUser?.name || `Guest-${(currentUser?.id || guestSession?.user?.id)?.toString().slice(-6).toUpperCase() || 'GUEST'}`)
                    : (currentUser?.name || 'Guest')}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {isGuest 
                    ? 'Anonymous account'
                    : (currentUser?.email || '')}
                </p>
              </div>
            </DropdownItem>
            <DropdownItem key="divider-1" className="opacity-0 cursor-default h-px">
              <Divider className="-mx-1 my-1" />
            </DropdownItem>
            {/* Bind Email - 仅访客用户显示 */}
            {isGuest && (
              <>
                <DropdownItem
                  key="bind-email"
                  startContent={<EnvelopeIcon className="w-4 h-4 text-pink-400" />}
                  onPress={() => {
                    toggleSignupDialog(null, EventEntry.UserMenuBindEmailButton)
                  }}
                  className="text-pink-400"
                >
                  Bind Email
                </DropdownItem>
                <DropdownItem key="divider-bind-email" className="opacity-0 cursor-default h-px">
                  <Divider className="-mx-1 my-1" />
                </DropdownItem>
              </>
            )}
            {/* My Creations */}
            <DropdownItem
              key="my-creations"
              startContent={<UserIcon className="w-4 h-4" />}
              onPress={() => handleNavigateToMyAi('My Creations')}
            >
              My Creations
            </DropdownItem>
            {/* Billing */}
            <DropdownItem
              key="billing"
              startContent={<CreditCardIcon className="w-4 h-4" />}
              onPress={() => handleNavigateToMyAi('Billing')}
            >
              Billing
            </DropdownItem>
            {/* Credit History */}
            <DropdownItem
              key="credit-history"
              startContent={<ClockIcon className="w-4 h-4" />}
              onPress={() => handleNavigateToMyAi('Credit History')}
            >
              Credit History
            </DropdownItem>
            <DropdownItem key="divider-2" className="opacity-0 cursor-default h-px">
              <Divider className="-mx-1 my-1" />
            </DropdownItem>
            {/* Logout */}
            <DropdownItem
              key="logout"
              startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
              onPress={handleLogout}
              className="text-danger"
              color="danger"
            >
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <UserDialog isOpen={isUserDialogOpen} onClose={() => setIsUserDialogOpen(false)} />
    </React.Fragment>
  )
}
