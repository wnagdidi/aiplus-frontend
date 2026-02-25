import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon'

interface DialogCloseIconProps {
  onClick: () => void
}
export default function DialogCloseIcon({ onClick }: DialogCloseIconProps) {
  return (
    <button
      onClick={onClick}
      aria-label="close"
      className="absolute right-4 top-4 z-10"
      type="button"
    >
      <CloseIcon />
    </button>
  )
}
