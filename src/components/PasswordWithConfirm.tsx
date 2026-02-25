import * as React from 'react'
import { Dispatch, SetStateAction, useState } from 'react'
import {useTranslations} from '@/hooks/useTranslations'
import { Input, Button } from '@heroui/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface Errors {
  password: string
  confirmPassword: string
}
interface PasswordWithConfirmFormItemsProps {
  passwordLabel?: string,
  onErrors: Dispatch<SetStateAction<Errors>>
}
export default function PasswordWithConfirmFormItems({ onErrors, passwordLabel }: PasswordWithConfirmFormItemsProps) {
  const t = useTranslations('Auth')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword,setShowPassWord] = useState(false)
  const [showConfirmPassword,setShowConfirmPassword] = useState(false)

  const validatePassword = (password: string) => {
    if (!password) {
      return ''
    }
    const lengthRegex = /^.{6,16}$/
    const letterRegex = /[a-zA-Z]/
    const numberRegex = /\d/

    if (!lengthRegex.test(password) || !letterRegex.test(password) || !numberRegex.test(password)) {
      return t('password_format_invalid')
    }
    return ''
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value
    if(newPassword.length > 16) return
    if(newPassword.includes(' ')) return
    setPassword(newPassword)
    setConfirmPassword('')
    const update = (prev: Errors) => ({
      ...prev,
      password: validatePassword(newPassword),
      confirmPassword: '',
    })
    setErrors(update)
    onErrors(update)
  }

  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = event.target.value
    if(newConfirmPassword.length > 16) return
    if(newConfirmPassword.includes(' ')) return
    setConfirmPassword(newConfirmPassword)
    const update = (prev: Errors) => ({
      ...prev,
      confirmPassword: newConfirmPassword !== password ? t('password_confirm_invalid') : '',
    })
    setErrors(update)
    onErrors(update)
  }

  return (
    <>
      <Input
        isRequired
        fullWidth
        id="password"
        label={passwordLabel || t('password')}
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={handlePasswordChange}
        isInvalid={!!errors.password}
        errorMessage={errors.password}
        autoComplete="new-password"
        endContent={
          <button
            type="button"
            aria-label={showPassword ? 'hide the password' : 'display the password'}
            onClick={() => setShowPassWord((v) => !v)}
            className="focus:outline-none"
          >
            {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
          </button>
        }
      />
      <Input
        isRequired
        fullWidth
        id="confirmPassword"
        label={t('confirm_password')}
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        isInvalid={!!errors.confirmPassword}
        errorMessage={errors.confirmPassword}
        autoComplete="new-password"
        endContent={
          <button
            type="button"
            aria-label={showConfirmPassword ? 'hide the password' : 'display the password'}
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="focus:outline-none"
          >
            {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
          </button>
        }
      />
    </>
  )
}
