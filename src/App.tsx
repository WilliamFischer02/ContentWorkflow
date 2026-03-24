import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Captions,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clapperboard,
  ExternalLink,
  FolderOpen,
  Gamepad2,
  KanbanSquare,
  Link as LinkIcon,
  Music4,
  PlaySquare,
  RefreshCcw,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";

type WorkflowIconKey = "Gamepad2" | "Sparkles" | "Clapperboard";
type StageIconKey =
  | "Search"
  | "PlaySquare"
  | "FolderOpen"
  | "Wand2"
  | "Captions"
  | "BarChart3"
  | "Music4"
  | "Link"
  | "KanbanSquare";

type Stage = {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: StageIconKey;
};

type Workflow = {
  id: string;
  brand: string;
  chapterLabel: string;
  handle: string;
  summary: string;
  workflowIcon: WorkflowIconKey;
  accentClass: string;
  glowClass: string;
  stages: Stage[];
};

type KanbanItem = {
  id: string;
  label: string;
};

type KanbanColumn = {
  id: string;
  title: string;
  items: KanbanItem[];
};

type SiteContent = {
  hero: {
    badge: string;
    title: string;
    description: string;
  };
  workflows: Workflow[];
  filmKanban: {
    title: string;
    description: string;
    columns: KanbanColumn[];
  };
  footerCards: Array<{
    id: string;
    title: string;
    text: string;
  }>;
};

const STORAGE_KEY = "contentworkflow-progress-v4";

const workflowIcons: Record<WorkflowIconKey, React.ComponentType<{ className?: string }>> = {
  Gamepad2,
  Sparkles,
  Clapperboard,
};

const stageIcons: Record<StageIconKey, React.ComponentType<{ className?: string }>> = {
  Search,
  PlaySquare,
  FolderOpen,
  Wand2,
  Captions,
  BarChart3,
  Music4,
  Link: LinkIcon,
  KanbanSquare,
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function App() {
const [content, setContent] = useState<SiteContent | null>(null);
const [loadError, setLoadError] = useState<string | null>(null);
const [completed, setCompleted] = useState<Record<string, boolean>>({});
const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

useEffect(() => {
  let isMounted = true;

  async function loadContent() {
    try {
      const cacheBustUrl = `${import.meta.env.BASE_URL}siteContent.json?v=${Date.now()}`;

      const res = await fetch(cacheBustUrl, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to load site content (${res.status})`);
      }

      const data = (await res.json()) as SiteContent;

      if (isMounted) {
        setContent(data);
        setLoadError(null);
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err instanceof Error ? err.message : "Unknown load error");
      }
    }
  }

  function handleVisibilityOrFocus() {
    if (document.visibilityState === "visible") {
      void loadContent();
    }
  }

  void loadContent();

  const intervalId = window.setInterval(() => {
    void loadContent();
  }, 20000);

  window.addEventListener("focus", handleVisibilityOrFocus);
  document.addEventListener("visibilitychange", handleVisibilityOrFocus);

  return () => {
    isMounted = false;
    window.clearInterval(intervalId);
    window.removeEventListener("focus", handleVisibilityOrFocus);
    document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
  };
}, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setCompleted(JSON.parse(raw) as Record<string, boolean>);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);
  
  useEffect(() => {
  if (!content?.workflows?.length) return;

  let frameId = 0;

  const computeActiveWorkflow = () => {
    const focusY = window.innerHeight * 0.38;
    let bestId = content.workflows[0]?.id ?? null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const workflow of content.workflows) {
      const el = document.getElementById(`workflow-${workflow.id}`);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(centerY - focusY);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestId = workflow.id;
      }
    }

    setActiveWorkflowId((prev) => (prev === bestId ? prev : bestId));
  };

  const onScrollOrResize = () => {
    window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(computeActiveWorkflow);
  };

  computeActiveWorkflow();

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  return () => {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("scroll", onScrollOrResize);
    window.removeEventListener("resize", onScrollOrResize);
  };
}, [content]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // Ignore storage write errors
    }
  }, [completed]);

  const stageProgress = useMemo(() => {
    if (!content) return { done: 0, total: 0 };

    const ids = content.workflows.flatMap((workflow) =>
      workflow.stages.map((stage) => stage.id),
    );

    return {
      done: ids.filter((id) => completed[id]).length,
      total: ids.length,
    };
  }, [content, completed]);

  const kanbanProgress = useMemo(() => {
    if (!content) return { done: 0, total: 0 };

    const kanbanIds = content.filmKanban.columns.flatMap((column) =>
      column.items.map((item) => `kanban-${item.id}`),
    );

    return {
      done: kanbanIds.filter((id) => completed[id]).length,
      total: kanbanIds.length,
    };
  }, [content, completed]);

  function toggleItem(id: string) {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetAll() {
    setCompleted({});
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-red-300">Load Error</div>
          <h1 className="mt-3 text-2xl font-semibold">The dashboard content failed to load.</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-300">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-sm uppercase tracking-[0.2em] text-neutral-400">
            Loading Dashboard
          </div>
          <h1 className="mt-3 text-2xl font-semibold">Preparing workflow interface…</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_20%,transparent_80%,rgba(255,255,255,0.03))]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />

      <nav className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 2xl:block">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/55 p-3 shadow-2xl backdrop-blur-xl">
          <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
            Chapters
          </div>

          <div className="mt-3 space-y-2">
            {content.workflows.map((workflow) => (
              <a
                key={workflow.id}
                href={`#workflow-${workflow.id}`}
                className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-200 transition hover:bg-white/10"
              >
                {workflow.chapterLabel}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-[1520px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-neutral-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {content.hero.badge}
              </div>

              <h1 className="text-3xl font-semibold leading-[0.95] tracking-tight sm:text-5xl">
                {content.hero.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
                {content.hero.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                  Stage Progress
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {stageProgress.done} / {stageProgress.total}
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
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-4 -translate-x-1/2 rounded-full bg-gradient-to-b from-white/12 via-white/4 to-white/12 opacity-80 md:block" />
          <div className="pointer-events-none absolute left-1/2 top-6 hidden h-16 w-16 -translate-x-1/2 rounded-full border border-white/10 bg-neutral-900 md:grid place-items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-b from-neutral-200/20 to-neutral-500/10" />
          </div>

          <div className="space-y-16 pt-10 md:pt-24">
            {content.workflows.map((workflow, workflowIndex) => {
              const WorkflowIcon = workflowIcons[workflow.workflowIcon];
			  const alignLeft = workflowIndex % 2 === 0;
			  const isActive = activeWorkflowId === null || activeWorkflowId === workflow.id;

              return (
                <div
                  key={workflow.id}
                  id={`workflow-${workflow.id}`}
                  className="scroll-mt-28"
                >
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(320px,540px)_96px_minmax(320px,540px)] md:items-start md:justify-between">
                    <div
                      className={cn(
                        alignLeft ? "md:col-start-1" : "md:col-start-3",
                      )}
                    >
                      <div
						  className={cn(
							"rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition duration-500",
							workflow.glowClass,
							isActive ? "opacity-100 saturate-100 grayscale-0" : "opacity-72 saturate-80 grayscale-[0.08]",
						  )}
						>
                        <div>
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white",
                              workflow.accentClass,
                            )}
                          >
                            <WorkflowIcon className="h-4 w-4" />
                            {workflow.brand}
                          </div>

                          <div className="mt-3 text-sm text-neutral-400">{workflow.handle}</div>

                          <p className="mt-3 max-w-xl text-[13px] leading-6 text-neutral-300/90">
                            {workflow.summary}
                          </p>
                        </div>

                        <div className="mt-6 space-y-3">
                          {workflow.stages.map((stage, stageIndex) => {
                            const StageIcon = stageIcons[stage.icon];
                            const isDone = !!completed[stage.id];
                            const isLast = stageIndex === workflow.stages.length - 1;

                            return (
                              <div
                                key={stage.id}
                                className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-4"
                              >
                                <div className="relative flex min-h-[88px] justify-center pt-1">
                                  {!isLast && (
                                    <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/14" />
                                  )}

                                  <button
                                    onClick={() => toggleItem(stage.id)}
                                    className="relative z-10 rounded-full bg-neutral-950 text-neutral-300 transition hover:text-white"
                                    aria-label={`Toggle ${stage.title}`}
                                    title={`Toggle ${stage.title}`}
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                    ) : (
                                      <Circle className="h-6 w-6" />
                                    )}
                                  </button>
                                </div>

                                <a
                                  href={stage.url}
                                  className={cn(
                                    "group rounded-2xl border px-4 py-4 transition",
                                    isDone
                                      ? "border-emerald-400/30 bg-emerald-400/10"
                                      : "border-white/10 bg-white/5 hover:bg-white/10",
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/25">
                                      <StageIcon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="text-[14px] font-semibold leading-5 text-white">
                                          {stage.title}
                                        </div>
                                        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 transition group-hover:text-white" />
                                      </div>

                                      <div className="mt-1 text-[12px] leading-5 text-neutral-400">
                                        {stage.description}
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                      <div className="relative hidden min-h-0 md:flex md:self-start md:justify-center">
                      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/12" />
                      <div
						  className={cn(
							"relative z-10 mt-8 grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-gradient-to-b from-neutral-100/10 to-neutral-700/10 transition duration-500",
							workflow.glowClass,
							isActive ? "opacity-100 saturate-100 grayscale-0" : "opacity-70 saturate-80 grayscale-[0.08]",
						  )}
						>
						
                        <WorkflowIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div
                      className={cn(
                        "hidden md:block",
                        alignLeft ? "md:col-start-3" : "md:col-start-1",
                      )}
                    />
                  </div>

                  {workflowIndex < content.workflows.length - 1 && (
                    <div className="mt-5 hidden justify-center md:flex text-neutral-500">
                      <ChevronDown className="h-5 w-5 animate-bounce" />
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

              <h2 className="mt-3 text-2xl font-semibold">{content.filmKanban.title}</h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
                {content.filmKanban.description}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                Kanban Progress
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {kanbanProgress.done} / {kanbanProgress.total}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {content.filmKanban.columns.map((column) => (
              <div
                key={column.id}
                className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-300">
                  {column.title}
                </div>

                <div className="space-y-3">
                  {column.items.map((item) => {
                    const checkboxId = `kanban-${item.id}`;
                    const isDone = !!completed[checkboxId];

                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(checkboxId)}
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

                        <span className="text-sm text-neutral-100">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {content.footerCards.map((card) => (
            <div
              key={card.id}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="text-lg font-semibold">{card.title}</div>
              <p className="mt-2 text-sm leading-6 text-neutral-300">{card.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}