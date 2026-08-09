import { useState } from 'react'
import { useToast } from '../lib/toast'
import { IconCheck, IconCopy } from './Icons'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API can be unavailable (permissions/insecure context);
    // fall back to a hidden textarea.
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

/** A labeled copy-pastable template block with a one-click copy button. */
export function CopyBlock({ label, text }: { label: string; text: string }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } else {
      toast({ title: 'Copy failed', description: 'Select the text manually.', kind: 'error' })
    }
  }

  return (
    <div className="copy-block group/copy relative">
      <div className="flex items-center justify-between gap-2 border-b border-surface-800 px-3 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <button
          onClick={() => void handleCopy()}
          className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
            copied
              ? 'text-emerald-400'
              : 'text-zinc-500 hover:bg-surface-800 hover:text-zinc-200'
          }`}
          aria-label={`Copy ${label}`}
        >
          {copied ? <IconCheck className="size-3" /> : <IconCopy className="size-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="px-3 py-2 text-zinc-300">{text}</p>
    </div>
  )
}

/** A one-line viral title pattern with an inline copy affordance. */
export function CopyLine({ text }: { text: string }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } else {
      toast({ title: 'Copy failed', kind: 'error' })
    }
  }

  return (
    <button
      onClick={() => void handleCopy()}
      className="group/line flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-surface-800/70"
      title="Copy title pattern"
    >
      <span
        className="mt-0.5 shrink-0"
        style={{ color: copied ? '#34d399' : 'var(--col-accent, #a970ff)' }}
      >
        {copied ? <IconCheck className="size-3" /> : <IconCopy className="size-3 opacity-40 transition-opacity group-hover/line:opacity-100" />}
      </span>
      <span>{text}</span>
    </button>
  )
}
