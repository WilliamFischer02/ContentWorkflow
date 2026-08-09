import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { openNewIdea } from '../lib/bus'
import { exportBackup } from '../lib/backup'
import {
  IconBoard,
  IconDownload,
  IconHome,
  IconList,
  IconPlay,
  IconPlus,
  IconSearch,
  IconSettings,
  IconTv,
  IconWrench,
} from './Icons'

interface Command {
  id: string
  label: string
  hint?: string
  icon: React.ReactNode
  run: () => void
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const ideas = useLiveQuery(() => db.ideas.orderBy('updatedAt').reverse().toArray(), [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const commands = useMemo<Command[]>(() => {
    const actions: Command[] = [
      {
        id: 'new-idea',
        label: 'New idea',
        hint: 'N',
        icon: <IconPlus className="size-4" />,
        run: () => openNewIdea(),
      },
      { id: 'nav-weekly', label: 'Go to Weekly streams', icon: <IconTv className="size-4" />, run: () => navigate('/') },
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: <IconHome className="size-4" />, run: () => navigate('/dashboard') },
      { id: 'nav-board', label: 'Go to Board', icon: <IconBoard className="size-4" />, run: () => navigate('/board') },
      { id: 'nav-templates', label: 'Go to Templates', icon: <IconList className="size-4" />, run: () => navigate('/templates') },
      { id: 'nav-toolkit', label: 'Go to Toolkit', icon: <IconWrench className="size-4" />, run: () => navigate('/toolkit') },
      { id: 'nav-settings', label: 'Go to Settings', icon: <IconSettings className="size-4" />, run: () => navigate('/settings') },
      {
        id: 'export',
        label: 'Export backup (JSON)',
        icon: <IconDownload className="size-4" />,
        run: () => void exportBackup(),
      },
    ]
    const ideaCommands: Command[] = (ideas ?? []).map((idea) => ({
      id: `idea-${idea.id}`,
      label: idea.title,
      hint: idea.game || undefined,
      icon: <IconPlay className="size-4 text-twitch" />,
      run: () => navigate(`/ideas/${idea.id}`),
    }))

    const q = query.trim().toLowerCase()
    const match = (c: Command) =>
      c.label.toLowerCase().includes(q) || (c.hint ?? '').toLowerCase().includes(q)
    const filteredActions = q ? actions.filter(match) : actions
    const filteredIdeas = (q ? ideaCommands.filter(match) : ideaCommands).slice(0, 8)
    return [...filteredActions, ...filteredIdeas]
  }, [ideas, query, navigate])

  useEffect(() => {
    setSelected((s) => Math.min(s, Math.max(commands.length - 1, 0)))
  }, [commands.length])

  if (!open) return null

  function runCommand(command: Command | undefined) {
    if (!command) return
    onClose()
    command.run()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, commands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runCommand(commands[selected])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="anim-scale-in w-full max-w-lg overflow-hidden rounded-2xl border border-surface-700 bg-surface-900 shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-surface-800 px-4">
          <IconSearch className="size-4 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            onKeyDown={handleKey}
            placeholder="Search ideas or type a command…"
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-zinc-600"
          />
          <kbd className="shrink-0 rounded border border-surface-700 bg-surface-950 px-1.5 py-0.5 text-[10px] text-zinc-500">
            esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {commands.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-zinc-500">No results.</li>
          ) : (
            commands.map((command, index) => (
              <li key={command.id}>
                <button
                  onClick={() => runCommand(command)}
                  onMouseEnter={() => setSelected(index)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    index === selected ? 'bg-surface-800 text-zinc-100' : 'text-zinc-400'
                  }`}
                >
                  <span className="text-zinc-500">{command.icon}</span>
                  <span className="truncate">{command.label}</span>
                  {command.hint && (
                    <span className="ms-auto shrink-0 text-xs text-zinc-600">{command.hint}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex items-center gap-3 border-t border-surface-800 px-4 py-2 text-[10px] text-zinc-600">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}
