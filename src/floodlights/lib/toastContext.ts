import { createContext, useContext } from 'react'

export interface ToastValue {
  toast: (msg: string, icon?: string) => void
}

export const ToastContext = createContext<ToastValue | null>(null)

export function useToast(): ToastValue {
  const v = useContext(ToastContext)
  if (!v) throw new Error('useToast must be used within <ToastProvider>')
  return v
}
