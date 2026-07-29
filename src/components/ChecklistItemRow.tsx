import { useState } from 'react'
import type { ChecklistItem } from '../db/types'
import { addItemLink, removeItemLink, setItemDone } from '../db/ideas'

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    const normalized = normalizeUrl(url)
    if (!normalized) return
    await addItemLink(item, label || `link ${item.links.length + 1}`, normalized)
    setLabel('')
    setUrl('')
  }

  return (
    <li
      className={`rounded-lg border p-3 transition-colors ${
        item.done ? 'border-zinc-800/60 bg-zinc-900/30' : 'border-zinc-800 bg-zinc-900/70'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(e) => void setItemDone(item, e.target.checked)}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-twitch"
          aria-label={`Mark "${item.label}" as ${item.done ? 'not done' : 'done'}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-medium ${item.done ? 'text-zinc-500 line-through' : ''}`}
            >
              {item.label}
            </span>
            {item.type === 'deep-link' && item.deepLinkUrl && (
              <a
                href={item.deepLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-twitch-dark px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-twitch"
              >
                Open ↗
              </a>
            )}
          </div>

          {item.type === 'link-input' && (
            <div className="mt-2 space-y-2">
              {item.links.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {item.links.map((link) => (
                    <li
                      key={link.id}
                      className="group flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950 py-0.5 pl-2.5 pr-1 text-xs"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.url}
                        className="max-w-48 truncate text-twitch hover:underline"
                      >
                        {link.label || link.url}
                      </a>
                      <button
                        onClick={() => void removeItemLink(item, link.id)}
                        title="Remove link"
                        aria-label={`Remove link ${link.label || link.url}`}
                        className="rounded-full px-1 text-zinc-600 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <form onSubmit={handleAddLink} className="flex flex-wrap gap-2">
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={`label (e.g. clip ${String.fromCharCode(97 + (item.links.length % 26))})`}
                  className="w-28 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs outline-none focus:border-twitch"
                />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="paste URL…"
                  className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs outline-none focus:border-twitch"
                />
                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-twitch hover:text-twitch disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
