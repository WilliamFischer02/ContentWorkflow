import Dexie, { type Table } from 'dexie'
import type { ChecklistItem, ChecklistTemplate, Idea } from './types'
import { buildDefaultTemplate } from './seed'

class ContentWorkflowDB extends Dexie {
  ideas!: Table<Idea, string>
  checklistTemplates!: Table<ChecklistTemplate, string>
  checklistItems!: Table<ChecklistItem, string>

  constructor() {
    super('ContentWorkflowDB')

    // v1 — initial schema. Only indexed fields are listed; full objects
    // (including embedded steps/links arrays) are stored as-is.
    this.version(1).stores({
      ideas: 'id, status, createdAt, updatedAt',
      checklistTemplates: 'id, name',
      checklistItems: 'id, ideaId, [ideaId+order]',
    })

    // Future migrations: bump the version and provide an upgrade callback, e.g.
    // this.version(2)
    //   .stores({ ideas: 'id, status, game, createdAt, updatedAt' })
    //   .upgrade((tx) => tx.table('ideas').toCollection().modify((idea) => { ... }))

    // Seed the default template the first time the database is created.
    this.on('populate', (tx) => {
      void tx.table('checklistTemplates').add(buildDefaultTemplate())
    })
  }
}

export const db = new ContentWorkflowDB()

export function uid(): string {
  return crypto.randomUUID()
}
