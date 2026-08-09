import { useEffect, useRef } from 'react'
import type { StreamDef } from '../content/streams'
import { DAY_NAMES } from '../content/streams'
import type { StreamRun } from '../db/types'
import { runProgress } from '../db/streams'
import { dateOfWeekday } from '../lib/weeks'
import { burstConfetti } from '../lib/confetti'
import { useToast } from '../lib/toast'
import { StreamStepCard } from './StreamStepCard'
import { IconExternal } from './Icons'

/** Small accent-colored completion ring for the column header. */
function MiniRing({ pct }: { pct: number }) {
  const size = 46
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(255 255 255 / 0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={pct === 100 ? '#34d399' : 'var(--col-accent)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
        {pct}%
      </span>
    </div>
  )
}

interface Props {
  def: StreamDef
  weekStart: string
  day: number
  run: StreamRun | undefined
  stagger: number
}

export function StreamColumn({ def, weekStart, day, run, stagger }: Props) {
  const toast = useToast()
  const progress = runProgress(def.game, run)
  const prevPct = useRef(progress.pct)

  useEffect(() => {
    if (progress.pct === 100 && prevPct.current < 100) {
      burstConfetti()
      toast({
        title: `${def.name} week complete! ${def.emoji}`,
        description: 'Stream → clips → posts → VOD, all shipped. That’s the machine working.',
        kind: 'success',
      })
    }
    prevPct.current = progress.pct
  }, [progress.pct, def.name, def.emoji, toast])

  const nextUp = def.steps.find((step) => !(run?.steps[step.id]?.done ?? false))
  const airDate = dateOfWeekday(weekStart, day)
  const airLabel = airDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <section
      className={`stream-col anim-fade-up ${def.themeClass} p-3.5`}
      style={{ '--stagger': stagger } as React.CSSProperties}
      data-game={def.game}
      aria-label={`${def.name} weekly pipeline`}
    >
      <header className="mb-3 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="stream-col-badge">
              <span aria-hidden>{def.emoji}</span>
              {def.name}
            </span>
            <p className="mt-2 text-[11px] text-zinc-400">{def.tagline}</p>
          </div>
          <MiniRing pct={progress.pct} />
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-zinc-300">
          <span
            className="rounded-full px-2 py-0.5"
            style={{
              background: 'color-mix(in srgb, var(--col-accent) 14%, transparent)',
              color: 'var(--col-accent)',
            }}
          >
            {DAY_NAMES[day]}s · {airLabel}
          </span>
          <span className="text-zinc-500">
            {progress.done}/{progress.total} steps
          </span>
        </div>
      </header>

      <ul className="space-y-2">
        {def.steps.map((step, index) => (
          <StreamStepCard
            key={step.id}
            game={def.game}
            weekStart={weekStart}
            step={step}
            state={run?.steps[step.id]}
            isNext={nextUp?.id === step.id}
            stagger={index}
          />
        ))}
      </ul>

      <footer className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/5 px-0.5 pt-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
          {def.name} tools
        </span>
        {def.resources.map((resource) => (
          <a
            key={resource.url}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 transition-colors hover:text-[var(--col-accent)]"
          >
            {resource.label}
            <IconExternal className="size-2.5 opacity-50" />
          </a>
        ))}
      </footer>
    </section>
  )
}
