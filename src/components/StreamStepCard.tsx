import { useState } from 'react'
import type { StreamGame, StreamStepDef } from '../content/streams'
import type { StreamStepState } from '../db/types'
import { patchStep, toggleSubStep } from '../db/streams'
import { CopyBlock, CopyLine } from './CopyBlock'
import { SpecPillRow } from './SpecPill'
import {
  IconChart,
  IconCheck,
  IconChevronDown,
  IconExternal,
  IconMegaphone,
  IconMinus,
  IconPlay,
  IconPlus,
  IconScissors,
  IconSparkles,
  IconTv,
  IconUpload,
} from './Icons'

function stepIcon(step: StreamStepDef) {
  const cls = 'size-4'
  switch (step.id) {
    case 'stream':
      return <IconTv className={cls} />
    case 'clips':
      return <IconScissors className={cls} />
    case 'vod':
      return <IconPlay className={cls} />
    case 'engage':
      return <IconMegaphone className={cls} />
    case 'analytics':
      return <IconChart className={cls} />
    default:
      return <IconUpload className={cls} />
  }
}

interface Props {
  game: StreamGame
  weekStart: string
  step: StreamStepDef
  state: StreamStepState | undefined
  /** First not-done step in the column — auto-expanded with an accent rail. */
  isNext: boolean
  stagger: number
}

export function StreamStepCard({ game, weekStart, step, state, isNext, stagger }: Props) {
  const [openOverride, setOpenOverride] = useState<boolean | undefined>(undefined)
  const done = state?.done ?? false
  const open = openOverride ?? (isNext && !done)
  const count = state?.count ?? 0
  const target = step.clipTarget

  async function toggleDone() {
    await patchStep(game, weekStart, step.id, {
      done: !done,
      doneAt: !done ? Date.now() : undefined,
    })
  }

  async function bumpCount(delta: number) {
    if (target === undefined) return
    const next = Math.max(0, count + delta)
    const reached = next >= target
    await patchStep(game, weekStart, step.id, {
      count: next,
      // Hitting the target completes the step; dropping back down un-completes
      // it only if it was auto-completed by the counter (done tracks target).
      ...(reached && !done ? { done: true, doneAt: Date.now() } : {}),
      ...(!reached && done && count >= target ? { done: false, doneAt: undefined } : {}),
    })
  }

  return (
    <li
      className="anim-fade-up"
      style={{ '--stagger': stagger } as React.CSSProperties}
      data-step={step.id}
      data-done={done}
    >
      <div
        className={`card overflow-hidden transition-all duration-200 ${
          isNext && !done ? 'shadow-[var(--col-glow)]' : ''
        }`}
        style={
          isNext && !done
            ? { borderColor: 'color-mix(in srgb, var(--col-accent) 55%, transparent)' }
            : undefined
        }
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <button
            onClick={() => void toggleDone()}
            aria-label={`Mark "${step.title}" ${done ? 'not done' : 'done'}`}
            className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
              done ? 'anim-pop text-black' : 'hover:scale-110'
            }`}
            style={{
              borderColor: 'var(--col-accent)',
              background: done ? 'var(--col-accent)' : 'transparent',
            }}
          >
            {done && <IconCheck className="size-3" />}
          </button>

          <button
            onClick={() => setOpenOverride(!open)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-expanded={open}
          >
            <span className="shrink-0" style={{ color: 'var(--col-accent)' }}>
              {stepIcon(step)}
            </span>
            <span
              className={`truncate text-sm font-semibold ${done ? 'text-zinc-500 line-through decoration-2' : ''}`}
            >
              {step.title}
            </span>
            {target !== undefined && (
              <span
                className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                style={{
                  background: 'color-mix(in srgb, var(--col-accent) 14%, transparent)',
                  color: 'var(--col-accent)',
                }}
              >
                {Math.min(count, 99)}/{target}
              </span>
            )}
            {isNext && !done && (
              <span
                className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--col-accent)' }}
              >
                <IconSparkles className="size-3" />
                Next up
              </span>
            )}
            <IconChevronDown
              className={`ms-auto size-3.5 shrink-0 text-zinc-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {open && (
          <div className="anim-scale-in space-y-3 border-t border-surface-800 px-3 pb-3.5 pt-3">
            <p className="text-xs leading-relaxed text-zinc-400">{step.blurb}</p>

            <SpecPillRow specs={step.specs} />

            {(step.link || target !== undefined) && (
              <div className="flex flex-wrap items-center gap-2">
                {step.link && (
                  <a
                    href={step.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ borderColor: 'color-mix(in srgb, var(--col-accent) 40%, transparent)' }}
                  >
                    {step.link.label}
                    <IconExternal className="size-3 opacity-50" />
                  </a>
                )}
                {target !== undefined && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-surface-700 px-1.5 py-1">
                    <button
                      onClick={() => void bumpCount(-1)}
                      disabled={count === 0}
                      aria-label="Remove a clip"
                      className="rounded p-0.5 text-zinc-400 transition-colors hover:text-white disabled:opacity-30"
                    >
                      <IconMinus className="size-3.5" />
                    </button>
                    <span className="min-w-14 text-center text-xs font-bold tabular-nums">
                      {count} / {target} clips
                    </span>
                    <button
                      onClick={() => void bumpCount(1)}
                      aria-label="Add a clip"
                      className="rounded p-0.5 transition-colors hover:text-white"
                      style={{ color: 'var(--col-accent)' }}
                    >
                      <IconPlus className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {step.subSteps && (
              <ul className="space-y-1">
                {step.subSteps.map((sub) => {
                  const subDone = state?.subs?.[sub.id] ?? false
                  return (
                    <li key={sub.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-surface-800/60">
                        <input
                          type="checkbox"
                          checked={subDone}
                          onChange={(e) =>
                            void toggleSubStep(game, weekStart, step.id, sub.id, e.target.checked)
                          }
                          className="size-3.5 accent-[var(--col-accent)]"
                        />
                        <span className={subDone ? 'text-zinc-500 line-through' : ''}>
                          {sub.label}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}

            {step.templates && step.templates.length > 0 && (
              <div className="space-y-2">
                {step.templates.map((template) => (
                  <CopyBlock key={template.label} label={template.label} text={template.text} />
                ))}
                <p className="text-[10px] text-zinc-600">
                  Fill the {'{PLACEHOLDERS}'} before posting.
                </p>
              </div>
            )}

            {step.viralTitles && step.viralTitles.length > 0 && (
              <div>
                <p
                  className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--col-accent)' }}
                >
                  <IconSparkles className="size-3" />
                  Viral title patterns — click to copy
                </p>
                <ul>
                  {step.viralTitles.map((title) => (
                    <li key={title}>
                      <CopyLine text={title} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
