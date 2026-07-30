import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { createTemplate, deleteTemplate, duplicateTemplate, newStep } from '../db/templates'
import { useToast } from '../lib/toast'
import { useState } from 'react'
import { IconCopy, IconPlus, IconTrash } from '../components/Icons'

export function TemplatesPage() {
  const navigate = useNavigate()
  const toast = useToast()
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
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="anim-fade-up flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checklist templates</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Templates define the pipeline steps new ideas start with. Editing a template never
            changes the checklists of existing ideas.
          </p>
        </div>
        <button onClick={() => void handleCreate()} className="btn-primary shrink-0">
          <IconPlus className="size-4" />
          New template
        </button>
      </div>

      {templates === undefined ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <p className="text-zinc-500">No templates yet.</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((template, index) => (
            <li
              key={template.id}
              className="anim-fade-up card card-hover flex items-center justify-between gap-3 px-4 py-3"
              style={{ '--stagger': index } as React.CSSProperties}
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
                    void duplicateTemplate(template.id).then((id) => {
                      if (id) {
                        toast({ title: 'Template duplicated', kind: 'success' })
                        navigate(`/templates/${id}`)
                      }
                    })
                  }
                  className="btn-ghost"
                >
                  <IconCopy className="size-3.5" />
                  Duplicate
                </button>
                {pendingDelete === template.id ? (
                  <>
                    <button
                      onClick={() => void deleteTemplate(template.id)}
                      className="rounded-lg bg-red-900 px-2.5 py-1.5 font-semibold text-red-200 hover:bg-red-800"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setPendingDelete(null)}
                      className="rounded-lg px-2 py-1.5 text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPendingDelete(template.id)}
                    disabled={templates.length === 1}
                    title={templates.length === 1 ? 'Keep at least one template' : 'Delete template'}
                    className="btn-danger-ghost"
                  >
                    <IconTrash className="size-3.5" />
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
