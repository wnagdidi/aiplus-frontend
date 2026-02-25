import { EventEntry } from '@/context/GTMContext'
import { usePricingDialog } from '@/context/PricingDialogContext'
import { Modal, ModalBody } from '@heroui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Index(props: any) {
  const { visible, onClose } = props

  const { openDialog: openPricingDialog } = usePricingDialog()

  const onHandleClick = () => {
    openPricingDialog(EventEntry.RecommendPricingTimer)
  }

  return (
    <Modal isOpen={visible} onOpenChange={onClose} className="[&_.heroui-modal-body]:overflow-visible">
      <ModalBody>
        <div className="content upgrade-dlg relative">
          <img src="/newHome/rocket.png" alt="" className="rocket" />
          <button className="close absolute right-2 top-2" onClick={onClose} aria-label="close">
            <XMarkIcon className="w-4 h-4" />
          </button>
          <div className="des">You've hit your word limit Please upgrade to get more words</div>
          <div className="action">
            <button onClick={onHandleClick}>Upgrade Now</button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  )
}
