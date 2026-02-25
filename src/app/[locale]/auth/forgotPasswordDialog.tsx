'use client'
import * as React from 'react'
import { useContext } from 'react'
import { Modal, ModalBody, ModalContent } from '@heroui/react'
import { AuthDialogContext } from '@/context/AuthDialogContext'
import ForgotPasswordStarter from "@/app/[locale]/auth/forgotPasswordStarter";
import DialogCloseIcon from '@/components/dialogCloseIcon'

export default function ForgotPasswordDialog() {
  const { isOpen, toggleForgotPasswordDialog, toggleLoginDialog } = useContext(AuthDialogContext)

  return (
    <Modal isOpen={isOpen} onOpenChange={toggleForgotPasswordDialog} className="rounded-2xl">
      <ModalContent>
        <DialogCloseIcon onClick={toggleForgotPasswordDialog} />
        <ModalBody className="pt-10 sm:pt-6">
          <ForgotPasswordStarter onGotoLogin={() => toggleLoginDialog(true)} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
