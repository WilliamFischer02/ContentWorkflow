import { db } from './db'
import type { StreamRun, StreamStepState } from './types'
import { STREAMS, type StreamGame } from '../content/streams'

export function runId(game: StreamGame, weekStart: string): string {
  return `${game}:${weekStart}`
}

function emptyRun(game: StreamGame, weekStart: string): StreamRun {
  const now = Date.now()
  return { id: runId(game, weekStart), game, weekStart, steps: {}, createdAt: now, updatedAt: now }
}

/** Merge a partial state into one step of a run, creating the run lazily. */
export async function patchStep(
  game: StreamGame,
  weekStart: string,
  stepId: string,
  patch: Partial<StreamStepState>,
): Promise<void> {
  await db.transaction('rw', db.streamRuns, async () => {
    const existing = (await db.streamRuns.get(runId(game, weekStart))) ?? emptyRun(game, weekStart)
    const prev: StreamStepState = existing.steps[stepId] ?? { done: false }
    existing.steps = { ...existing.steps, [stepId]: { ...prev, ...patch } }
    existing.updatedAt = Date.now()
    await db.streamRuns.put(existing)
  })
}

/** Toggle one sub-step checkbox inside a step. */
export async function toggleSubStep(
  game: StreamGame,
  weekStart: string,
  stepId: string,
  subId: string,
  value: boolean,
): Promise<void> {
  await db.transaction('rw', db.streamRuns, async () => {
    const existing = (await db.streamRuns.get(runId(game, weekStart))) ?? emptyRun(game, weekStart)
    const prev: StreamStepState = existing.steps[stepId] ?? { done: false }
    const step: StreamStepState = { ...prev, subs: { ...prev.subs, [subId]: value } }
    existing.steps = { ...existing.steps, [stepId]: step }
    existing.updatedAt = Date.now()
    await db.streamRuns.put(existing)
  })
}

export interface RunProgress {
  done: number
  total: number
  pct: number
}

/** Column progress counts main steps only (sub-steps are helpers). */
export function runProgress(game: StreamGame, run: StreamRun | undefined): RunProgress {
  const total = STREAMS[game].steps.length
  const done = run
    ? STREAMS[game].steps.filter((step) => run.steps[step.id]?.done).length
    : 0
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}
