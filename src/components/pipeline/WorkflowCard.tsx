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
};

export default function WorkflowCard({
  workflow,
  completed,
  stages,
  isActive,
  onToggle,
  animateDelayMs = 0,
}: WorkflowCardProps) {
  const Icon = workflowIcons[workflow.icon];
  const done = workflow.stages.filter((stage) => typeof completed[stage.id] === "number").length;

  return (
    <div
      id={`workflow-${workflow.id}`}
      className={cn(
        "rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition",
        workflow.glow,
        isActive
          ? "opacity-100 saturate-100 grayscale-0 scale-100"
          : "opacity-35 saturate-50 grayscale-[0.25] scale-[0.97]",
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
            {workflow.output}
          </div>
          <ProgressBar
            done={done}
            total={workflow.stages.length}
            accent={workflow.accent}
            animateDelayMs={animateDelayMs}
          />
          <div className="mt-3 text-sm text-neutral-400">{workflow.handle}</div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-300">{workflow.summary}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-right">
          <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">Cadence</div>
          <div className="mt-1 text-sm font-semibold text-white">{workflow.cadence}</div>
        </div>
      </div>

      <div className="mt-6">
        <WorkflowStageList stages={stages} completed={completed} onToggle={onToggle} />
      </div>

      <div className="mt-5 space-y-3">
        {workflow.quickLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="group flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-200 transition hover:bg-white/10"
          >
            <span>{link.label}</span>
            <ExternalLink className="h-4 w-4 text-neutral-400 transition group-hover:text-white" />
          </a>
        ))}
      </div>
    </div>
  );
}
