import type { IdeaStatus, Priority } from '../db/types'
import { STATUS_LABELS } from '../db/types'
import { describeDue } from '../lib/dates'
import { IconCalendar, IconFlag } from './Icons'

const STATUS_STYLES: Record<IdeaStatus, string> = {
  backlog: 'bg-surface-800 text-zinc-300 border-surface-700',
  active: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/70',
  done: 'bg-violet-950/80 text-violet-300 border-violet-800/70',
}

export function StatusBadge({ status }: { status: IdeaStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

const PRIORITY_STYLES: Record<Exclude<Priority, 'none'>, { chip: string; label: string }> = {
  high: { chip: 'text-red-400', label: 'High' },
  medium: { chip: 'text-amber-400', label: 'Medium' },
  low: { chip: 'text-sky-400', label: 'Low' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === 'none') return null
  const style = PRIORITY_STYLES[priority]
  return (
    <span
      title={`${style.label} priority`}
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${style.chip}`}
    >
      <IconFlag className="size-3" />
      {style.label}
    </span>
  )
}

const DUE_TONES: Record<string, string> = {
  overdue: 'text-red-400',
  today: 'text-amber-400',
  soon: 'text-amber-300/90',
  later: 'text-zinc-400',
}

export function DueBadge({ dueDate }: { dueDate: number }) {
  const info = describeDue(dueDate)
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${DUE_TONES[info.tone]}`}
    >
      <IconCalendar className="size-3" />
      {info.label}
    </span>
  )
}

export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-surface-700 bg-surface-950/60 px-2 py-0.5 text-[10px] text-zinc-400">
      #{tag}
    </span>
  )
}
