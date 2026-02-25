'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type DownloadStatus = 'idle' | 'preparing' | 'success' | 'error'

interface DownloadStatusContextType {
  showDownloadStatus: (status: 'preparing' | 'success' | 'error') => void
}

const DownloadStatusContext = createContext<DownloadStatusContextType>({
  showDownloadStatus: () => {},
})

export const DownloadStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<DownloadStatus>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'idle') return

    let timer: NodeJS.Timeout
    if (status === 'preparing') {
      // Preparing 状态不自动消失，等待成功或错误
      return
    } else if (status === 'success') {
      setMessage('Download started!')
      timer = setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } else if (status === 'error') {
      setMessage('Download failed')
      timer = setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [status])

  const showDownloadStatus = (newStatus: 'preparing' | 'success' | 'error') => {
    if (newStatus === 'preparing') {
      setMessage('Preparing download...')
    }
    setStatus(newStatus)
  }

  return (
    <DownloadStatusContext.Provider value={{ showDownloadStatus }}>
      {children}
      {status !== 'idle' && (
        <div
          className="pointer-events-none"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '16px',
            zIndex: 2000,
            transition: '230ms cubic-bezier(0.21, 1.02, 0.73, 1)',
            transform: 'translateY(0px)',
          }}
        >
          <div
            className="pointer-events-auto"
            style={{
              background: 'var(--background-secondary, rgb(17, 24, 39))',
              color: 'var(--foreground, rgb(255, 255, 255))',
              border: status === 'success' 
                ? '1px solid rgb(34, 197, 94)' 
                : '1px solid var(--border, rgb(55, 65, 81))',
              borderRadius: '8px',
              boxShadow: status === 'preparing'
                ? 'rgba(236, 72, 153, 0.3) 0px 10px 25px -5px'
                : status === 'success'
                ? 'rgba(34, 197, 94, 0.3) 0px 10px 25px -5px'
                : 'rgba(239, 68, 68, 0.3) 0px 10px 25px -5px',
              animation: 'slideIn 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '200px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {status === 'preparing' && (
                <div
                  className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full"
                  style={{
                    animation: 'spin 1s linear infinite',
                  }}
                />
              )}
              {status === 'success' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              {status === 'error' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              )}
            </div>
            <div
              role="status"
              aria-live="polite"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: status === 'success' 
                  ? 'rgb(34, 197, 94)' 
                  : status === 'error'
                  ? 'rgb(239, 68, 68)'
                  : 'var(--foreground, rgb(255, 255, 255))',
              }}
            >
              {message}
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </DownloadStatusContext.Provider>
  )
}

export const useDownloadStatus = () => {
  return useContext(DownloadStatusContext)
}
