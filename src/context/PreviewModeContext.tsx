'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export const PreviewModeContext = createContext({
  isPreview: false,
})

export const PreviewModeProvider = ({ children, previewToken }: { children: any; previewToken?: string }) => {
  const searchParams = useSearchParams()
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    setIsPreview(searchParams.get('pt') === previewToken)
  }, [])

  return (
    <PreviewModeContext.Provider
      value={{
        isPreview,
      }}
    >
      <div style={isPreview ? { paddingTop: '1.25rem' } : undefined}>{children}</div>
    </PreviewModeContext.Provider>
  )
}

export const usePreviewMode = () => {
  return useContext(PreviewModeContext)
}
