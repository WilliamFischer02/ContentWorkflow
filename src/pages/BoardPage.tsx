import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Idea, IdeaStatus } from '../db/types'
import { IDEA_STATUSES, PRIORITY_RANK, STATUS_LABELS } from '../db/types'
import { updateIdea } from '../db/ideas'
import { openNewIdea } from '../lib/bus'
import { useToast } from '../lib/toast'
import { DueBadge, PriorityBadge, TagChip } from '../components/badges'
import { ProgressBar } from '../components/ProgressBar'
import { IconPlus } from '../components/Icons'

const COLUMN_ACCENTS: Record<IdeaStatus, string> = {
  backlog: 'border-t-zinc-600',
  active: 'border-t-emerald-500',
  done: 'border-t-violet-500',
}

export function BoardPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const ideas = useLiveQuery(() => db.ideas.toArray(), [])
  const items = useLiveQuery(() => db.checklistItems.toArray(), [])
  const [dragOver, setDragOver] = useState<IdeaStatus | null>(null)

  const progressByIdea = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>()
    for (const item of items ?? []) {
      const entry = map.get(item.ideaId) ?? { done: 0, total: 0 }
      entry.total += 1
      if (item.done) entry.done += 1
      map.set(item.ideaId, entry)
    }
    return map
  }, [items])

  const columns = useMemo(() => {
    const byStatus: Record<IdeaStatus, Idea[]> = { backlog: [], active: [], done: [] }
    for (const idea of ideas ?? []) byStatus[idea.status].push(idea)
    for (const status of IDEA_STATUSES) {
      byStatus[status].sort(
        (a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || b.updatedAt - a.updatedAt,
      )
    }
    return byStatus
  }, [ideas])

  async function handleDrop(e: React.DragEvent, status: IdeaStatus) {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData('text/plain')
    const idea = (ideas ?? []).find((i) => i.id === id)
    if (!idea || idea.status === status) return
    await updateIdea(id, { status })
    toast({
      title: `Moved to ${STATUS_LABELS[status]}`,
      description: idea.title,
      kind: 'success',
    })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="anim-fade-up mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Board</h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            Drag ideas between columns to update their status.
          </p>
        </div>
        <button onClick={openNewIdea} className="btn-primary">
          <IconPlus className="size-4" />
          New idea
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {IDEA_STATUSES.map((status) => (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(status)
            }}
            onDragLeave={() => setDragOver((current) => (current === status ? null : current))}
            onDrop={(e) => void handleDrop(e, status)}
            className={`rounded-2xl border border-surface-800 border-t-2 bg-surface-900/40 transition-colors ${
              COLUMN_ACCENTS[status]
            } ${dragOver === status ? 'bg-surface-850 ring-2 ring-twitch/40' : ''}`}
          >
            <header className="flex items-center justify-between px-4 pb-2 pt-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {STATUS_LABELS[status]}
              </h2>
              <span className="rounded-full bg-surface-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                {columns[status].length}
              </span>
            </header>
            <div className="min-h-40 space-y-2 p-2.5">
              {columns[status].length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-zinc-600">
                  {dragOver === status ? 'Drop here' : 'No ideas'}
                </p>
              )}
              {columns[status].map((idea, index) => {
                const progress = progressByIdea.get(idea.id) ?? { done: 0, total: 0 }
                return (
                  <article
                    key={idea.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', idea.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onClick={() => navigate(`/ideas/${idea.id}`)}
                    className="anim-fade-up card card-hover cursor-grab p-3.5 active:cursor-grabbing"
                    style={{ '--stagger': Math.min(index, 8) } as React.CSSProperties}
                  >
                    <p className="text-sm font-medium leading-snug">{idea.title}</p>
                    {idea.game && <p className="mt-0.5 truncate text-xs text-zinc-500">{idea.game}</p>}
                    {(idea.priority !== 'none' || idea.dueDate !== undefined) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2.5">
                        <PriorityBadge priority={idea.priority} />
                        {idea.dueDate !== undefined && <DueBadge dueDate={idea.dueDate} />}
                      </div>
                    )}
                    {idea.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {idea.tags.slice(0, 4).map((tag) => (
                          <TagChip key={tag} tag={tag} />
                        ))}
                      </div>
                    )}
                    {progress.total > 0 && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1">
                          <ProgressBar done={progress.done} total={progress.total} compact />
                        </div>
                        <span className="text-[10px] tabular-nums text-zinc-500">
                          {progress.done}/{progress.total}
                        </span>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
