'use client'
import { Spinner } from '@heroui/react'
import {isMetaApp} from '@/util/browser'
import {useEffect, useState} from 'react'

export default function ExternalPage() {
  const [url, setUrl] = useState()
  const [isMeta, setIsMeta] = useState()

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const isMetaMobile = isMetaApp()
    setIsMeta(isMetaMobile)
    const params = {}
    for (const [key, value] of urlParams.entries()) {
      params[key] = value
    }
    setUrl(params.r)
    if (!isMetaMobile) {
      window.location.href = params.r
    }
  }, [])

  return (
    <div className="max-w-xs mx-auto mt-8 pt-8 flex flex-col items-center text-center break-words">
      {isMeta ? (
        <>
          <div className="text-lg">
            Please open this page in an external browser or manually open the following link in an external browser
          </div>
          <div className="text-base mt-4 break-all">{url}</div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-base">Redirecting...</span>
          <Spinner size="sm" />
        </div>
      )}
    </div>
  )
}
