import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db/db'
import { STREAMS, STREAM_GAMES } from '../content/streams'
import { runProgress } from '../db/streams'
import { weekStartISO } from '../lib/weeks'
import { describeDue, formatRelativeTime, isDueWithin } from '../lib/dates'
import { DueBadge, PriorityBadge, StatusBadge, TagChip } from '../components/badges'
import { ProgressBar, ProgressRing } from '../components/ProgressBar'
import { TwitchClipsPanel } from '../components/TwitchClipsPanel'
import { EmptyState } from '../components/EmptyState'
import { IconCalendar, IconChevronRight, IconClock, IconTv } from '../components/Icons'

/** Compact per-stream progress row linking into the weekly panel. */
function WeekStrip() {
  const weekStart = weekStartISO()
  const runs = useLiveQuery(
    () => db.streamRuns.where('weekStart').equals(weekStart).toArray(),
    [weekStart],
  )
  const byGame = new Map(runs?.map((run) => [run.game, run]))

  return (
    <section className="anim-fade-up" style={{ '--stagger': 2 } as React.CSSProperties}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
        <IconTv className="size-3.5 text-twitch" />
        This week&rsquo;s streams
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {STREAM_GAMES.map((game) => {
          const def = STREAMS[game]
          const progress = runProgress(game, byGame.get(game))
          return (
            <Link
              key={game}
              to="/"
              className={`stream-col ${def.themeClass} card-hover block p-4`}
            >
              <p className="flex items-center gap-2 text-sm font-bold">
                <span aria-hidden>{def.emoji}</span>
                {def.name}
                <span
                  className="ms-auto text-xs font-bold tabular-nums"
                  style={{ color: 'var(--col-accent)' }}
                >
                  {progress.done}/{progress.total}
                </span>
              </p>
              <div className="mt-2.5">
                <ProgressBar done={progress.done} total={progress.total} compact />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function DashboardPage() {
  const ideas = useLiveQuery(() => db.ideas.toArray(), [])
  const items = useLiveQuery(() => db.checklistItems.toArray(), [])
  const settings = useLiveQuery(() => db.settings.get('app'), [])

  const stats = useMemo(() => {
    if (!ideas || !items) return undefined
    const progressByIdea = new Map<string, { done: number; total: number }>()
    let linkCount = 0
    for (const item of items) {
      const entry = progressByIdea.get(item.ideaId) ?? { done: 0, total: 0 }
      entry.total += 1
      if (item.done) entry.done += 1
      progressByIdea.set(item.ideaId, entry)
      linkCount += item.links.length
    }
    const activeIdeas = ideas.filter((i) => i.status === 'active')
    const activeSteps = activeIdeas.reduce(
      (acc, idea) => {
        const p = progressByIdea.get(idea.id) ?? { done: 0, total: 0 }
        acc.done += p.done
        acc.total += p.total
        return acc
      },
      { done: 0, total: 0 },
    )
    const dueSoon = ideas
      .filter((i) => i.status !== 'done' && i.dueDate !== undefined && isDueWithin(i.dueDate, 7))
      .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0))
    const stepsDone = items.filter((i) => i.done).length
    return { progressByIdea, activeIdeas, activeSteps, dueSoon, stepsDone, linkCount }
  }, [ideas, items])

  if (!ideas || !items || !stats) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-24 rounded-2xl" />
      </div>
    )
  }

  const recent = [...ideas].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="anim-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-twitch to-brand-glow bg-clip-text text-transparent">
            {settings?.channelName ?? 'BingusTheWizard'}
          </span>{' '}
          🪄
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your stream-to-clips pipeline at a glance. Press{' '}
          <kbd className="rounded border border-surface-700 bg-surface-900 px-1.5 py-0.5 text-[10px] font-semibold">
            N
          </kbd>{' '}
          for a new idea,{' '}
          <kbd className="rounded border border-surface-700 bg-surface-900 px-1.5 py-0.5 text-[10px] font-semibold">
            ⌘K
          </kbd>{' '}
          to jump anywhere.
        </p>
      </div>

      <div className="anim-fade-up grid gap-4 md:grid-cols-[auto_1fr]" style={{ '--stagger': 1 } as React.CSSProperties}>
        <div className="card flex items-center gap-5 p-5">
          <ProgressRing done={stats.activeSteps.done} total={stats.activeSteps.total} />
          <div>
            <p className="text-sm font-semibold">Active pipeline</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {stats.activeSteps.done}/{stats.activeSteps.total || 0} steps across{' '}
              {stats.activeIdeas.length} in-progress {stats.activeIdeas.length === 1 ? 'idea' : 'ideas'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['In progress', stats.activeIdeas.length, 'text-emerald-300'],
              ['Backlog', ideas.filter((i) => i.status === 'backlog').length, 'text-zinc-300'],
              ['Steps done', stats.stepsDone, 'text-violet-300'],
              ['Links saved', stats.linkCount, 'text-twitch'],
            ] as const
          ).map(([label, count, color]) => (
            <div key={label} className="card flex flex-col justify-center p-4">
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{count}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <WeekStrip />

      {stats.dueSoon.length > 0 && (
        <section className="anim-fade-up" style={{ '--stagger': 2 } as React.CSSProperties}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
            <IconCalendar className="size-3.5 text-amber-400" />
            Due soon
          </h2>
          <ul className="space-y-2">
            {stats.dueSoon.map((idea) => {
              const info = idea.dueDate !== undefined ? describeDue(idea.dueDate) : undefined
              return (
                <li key={idea.id}>
                  <Link
                    to={`/ideas/${idea.id}`}
                    className={`card card-hover flex items-center justify-between gap-3 px-4 py-3 ${
                      info?.tone === 'overdue' ? '!border-red-900/60' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{idea.title}</p>
                      {idea.game && <p className="truncate text-xs text-zinc-500">{idea.game}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {idea.dueDate !== undefined && <DueBadge dueDate={idea.dueDate} />}
                      <StatusBadge status={idea.status} />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {ideas.length === 0 ? (
        <EmptyState
          title="Plan your first stream"
          description="Create an idea and it gets the full pipeline checklist — from picking the game to sharing the clips."
          showCreate
        />
      ) : (
        <section className="anim-fade-up" style={{ '--stagger': 3 } as React.CSSProperties}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
            <IconClock className="size-3.5" />
            Recently updated
          </h2>
          <ul className="space-y-2">
            {recent.map((idea, index) => {
              const progress = stats.progressByIdea.get(idea.id) ?? { done: 0, total: 0 }
              return (
                <li
                  key={idea.id}
                  className="anim-fade-up"
                  style={{ '--stagger': index } as React.CSSProperties}
                >
                  <Link
                    to={`/ideas/${idea.id}`}
                    className="card card-hover group block px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate font-medium">{idea.title}</p>
                        <PriorityBadge priority={idea.priority} />
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-[11px] text-zinc-600">
                          {formatRelativeTime(idea.updatedAt)}
                        </span>
                        <StatusBadge status={idea.status} />
                        <IconChevronRight className="size-3.5 text-zinc-700 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      {idea.game && (
                        <span className="shrink-0 text-xs text-zinc-500">{idea.game}</span>
                      )}
                      {idea.tags.slice(0, 3).map((tag) => (
                        <TagChip key={tag} tag={tag} />
                      ))}
                      <div className="min-w-24 flex-1">
                        <ProgressBar done={progress.done} total={progress.total} compact />
                      </div>
                      <span className="shrink-0 text-[11px] tabular-nums text-zinc-500">
                        {progress.done}/{progress.total}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="anim-fade-up" style={{ '--stagger': 4 } as React.CSSProperties}>
        <TwitchClipsPanel />
      </div>
    </div>
  )
}
