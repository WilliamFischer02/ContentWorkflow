import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Captions,
  Circle,
  Clapperboard,
  ExternalLink,
  FolderOpen,
  Gamepad2,
  KanbanSquare,
  Link as LinkIcon,
  Music4,
  PlaySquare,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";

const STORAGE_KEY = "workflow-pipeline-progress-v2";

const workflowIcons = {
  Gamepad2,
  Sparkles,
  Clapperboard,
} as const;

const stageIcons = {
  Search,
  PlaySquare,
  FolderOpen,
  Wand2,
  Captions,
  BarChart3,
  Music4,
  Link: LinkIcon,
  KanbanSquare,
} as const;

type WorkflowIconKey = keyof typeof workflowIcons;
type StageIconKey = keyof typeof stageIcons;

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

type FilmKanbanItem = {
  id: string;
  label: string;
};

type FilmKanbanColumn = {
  id: string;
  title: string;
  items: FilmKanbanItem[];
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
    columns: FilmKanbanColumn[];
  };
  footerCards: {
    id: string;
    title: string;
    text: string;
  }[];
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function WorkflowStageList({
  stages,
  completed,
  onToggle,
}: {
  stages: Stage[];
  completed: Record<string, boolean>;
  onToggle: (stageId: string) => void;
}) {
  return (
    <div className="mt-5 space-y-3">
      {stages.map((stage, index) => {
        const StageIcon = stageIcons[stage.icon] ?? LinkIcon;
        const isDone = !!completed[stage.id];
        const isFirst = index === 0;
        const isLast = index === stages.length - 1;

        return (
          <div
            key={stage.id}
            className="grid grid-cols-[26px_minmax(0,1fr)] items-start gap-4"
          >
            <div className="relative flex min-h-[88px] justify-center">
              {!isFirst && (
                <div className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-white/12" />
              )}
              {!isLast && (
                <div className="absolute left-1/2 top-8 bottom-0 w-px -translate-x-1/2 bg-white/12" />
              )}

              <button
                type="button"
                onClick={() => onToggle(stage.id)}
                aria-label={`Toggle ${stage.title}`}
                className={cn(
                  "relative z-10 mt-2 h-5 w-5 rounded-full border transition",
                  isDone
                    ? "border-white/80 bg-white/80 shadow-[0_0_0_3px_rgba(255,255,255,0.08)]"
                    : "border-white/70 bg-black/70 hover:border-white"
                )}
              />
            </div>

            <a
              href={stage.url}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "group flex min-h-[74px] items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.045] px-5 py-4 transition duration-300 hover:border-white/20 hover:bg-white/[0.07]",
                isDone && "border-white/20 bg-white/[0.08]"
              )}
            >
              <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                <StageIcon className="h-5 w-5 text-white/90" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-[1.02rem] font-semibold text-white">
                    {stage.title}
                  </h4>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-white/45 transition group-hover:text-white/75" />
                </div>

                <p className="mt-1.5 text-sm leading-6 text-white/60">
                  {stage.description}
                </p>
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
}

function WorkflowRow({
  workflow,
  workflowIndex,
  completed,
  onToggleStage,
  isActive,
}: {
  workflow: Workflow;
  workflowIndex: number;
  completed: Record<string, boolean>;
  onToggleStage: (stageId: string) => void;
  isActive: boolean;
}) {
  const WorkflowIcon = workflowIcons[workflow.workflowIcon] ?? Sparkles;
  const alignLeft = workflowIndex % 2 === 0;

  const card = (
    <div
      className={cn(
        "rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl transition-all duration-500",
        workflow.glowClass,
        isActive
          ? "opacity-100 saturate-100 grayscale-0"
          : "opacity-55 saturate-75 grayscale-[0.12]"
      )}
    >
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white shadow-[0_0_24px_rgba(255,255,255,0.06)] bg-gradient-to-r",
          workflow.accentClass
        )}
      >
        <WorkflowIcon className="h-3.5 w-3.5" />
        <span>{workflow.brand}</span>
      </div>

      <p className="mt-4 text-sm text-white/58">{workflow.handle}</p>
      <p className="mt-4 text-[1rem] leading-8 text-white/80">{workflow.summary}</p>

      <WorkflowStageList
        stages={workflow.stages}
        completed={completed}
        onToggle={onToggleStage}
      />
    </div>
  );

  return (
    <section id={`workflow-${workflow.id}`} className="relative">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(340px,560px)_88px_minmax(340px,560px)] md:items-start">
        {alignLeft ? card : <div className="hidden md:block" />}

        <div className="relative hidden md:block">

          <div className="relative flex justify-center pt-8">
            <div
              className={cn(
                "relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/80 shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-500",
                workflow.glowClass,
                isActive
                  ? "opacity-100 saturate-100 grayscale-0 scale-100"
                  : "opacity-65 saturate-75 grayscale-[0.12] scale-[0.96]"
              )}
            >
              <WorkflowIcon className="h-5 w-5 text-white/90" />
            </div>
          </div>
        </div>

        {!alignLeft ? card : <div className="hidden md:block" />}
      </div>
    </section>
  );
}

export default function App() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  const toggleCompleted = (stageId: string) => {
    setCompleted((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setCompleted(JSON.parse(raw));
      }
    } catch {
      // ignore localStorage issues
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // ignore localStorage issues
    }
  }, [completed]);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        const url = `${import.meta.env.BASE_URL}siteContent.json?v=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });

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

    function refreshVisible() {
      if (document.visibilityState === "visible") {
        void loadContent();
      }
    }

    void loadContent();

    const intervalId = window.setInterval(() => {
      void loadContent();
    }, 20000);

    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, []);

  useEffect(() => {
    if (!content?.workflows?.length) return;

    let frameId = 0;

    const computeActiveWorkflow = () => {
      const focusY = window.innerHeight * 0.34;
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
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(computeActiveWorkflow);
    };

    computeActiveWorkflow();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [content]);

  const totals = useMemo(() => {
    const allIds = content?.workflows.flatMap((w) => w.stages.map((s) => s.id)) ?? [];
    const done = allIds.filter((id) => completed[id]).length;
    return { done, total: allIds.length };
  }, [content, completed]);

  const kanbanDone = useMemo(() => {
    if (!content) return 0;
    const allKanbanIds = content.filmKanban.columns.flatMap((column) =>
      column.items.map((item) => `kanban-${item.id}`)
    );
    return allKanbanIds.filter((id) => completed[id]).length;
  }, [content, completed]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="text-2xl font-semibold">ContentWorkflow failed to load</h1>
          <p className="mt-3 text-white/70">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70">Loading ContentWorkflow…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-6 md:px-8">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-6 shadow-[0_0_80px_rgba(255,255,255,0.04)] backdrop-blur-xl">
          <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-start">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[0.64rem] uppercase tracking-[0.25em] text-white/65">
                {content.hero.badge}
              </div>
              <h1 className="mt-4 max-w-[700px] text-4xl font-semibold leading-tight md:text-5xl">
                {content.hero.title}
              </h1>
              <p className="mt-4 max-w-[700px] text-sm leading-7 text-white/65 md:text-base">
                {content.hero.description}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/35 px-5 py-4 text-center">
              <div className="text-[0.62rem] uppercase tracking-[0.25em] text-white/45">
                Stage Progress
              </div>
              <div className="mt-2 text-3xl font-semibold">
                {totals.done} / {totals.total}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCompleted({})}
              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              Reset Checks
            </button>
          </div>
        </header>

        <main className="mt-6 space-y-16">
		  <div className="relative">
			<div className="pointer-events-none absolute left-1/2 top-10 bottom-10 hidden w-px -translate-x-1/2 bg-white/12 shadow-[0_0_18px_rgba(255,255,255,0.04)] md:block" />

			<div className="space-y-16">
			  {content.workflows.map((workflow, workflowIndex) => (
				<WorkflowRow
				  key={workflow.id}
				  workflow={workflow}
				  workflowIndex={workflowIndex}
				  completed={completed}
				  onToggleStage={toggleCompleted}
				  isActive={activeWorkflowId === null || activeWorkflowId === workflow.id}
				/>
			  ))}
			</div>
		  </div>

		  <section
			id="film-kanban"
			className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
		  >
			<div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
			  <div>
				<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[0.64rem] uppercase tracking-[0.25em] text-white/65">
				  <KanbanSquare className="h-3.5 w-3.5" />
				  Film Edit Mini-Kanban
				</div>
				<h2 className="mt-4 text-3xl font-semibold">{content.filmKanban.title}</h2>
				<p className="mt-3 max-w-[760px] text-sm leading-7 text-white/65">
				  {content.filmKanban.description}
				</p>
			  </div>

			  <div className="rounded-3xl border border-white/10 bg-black/35 px-5 py-4 text-center">
				<div className="text-[0.62rem] uppercase tracking-[0.25em] text-white/45">
				  Kanban Progress
				</div>
				<div className="mt-2 text-3xl font-semibold">
				  {kanbanDone} / {content.filmKanban.columns.flatMap((column) => column.items).length}
				</div>
			  </div>
			</div>

			<div className="mt-6 grid gap-4 md:grid-cols-3">
			  {content.filmKanban.columns.map((column) => (
				<div
				  key={column.id}
				  className="rounded-[1.75rem] border border-white/10 bg-black/30 p-4"
				>
				  <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/65">
					{column.title}
				  </h3>

				  <div className="mt-4 space-y-3">
					{column.items.map((item) => {
					  const id = `kanban-${item.id}`;
					  const isDone = !!completed[id];

					  return (
						<button
						  key={item.id}
						  type="button"
						  onClick={() => toggleCompleted(id)}
						  className={cn(
							"flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
							isDone
							  ? "border-emerald-400/30 bg-emerald-400/10"
							  : "border-white/10 bg-white/5 hover:bg-white/10"
						  )}
						>
						  {isDone ? (
							<Circle className="h-4 w-4 fill-white text-white" />
						  ) : (
							<Circle className="h-4 w-4 text-white/70" />
						  )}
						  <span className="text-sm text-white/80">{item.label}</span>
						</button>
					  );
					})}
				  </div>
				</div>
			  ))}
			</div>
		  </section>

		  <section className="grid gap-4 md:grid-cols-3">
			{content.footerCards.map((card) => (
			  <div
				key={card.id}
				className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
			  >
				<h3 className="text-lg font-semibold">{card.title}</h3>
				<p className="mt-3 text-sm leading-7 text-white/65">{card.text}</p>
			  </div>
			))}
		  </section>
		</main>
      </div>
    </div>
  );
}