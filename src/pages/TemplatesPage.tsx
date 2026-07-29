import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { createTemplate, deleteTemplate, duplicateTemplate, newStep } from '../db/templates'
import { useState } from 'react'

export function TemplatesPage() {
  const navigate = useNavigate()
  const templates = useLiveQuery(() => db.checklistTemplates.orderBy('name').toArray(), [])
  const ideas = useLiveQuery(() => db.ideas.toArray(), [])
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  async function handleCreate() {
    const id = await createTemplate('New template', [newStep(0)])
    navigate(`/templates/${id}`)
  }

  function usageCount(templateId: string): number {
    return (ideas ?? []).filter((idea) => idea.templateId === templateId).length
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checklist templates</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Templates define the pipeline steps new ideas start with. Editing a template never
            changes the checklists of existing ideas.
          </p>
        </div>
        <button
          onClick={() => void handleCreate()}
          className="shrink-0 rounded-md bg-twitch-dark px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-twitch"
        >
          + New template
        </button>
      </div>

      {templates === undefined ? (
        <p className="text-zinc-500">Loading…</p>
      ) : templates.length === 0 ? (
        <p className="text-zinc-500">No templates yet.</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((template) => (
            <li
              key={template.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <Link to={`/templates/${template.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium hover:text-twitch">{template.name}</p>
                <p className="text-xs text-zinc-500">
                  {template.steps.length} steps · used by {usageCount(template.id)}{' '}
                  {usageCount(template.id) === 1 ? 'idea' : 'ideas'}
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-2 text-xs">
                <button
                  onClick={() =>
                    void duplicateTemplate(template.id).then((id) => id && navigate(`/templates/${id}`))
                  }
                  className="rounded-md border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-twitch hover:text-twitch"
                >
                  Duplicate
                </button>
                {pendingDelete === template.id ? (
                  <>
                    <button
                      onClick={() => void deleteTemplate(template.id)}
                      className="rounded-md bg-red-900 px-2.5 py-1 font-semibold text-red-200 hover:bg-red-800"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setPendingDelete(null)}
                      className="rounded-md px-2 py-1 text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPendingDelete(template.id)}
                    disabled={templates.length === 1}
                    title={templates.length === 1 ? 'Keep at least one template' : 'Delete template'}
                    className="rounded-md border border-zinc-800 px-2.5 py-1 text-zinc-500 hover:border-red-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
