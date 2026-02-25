import { useTranslations } from '@/hooks/useTranslations'
import { Input, Button } from '@heroui/react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface BindEmailFormProps {
  onSendCode: (email: string) => void
  onChange?: () => void
  sendCodeError?: string
  sendingCode: boolean
  resendDisabled: boolean
  resendTimer: number
}
export default function BindEmailForm({
  sendCodeError,
  sendingCode,
  resendDisabled,
  resendTimer,
  onSendCode,
  onChange,
}: BindEmailFormProps) {
  const t = useTranslations('Auth')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = data.get('email') as string
    onSendCode(email)
  }

  return (
    <>
      <h5 className="text-xl font-semibold">{t('bind_email_title')}</h5>
      <p className="text-sm mt-1">{t('bind_email_subtitle')}</p>
      <div style={{ marginTop: 16, maxWidth: 360, width: '100%' }}>
        {sendCodeError && (
          <div className="mb-1 p-2 bg-red-100 text-red-700 rounded text-sm flex items-center">
            {sendCodeError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            isRequired
            fullWidth
            id="email"
            label={t('email')}
            name="email"
            autoComplete="email"
            autoFocus
            onInput={() => onChange && onChange()}
          />
          <Button
            type="submit"
            fullWidth
            className="icon-transition-x icon-small mt-2"
            endContent={sendingCode ? undefined : <ChevronRightIcon className="w-4 h-4" />}
            isLoading={sendingCode}
            size="lg"
            color="primary"
            isDisabled={resendDisabled}
          >
            {resendDisabled ? `${resendTimer}s` : t('continue')}
          </Button>
        </form>
      </div>
    </>
  )
}
