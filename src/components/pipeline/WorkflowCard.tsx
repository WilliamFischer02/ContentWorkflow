import { ExternalLink } from "lucide-react";
import { cn, workflowIcons } from "../../constants";
import type { CompletedState, Workflow } from "../../types";
import ProgressBar from "./ProgressBar";
import WorkflowStageList from "./WorkflowStageList";

type WorkflowCardProps = {
  workflow: Workflow;
  completed: CompletedState;
  stages: Workflow["stages"];
  isActive: boolean;
  onToggle: (id: string) => void;
  animateDelayMs?: number;
  compact?: boolean;
};

export default function WorkflowCard({
  workflow,
  completed,
  stages,
  isActive,
  onToggle,
  animateDelayMs = 0,
  compact = false,
}: WorkflowCardProps) {
  const Icon = workflowIcons[workflow.icon];
  const done = workflow.stages.filter((stage) => typeof completed[stage.id] === "number").length;

  return (
    <div
      id={`workflow-${workflow.id}`}
      className={cn(
        "border border-white/10 bg-white/5 backdrop-blur-xl transition",
        compact ? "rounded-[1.25rem] p-3" : "rounded-[2rem] p-5",
        workflow.glow,
        isActive ? "opacity-100" : "opacity-35 saturate-[0.3] grayscale-[0.3]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white whitespace-nowrap",
              workflow.accent,
            )}
          >
            <Icon className="h-4 w-4" />
            {workflow.output}
          </div>
          <ProgressBar
            done={done}
            total={workflow.stages.length}
            accent={workflow.accent}
            animateDelayMs={animateDelayMs}
          />
          <div className="mt-3 truncate text-sm text-neutral-400">{workflow.handle}</div>
          <p className={cn("mt-3 max-w-xl overflow-hidden text-ellipsis text-neutral-300", compact ? "text-xs line-clamp-2" : "text-sm leading-6")}>{workflow.summary}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-right">
          <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">Cadence</div>
          <div className="mt-1 text-sm font-semibold text-white">{workflow.cadence}</div>
        </div>
      </div>

      <div className={cn(compact ? "mt-4" : "mt-6")}>
        <WorkflowStageList stages={stages} completed={completed} onToggle={onToggle} compact={compact} />
      </div>

      <div className={cn(compact ? "mt-3 space-y-2" : "mt-5 space-y-3")}>
        {workflow.quickLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="group flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-200 transition hover:bg-white/10"
          >
            <span className="truncate">{link.label}</span>
            <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400 transition group-hover:text-white" />
          </a>
        ))}
      </div>
    </div>
  );
}
