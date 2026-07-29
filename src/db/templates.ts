import { db, uid } from './db'
import type { ChecklistTemplate, TemplateStep } from './types'

/**
 * Template CRUD. Checklist items are per-Idea copies of template steps, so
 * none of these operations affect the saved progress of existing Ideas —
 * template edits only apply to Ideas created afterwards.
 */

export async function createTemplate(name: string, steps: TemplateStep[]): Promise<string> {
  const now = Date.now()
  const template: ChecklistTemplate = {
    id: uid(),
    name: name.trim() || 'Untitled template',
    steps: normalizeOrder(steps),
    createdAt: now,
    updatedAt: now,
  }
  await db.checklistTemplates.add(template)
  return template.id
}

export async function updateTemplate(
  id: string,
  changes: { name?: string; steps?: TemplateStep[] },
): Promise<void> {
  await db.checklistTemplates.update(id, {
    ...(changes.name !== undefined ? { name: changes.name.trim() || 'Untitled template' } : {}),
    ...(changes.steps !== undefined ? { steps: normalizeOrder(changes.steps) } : {}),
    updatedAt: Date.now(),
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.checklistTemplates.delete(id)
}

export async function duplicateTemplate(id: string): Promise<string | undefined> {
  const template = await db.checklistTemplates.get(id)
  if (!template) return undefined
  const steps = template.steps.map((step) => ({ ...step, id: uid() }))
  return createTemplate(`${template.name} (copy)`, steps)
}

export function newStep(order: number): TemplateStep {
  return { id: uid(), order, label: '', type: 'task' }
}

function normalizeOrder(steps: TemplateStep[]): TemplateStep[] {
  return [...steps]
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({ ...step, order: index }))
}
