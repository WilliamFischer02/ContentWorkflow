import React, { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  Gamepad2,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
  ChevronDown,
  KanbanSquare,
  Music4,
  Search,
  Wand2,
  Captions,
  BarChart3,
  PlaySquare,
  FolderOpen,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";

type Stage = {
  id: string;
  label: string;
  note: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type Workflow = {
  id: string;
  brand: string;
  handle: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  glow: string;
  stages: Stage[];
};

const STORAGE_KEY = "workflow-pipeline-progress-v1";

const workflows: Workflow[] = [
  {
    id: "gaming",
    brand: "Bingus The Wizard",
    handle: "@BingusTheWizard / @bingusthewizard.official",
    summary:
      "Capture stream moments, shape them into vertical clips, then ship them across Shorts, Reels, and TikTok.",
    icon: Gamepad2,
    accent: "from-violet-500/90 to-fuchsia-500/90",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.20)]",
    stages: [
      {
        id: "gaming-01",
        label: "Trend / Game Priority",
        note: "Open your game shortlist, trend notes, and clip-worthy formats.",
        href: "#replace-with-gaming-trend-doc",
        icon: Search,
      },
      {
        id: "gaming-02",
        label: "Stream / Record Session",
        note: "Launch your stream setup, overlays, and recording checklist.",
        href: "#replace-with-stream-setup",
        icon: PlaySquare,
      },
      {
        id: "gaming-03",
        label: "Review Raw Moments",
        note: "Open rough highlights, timestamps, and shortlist candidate clips.",
        href: "#replace-with-gaming-clip-bank",
        icon: FolderOpen,
      },
      {
        id: "gaming-04",
        label: "Vertical Clip Edit",
        note: "Jump into your editing workspace for captions, crops, and pacing.",
        href: "#replace-with-gaming-edit-project",
        icon: Wand2,
      },
      {
        id: "gaming-05",
        label: "Caption + Metadata",
        note: "Hook line, title, keywords, platform copy, and tags.",
        href: "#replace-with-gaming-copy-doc",
        icon: Captions,
      },
      {
        id: "gaming-06",
        label: "Publish + Analytics",
        note: "Upload, schedule, and review retention / CTR / saves / shares.",
        href: "#replace-with-gaming-analytics-board",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "motion",
    brand: "GOOB VISION",
    handle: "@goobvision.scott / @goobvision-scott",
    summary:
      "Turn prior artwork and motion pieces into loops, process clips, breakdowns, and polished short-form posts.",
    icon: Sparkles,
    accent: "from-cyan-400/90 to-sky-500/90",
    glow: "shadow-[0_0_40px_rgba(56,189,248,0.18)]",
    stages: [
      {
        id: "motion-01",
        label: "Asset Pick / Theme",
        note: "Choose the artwork, motion loop, or breakdown concept to feature.",
        href: "#replace-with-goobvision-asset-bank",
        icon: FolderOpen,
      },
      {
        id: "motion-02",
        label: "Hook / Framing",
        note: "Decide whether the post is a reveal, process, loop, or before/after.",
        href: "#replace-with-goobvision-hooks",
        icon: Search,
      },
      {
        id: "motion-03",
        label: "Assemble / Animate",
        note: "Open the project file and move into build or cleanup mode.",
        href: "#replace-with-goobvision-projects",
        icon: Wand2,
      },
      {
        id: "motion-04",
        label: "Sound / Sync",
        note: "Pair with approved audio, timing beats, or ambient design.",
        href: "#replace-with-goobvision-audio",
        icon: Music4,
      },
      {
        id: "motion-05",
        label: "Export Variants",
        note: "Create TikTok / Reels / Shorts versions with correct sizing and burn-ins.",
        href: "#replace-with-goobvision-exports",
        icon: LinkIcon,
      },
      {
        id: "motion-06",
        label: "Post + Review",
        note: "Publish and compare saves, watch time, comments, and follows.",
        href: "#replace-with-goobvision-analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "film",
    brand: "GOOB Entertainment Co.",
    handle: "@goobentertainmentco / @goobentertainmentco.official",
    summary:
      "Build cinematic or anime edits from idea to final post, with a dedicated progress lane for clip-by-clip edit status.",
    icon: Clapperboard,
    accent: "from-amber-400/90 to-orange-500/90",
    glow: "shadow-[0_0_40px_rgba(251,146,60,0.18)]",
    stages: [
      {
        id: "film-01",
        label: "Generate Clip Search Queries",
        note: "Open your prompt bank for search phrases, moods, and source targets.",
        href: "#replace-with-film-query-doc",
        icon: Search,
      },
      {
        id: "film-02",
        label: "Source Intake",
        note: "Pull in locally owned, licensed, or otherwise authorized footage assets.",
        href: "#replace-with-film-source-folder",
        icon: FolderOpen,
      },
      {
        id: "film-03",
        label: "Audio Selection",
        note: "Choose approved music / audio that you are licensed to use.",
        href: "#replace-with-film-audio-bank",
        icon: Music4,
      },
      {
        id: "film-04",
        label: "Main Edit Project",
        note: "Open your edit timeline and asset bin for the current short.",
        href: "#replace-with-film-edit-project",
        icon: Wand2,
      },
      {
        id: "film-05",
        label: "Kanban / Clip Progress",
        note: "Track Clip01 Edited, Clip02 Edited, export status, and ready-to-post state.",
        href: "#film-kanban",
        icon: KanbanSquare,
      },
      {
        id: "film-06",
        label: "Caption + Publish",
        note: "Finalize copy, export, and platform uploads.",
        href: "#replace-with-film-publishing-board",
        icon: Captions,
      },
    ],
  },
];

const filmKanban = [
  "Clip01 Edited",
  "Clip02 Edited",
  "Clip03 Edited",
  "Clip04 Edited",
  "Hook / Intro Built",
  "Audio Synced",
  "Captions Added",
  "Exported 9:16",
  "Uploaded / Scheduled",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {
      // ignore localStorage weirdness
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // ignore
    }
  }, [completed]);

  const totals = useMemo(() => {
    const allIds = workflows.flatMap((w) => w.stages.map((s) => s.id));
    const done = allIds.filter((id) => completed[id]).length;
    return { done, total: allIds.length };
  }, [completed]);

  const kanbanDone = filmKanban.filter((item) => completed[`kanban-${item}`]).length;

  function toggle(id: string) {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetAll() {
    setCompleted({});
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_20%,transparent_80%,rgba(255,255,255,0.03))]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-neutral-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Content Pipeline Dashboard
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Your workflows, disguised as a literal descending pipe.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
                Each valve-button opens a phase in your process. Replace the placeholder links
                with Notion pages, Trello boards, docs, folders, edit projects, or posting
                checklists.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                  Stage Progress
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {totals.done} / {totals.total}
                </div>
              </div>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:bg-white/10"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset Checks
              </button>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 p-4 sm:p-6">
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-6 -translate-x-1/2 rounded-full bg-gradient-to-b from-white/15 via-white/5 to-white/15 md:block" />
          <div className="pointer-events-none absolute left-1/2 top-6 hidden h-20 w-20 -translate-x-1/2 rounded-full border border-white/15 bg-neutral-900 md:grid place-items-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-b from-neutral-200/25 to-neutral-500/10" />
          </div>

          <div className="pt-10 md:pt-24">
            {workflows.map((workflow, index) => {
              const Icon = workflow.icon;
              const alignLeft = index % 2 === 0;

              return (
                <div key={workflow.id} className="relative mb-12 last:mb-0">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_80px_1fr] md:items-start">
                    <div
                      className={cn(
                        "order-2 md:order-none",
                        alignLeft ? "md:col-start-1" : "md:col-start-3",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl",
                          workflow.glow,
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white",
                                workflow.accent,
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {workflow.brand}
                            </div>
                            <div className="mt-3 text-sm text-neutral-400">{workflow.handle}</div>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-300">
                              {workflow.summary}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          {workflow.stages.map((stage, stageIndex) => {
                            const StageIcon = stage.icon ?? LinkIcon;
                            const isDone = !!completed[stage.id];

                            return (
                              <div key={stage.id} className="relative">
                                {stageIndex < workflow.stages.length - 1 && (
                                  <div className="absolute left-6 top-14 h-10 w-px bg-white/10" />
                                )}
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => toggle(stage.id)}
                                    className="mt-1 rounded-full text-neutral-300 transition hover:text-white"
                                    aria-label={`Toggle ${stage.label}`}
                                    title={`Toggle ${stage.label}`}
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                    ) : (
                                      <Circle className="h-6 w-6" />
                                    )}
                                  </button>

                                  <a
                                    href={stage.href}
                                    className={cn(
                                      "group flex-1 rounded-2xl border px-4 py-4 transition",
                                      isDone
                                        ? "border-emerald-400/30 bg-emerald-400/10"
                                        : "border-white/10 bg-white/5 hover:bg-white/10",
                                    )}
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex gap-3">
                                        <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                                          <StageIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-semibold text-white">
                                            {stage.label}
                                          </div>
                                          <div className="mt-1 text-sm leading-5 text-neutral-300">
                                            {stage.note}
                                          </div>
                                        </div>
                                      </div>
                                      <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400 transition group-hover:text-white" />
                                    </div>
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="relative hidden md:flex md:justify-center">
                      <div className="absolute top-6 h-full w-px bg-white/15" />
                      <div
                        className={cn(
                          "relative z-10 mt-8 grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-gradient-to-b from-neutral-100/10 to-neutral-700/10",
                          workflow.glow,
                        )}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    <div
                      className={cn(
                        "hidden md:block",
                        alignLeft ? "md:col-start-3" : "md:col-start-1",
                      )}
                    >
                      <div className="h-full rounded-[2rem] border border-dashed border-white/8 bg-white/[0.02]" />
                    </div>
                  </div>

                  {index < workflows.length - 1 && (
                    <div className="mt-6 flex justify-center text-neutral-500">
                      <ChevronDown className="h-6 w-6 animate-bounce" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="film-kanban"
          className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-neutral-300">
                <KanbanSquare className="h-4 w-4" />
                Film Edit Mini-Kanban
              </div>
              <h2 className="mt-3 text-2xl font-semibold">
                GOOB Entertainment clip progress board
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
                This stores your checkbox state in local storage so the browser remembers
                progress.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                Kanban Progress
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {kanbanDone} / {filmKanban.length}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { title: "To Do", items: filmKanban.slice(0, 3) },
              { title: "In Progress", items: filmKanban.slice(3, 6) },
              { title: "Done / Ready", items: filmKanban.slice(6) },
            ].map((column) => (
              <div
                key={column.title}
                className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-300">
                  {column.title}
                </div>
                <div className="space-y-3">
                  {column.items.map((item) => {
                    const id = `kanban-${item}`;
                    const isDone = !!completed[id];
                    return (
                      <button
                        key={item}
                        onClick={() => toggle(id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                          isDone
                            ? "border-emerald-400/30 bg-emerald-400/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10",
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                        ) : (
                          <Circle className="h-5 w-5 shrink-0 text-neutral-400" />
                        )}
                        <span className="text-sm text-neutral-100">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Replace the placeholder links",
              text: "Swap every #replace-with... href with the real URL for your Notion pages, Trello boards, folders, docs, or published tools.",
            },
            {
              title: "Keep it compliant",
              text: "Use footage, music, and assets you have rights to use so the dashboard stays useful instead of becoming a copyright mousetrap.",
            },
            {
              title: "Deploy path",
              text: "This project is configured for GitHub Pages through GitHub Actions.",
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="text-lg font-semibold">{tip.title}</div>
              <p className="mt-2 text-sm leading-6 text-neutral-300">{tip.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}