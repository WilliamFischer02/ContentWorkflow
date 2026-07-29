import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db/db'
import { StatusBadge } from '../components/StatusBadge'
import { TwitchClipsPanel } from '../components/TwitchClipsPanel'

export function DashboardPage() {
  const stats = useLiveQuery(async () => {
    const ideas = await db.ideas.toArray()
    const items = await db.checklistItems.toArray()
    const doneByIdea = new Map<string, { done: number; total: number }>()
    for (const item of items) {
      const entry = doneByIdea.get(item.ideaId) ?? { done: 0, total: 0 }
      entry.total += 1
      if (item.done) entry.done += 1
      doneByIdea.set(item.ideaId, entry)
    }
    return { ideas, doneByIdea }
  }, [])

  if (!stats) return <p className="text-zinc-500">Loading…</p>

  const { ideas, doneByIdea } = stats
  const active = ideas.filter((i) => i.status === 'active')
  const backlog = ideas.filter((i) => i.status === 'backlog')
  const done = ideas.filter((i) => i.status === 'done')

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, <span className="text-twitch">BingusTheWizard</span> 🪄
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Pick an idea from the sidebar, or start a new one. Every idea gets a full
          stream-to-clips pipeline checklist.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(
          [
            ['Active', active.length, 'text-emerald-300'],
            ['Backlog', backlog.length, 'text-zinc-300'],
            ['Done', done.length, 'text-violet-300'],
          ] as const
        ).map(([label, count, color]) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className={`text-3xl font-bold ${color}`}>{count}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {ideas.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
            All ideas
          </h2>
          <ul className="space-y-2">
            {[...ideas]
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((idea) => {
                const progress = doneByIdea.get(idea.id) ?? { done: 0, total: 0 }
                return (
                  <li key={idea.id}>
                    <Link
                      to={`/ideas/${idea.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:border-zinc-700"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{idea.title}</p>
                        {idea.game && <p className="truncate text-xs text-zinc-500">{idea.game}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs text-zinc-500">
                          {progress.done}/{progress.total}
                        </span>
                        <StatusBadge status={idea.status} />
                      </div>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </section>
      )}

      <TwitchClipsPanel />
    </div>
  )
}
