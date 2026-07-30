import { useState } from 'react'
import type { ChecklistItem } from '../db/types'
import { addItemLink, removeItemLink, setItemDone, setItemNote } from '../db/ideas'
import { IconExternal, IconPencil, IconX } from './Icons'

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function ChecklistItemRow({
  item,
  index,
  isNext,
}: {
  item: ChecklistItem
  index: number
  isNext: boolean
}) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState(item.note)

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    const normalized = normalizeUrl(url)
    if (!normalized) return
    await addItemLink(item, label || `link ${item.links.length + 1}`, normalized)
    setLabel('')
    setUrl('')
  }

  async function saveNote() {
    if (noteDraft !== item.note) await setItemNote(item, noteDraft)
    if (!noteDraft.trim()) setNoteOpen(false)
  }

  return (
    <li
      className={`anim-fade-up rounded-xl border p-3.5 transition-all duration-200 ${
        item.done
          ? 'border-surface-800/50 bg-surface-900/30'
          : isNext
            ? 'border-twitch/40 bg-surface-900/80 shadow-glow'
            : 'border-surface-800 bg-surface-900/70'
      }`}
      style={{ '--stagger': Math.min(index, 12) } as React.CSSProperties}
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
              className={`text-sm font-medium transition-colors ${
                item.done ? 'text-zinc-500 line-through' : ''
              }`}
            >
              {item.label}
            </span>
            {isNext && (
              <span className="rounded-full bg-twitch/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-twitch">
                Next up
              </span>
            )}
            {item.type === 'deep-link' && item.deepLinkUrl && (
              <a
                href={item.deepLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-twitch-dark px-2.5 py-1 text-xs font-semibold text-white transition-all hover:bg-twitch hover:shadow-glow"
              >
                Open
                <IconExternal className="size-3" />
              </a>
            )}
            <button
              onClick={() => {
                setNoteOpen((v) => !v)
                setNoteDraft(item.note)
              }}
              title={item.note ? 'Edit note' : 'Add note'}
              className={`ms-auto rounded-md p-1.5 transition-colors ${
                item.note ? 'text-twitch' : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <IconPencil className="size-3.5" />
            </button>
          </div>

          {item.note && !noteOpen && (
            <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-surface-950/50 px-2.5 py-1.5 text-xs text-zinc-400">
              {item.note}
            </p>
          )}
          {noteOpen && (
            <textarea
              autoFocus
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onBlur={() => void saveNote()}
              rows={2}
              placeholder="Step note — saved when you click away…"
              className="input mt-1.5 w-full resize-y !text-xs"
            />
          )}

          {item.type === 'link-input' && (
            <div className="mt-2.5 space-y-2">
              {item.links.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {item.links.map((link) => (
                    <li
                      key={link.id}
                      className="anim-pop flex items-center gap-1 rounded-full border border-surface-700 bg-surface-950 py-0.5 pl-2.5 pr-1 text-xs"
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
                        className="rounded-full p-0.5 text-zinc-600 hover:text-red-400"
                      >
                        <IconX className="size-3" />
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
                  className="input w-28 !px-2 !py-1 !text-xs"
                />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="paste URL…"
                  className="input min-w-0 flex-1 !px-2 !py-1 !text-xs"
                />
                <button type="submit" disabled={!url.trim()} className="btn-ghost !px-2.5 !py-1">
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
