'use client'
import { Button } from '@heroui/react'
import {useRouter} from '@/components/next-intl-progress-bar'
import {usePreviewMode} from "@/context/PreviewModeContext";

export default function PreviewModeBanner() {
  const router = useRouter()
  const { isPreview } = usePreviewMode()

  const handleExitPreview = () => {
    window.location.href = '/'
  }

  if (!isPreview) {
    return
  }

  return (
    <div
      style={{
        background: '#8C57FF',
        textAlign: 'center',
        padding: 8,
      }}
    >
      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'white' }}>
        <span style={{ color: 'white', fontSize: 12 }}>
          您当前处于预览模式。在此模式下，您可以查看尚未发布的变更。
        </span>
        <Button
          onPress={handleExitPreview}
          variant="light"
          size="sm"
          className="min-w-[90px] underline text-white hover:text-white"
        >
          退出预览模式
        </Button>
      </div>
    </div>
  )
}
