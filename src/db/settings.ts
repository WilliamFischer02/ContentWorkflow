import { db } from './db'
import { defaultSettings, defaultStreamDays } from './seed'
import type { AppSettings } from './types'

export const SETTINGS_ID = 'app'

/** Reads settings, self-healing missing rows/fields (e.g. v2 backup imports). */
export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get(SETTINGS_ID)
  if (existing) {
    if (!existing.streamDays) {
      existing.streamDays = defaultStreamDays()
      await db.settings.put(existing)
    }
    return existing
  }
  const fresh = defaultSettings()
  await db.settings.put(fresh)
  return fresh
}

export async function updateSettings(changes: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
  const current = await getSettings()
  await db.settings.put({ ...current, ...changes, id: SETTINGS_ID })
}
