import { ArrowRight, CheckCircle2, ChevronDown, Circle, KanbanSquare } from "lucide-react";
import { cn, workflowAccentBorder, workflowAccentFill, workflowIcons } from "../../constants";
import type { CompletedState, SiteContent, Workflow } from "../../types";
import ProgressBar from "./ProgressBar";
import WorkflowCard from "./WorkflowCard";

type PipelinePaneProps = {
  content: SiteContent;
  selectedWorkflow: Workflow;
  filteredStages: Workflow["stages"];
  completed: CompletedState;
  workflowProgress: Array<{ workflow: Workflow; progress: { done: number; total: number; percent: number } }>;
  kanbanDone: number;
  onSelectWorkflow: (id: string) => void;
  onToggle: (id: string) => void;
  compact?: boolean;
};

export default function PipelinePane({
  content,
  selectedWorkflow,
  filteredStages,
  completed,
  workflowProgress,
  kanbanDone,
  onSelectWorkflow,
  onToggle,
  compact = false,
}: PipelinePaneProps) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", compact ? "py-4" : "py-8")}>
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {workflowProgress.map(({ workflow, progress }) => {
          const Icon = workflowIcons[workflow.icon];
          const isSelected = workflow.id === selectedWorkflow.id;
          return (
            <button
              key={workflow.id}
              onClick={() => onSelectWorkflow(workflow.id)}
              className={cn(
                "rounded-[1.75rem] border border-l-[3px] p-5 text-left transition",
                workflowAccentBorder[workflow.icon],
                isSelected
                  ? "bg-white/10 shadow-[0_10px_40px_rgba(15,23,42,0.35)]"
                  : "bg-white/5 hover:bg-white/8",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
                  <Icon className="h-4 w-4" />
                  {workflow.brand}
                </div>
                <div className="text-sm text-neutral-300">{progress.done}/{progress.total}</div>
              </div>
              <ProgressBar
                done={progress.done}
                total={progress.total}
                fillClass={workflowAccentFill[workflow.icon]}
              />
              <p className="mt-3 text-sm leading-6 text-neutral-300">{workflow.summary}</p>
            </button>
          );
        })}
      </section>

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
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
            <ProgressBar
              done={workflowProgress.find((x) => x.workflow.id === selectedWorkflow.id)?.progress.done ?? 0}
              total={selectedWorkflow.stages.length}
              fillClass={workflowAccentFill[selectedWorkflow.icon]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_80px_1fr] md:items-start">
          <div className="order-2 md:col-start-1">
            <WorkflowCard
              workflow={selectedWorkflow}
              completed={completed}
              stages={filteredStages}
              isActive={true}
              onToggle={onToggle}
            />
          </div>
          <div className="relative hidden md:flex md:justify-center">
            <div className="absolute top-6 h-full w-px bg-white/15" />
            <div className={cn("relative z-10 mt-8 grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-gradient-to-b from-neutral-100/10 to-neutral-700/10", selectedWorkflow.glow)}>
              {(() => {
                const SelectedWorkflowIcon = workflowIcons[selectedWorkflow.icon];
                return <SelectedWorkflowIcon className="h-7 w-7 text-white" />;
              })()}
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
                      onClick={() => onToggle(id)}
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
    </div>
  );
}
