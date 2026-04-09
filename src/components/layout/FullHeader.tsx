import type { ComponentType } from "react";
import { PanelLeftOpen, RefreshCcw, Search, TimerReset } from "lucide-react";

type FullHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onClearQuery: () => void;
  onReset: () => void;
  onToggleSplit: () => void;
  stageCards: Array<{ label: string; value: string; hint: string; icon: ComponentType<{ className?: string }> }>;
};

export default function FullHeader({
  query,
  onQueryChange,
  onClearQuery,
  onReset,
  onToggleSplit,
  stageCards,
}: FullHeaderProps) {
  return (
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
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search the focused workflow by task, note, or deliverable"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-cyan-400/50 focus:bg-white/8"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={onClearQuery} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-100 transition hover:bg-white/10">
              <TimerReset className="h-4 w-4" />
              Clear search
            </button>
            <button onClick={onReset} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-100 transition hover:bg-white/10">
              <RefreshCcw className="h-4 w-4" />
              Reset checks
            </button>
            <button onClick={onToggleSplit} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-100 transition hover:bg-white/10">
              <PanelLeftOpen className="h-4 w-4" />
              Split view
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
