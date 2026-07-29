import { db, uid } from './db'
import type { ChecklistItem, Idea, IdeaStatus, LinkEntry } from './types'

export interface IdeaDraft {
  title: string
  game: string
  status: IdeaStatus
  notes: string
}

/** Creates an Idea and instantiates its checklist from the given template. */
export async function createIdea(draft: IdeaDraft, templateId: string): Promise<string> {
  const template = await db.checklistTemplates.get(templateId)
  if (!template) throw new Error('Template not found')

  const now = Date.now()
  const idea: Idea = {
    id: uid(),
    title: draft.title.trim(),
    game: draft.game.trim(),
    status: draft.status,
    notes: draft.notes,
    templateId,
    createdAt: now,
    updatedAt: now,
  }
  const items: ChecklistItem[] = [...template.steps]
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({
      id: uid(),
      ideaId: idea.id,
      templateStepId: step.id,
      order: index,
      label: step.label,
      type: step.type,
      ...(step.deepLinkUrl ? { deepLinkUrl: step.deepLinkUrl } : {}),
      done: false,
      links: [],
    }))

  await db.transaction('rw', db.ideas, db.checklistItems, async () => {
    await db.ideas.add(idea)
    await db.checklistItems.bulkAdd(items)
  })
  return idea.id
}

export async function updateIdea(id: string, changes: Partial<IdeaDraft>): Promise<void> {
  await db.ideas.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteIdea(id: string): Promise<void> {
  await db.transaction('rw', db.ideas, db.checklistItems, async () => {
    await db.checklistItems.where('ideaId').equals(id).delete()
    await db.ideas.delete(id)
  })
}

async function touchIdea(ideaId: string): Promise<void> {
  await db.ideas.update(ideaId, { updatedAt: Date.now() })
}

export async function setItemDone(item: ChecklistItem, done: boolean): Promise<void> {
  await db.transaction('rw', db.ideas, db.checklistItems, async () => {
    await db.checklistItems.update(item.id, { done })
    await touchIdea(item.ideaId)
  })
}

export async function addItemLink(item: ChecklistItem, label: string, url: string): Promise<void> {
  const entry: LinkEntry = { id: uid(), label: label.trim(), url: url.trim() }
  await db.transaction('rw', db.ideas, db.checklistItems, async () => {
    await db.checklistItems.update(item.id, { links: [...item.links, entry] })
    await touchIdea(item.ideaId)
  })
}

export async function removeItemLink(item: ChecklistItem, linkId: string): Promise<void> {
  await db.transaction('rw', db.ideas, db.checklistItems, async () => {
    await db.checklistItems.update(item.id, {
      links: item.links.filter((link) => link.id !== linkId),
    })
    await touchIdea(item.ideaId)
  })
}
