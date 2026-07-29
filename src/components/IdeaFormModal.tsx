import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Idea, IdeaStatus } from '../db/types'
import { IDEA_STATUSES } from '../db/types'
import { createIdea, updateIdea, type IdeaDraft } from '../db/ideas'

interface Props {
  /** When set, the modal edits this Idea; otherwise it creates a new one. */
  idea?: Idea
  onClose: () => void
  onCreated?: (id: string) => void
}

export function IdeaFormModal({ idea, onClose, onCreated }: Props) {
  const templates = useLiveQuery(() => db.checklistTemplates.orderBy('name').toArray(), [])
  const [title, setTitle] = useState(idea?.title ?? '')
  const [game, setGame] = useState(idea?.game ?? '')
  const [status, setStatus] = useState<IdeaStatus>(idea?.status ?? 'backlog')
  const [notes, setNotes] = useState(idea?.notes ?? '')
  const [templateId, setTemplateId] = useState(idea?.templateId ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!idea && templates && templates.length > 0 && !templateId) {
      setTemplateId(templates[0].id)
    }
  }, [idea, templates, templateId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const canSave = title.trim().length > 0 && (idea ? true : Boolean(templateId)) && !saving

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      const draft: IdeaDraft = { title, game, status, notes }
      if (idea) {
        await updateIdea(idea.id, draft)
      } else {
        const id = await createIdea(draft, templateId)
        onCreated?.(id)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <h2 className="mb-4 text-lg font-bold">{idea ? 'Edit idea' : 'New stream idea'}</h2>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-zinc-400">Title</span>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Elden Ring randomizer run"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-twitch"
          />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-zinc-400">Game</span>
          <input
            value={game}
            onChange={(e) => setGame(e.target.value)}
            placeholder="e.g. Elden Ring"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-twitch"
          />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-zinc-400">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as IdeaStatus)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-twitch"
          >
            {IDEA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {!idea && (
          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-zinc-400">Checklist template</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-twitch"
            >
              {(templates ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.steps.length} steps)
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="mb-5 block text-sm">
          <span className="mb-1 block text-zinc-400">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Hooks, thumbnail ideas, timestamps…"
            className="w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-twitch"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-md bg-twitch-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-twitch disabled:cursor-not-allowed disabled:opacity-40"
          >
            {idea ? 'Save' : 'Create idea'}
          </button>
        </div>
      </form>
    </div>
  )
}
