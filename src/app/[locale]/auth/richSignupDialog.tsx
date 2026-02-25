'use client'
import { useTranslations } from '@/hooks/useTranslations'
import * as React from 'react'
import { useContext, useState } from 'react'
import { Modal, ModalBody, ModalContent } from '@heroui/react'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import RichSignupStarter from '@/app/[locale]/auth/richSignupStarter'
import SignupEmailControl from '@/app/[locale]/auth/signupEmailControl'
import DialogCloseIcon from '@/components/dialogCloseIcon'
import { EventEntry } from '@/context/GTMContext'

export default function RichSignupDialog() {
  const { isOpen, toggleRichSignupDialog, toggleLoginDialog } = useContext(AuthDialogContext)
  const t = useTranslations('Auth')
  const [isEmailSignup, setIsEmailSignup] = useState(false)

  return (
    <Modal isOpen={isOpen} onOpenChange={toggleRichSignupDialog} className="rounded-2xl max-w-3xl" hideCloseButton>
      <ModalContent>
        <DialogCloseIcon onClick={toggleRichSignupDialog} />
        <ModalBody className="p-0">
          <div className="flex">
          <div className="bg-[#EDFFF4] min-w-[295px] hidden md:flex justify-center items-center rounded-tl-2xl rounded-bl-2xl">
            <img width={223} src="/register-overview.png" alt="register overview" />
          </div>
          {isEmailSignup ? (
            <div className="m-3 flex-1">
              <SignupEmailControl onBack={() => setIsEmailSignup(false)} onSignup={toggleRichSignupDialog} />
            </div>
          ) : (
            <RichSignupStarter
              onGotoEmailSignup={() => setIsEmailSignup(true)}
              onSignup={toggleRichSignupDialog}
              onGotoLogin={() => toggleLoginDialog(true, EventEntry.RichSignupDialog)}
            />
          )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
