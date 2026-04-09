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
  const selectedProgress = workflowProgress.find((x) => x.workflow.id === selectedWorkflow.id)?.progress;

  return (
    <div className={cn("pipeline-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", compact ? "py-3" : "py-6")}>
      <section className="workflow-strip-grid mt-3 grid gap-3">
        {workflowProgress.map(({ workflow, progress }) => {
          const Icon = workflowIcons[workflow.icon];
          const isSelected = workflow.id === selectedWorkflow.id;
          return (
            <button
              key={workflow.id}
              onClick={() => onSelectWorkflow(workflow.id)}
              className={cn(
                "group rounded-xl border border-l-[3px] px-3 py-2 text-left transition",
                workflowAccentBorder[workflow.icon],
                isSelected
                  ? "border-white/20 bg-white/[0.06] shadow-[0_0_20px_rgba(56,189,248,0.15)] opacity-100"
                  : "border-white/6 bg-white/[0.02] opacity-40 saturate-[0.3] grayscale-[0.3]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white whitespace-nowrap">
                  <Icon className="h-3.5 w-3.5" />
                  {workflow.brand}
                </div>
                <span className="text-xs text-neutral-300">{progress.done}/{progress.total}</span>
              </div>
              <div className={cn("strip-progress", compact && "hidden")}> 
                <ProgressBar done={progress.done} total={progress.total} fillClass={workflowAccentFill[workflow.icon]} />
              </div>
              <div className="overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-200">
                <p className="mt-2 text-xs text-white/50 line-clamp-2">{workflow.summary}</p>
              </div>
            </button>
          );
        })}
      </section>

      <section className={cn("mt-5 relative overflow-hidden border border-white/10 bg-black/30", compact ? "rounded-[1.25rem] p-3" : "rounded-[2rem] p-5")}>
        <div className="pointer-events-none absolute right-8 top-0 hidden h-full w-6 rounded-full bg-gradient-to-b from-white/15 via-white/5 to-white/15 md:block" />

        <div className="mb-5 flex flex-col gap-3 pt-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-300">
              <ArrowRight className="h-4 w-4" />
              Active workflow map
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">{selectedWorkflow.brand}</h2>
          </div>
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
            <ProgressBar
              done={selectedProgress?.done ?? 0}
              total={selectedWorkflow.stages.length}
              fillClass={workflowAccentFill[selectedWorkflow.icon]}
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_88px] gap-4 items-start">
          <WorkflowCard
            workflow={selectedWorkflow}
            completed={completed}
            stages={filteredStages}
            isActive={true}
            onToggle={onToggle}
            compact={compact}
          />
          <div className="relative hidden md:flex md:justify-center">
            <div className="absolute top-6 h-full w-px bg-white/15" />
            <div className={cn("relative z-10 mt-8 grid h-14 w-14 place-items-center rounded-full border bg-gradient-to-b from-neutral-100/10 to-neutral-700/10", selectedWorkflow.glow, workflowAccentBorder[selectedWorkflow.icon])}>
              {(() => {
                const SelectedWorkflowIcon = workflowIcons[selectedWorkflow.icon];
                return <SelectedWorkflowIcon className="h-6 w-6 text-white" />;
              })()}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center text-neutral-500">
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </section>

      <section id="film-kanban" className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-neutral-300">
              <KanbanSquare className="h-4 w-4" />
              Film Edit Mini-Kanban
            </div>
            <h2 className="mt-2 text-xl font-semibold">GOOB Entertainment clip progress board</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.22em] text-neutral-400">Kanban Progress</div>
            <div className="mt-1 text-2xl font-semibold">{kanbanDone} / {content.filmKanbanItems.length}</div>
          </div>
        </div>

        <div className="kanban-grid mt-5 grid gap-3">
          {content.filmKanbanColumns.map((column) => (
            <div key={column.id} className="rounded-[1rem] border border-white/10 bg-black/20 p-3">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300">{column.title}</div>
              <div className="space-y-2">
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
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                        isDone
                          ? "border-emerald-400/30 bg-emerald-400/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10",
                      )}
                      aria-pressed={isDone}
                      aria-label={`Toggle ${item.label}`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-neutral-400" />
                      )}
                      <span className="text-xs text-neutral-100 line-clamp-2">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
