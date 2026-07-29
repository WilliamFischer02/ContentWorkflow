import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../db/db'
import type { ChecklistTemplate, StepType, TemplateStep } from '../db/types'
import { STEP_TYPE_LABELS } from '../db/types'
import { newStep, updateTemplate } from '../db/templates'

/**
 * Loads the template once into local state, lets the user edit freely, and
 * saves explicitly. Saving only affects Ideas created afterwards — existing
 * Ideas keep their own checklist item copies.
 */
export function TemplateEditorPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const [template, setTemplate] = useState<ChecklistTemplate | null | undefined>(undefined)
  const [name, setName] = useState('')
  const [steps, setSteps] = useState<TemplateStep[]>([])
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!templateId) return
    void db.checklistTemplates.get(templateId).then((t) => {
      if (cancelled) return
      setTemplate(t ?? null)
      if (t) {
        setName(t.name)
        setSteps([...t.steps].sort((a, b) => a.order - b.order))
      }
    })
    return () => {
      cancelled = true
    }
  }, [templateId])

  if (template === undefined) return <p className="text-zinc-500">Loading…</p>
  if (template === null) {
    return (
      <p className="text-zinc-400">
        Template not found.{' '}
        <Link to="/templates" className="text-twitch hover:underline">
          Back to templates
        </Link>
      </p>
    )
  }

  function mutateSteps(next: TemplateStep[]) {
    setSteps(next)
    setDirty(true)
  }

  function updateStep(id: string, changes: Partial<TemplateStep>) {
    mutateSteps(steps.map((s) => (s.id === id ? { ...s, ...changes } : s)))
  }

  function moveStep(index: number, delta: -1 | 1) {
    const target = index + delta
    if (target < 0 || target >= steps.length) return
    const next = [...steps]
    ;[next[index], next[target]] = [next[target], next[index]]
    mutateSteps(next.map((s, i) => ({ ...s, order: i })))
  }

  function removeStep(id: string) {
    mutateSteps(steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })))
  }

  function addStep() {
    mutateSteps([...steps, newStep(steps.length)])
  }

  async function handleSave() {
    if (!templateId) return
    await updateTemplate(templateId, { name, steps })
    setDirty(false)
    setSavedAt(Date.now())
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/templates" className="text-sm text-zinc-400 hover:text-twitch">
          ← Templates
        </Link>
        <div className="flex items-center gap-3">
          {savedAt && !dirty && <span className="text-xs text-emerald-400">Saved ✓</span>}
          {dirty && <span className="text-xs text-amber-400">Unsaved changes</span>}
          <button
            onClick={() => void handleSave()}
            disabled={!dirty || steps.length === 0}
            className="rounded-md bg-twitch-dark px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-twitch disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save template
          </button>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-400">Template name</span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setDirty(true)
          }}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-lg font-semibold outline-none focus:border-twitch"
        />
      </label>

      <p className="text-xs text-zinc-500">
        Step types: <strong>Task</strong> = simple checkbox · <strong>Deep link</strong> = checkbox
        + a button that opens a hardcoded URL · <strong>Link input</strong> = checkbox + user can
        collect multiple labeled URLs on the idea page.
      </p>

      <ul className="space-y-2">
        {steps.map((step, index) => (
          <li key={step.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-col">
                <button
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                  aria-label="Move step up"
                  className="px-1 text-zinc-500 hover:text-twitch disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveStep(index, 1)}
                  disabled={index === steps.length - 1}
                  aria-label="Move step down"
                  className="px-1 text-zinc-500 hover:text-twitch disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <input
                value={step.label}
                onChange={(e) => updateStep(step.id, { label: e.target.value })}
                placeholder="Step label…"
                className="min-w-40 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm outline-none focus:border-twitch"
              />
              <select
                value={step.type}
                onChange={(e) => {
                  const type = e.target.value as StepType
                  updateStep(step.id, {
                    type,
                    ...(type !== 'deep-link' ? { deepLinkUrl: undefined } : {}),
                  })
                }}
                aria-label="Step type"
                className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs outline-none focus:border-twitch"
              >
                {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map((type) => (
                  <option key={type} value={type}>
                    {STEP_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeStep(step.id)}
                disabled={steps.length === 1}
                aria-label="Remove step"
                title={steps.length === 1 ? 'Templates need at least one step' : 'Remove step'}
                className="rounded-md border border-zinc-800 px-2 py-1.5 text-xs text-zinc-500 hover:border-red-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ✕
              </button>
            </div>
            {step.type === 'deep-link' && (
              <input
                value={step.deepLinkUrl ?? ''}
                onChange={(e) => updateStep(step.id, { deepLinkUrl: e.target.value })}
                placeholder="https://… (URL the step's button opens)"
                className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs outline-none focus:border-twitch"
              />
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={addStep}
        className="w-full rounded-lg border border-dashed border-zinc-700 py-2.5 text-sm text-zinc-400 transition-colors hover:border-twitch hover:text-twitch"
      >
        + Add step
      </button>
    </div>
  )
}
