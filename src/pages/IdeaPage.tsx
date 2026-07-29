import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { deleteIdea, updateIdea } from '../db/ideas'
import type { IdeaStatus } from '../db/types'
import { IDEA_STATUSES } from '../db/types'
import { ProgressBar } from '../components/ProgressBar'
import { ChecklistItemRow } from '../components/ChecklistItemRow'
import { IdeaFormModal } from '../components/IdeaFormModal'

export function IdeaPage() {
  const { ideaId } = useParams<{ ideaId: string }>()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const idea = useLiveQuery(() => (ideaId ? db.ideas.get(ideaId) : undefined), [ideaId])
  const items = useLiveQuery(
    () =>
      ideaId ? db.checklistItems.where('ideaId').equals(ideaId).sortBy('order') : [],
    [ideaId],
  )

  if (idea === undefined || items === undefined) {
    return <p className="text-zinc-500">Loading…</p>
  }
  if (!idea) {
    return (
      <div className="text-zinc-400">
        <p>Idea not found — it may have been deleted.</p>
      </div>
    )
  }

  const doneCount = items.filter((item) => item.done).length

  async function handleDelete() {
    if (!ideaId) return
    await deleteIdea(ideaId)
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{idea.title}</h1>
          {idea.game && <p className="mt-0.5 text-sm text-zinc-400">🎮 {idea.game}</p>}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={idea.status}
            onChange={(e) => void updateIdea(idea.id, { status: e.target.value as IdeaStatus })}
            aria-label="Idea status"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs capitalize outline-none focus:border-twitch"
          >
            {IDEA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-twitch hover:text-twitch"
          >
            Edit
          </button>
          {confirmDelete ? (
            <span className="flex items-center gap-1 text-xs">
              <button
                onClick={() => void handleDelete()}
                className="rounded-md bg-red-900 px-2.5 py-1.5 font-semibold text-red-200 hover:bg-red-800"
              >
                Confirm delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md px-2 py-1.5 text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-red-800 hover:text-red-400"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {idea.notes && (
        <p className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300">
          {idea.notes}
        </p>
      )}

      <ProgressBar done={doneCount} total={items.length} />

      <ul className="space-y-2">
        {items.map((item) => (
          <ChecklistItemRow key={item.id} item={item} />
        ))}
      </ul>

      <p className="text-xs text-zinc-600">
        Created {new Date(idea.createdAt).toLocaleString()} · Updated{' '}
        {new Date(idea.updatedAt).toLocaleString()}
      </p>

      {editing && <IdeaFormModal idea={idea} onClose={() => setEditing(false)} />}
    </div>
  )
}
