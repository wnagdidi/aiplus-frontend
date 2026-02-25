'use client'
import { useContext, useEffect } from 'react'
import { Modal, ModalBody, ModalContent } from '@heroui/react'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import LoginStarter from '@/app/[locale]/auth/loginStarter'
import DialogCloseIcon from '@/components/dialogCloseIcon'
import { EventEntry, useGTM } from '@/context/GTMContext'

export default function LoginDialog() {
  const { isOpen, toggleLoginDialog, toggleSignupDialog, toggleForgotPasswordDialog } = useContext(AuthDialogContext)
  const { sendEvent , reportEvent } = useGTM()

  useEffect(() => {
    if (isOpen) {
      //reportEvent('ClickLogin', {})
    }
  }, [isOpen])

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={toggleLoginDialog} className="rounded-2xl" hideCloseButton>
        <ModalContent>
          <DialogCloseIcon onClick={toggleLoginDialog} />
          <ModalBody className="px-[36px] py-[28px]">
            <LoginStarter
              signInOptions={{ redirect: false }}
              onSuccess={toggleLoginDialog}
              onGotoForgotPassword={() => toggleForgotPasswordDialog(true)}
              onGotoSignup={() => toggleSignupDialog(true, EventEntry.LoginDialog)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
