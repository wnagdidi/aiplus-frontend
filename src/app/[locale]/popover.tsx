import * as React from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react'

export default function MouseHoverPopover(props: any) {
  const { trigger, popContent } = props
  const [isOpen, setIsOpen] = React.useState(false)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  return (
    <div style={{ display: 'inline-flex' }}>
      <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom" disableAnimation>
        <PopoverTrigger>
          <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
            {trigger}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] sm:w-[340px] max-w-[86vw] p-4 rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-none">
          <div className="arrow"></div>
          {popContent}
        </PopoverContent>
      </Popover>
    </div>
  )
}
