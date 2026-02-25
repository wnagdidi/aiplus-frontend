import { Button } from "@heroui/react"
import React from "react"

interface MainButtonProps extends React.ComponentProps<typeof Button> {}

export default function MainButton(props: MainButtonProps) {
  const { className = "", isDisabled, ...rest } = props
  const base = "bg-gradient-to-r from-[#9E54FF] to-[#507AF6] hover:from-[#B47EFF] hover:to-[#85A2FF] rounded-sm text-white disabled:opacity-30 disabled:text-white"
  return <Button className={`${base} ${className}`} isDisabled={isDisabled} {...rest} />
}
