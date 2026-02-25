import * as React from 'react'
import {useState} from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import { Input, Button } from '@heroui/react'
import CoreApiError from '@/api/core/coreApiError'
import {useSession} from 'next-auth/react'
import {useSnackbar} from '@/context/SnackbarContext'
import {updateProfile} from "@/api/client/userApi";
import BackButton from '@/app/[locale]/auth/backButton'
import {useRouter} from '@/components/next-intl-progress-bar'
import { getCookie } from '@/util/cokkie'
import { getLocalStorage } from '@/util/localStorage'

interface ProfileFormProps {
  onSuccess: () => void
}
export default function ProfileForm({ onSuccess }: ProfileFormProps) {
  const { data: session, update } = useSession()
  const t = useTranslations('Auth')
  const tCommon = useTranslations('Common')
  const tError = useTranslations('Error')
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const { showSnackbar } = useSnackbar()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const firstName = data.get('firstName') || session.user.firstName
    const lastName = data.get('lastName') || session.user.lastName
    setSaving(true)
    try {
      // 从cookie获取UTM参数
      const utmSource = getCookie('utm_source') || undefined
      const utmCampaign = getCookie('utm_campaign') || undefined
      // 从localStorage获取fbclid
      const storedTracking = getLocalStorage<any>('AVOID_AI_TRACKING') || {}
      const fbclid = storedTracking.fbclid || undefined
      
      await updateProfile({ 
        firstName, 
        lastName,
        ...(utmSource && { utmSource }),
        ...(utmCampaign && { utmCampaign }),
        ...(fbclid && { fbclid }),
      })
      await update({ firstName, lastName })
      showSnackbar(t('saved_changes'))
      onSuccess()
    } catch (e: any) {
      if (e instanceof CoreApiError) {
        setError(tError(e.code, e.context()))
      } else {
        setError(e.message)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <BackButton onBack={onSuccess} size="default" className="absolute top-4 left-5" />
      <div className="w-full max-w-md mx-auto mt-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            {tCommon('edit_profile')}
          </h2>
        </div>
        <div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                defaultValue={session.user.firstName}
                isRequired
                type="text"
                id="firstName"
                label={t('first_name')}
                name="firstName"
                autoComplete="username"
                autoFocus
                className="w-full"
              />
              <Input
                defaultValue={session.user.lastName}
                isRequired
                type="text"
                id="lastName"
                label={t('last_name')}
                name="lastName"
                autoComplete="username"
                className="w-full"
              />
            </div>
            <Input
              defaultValue={session.user.email}
              type="email"
              id="email"
              label={t('email')}
              name="email"
              autoComplete="email"
              isDisabled
              className="w-full"
            />
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full mt-6"
              isLoading={saving}
              loadingText={t('saving')}
            >
              {t('save_changes')}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
