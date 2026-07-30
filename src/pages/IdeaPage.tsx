import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { deleteIdea, duplicateIdea, updateIdea } from '../db/ideas'
import type { IdeaStatus } from '../db/types'
import { IDEA_STATUSES, STATUS_LABELS } from '../db/types'
import { burstConfetti } from '../lib/confetti'
import { useToast } from '../lib/toast'
import { formatRelativeTime } from '../lib/dates'
import { DueBadge, PriorityBadge, TagChip } from '../components/badges'
import { ProgressBar } from '../components/ProgressBar'
import { ChecklistItemRow } from '../components/ChecklistItemRow'
import { IdeaFormModal } from '../components/IdeaFormModal'
import { IconCopy, IconPencil, IconTrash } from '../components/Icons'

export function IdeaPage() {
  const { ideaId } = useParams<{ ideaId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hideCompleted, setHideCompleted] = useState(false)
  const prevDoneRef = useRef<number | null>(null)

  const idea = useLiveQuery(() => (ideaId ? db.ideas.get(ideaId) : undefined), [ideaId])
  const items = useLiveQuery(
    () => (ideaId ? db.checklistItems.where('ideaId').equals(ideaId).sortBy('order') : []),
    [ideaId],
  )

  const doneCount = (items ?? []).filter((item) => item.done).length
  const total = items?.length ?? 0

  // Celebrate the transition into 100% (not when landing on an already-done idea).
  useEffect(() => {
    if (items === undefined || total === 0) return
    const prev = prevDoneRef.current
    prevDoneRef.current = doneCount
    if (prev !== null && prev < total && doneCount === total) {
      burstConfetti()
      toast({
        title: 'Pipeline complete! 🎉',
        description: 'Every step is done — ship it and start the next one.',
        kind: 'success',
      })
    }
  }, [doneCount, total, items, toast])

  useEffect(() => {
    prevDoneRef.current = null
    setHideCompleted(false)
    setConfirmDelete(false)
  }, [ideaId])

  if (idea === undefined || items === undefined) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="skeleton h-16 rounded-2xl" />
        <div className="skeleton h-10 rounded-xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }
  if (!idea) {
    return <p className="text-zinc-400">Idea not found — it may have been deleted.</p>
  }

  const nextItem = items.find((item) => !item.done)
  const visibleItems = hideCompleted ? items.filter((item) => !item.done) : items

  async function handleDelete() {
    if (!ideaId) return
    await deleteIdea(ideaId)
    toast({ title: 'Idea deleted', kind: 'info' })
    navigate('/')
  }

  async function handleDuplicate() {
    if (!ideaId) return
    const newId = await duplicateIdea(ideaId)
    if (newId) {
      toast({ title: 'Idea duplicated', description: 'Progress reset for the copy.', kind: 'success' })
      navigate(`/ideas/${newId}`)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="anim-fade-up flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{idea.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            {idea.game && <span className="text-sm text-zinc-400">🎮 {idea.game}</span>}
            <PriorityBadge priority={idea.priority} />
            {idea.dueDate !== undefined && <DueBadge dueDate={idea.dueDate} />}
            {idea.tags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={idea.status}
            onChange={(e) => void updateIdea(idea.id, { status: e.target.value as IdeaStatus })}
            aria-label="Idea status"
            className="input !px-2 !py-1.5 !text-xs capitalize"
          >
            {IDEA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button onClick={() => setEditing(true)} className="btn-ghost">
            <IconPencil className="size-3.5" />
            Edit
          </button>
          <button onClick={() => void handleDuplicate()} className="btn-ghost">
            <IconCopy className="size-3.5" />
            Duplicate
          </button>
          {confirmDelete ? (
            <span className="flex items-center gap-1 text-xs">
              <button
                onClick={() => void handleDelete()}
                className="rounded-lg bg-red-900 px-2.5 py-1.5 font-semibold text-red-200 hover:bg-red-800"
              >
                Confirm delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-2 py-1.5 text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="btn-danger-ghost">
              <IconTrash className="size-3.5" />
              Delete
            </button>
          )}
        </div>
      </div>

      {idea.notes && (
        <p className="anim-fade-up card whitespace-pre-wrap p-3.5 text-sm text-zinc-300">
          {idea.notes}
        </p>
      )}

      <div className="anim-fade-up" style={{ '--stagger': 1 } as React.CSSProperties}>
        <ProgressBar done={doneCount} total={total} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {nextItem ? (
            <>
              Next up: <span className="font-medium text-zinc-300">{nextItem.label}</span>
            </>
          ) : total > 0 ? (
            <span className="font-medium text-emerald-400">All steps complete 🎉</span>
          ) : (
            'This idea has no checklist steps.'
          )}
        </p>
        {doneCount > 0 && (
          <button
            onClick={() => setHideCompleted((v) => !v)}
            className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {hideCompleted ? `Show completed (${doneCount})` : 'Hide completed'}
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {visibleItems.map((item, index) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            index={index}
            isNext={nextItem?.id === item.id}
          />
        ))}
      </ul>

      <p className="text-xs text-zinc-600">
        Created {new Date(idea.createdAt).toLocaleString()} · Updated{' '}
        {formatRelativeTime(idea.updatedAt)}
      </p>

      {editing && <IdeaFormModal idea={idea} onClose={() => setEditing(false)} />}
    </div>
  )
}
