import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../db/db'
import type { ChecklistTemplate, StepType, TemplateStep } from '../db/types'
import { STEP_TYPE_LABELS } from '../db/types'
import { newStep, updateTemplate } from '../db/templates'
import { useToast } from '../lib/toast'
import { IconArrowDown, IconArrowUp, IconPlus, IconX } from '../components/Icons'

/**
 * Loads the template once into local state, lets the user edit freely, and
 * saves explicitly. Saving only affects Ideas created afterwards — existing
 * Ideas keep their own checklist item copies.
 */
export function TemplateEditorPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const toast = useToast()
  const [template, setTemplate] = useState<ChecklistTemplate | null | undefined>(undefined)
  const [name, setName] = useState('')
  const [steps, setSteps] = useState<TemplateStep[]>([])
  const [dirty, setDirty] = useState(false)

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

  if (template === undefined) {
    return <div className="mx-auto max-w-3xl"><div className="skeleton h-72 rounded-2xl" /></div>
  }
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

  async function handleSave() {
    if (!templateId) return
    await updateTemplate(templateId, { name, steps })
    setDirty(false)
    toast({ title: 'Template saved', description: 'Applies to ideas created from now on.', kind: 'success' })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="anim-fade-up flex flex-wrap items-center justify-between gap-3">
        <Link to="/templates" className="text-sm text-zinc-400 hover:text-twitch">
          ← Templates
        </Link>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-xs text-amber-400">Unsaved changes</span>}
          <button
            onClick={() => void handleSave()}
            disabled={!dirty || steps.length === 0}
            className="btn-primary"
          >
            Save template
          </button>
        </div>
      </div>

      <label className="anim-fade-up block">
        <span className="mb-1 block text-sm text-zinc-400">Template name</span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setDirty(true)
          }}
          className="input w-full !text-lg !font-semibold"
        />
      </label>

      <p className="text-xs text-zinc-500">
        Step types: <strong>Task</strong> = simple checkbox · <strong>Deep link</strong> = checkbox
        + a button that opens a hardcoded URL · <strong>Link input</strong> = checkbox + user can
        collect multiple labeled URLs on the idea page.
      </p>

      <ul className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="anim-fade-up card p-3"
            style={{ '--stagger': Math.min(index, 12) } as React.CSSProperties}
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-col">
                <button
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                  aria-label="Move step up"
                  className="p-0.5 text-zinc-600 hover:text-twitch disabled:opacity-30"
                >
                  <IconArrowUp className="size-3" />
                </button>
                <button
                  onClick={() => moveStep(index, 1)}
                  disabled={index === steps.length - 1}
                  aria-label="Move step down"
                  className="p-0.5 text-zinc-600 hover:text-twitch disabled:opacity-30"
                >
                  <IconArrowDown className="size-3" />
                </button>
              </div>
              <input
                value={step.label}
                onChange={(e) => updateStep(step.id, { label: e.target.value })}
                placeholder="Step label…"
                className="input min-w-40 flex-1 !py-1.5 !text-sm"
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
                className="input !py-1.5 !text-xs"
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
                className="btn-danger-ghost !px-2"
              >
                <IconX className="size-3.5" />
              </button>
            </div>
            {step.type === 'deep-link' && (
              <input
                value={step.deepLinkUrl ?? ''}
                onChange={(e) => updateStep(step.id, { deepLinkUrl: e.target.value })}
                placeholder="https://… (URL the step's button opens)"
                className="input mt-2 w-full !py-1.5 !text-xs"
              />
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={() => mutateSteps([...steps, newStep(steps.length)])}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-700 py-2.5 text-sm text-zinc-400 transition-colors hover:border-twitch hover:text-twitch"
      >
        <IconPlus className="size-4" />
        Add step
      </button>
    </div>
  )
}
