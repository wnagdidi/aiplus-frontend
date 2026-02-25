'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type AlertColor = 'success' | 'info' | 'warning' | 'error'

const SnackbarContext = createContext({ showSnackbar: (message: string, severity?: AlertColor) => {} })

export const SnackbarProvider = ({ children }: { children: any }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor,
  })

  useEffect(() => {
    if (!snackbar.open) return
    const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 6000)
    return () => clearTimeout(timer)
  }, [snackbar.open])

  const showSnackbar = (message: string, severity: AlertColor = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const severityClasses: Record<AlertColor, string> = {
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbar.open && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] px-4 w-full max-w-xl">
          <div
            className={`flex items-center justify-between gap-3 border rounded-md shadow-md px-4 py-2 ${severityClasses[snackbar.severity]}`}
            role="alert"
          >
            <div className="text-sm">{snackbar.message}</div>
            <button onClick={handleClose} aria-label="close" className="text-current/70 hover:text-current">×</button>
          </div>
        </div>
      )}
    </SnackbarContext.Provider>
  )
}

// 使用 SnackbarContext 的 Hook
export const useSnackbar = () => {
  return useContext(SnackbarContext)
}
