import { openNewIdea } from '../lib/bus'
import { IconPlus, IconSparkles } from './Icons'

export function EmptyState({
  title,
  description,
  showCreate = false,
}: {
  title: string
  description: string
  showCreate?: boolean
}) {
  return (
    <div className="anim-scale-in flex flex-col items-center rounded-2xl border border-dashed border-surface-700 px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-twitch/10">
        <IconSparkles className="size-7 text-twitch" />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
      {showCreate && (
        <button onClick={openNewIdea} className="btn-primary mt-5">
          <IconPlus className="size-4" />
          New idea
        </button>
      )}
    </div>
  )
}
