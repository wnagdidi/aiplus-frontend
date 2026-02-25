'use client'
import * as React from 'react'
import { useContext } from 'react'
import { Modal, ModalBody, ModalContent } from '@heroui/react'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import SignupStarter from '@/app/[locale]/auth/signupStarter'
import DialogCloseIcon from '@/components/dialogCloseIcon'
import { EventEntry } from '@/context/GTMContext'

export default function SignupDialog() {
  const { isOpen, toggleSignupDialog, toggleLoginDialog } = useContext(AuthDialogContext)
  return (
    <Modal isOpen={isOpen} onOpenChange={toggleSignupDialog} className="rounded-2xl" hideCloseButton>
      <ModalContent>
        <DialogCloseIcon onClick={toggleSignupDialog} />
        <ModalBody className="px-[36px] py-[28px]">
          <SignupStarter onGotoLogin={() => toggleLoginDialog(true, EventEntry.SignupDialog)} onSignup={toggleSignupDialog} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
