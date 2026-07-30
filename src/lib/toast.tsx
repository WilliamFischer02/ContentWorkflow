import { createContext, useCallback, useContext, useRef, useState } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: number
  title: string
  description?: string
  kind: ToastKind
}

interface ToastInput {
  title: string
  description?: string
  kind?: ToastKind
}

const ToastContext = createContext<(toast: ToastInput) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

const KIND_STYLES: Record<ToastKind, string> = {
  success: 'border-emerald-800/70 [--toast-dot:#34d399]',
  error: 'border-red-800/70 [--toast-dot:#f87171]',
  info: 'border-surface-700 [--toast-dot:#a970ff]',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const push = useCallback((input: ToastInput) => {
    const id = ++counter.current
    setToasts((prev) => [...prev.slice(-3), { id, kind: 'info', ...input }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`anim-toast-in pointer-events-auto rounded-xl border bg-surface-900/95 px-4 py-3 shadow-2xl backdrop-blur ${KIND_STYLES[toast.kind]}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--toast-dot)]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-zinc-400">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ms-auto -mr-1 rounded p-1 text-zinc-600 hover:text-zinc-300"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
