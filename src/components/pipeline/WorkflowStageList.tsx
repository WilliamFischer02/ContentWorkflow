import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { cn, stageIcons } from "../../constants";
import type { CompletedState, Stage } from "../../types";
import { relativeTime } from "../../utils/relativeTime";

type WorkflowStageListProps = {
  stages: Stage[];
  completed: CompletedState;
  onToggle: (id: string) => void;
};

export default function WorkflowStageList({ stages, completed, onToggle }: WorkflowStageListProps) {
  return (
    <div className="space-y-4">
      {stages.map((stage, stageIndex) => {
        const completedAt = completed[stage.id];
        const isDone = typeof completedAt === "number";
        const isPlaceholderLink = stage.href.startsWith("#replace-with-");

        return (
          <div key={stage.id} className="relative">
            {stageIndex < stages.length - 1 && (
              <div className="absolute left-6 top-16 h-14 w-px bg-white/10" />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => onToggle(stage.id)}
                className="mt-1 rounded-full text-neutral-300 transition hover:text-white"
                aria-label={`Toggle ${stage.label}`}
                aria-pressed={isDone}
                title={`Toggle ${stage.label}`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>

              {isPlaceholderLink ? (
                <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 opacity-50 cursor-not-allowed">
                  <StageBody stage={stage} completedAt={completedAt} isDone={isDone} />
                  <span className="mt-3 inline-flex rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-neutral-300">
                    Link not set
                  </span>
                </div>
              ) : (
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
                    <StageBody stage={stage} completedAt={completedAt} isDone={isDone} />
                    <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400 transition group-hover:text-white" />
                  </div>
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type StageBodyProps = {
  stage: Stage;
  completedAt: number | false | undefined;
  isDone: boolean;
};

function StageBody({ stage, completedAt, isDone }: StageBodyProps) {
  const StageIcon = stageIcons[stage.icon];

  return (
    <div className="flex gap-3">
      <div className="rounded-xl border border-white/10 bg-black/20 p-2">
        <StageIcon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{stage.label}</div>
        <div className="mt-1 text-sm leading-5 text-neutral-300">{stage.note}</div>
        {typeof completedAt === "number" && (
          <div className="mt-1 text-xs text-emerald-300/90">Completed {relativeTime(completedAt)}</div>
        )}
        <div
          className={cn(
            "mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs leading-5 text-neutral-300",
            isDone && "border-emerald-400/30",
          )}
        >
          Deliverable: {stage.deliverable}
        </div>
      </div>
    </div>
  );
}
