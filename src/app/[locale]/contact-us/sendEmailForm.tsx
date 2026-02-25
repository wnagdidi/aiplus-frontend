'use client'
import * as React from 'react'
import {useState} from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import CoreApiError from '@/api/core/coreApiError'
import {useSession} from 'next-auth/react'
import {sendSupportEmail} from '@/api/client/userApi'
import RichSuccessIcon from '@/components/RichSuccessIcon'
import DialogCloseIcon from '@/components/dialogCloseIcon'
import { Button, Input, Textarea, Modal, ModalBody, ModalContent, Spinner } from '@heroui/react'

export default function SendEmailForm() {
  const { data: session } = useSession()
  const tAuth = useTranslations('Auth')
  const tCommon = useTranslations('Common')
  const tContactUs = useTranslations('ContactUs')
  const tError = useTranslations('Error')
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const firstName = data.get('firstName') || session?.user?.firstName
    const lastName = data.get('lastName') || session?.user?.lastName
    const email = data.get('email') || session?.user?.email
    const content = data.get('content') as string
    console.log(firstName, lastName, email, content)
    setSaving(true)
    try {
      await sendSupportEmail({ firstName, lastName, email: email.trim().toLowerCase(), content })
      setResultDialogOpen(true)
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
      {error && (
        <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg mb-3">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            defaultValue={session?.user.firstName as any}
            isRequired
            label={tAuth('first_name')}
            name="firstName"
            isDisabled={!!session}
            autoComplete="username"
          />
          <Input
            defaultValue={session?.user.lastName as any}
            isRequired
            label={tAuth('last_name')}
            name="lastName"
            isDisabled={!!session}
            autoComplete="username"
          />
        </div>
        <Input
          defaultValue={session?.user.email as any}
          isRequired
          isDisabled={!!session}
          label={tAuth('email')}
          name="email"
          autoComplete="email"
        />
        <Textarea
          label={tCommon('message')}
          name="content"
          isRequired
          minRows={5}
        />
        <Button type="submit" size="lg" color="primary" className="w-full" isDisabled={saving}>
          {saving ? <Spinner size="sm" className="mr-2" /> : null}
          {tAuth('submit')}
        </Button>
      </form>

      <Modal
        isOpen={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
        size="sm"
        hideCloseButton
        placement="center"
        classNames={{
          base: 'rounded-xl',
          wrapper: 'p-3',
          backdrop: 'backdrop-blur-none',
        }}
      >
        <ModalContent className="bg-white rounded-xl overflow-hidden">
          {/* 右上角关闭按钮与 MUI 行为一致 */}
          <button
            aria-label="close"
            onClick={() => setResultDialogOpen(false)}
            className="absolute right-3 top-3 p-1 rounded-full"
          >
            <DialogCloseIcon />
          </button>
          <ModalBody className="py-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <RichSuccessIcon fontSize="72px" />
              <div className="mt-3 text-base">{tContactUs('send_success')}</div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
