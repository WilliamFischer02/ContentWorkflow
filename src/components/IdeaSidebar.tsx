import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { IdeaStatus } from '../db/types'
import { IDEA_STATUSES } from '../db/types'
import { StatusBadge } from './StatusBadge'
import { IdeaFormModal } from './IdeaFormModal'

type Filter = IdeaStatus | 'all'

export function IdeaSidebar() {
  const [filter, setFilter] = useState<Filter>('all')
  const [showNew, setShowNew] = useState(false)
  const navigate = useNavigate()

  const ideas = useLiveQuery(async () => {
    const all = await db.ideas.orderBy('updatedAt').reverse().toArray()
    return filter === 'all' ? all : all.filter((idea) => idea.status === filter)
  }, [filter])

  return (
    <aside className="w-full shrink-0 border-b border-zinc-800 bg-zinc-900/40 md:w-72 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Ideas</h2>
        <button
          onClick={() => setShowNew(true)}
          className="rounded-md bg-twitch-dark px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-twitch"
        >
          + New
        </button>
      </div>

      <div className="flex gap-1 px-4 pb-3">
        {(['all', ...IDEA_STATUSES] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-2.5 py-0.5 text-xs capitalize transition-colors ${
              filter === f
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <nav className="max-h-56 overflow-y-auto px-2 pb-4 md:max-h-[calc(100vh-10.5rem)]">
        {ideas === undefined ? (
          <p className="px-2 py-4 text-sm text-zinc-500">Loading…</p>
        ) : ideas.length === 0 ? (
          <p className="px-2 py-4 text-sm text-zinc-500">
            {filter === 'all' ? 'No ideas yet — create your first one!' : `No ${filter} ideas.`}
          </p>
        ) : (
          <ul className="space-y-1">
            {ideas.map((idea) => (
              <li key={idea.id}>
                <NavLink
                  to={`/ideas/${idea.id}`}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 transition-colors ${
                      isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
                    }`
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{idea.title}</span>
                    <StatusBadge status={idea.status} />
                  </div>
                  {idea.game && <p className="mt-0.5 truncate text-xs text-zinc-500">{idea.game}</p>}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {showNew && (
        <IdeaFormModal
          onClose={() => setShowNew(false)}
          onCreated={(id) => navigate(`/ideas/${id}`)}
        />
      )}
    </aside>
  )
}
