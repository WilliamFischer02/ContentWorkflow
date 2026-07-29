import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { LinkColor, QuickLink } from '../db/types'
import { updateSettings } from '../db/settings'
import { defaultQuickLinks } from '../db/seed'
import { exportBackup, importBackup, resetAllData } from '../lib/backup'
import { useToast } from '../lib/toast'
import {
  IconArrowDown,
  IconArrowUp,
  IconDownload,
  IconPlus,
  IconTrash,
  IconUpload,
} from '../components/Icons'

const COLOR_OPTIONS: LinkColor[] = ['red', 'cyan', 'pink', 'purple', 'emerald', 'amber', 'zinc']

export function SettingsPage() {
  const toast = useToast()
  const settings = useLiveQuery(() => db.settings.get('app'), [])
  const ideasCount = useLiveQuery(() => db.ideas.count(), [])
  const itemsCount = useLiveQuery(() => db.checklistItems.count(), [])
  const templatesCount = useLiveQuery(() => db.checklistTemplates.count(), [])

  const [channelName, setChannelName] = useState('')
  const [links, setLinks] = useState<QuickLink[] | null>(null)
  const [dirty, setDirty] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Hydrate local editing state once settings arrive.
  useEffect(() => {
    if (settings && links === null) {
      setChannelName(settings.channelName)
      setLinks(settings.quickLinks)
    }
  }, [settings, links])

  if (!settings || links === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  function mutateLinks(next: QuickLink[]) {
    setLinks(next)
    setDirty(true)
  }

  function updateLink(id: string, changes: Partial<QuickLink>) {
    mutateLinks((links ?? []).map((l) => (l.id === id ? { ...l, ...changes } : l)))
  }

  function moveLink(index: number, delta: -1 | 1) {
    const list = [...(links ?? [])]
    const target = index + delta
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    mutateLinks(list)
  }

  async function handleSave() {
    await updateSettings({
      channelName: channelName.trim() || 'BingusTheWizard',
      quickLinks: (links ?? []).filter((l) => l.label.trim() && l.url.trim()),
    })
    setDirty(false)
    toast({ title: 'Settings saved', kind: 'success' })
  }

  async function handleImport(file: File) {
    try {
      const result = await importBackup(file)
      setLinks(null) // re-hydrate from restored settings
      toast({
        title: 'Backup restored',
        description: `${result.ideas} ideas, ${result.templates} templates imported.`,
        kind: 'success',
      })
    } catch (err) {
      toast({
        title: 'Import failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        kind: 'error',
      })
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="anim-fade-up flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            Workspace, quick-launch links, and data management.
          </p>
        </div>
        <button onClick={() => void handleSave()} disabled={!dirty} className="btn-primary">
          Save changes
        </button>
      </div>

      <section className="anim-fade-up card p-5" style={{ '--stagger': 1 } as React.CSSProperties}>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">Workspace</h2>
        <label className="block max-w-sm text-sm">
          <span className="mb-1 block text-zinc-400">Channel name</span>
          <input
            value={channelName}
            onChange={(e) => {
              setChannelName(e.target.value)
              setDirty(true)
            }}
            className="input w-full"
          />
        </label>
      </section>

      <section className="anim-fade-up card p-5" style={{ '--stagger': 2 } as React.CSSProperties}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Quick-launch links
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              These appear in the top bar and always open in a new tab.
            </p>
          </div>
          <button
            onClick={() =>
              mutateLinks([
                ...links,
                { id: crypto.randomUUID(), label: '', url: '', color: 'zinc' },
              ])
            }
            className="btn-ghost"
          >
            <IconPlus className="size-3.5" />
            Add link
          </button>
        </div>
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li
              key={link.id}
              className="rounded-xl border border-surface-800 bg-surface-950/50 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveLink(index, -1)}
                    disabled={index === 0}
                    aria-label="Move link up"
                    className="p-0.5 text-zinc-600 hover:text-twitch disabled:opacity-30"
                  >
                    <IconArrowUp className="size-3" />
                  </button>
                  <button
                    onClick={() => moveLink(index, 1)}
                    disabled={index === links.length - 1}
                    aria-label="Move link down"
                    className="p-0.5 text-zinc-600 hover:text-twitch disabled:opacity-30"
                  >
                    <IconArrowDown className="size-3" />
                  </button>
                </div>
                <input
                  value={link.label}
                  onChange={(e) => updateLink(link.id, { label: e.target.value })}
                  placeholder="Label"
                  className="input w-36 !py-1.5 !text-xs"
                />
                <input
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  placeholder="https://…"
                  className="input min-w-40 flex-1 !py-1.5 !text-xs"
                />
                <select
                  value={link.color}
                  onChange={(e) => updateLink(link.id, { color: e.target.value as LinkColor })}
                  aria-label="Link color"
                  className="input !py-1.5 !text-xs capitalize"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => mutateLinks(links.filter((l) => l.id !== link.id))}
                  aria-label={`Remove link ${link.label}`}
                  className="btn-danger-ghost !px-2"
                >
                  <IconTrash className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={() => mutateLinks(defaultQuickLinks())}
          className="mt-3 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          Restore default links
        </button>
      </section>

      <section className="anim-fade-up card p-5" style={{ '--stagger': 3 } as React.CSSProperties}>
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-zinc-400">Data</h2>
        <p className="mb-4 text-xs text-zinc-500">
          Everything is stored locally in this browser (IndexedDB): currently {ideasCount ?? 0}{' '}
          ideas, {templatesCount ?? 0} templates, {itemsCount ?? 0} checklist items. Export a
          backup before clearing browser data or to move to another device.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => void exportBackup()} className="btn-ghost">
            <IconDownload className="size-3.5" />
            Export backup (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost">
            <IconUpload className="size-3.5" />
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImport(file)
              e.target.value = ''
            }}
          />
          <div className="ms-auto">
            {confirmReset ? (
              <span className="flex items-center gap-1 text-xs">
                <span className="mr-1 text-zinc-500">Delete everything?</span>
                <button
                  onClick={() => void resetAllData()}
                  className="rounded-lg bg-red-900 px-2.5 py-1.5 font-semibold text-red-200 hover:bg-red-800"
                >
                  Yes, reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg px-2 py-1.5 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="btn-danger-ghost">
                <IconTrash className="size-3.5" />
                Reset all data
              </button>
            )}
          </div>
        </div>
      </section>

      <section
        className="anim-fade-up card p-5 text-xs text-zinc-500"
        style={{ '--stagger': 4 } as React.CSSProperties}
      >
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">About</h2>
        <p>
          ContentWorkflow v2 — local-first stream pipeline manager. Vite · React · TypeScript ·
          Tailwind CSS · Dexie (IndexedDB). Twitch clip fetching runs through a Vercel serverless
          function; credentials are configured via environment variables, never stored here.
        </p>
      </section>
    </div>
  )
}
