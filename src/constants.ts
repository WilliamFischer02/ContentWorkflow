import {
  BarChart3,
  Captions,
  FolderOpen,
  Gamepad2,
  KanbanSquare,
  Link as LinkIcon,
  Music4,
  PlaySquare,
  Search,
  Sparkles,
  Wand2,
  Clapperboard,
} from "lucide-react";
import type { IconComponent, StageIconKey, WorkflowIconKey } from "./types";

export const STORAGE_KEY = "workflow-pipeline-progress-v1";
export const SPLIT_PANE_STORAGE_KEY = "split-pane-v1";

export const workflowIcons: Record<WorkflowIconKey, IconComponent> = {
  gaming: Gamepad2,
  motion: Sparkles,
  film: Clapperboard,
};

export const workflowAccentBorder: Record<WorkflowIconKey, string> = {
  gaming: "border-l-violet-500",
  motion: "border-l-cyan-400",
  film: "border-l-amber-400",
};

export const workflowAccentFill: Record<WorkflowIconKey, string> = {
  gaming: "bg-violet-500",
  motion: "bg-cyan-400",
  film: "bg-amber-400",
};

export const stageIcons: Record<StageIconKey, IconComponent> = {
  search: Search,
  play: PlaySquare,
  folder: FolderOpen,
  wand: Wand2,
  captions: Captions,
  chart: BarChart3,
  music: Music4,
  link: LinkIcon,
  kanban: KanbanSquare,
};

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
