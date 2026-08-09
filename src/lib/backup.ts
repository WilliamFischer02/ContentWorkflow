import { db } from '../db/db'
import type { AppSettings, ChecklistItem, ChecklistTemplate, Idea, StreamRun } from '../db/types'

interface BackupFile {
  app: 'ContentWorkflow'
  schemaVersion: number
  exportedAt: string
  ideas: Idea[]
  checklistTemplates: ChecklistTemplate[]
  checklistItems: ChecklistItem[]
  settings: AppSettings[]
  /** Added in schema v3; absent from older backup files. */
  streamRuns?: StreamRun[]
}

/** Serializes the entire database and triggers a JSON download. */
export async function exportBackup(): Promise<void> {
  const [ideas, checklistTemplates, checklistItems, settings, streamRuns] = await Promise.all([
    db.ideas.toArray(),
    db.checklistTemplates.toArray(),
    db.checklistItems.toArray(),
    db.settings.toArray(),
    db.streamRuns.toArray(),
  ])
  const backup: BackupFile = {
    app: 'ContentWorkflow',
    schemaVersion: 3,
    exportedAt: new Date().toISOString(),
    ideas,
    checklistTemplates,
    checklistItems,
    settings,
    streamRuns,
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `contentworkflow-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Restores a backup file, replacing all current data.
 * Throws with a readable message when the file isn't a valid backup.
 */
export async function importBackup(file: File): Promise<{ ideas: number; templates: number }> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  const data = parsed as Partial<BackupFile>
  if (
    data.app !== 'ContentWorkflow' ||
    !Array.isArray(data.ideas) ||
    !Array.isArray(data.checklistTemplates) ||
    !Array.isArray(data.checklistItems)
  ) {
    throw new Error('That file is not a ContentWorkflow backup.')
  }

  await db.transaction(
    'rw',
    db.ideas,
    db.checklistTemplates,
    db.checklistItems,
    db.settings,
    db.streamRuns,
    async () => {
      await Promise.all([
        db.ideas.clear(),
        db.checklistTemplates.clear(),
        db.checklistItems.clear(),
        db.streamRuns.clear(),
      ])
      await db.ideas.bulkAdd(data.ideas as Idea[])
      await db.checklistTemplates.bulkAdd(data.checklistTemplates as ChecklistTemplate[])
      await db.checklistItems.bulkAdd(data.checklistItems as ChecklistItem[])
      if (Array.isArray(data.streamRuns)) {
        await db.streamRuns.bulkAdd(data.streamRuns as StreamRun[])
      }
      if (Array.isArray(data.settings) && data.settings.length > 0) {
        await db.settings.clear()
        await db.settings.bulkAdd(data.settings as AppSettings[])
      }
    },
  )
  return { ideas: data.ideas.length, templates: data.checklistTemplates.length }
}

/** Deletes the whole database; the app re-seeds defaults on reload. */
export async function resetAllData(): Promise<void> {
  await db.delete()
  window.location.assign('/')
}
