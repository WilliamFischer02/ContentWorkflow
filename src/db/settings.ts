import { db } from './db'
import { defaultSettings } from './seed'
import type { AppSettings } from './types'

export const SETTINGS_ID = 'app'

/** Reads settings, self-healing to defaults if the row is missing. */
export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get(SETTINGS_ID)
  if (existing) return existing
  const fresh = defaultSettings()
  await db.settings.put(fresh)
  return fresh
}

export async function updateSettings(changes: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
  const current = await getSettings()
  await db.settings.put({ ...current, ...changes, id: SETTINGS_ID })
}
