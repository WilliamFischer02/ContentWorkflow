import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Idea, IdeaStatus, Priority } from '../db/types'
import { IDEA_STATUSES, PRIORITIES, STATUS_LABELS } from '../db/types'
import { createIdea, updateIdea, type IdeaDraft } from '../db/ideas'
import { fromDateInputValue, toDateInputValue } from '../lib/dates'
import { useToast } from '../lib/toast'

interface Props {
  /** When set, the modal edits this Idea; otherwise it creates a new one. */
  idea?: Idea
  onClose: () => void
  onCreated?: (id: string) => void
}

const PRIORITY_LABELS: Record<Priority, string> = {
  none: 'No priority',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

function parseTags(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, '').toLowerCase())
        .filter(Boolean),
    ),
  ]
}

export function IdeaFormModal({ idea, onClose, onCreated }: Props) {
  const toast = useToast()
  const templates = useLiveQuery(() => db.checklistTemplates.orderBy('name').toArray(), [])
  const [title, setTitle] = useState(idea?.title ?? '')
  const [game, setGame] = useState(idea?.game ?? '')
  const [status, setStatus] = useState<IdeaStatus>(idea?.status ?? 'backlog')
  const [priority, setPriority] = useState<Priority>(idea?.priority ?? 'none')
  const [dueValue, setDueValue] = useState(
    idea?.dueDate !== undefined ? toDateInputValue(idea.dueDate) : '',
  )
  const [tagsValue, setTagsValue] = useState(idea?.tags.join(', ') ?? '')
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
      const draft: IdeaDraft = {
        title,
        game,
        status,
        priority,
        dueDate: fromDateInputValue(dueValue),
        tags: parseTags(tagsValue),
        notes,
      }
      if (idea) {
        await updateIdea(idea.id, draft)
        toast({ title: 'Idea updated', kind: 'success' })
      } else {
        const id = await createIdea(draft, templateId)
        toast({ title: 'Idea created', description: draft.title, kind: 'success' })
        onCreated?.(id)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="anim-scale-in max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-surface-700 bg-surface-900 p-6 shadow-2xl"
      >
        <h2 className="mb-5 text-lg font-bold">{idea ? 'Edit idea' : 'New stream idea'}</h2>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-zinc-400">Title</span>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Elden Ring randomizer run"
            className="input w-full"
          />
        </label>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Game</span>
            <input
              value={game}
              onChange={(e) => setGame(e.target.value)}
              placeholder="e.g. Elden Ring"
              className="input w-full"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IdeaStatus)}
              className="input w-full"
            >
              {IDEA_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="input w-full"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Target date</span>
            <input
              type="date"
              value={dueValue}
              onChange={(e) => setDueValue(e.target.value)}
              className="input w-full [color-scheme:dark]"
            />
          </label>
        </div>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-zinc-400">Tags</span>
          <input
            value={tagsValue}
            onChange={(e) => setTagsValue(e.target.value)}
            placeholder="comma separated, e.g. speedrun, collab"
            className="input w-full"
          />
        </label>

        {!idea && (
          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-zinc-400">Checklist template</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="input w-full"
            >
              {(templates ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.steps.length} steps)
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="mb-6 block text-sm">
          <span className="mb-1 block text-zinc-400">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Hooks, thumbnail ideas, timestamps…"
            className="input w-full resize-y"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </button>
          <button type="submit" disabled={!canSave} className="btn-primary">
            {idea ? 'Save changes' : 'Create idea'}
          </button>
        </div>
      </form>
    </div>
  )
}
