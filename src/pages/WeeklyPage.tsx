import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { STREAMS, STREAM_GAMES, type StreamGame } from '../content/streams'
import { runProgress } from '../db/streams'
import { describeWeek, shiftWeek, weekStartISO } from '../lib/weeks'
import { StreamColumn } from '../components/StreamColumn'
import { ProgressBar } from '../components/ProgressBar'
import { IconChevronRight } from '../components/Icons'

/** Monday-first ordering for day-of-week values. */
function mondayRank(day: number): number {
  return (day + 6) % 7
}

export function WeeklyPage() {
  const [offset, setOffset] = useState(0)
  const weekStart = useMemo(() => shiftWeek(weekStartISO(), offset), [offset])

  const settings = useLiveQuery(() => db.settings.get('app'), [])
  const runs = useLiveQuery(
    () => db.streamRuns.where('weekStart').equals(weekStart).toArray(),
    [weekStart],
  )

  const runByGame = useMemo(() => {
    const map = new Map(runs?.map((run) => [run.game, run]))
    return (game: StreamGame) => map.get(game)
  }, [runs])

  const days: Record<string, number> = settings?.streamDays ?? {
    rivals: 1,
    minecraft: 3,
    chess: 5,
  }

  const ordered = [...STREAM_GAMES].sort(
    (a, b) => mondayRank(days[a] ?? 0) - mondayRank(days[b] ?? 0),
  )

  const overall = STREAM_GAMES.reduce(
    (acc, game) => {
      const p = runProgress(game, runByGame(game))
      acc.done += p.done
      acc.total += p.total
      return acc
    },
    { done: 0, total: 0 },
  )

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="anim-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Weekly{' '}
            <span className="bg-gradient-to-r from-twitch to-brand-glow bg-clip-text text-transparent">
              streams
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Three games, three 4-hour streams, one machine: stream it, clip it, post it everywhere.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset((o) => o - 1)}
            aria-label="Previous week"
            className="btn-ghost !px-2.5"
          >
            <IconChevronRight className="size-3.5 rotate-180" />
          </button>
          <div className="min-w-36 text-center">
            <p className="text-sm font-bold tabular-nums">{describeWeek(weekStart)}</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              {offset === 0 ? 'This week' : offset === -1 ? 'Last week' : offset === 1 ? 'Next week' : `${Math.abs(offset)} weeks ${offset < 0 ? 'ago' : 'ahead'}`}
            </p>
          </div>
          <button
            onClick={() => setOffset((o) => o + 1)}
            aria-label="Next week"
            className="btn-ghost !px-2.5"
          >
            <IconChevronRight className="size-3.5" />
          </button>
          {offset !== 0 && (
            <button onClick={() => setOffset(0)} className="btn-ghost">
              Today
            </button>
          )}
        </div>
      </div>

      <div className="anim-fade-up max-w-md" style={{ '--stagger': 1 } as React.CSSProperties}>
        <ProgressBar done={overall.done} total={overall.total} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {ordered.map((game, index) => (
          <StreamColumn
            key={game}
            def={STREAMS[game]}
            weekStart={weekStart}
            day={days[game] ?? STREAMS[game].defaultDay}
            run={runByGame(game)}
            stagger={index + 1}
          />
        ))}
      </div>
    </div>
  )
}
