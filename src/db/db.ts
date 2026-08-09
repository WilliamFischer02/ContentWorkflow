import Dexie, { type Table } from 'dexie'
import type {
  AppSettings,
  ChecklistItem,
  ChecklistTemplate,
  Idea,
  StreamRun,
  TemplateStep,
} from './types'
import {
  buildDefaultTemplate,
  defaultSettings,
  defaultStreamDays,
  LEGACY_TIKTOK_UPLOAD_URL,
  LEGACY_YOUTUBE_UPLOAD_URL,
  TIKTOK_UPLOAD_URL,
  YOUTUBE_UPLOAD_URL,
} from './seed'

const URL_MIGRATIONS: Record<string, string> = {
  [LEGACY_YOUTUBE_UPLOAD_URL]: YOUTUBE_UPLOAD_URL,
  [LEGACY_TIKTOK_UPLOAD_URL]: TIKTOK_UPLOAD_URL,
}

class ContentWorkflowDB extends Dexie {
  ideas!: Table<Idea, string>
  checklistTemplates!: Table<ChecklistTemplate, string>
  checklistItems!: Table<ChecklistItem, string>
  settings!: Table<AppSettings, string>
  streamRuns!: Table<StreamRun, string>

  constructor() {
    super('ContentWorkflowDB')

    // v1 — initial schema.
    this.version(1).stores({
      ideas: 'id, status, createdAt, updatedAt',
      checklistTemplates: 'id, name',
      checklistItems: 'id, ideaId, [ideaId+order]',
    })

    // v2 — priorities/due dates/tags on ideas, per-step notes, settings
    // singleton, and migration of the v1 placeholder upload URLs to the
    // real channel URLs.
    this.version(2)
      .stores({
        ideas: 'id, status, priority, dueDate, createdAt, updatedAt',
        checklistTemplates: 'id, name',
        checklistItems: 'id, ideaId, [ideaId+order]',
        settings: 'id',
      })
      .upgrade(async (tx) => {
        await tx
          .table<Idea>('ideas')
          .toCollection()
          .modify((idea) => {
            idea.priority ??= 'none'
            idea.tags ??= []
          })
        await tx
          .table<ChecklistItem>('checklistItems')
          .toCollection()
          .modify((item) => {
            item.note ??= ''
            if (item.deepLinkUrl && URL_MIGRATIONS[item.deepLinkUrl]) {
              item.deepLinkUrl = URL_MIGRATIONS[item.deepLinkUrl]
            }
          })
        await tx
          .table<ChecklistTemplate>('checklistTemplates')
          .toCollection()
          .modify((template) => {
            template.steps = template.steps.map((step: TemplateStep) =>
              step.deepLinkUrl && URL_MIGRATIONS[step.deepLinkUrl]
                ? { ...step, deepLinkUrl: URL_MIGRATIONS[step.deepLinkUrl] }
                : step,
            )
          })
        await tx.table<AppSettings>('settings').put(defaultSettings())
      })

    // v3 — weekly stream runs (3-column recurring pipeline) and the
    // per-stream day-of-week schedule on settings.
    this.version(3)
      .stores({
        ideas: 'id, status, priority, dueDate, createdAt, updatedAt',
        checklistTemplates: 'id, name',
        checklistItems: 'id, ideaId, [ideaId+order]',
        settings: 'id',
        streamRuns: 'id, game, weekStart',
      })
      .upgrade(async (tx) => {
        await tx
          .table<AppSettings>('settings')
          .toCollection()
          .modify((settings) => {
            settings.streamDays ??= defaultStreamDays()
          })
      })

    // Seed on first run (fresh databases are created directly at the
    // latest version, so both the template and settings go in here).
    this.on('populate', (tx) => {
      void tx.table('checklistTemplates').add(buildDefaultTemplate())
      void tx.table('settings').add(defaultSettings())
    })
  }
}

export const db = new ContentWorkflowDB()

export function uid(): string {
  return crypto.randomUUID()
}
