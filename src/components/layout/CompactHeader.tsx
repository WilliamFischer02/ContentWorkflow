import { PanelLeftClose, RefreshCcw } from "lucide-react";

type CompactHeaderProps = {
  done: number;
  total: number;
  selectedWorkflowName: string;
  onToggleSplit: () => void;
  onReset: () => void;
};

export default function CompactHeader({
  done,
  total,
  selectedWorkflowName,
  onToggleSplit,
  onReset,
}: CompactHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/90 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-sm">
        <div className="font-medium text-neutral-100">Content Pipeline Dashboard</div>
        <div className="text-neutral-300">
          {done}/{total} · Focus: {selectedWorkflowName}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleSplit} className="rounded-lg border border-white/15 px-3 py-1.5">
            <PanelLeftClose className="h-4 w-4" />
          </button>
          <button onClick={onReset} className="rounded-lg border border-white/15 px-3 py-1.5">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
