import type { ComponentType } from "react";

export type WorkflowIconKey = "gaming" | "motion" | "film";
export type StageIconKey =
  | "search"
  | "play"
  | "folder"
  | "wand"
  | "captions"
  | "chart"
  | "music"
  | "link"
  | "kanban";

export type WorkflowStatus = "idle" | "active" | "complete";

export type Stage = {
  id: string;
  label: string;
  note: string;
  href: string;
  icon: StageIconKey;
  deliverable: string;
};

export type QuickLink = {
  label: string;
  href: string;
};

export type Workflow = {
  id: string;
  brand: string;
  handle: string;
  summary: string;
  icon: WorkflowIconKey;
  accent: string;
  glow: string;
  cadence: string;
  output: string;
  objective: string;
  quickLinks: QuickLink[];
  stages: Stage[];
};

export type FilmKanbanItem = {
  id: string;
  label: string;
};

export type FilmKanbanColumn = {
  id: string;
  title: string;
  itemIds: string[];
};

export type SiteContent = {
  workflows: Workflow[];
  filmKanbanItems: FilmKanbanItem[];
  filmKanbanColumns: FilmKanbanColumn[];
  operatingPrinciples: Array<{ title: string; text: string }>;
  footerTips: Array<{ title: string; text: string }>;
};

export type CompletedState = Record<string, number | false>;

export type IconComponent = ComponentType<{ className?: string }>;
