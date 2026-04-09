import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Circle,
  KanbanSquare,
  RefreshCcw,
  Search,
  Target,
  TimerReset,
} from "lucide-react";
import { STORAGE_KEY, cn, workflowIcons } from "./constants";
import WorkflowCard from "./components/pipeline/WorkflowCard";
import ConfirmModal from "./components/shared/ConfirmModal";
import { useContentLoader } from "./hooks/useContentLoader";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useScrollActiveId } from "./hooks/useScrollActiveId";
import type { CompletedState } from "./types";

function getWorkflowProgress(stageIds: string[], completed: CompletedState) {
  const done = stageIds.filter((id) => typeof completed[id] === "number").length;
  const total = stageIds.length;
  return {
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
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
  status,
}: {
  workflow: Workflow;
  workflowIndex: number;
  completed: Record<string, boolean>;
  onToggleStage: (stageId: string) => void;
  isActive: boolean;
  status: WorkflowStatus;
}) {
  const WorkflowIcon = workflowIcons[workflow.workflowIcon] ?? Sparkles;
  const alignLeft = workflowIndex % 2 === 0;
  const statusTintClass =
	 status === "complete"
	  ? "border-emerald-500/20 bg-emerald-950/28 shadow-[0_0_55px_rgba(16,185,129,0.10)]"
	  : status === "partial"
	  ? "border-amber-400/18 bg-amber-950/22 shadow-[0_0_48px_rgba(245,158,11,0.08)]"
	  : "border-rose-500/16 bg-rose-950/18 shadow-[0_0_38px_rgba(244,63,94,0.07)]";

  const card = (
    <div
	  className={cn(
		"group rounded-[2rem] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-white/18",
		statusTintClass,
		workflow.glowClass,
		isActive
		  ? "opacity-100 saturate-100 grayscale-0"
		  : "opacity-62 saturate-80 grayscale-[0.10]"
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
  const { content, error } = useContentLoader();
  const [completed, setCompleted] = useLocalStorage<CompletedState>(STORAGE_KEY, {});
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const workflowIds = useMemo(
    () => (content ? content.workflows.map((workflow) => `workflow-${workflow.id}`) : []),
    [content],
  );
  const activeWorkflowElementId = useScrollActiveId(workflowIds);

  useEffect(() => {
    if (!content || content.workflows.length === 0) return;
    if (!selectedWorkflowId) {
      setSelectedWorkflowId(content.workflows[0].id);
    }
  }, [content, selectedWorkflowId]);

  useEffect(() => {
    if (!activeWorkflowElementId || query.trim() || !content) return;
    const derivedId = activeWorkflowElementId.replace("workflow-", "");
    const exists = content.workflows.some((workflow) => workflow.id === derivedId);
    if (exists) {
      setSelectedWorkflowId(derivedId);
    }
  }, [activeWorkflowElementId, content, query]);

  const selectedWorkflow = useMemo(() => {
    if (!content) return null;
    return content.workflows.find((workflow) => workflow.id === selectedWorkflowId) ?? content.workflows[0];
  }, [content, selectedWorkflowId]);

  const filteredStages = useMemo(() => {
    if (!selectedWorkflow) return [];

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return selectedWorkflow.stages;

    return selectedWorkflow.stages.filter((stage) => {
      const haystack = `${stage.label} ${stage.note} ${stage.deliverable}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, selectedWorkflow]);

  const allStageIds = useMemo(
    () => (content ? content.workflows.flatMap((workflow) => workflow.stages.map((stage) => stage.id)) : []),
    [content],
  );

  const totals = useMemo(() => getWorkflowProgress(allStageIds, completed), [allStageIds, completed]);

  const kanbanDone = useMemo(() => {
    if (!content) return 0;
    return content.filmKanbanItems.filter((item) => typeof completed[`kanban-${item.id}`] === "number").length;
  }, [completed, content]);

  if (!content) {
    return (
      <div className="min-h-screen bg-[#050816] px-4 py-10 text-neutral-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-black/40 p-6">
          <h1 className="text-xl font-semibold">Loading content workflow dashboard...</h1>
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    );
  }

  const stageCards = [
    {
      label: "Total completion",
      value: `${totals.done} / ${totals.total}`,
      hint: `${totals.percent}% of tracked stages completed`,
      icon: Target,
    },
    {
      label: "Focused workflow",
      value: selectedWorkflow?.brand ?? "None",
      hint: selectedWorkflow
        ? `${getWorkflowProgress(selectedWorkflow.stages.map((stage) => stage.id), completed).done} of ${selectedWorkflow.stages.length} stages marked complete`
        : "No workflow selected",
      icon: ArrowRight,
    },
    {
      label: "Film kanban",
      value: `${kanbanDone} / ${content.filmKanbanItems.length}`,
      hint: "Clip-level progress for the long-form edit lane",
      icon: KanbanSquare,
    },
  ];

  const workflowProgress = content.workflows.map((workflow) => ({
    workflow,
    progress: getWorkflowProgress(
      workflow.stages.map((stage) => stage.id),
      completed,
    ),
  }));

  function toggle(id: string) {
    setCompleted((prev) => ({
      ...prev,
      [id]: typeof prev[id] === "number" ? false : Date.now(),
    }));
  }

  function resetAll() {
    setCompleted({});
    setShowResetConfirm(false);
  }

  return (
    <div className="min-h-screen bg-[#050816] text-neutral-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_25%),linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_18%,transparent_80%,rgba(255,255,255,0.04))]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Workflow Control Room
              </div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
                A cleaner operating dashboard for planning, editing, and shipping every content lane.
              </h1>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {stageCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">{card.label}</div>
                        <Icon className="h-4 w-4 text-neutral-300" />
                      </div>
                      <div className="mt-3 text-xl font-semibold text-white">{card.value}</div>
                      <div className="mt-2 text-sm leading-6 text-neutral-400">{card.hint}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-neutral-400">Workflow search</div>
                  <div className="mt-2 text-lg font-semibold">Find the next stage faster</div>
                </div>
                <Search className="h-5 w-5 text-neutral-400" />
              </div>

              <label className="mt-5 block">
                <span className="sr-only">Search stages</span>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the focused workflow by task, note, or deliverable"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-cyan-400/50 focus:bg-white/8"
                />
              </label>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => setQuery("")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-100 transition hover:bg-white/10"
                >
                  <TimerReset className="h-4 w-4" />
                  Clear search
                </button>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-100 transition hover:bg-white/10"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset checks
                </button>
              </div>
            </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {workflowProgress.map(({ workflow, progress }) => {
            const Icon = workflowIcons[workflow.icon];
            const isSelected = workflow.id === selectedWorkflow?.id;
            return (
              <button
                key={workflow.id}
                onClick={() => setSelectedWorkflowId(workflow.id)}
                className={cn(
                  "rounded-[1.75rem] border p-5 text-left transition",
                  isSelected
                    ? "border-white/20 bg-white/10 shadow-[0_10px_40px_rgba(15,23,42,0.35)]"
                    : "border-white/10 bg-white/5 hover:bg-white/8",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
                    <Icon className="h-4 w-4" />
                    {workflow.brand}
                  </div>
                  <div className="text-sm text-neutral-300">{progress.done}/{progress.total}</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-300">{workflow.summary}</p>
              </button>
            );
          })}
        </section>

        {selectedWorkflow && (() => {
          const SelectedWorkflowIcon = workflowIcons[selectedWorkflow.icon];

          return (
          <section className="mt-8 relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 p-4 sm:p-6">
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-6 -translate-x-1/2 rounded-full bg-gradient-to-b from-white/15 via-white/5 to-white/15 md:block" />

            <div className="mb-8 flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-300">
                  <ArrowRight className="h-4 w-4" />
                  Active workflow map
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-white">{selectedWorkflow.brand}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">{selectedWorkflow.objective}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">Visible stages</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {filteredStages.length} / {selectedWorkflow.stages.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_80px_1fr] md:items-start">
              <div className="order-2 md:col-start-1">
                <WorkflowCard
                  workflow={selectedWorkflow}
                  completed={completed}
                  stages={filteredStages}
                  isActive={true}
                  onToggle={toggle}
                />
              </div>
              <div className="relative hidden md:flex md:justify-center">
                <div className="absolute top-6 h-full w-px bg-white/15" />
                <div className={cn("relative z-10 mt-8 grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-gradient-to-b from-neutral-100/10 to-neutral-700/10", selectedWorkflow.glow)}>
                  <SelectedWorkflowIcon className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="hidden md:block md:col-start-3">
                <div className="h-full rounded-[2rem] border border-dashed border-white/8 bg-white/[0.02]" />
              </div>
            </div>

            <div className="mt-6 flex justify-center text-neutral-500">
              <ChevronDown className="h-6 w-6 animate-bounce" />
            </div>
          </section>
          );
        })()}

        <section id="film-kanban" className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-neutral-300">
                <KanbanSquare className="h-4 w-4" />
                Film Edit Mini-Kanban
              </div>
              <h2 className="mt-3 text-2xl font-semibold">GOOB Entertainment clip progress board</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.22em] text-neutral-400">Kanban Progress</div>
              <div className="mt-1 text-2xl font-semibold">{kanbanDone} / {content.filmKanbanItems.length}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {content.filmKanbanColumns.map((column) => (
              <div key={column.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-300">{column.title}</div>
                <div className="space-y-3">
                  {column.itemIds.map((itemId) => {
                    const item = content.filmKanbanItems.find((value) => value.id === itemId);
                    if (!item) return null;

                    const id = `kanban-${item.id}`;
                    const isDone = typeof completed[id] === "number";

                    return (
                      <button
                        key={item.id}
                        onClick={() => toggle(id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                          isDone
                            ? "border-emerald-400/30 bg-emerald-400/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10",
                        )}
                        aria-pressed={isDone}
                        aria-label={`Toggle ${item.label}`}
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
          {content.footerTips.map((tip) => (
            <div key={tip.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="text-lg font-semibold">{tip.title}</div>
              <p className="mt-2 text-sm leading-6 text-neutral-300">{tip.text}</p>
            </div>
          ))}
        </section>
      </main>

      {showResetConfirm && (
        <ConfirmModal
          title="Reset all progress?"
          message="This will clear every completed stage and kanban item. This cannot be undone."
          onCancel={() => setShowResetConfirm(false)}
          onConfirm={resetAll}
        />
      )}
    </div>
  );
}
