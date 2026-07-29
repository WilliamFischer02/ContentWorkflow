import type { IdeaStatus } from '../db/types'

const STYLES: Record<IdeaStatus, string> = {
  backlog: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  active: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  done: 'bg-violet-950 text-violet-300 border-violet-800',
}

export function StatusBadge({ status }: { status: IdeaStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[status]}`}
    >
      {status}
    </span>
  )
}
