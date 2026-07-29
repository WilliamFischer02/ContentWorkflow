import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { IdeaStatus } from '../db/types'
import { IDEA_STATUSES, PRIORITY_RANK } from '../db/types'
import { openNewIdea } from '../lib/bus'
import { DueBadge, PriorityBadge, StatusBadge } from './badges'
import { ProgressBar } from './ProgressBar'
import { IconPlus, IconSearch } from './Icons'

type Filter = IdeaStatus | 'all'
type SortKey = 'updated' | 'due' | 'priority' | 'title'

const SORT_LABELS: Record<SortKey, string> = {
  updated: 'Recently updated',
  due: 'Due date',
  priority: 'Priority',
  title: 'Title A→Z',
}

export function IdeaSidebar() {
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<SortKey>('updated')
  const [query, setQuery] = useState('')

  const ideas = useLiveQuery(() => db.ideas.toArray(), [])
  const items = useLiveQuery(() => db.checklistItems.toArray(), [])

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

  const visible = useMemo(() => {
    let list = ideas ?? []
    if (filter !== 'all') list = list.filter((idea) => idea.status === filter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (idea) =>
          idea.title.toLowerCase().includes(q) ||
          idea.game.toLowerCase().includes(q) ||
          idea.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
    }
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'due':
          return (a.dueDate ?? Infinity) - (b.dueDate ?? Infinity)
        case 'priority':
          return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || b.updatedAt - a.updatedAt
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return b.updatedAt - a.updatedAt
      }
    })
  }, [ideas, filter, query, sort])

  return (
    <aside className="w-full shrink-0 border-b border-surface-800 bg-surface-900/40 md:w-80 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Ideas
          {ideas !== undefined && (
            <span className="ml-1.5 rounded-full bg-surface-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
              {ideas.length}
            </span>
          )}
        </h2>
        <button onClick={openNewIdea} className="btn-primary !px-2.5 !py-1 !text-xs">
          <IconPlus className="size-3.5" />
          New
        </button>
      </div>

      <div className="space-y-2 px-4 pb-3">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, game, #tag"
            className="input w-full !py-1.5 !pl-8 !text-xs"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {(['all', ...IDEA_STATUSES] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-2 py-0.5 text-[11px] capitalize transition-colors ${
                  filter === f
                    ? 'bg-surface-700 text-zinc-100'
                    : 'text-zinc-500 hover:bg-surface-800 hover:text-zinc-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort ideas"
            className="rounded-md border border-surface-800 bg-transparent py-0.5 pl-1 text-[11px] text-zinc-500 outline-none hover:text-zinc-300"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key} className="bg-surface-900">
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <nav className="max-h-64 overflow-y-auto px-2 pb-4 md:max-h-[calc(100vh-15rem)]">
        {ideas === undefined ? (
          <div className="space-y-2 px-2 py-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="px-3 py-4 text-sm text-zinc-500">
            {query
              ? 'No ideas match your search.'
              : filter === 'all'
                ? 'No ideas yet — create your first one!'
                : `No ${filter} ideas.`}
          </p>
        ) : (
          <ul className="space-y-1">
            {visible.map((idea, index) => {
              const progress = progressByIdea.get(idea.id) ?? { done: 0, total: 0 }
              return (
                <li
                  key={idea.id}
                  className="anim-fade-up"
                  style={{ '--stagger': Math.min(index, 10) } as React.CSSProperties}
                >
                  <NavLink
                    to={`/ideas/${idea.id}`}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 transition-colors ${
                        isActive
                          ? 'bg-surface-800 ring-1 ring-surface-700'
                          : 'hover:bg-surface-850'
                      }`
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{idea.title}</span>
                      <StatusBadge status={idea.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-2.5">
                      {idea.game && (
                        <span className="truncate text-xs text-zinc-500">{idea.game}</span>
                      )}
                      <PriorityBadge priority={idea.priority} />
                      {idea.dueDate !== undefined && <DueBadge dueDate={idea.dueDate} />}
                    </div>
                    {progress.total > 0 && (
                      <div className="mt-2">
                        <ProgressBar done={progress.done} total={progress.total} compact />
                      </div>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )
}
