export type IdeaStatus = 'backlog' | 'active' | 'done'

export type StepType = 'task' | 'deep-link' | 'link-input'

export type Priority = 'none' | 'low' | 'medium' | 'high'

/** A user-pasted labeled URL stored inside a link-input checklist item. */
export interface LinkEntry {
  id: string
  label: string
  url: string
}

/** One ordered step inside a checklist template. */
export interface TemplateStep {
  id: string
  order: number
  label: string
  type: StepType
  /** Hardcoded URL for 'deep-link' steps (e.g. the YouTube upload page). */
  deepLinkUrl?: string
}

export interface ChecklistTemplate {
  id: string
  name: string
  steps: TemplateStep[]
  createdAt: number
  updatedAt: number
}

/** A stream idea/project. Instantiates a checklist from a template on creation. */
export interface Idea {
  id: string
  title: string
  game: string
  status: IdeaStatus
  priority: Priority
  /** Optional planned stream/publish date (ms epoch, local noon). */
  dueDate?: number
  tags: string[]
  notes: string
  templateId: string
  createdAt: number
  updatedAt: number
}

/**
 * A per-Idea copy of a template step, carrying its own progress.
 * Because items are copies, editing a template never touches the
 * saved progress of existing Ideas.
 */
export interface ChecklistItem {
  id: string
  ideaId: string
  templateStepId: string
  order: number
  label: string
  type: StepType
  deepLinkUrl?: string
  done: boolean
  links: LinkEntry[]
  /** Free-form working note attached to this step. */
  note: string
}

export type LinkColor = 'red' | 'cyan' | 'pink' | 'purple' | 'emerald' | 'amber' | 'zinc'

/** A configurable quick-launch link shown in the top bar. */
export interface QuickLink {
  id: string
  label: string
  url: string
  color: LinkColor
  note?: string
}

/** Singleton app settings row (id is always 'app'). */
export interface AppSettings {
  id: string
  channelName: string
  quickLinks: QuickLink[]
}

export const IDEA_STATUSES: IdeaStatus[] = ['backlog', 'active', 'done']

export const STATUS_LABELS: Record<IdeaStatus, string> = {
  backlog: 'Backlog',
  active: 'In progress',
  done: 'Done',
}

export const PRIORITIES: Priority[] = ['none', 'low', 'medium', 'high']

export const PRIORITY_RANK: Record<Priority, number> = { high: 3, medium: 2, low: 1, none: 0 }

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  task: 'Task',
  'deep-link': 'Deep link',
  'link-input': 'Link input',
}
