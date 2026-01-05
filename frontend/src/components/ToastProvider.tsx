import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Toast = {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
}

type ToastContextValue = {
  pushToast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), 3500)
    },
    [removeToast],
  )

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`w-72 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${
                toast.type === 'success'
                  ? 'border-green-500/30 bg-green-500/20 text-green-50'
                  : toast.type === 'error'
                    ? 'border-red-500/30 bg-red-500/20 text-red-50'
                    : 'border-sky-500/30 bg-sky-500/20 text-sky-50'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

