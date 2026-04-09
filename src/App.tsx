import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { ArrowRight, KanbanSquare, Search, Target, RefreshCcw, TimerReset, PanelLeftOpen } from "lucide-react";
import { STORAGE_KEY } from "./constants";
import CompactHeader from "./components/layout/CompactHeader";
import FullHeader from "./components/layout/FullHeader";
import SplitPaneLayout from "./components/layout/SplitPaneLayout";
import PipelinePane from "./components/pipeline/PipelinePane";
import ConfirmModal from "./components/shared/ConfirmModal";
import { useContentLoader } from "./hooks/useContentLoader";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useScrollActiveId } from "./hooks/useScrollActiveId";
import { useSplitPane } from "./hooks/useSplitPane";
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

export default function App() {
  const { content, error } = useContentLoader();
  const [completed, setCompleted] = useLocalStorage<CompletedState>(STORAGE_KEY, {});
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const splitPane = useSplitPane();

  const workflowIds = useMemo(
    () => (content ? content.workflows.map((workflow) => `workflow-${workflow.id}`) : []),
    [content],
  );
  const activeWorkflowElementId = useScrollActiveId(workflowIds);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSearchPanel(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!content || content.workflows.length === 0) return;
    if (!selectedWorkflowId) setSelectedWorkflowId(content.workflows[0].id);
  }, [content, selectedWorkflowId]);

  useEffect(() => {
    if (!activeWorkflowElementId || query.trim() || !content) return;
    const derivedId = activeWorkflowElementId.replace("workflow-", "");
    if (content.workflows.some((workflow) => workflow.id === derivedId)) {
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

  const workflowProgress = useMemo(() => {
    if (!content) return [];
    return content.workflows.map((workflow) => ({
      workflow,
      progress: getWorkflowProgress(
        workflow.stages.map((stage) => stage.id),
        completed,
      ),
    }));
  }, [completed, content]);

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

  if (!content || !selectedWorkflow) {
    return (
      <div className="min-h-screen bg-[#050816] px-4 py-10 text-neutral-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-black/40 p-6">
          <h1 className="text-xl font-semibold">Loading content workflow dashboard...</h1>
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    );
  }

  const selectedDone = workflowProgress.find((entry) => entry.workflow.id === selectedWorkflow.id)?.progress.done ?? 0;

  const pipeline = (
    <PipelinePane
      content={content}
      selectedWorkflow={selectedWorkflow}
      filteredStages={filteredStages}
      completed={completed}
      workflowProgress={workflowProgress}
      kanbanDone={kanbanDone}
      onSelectWorkflow={setSelectedWorkflowId}
      onToggle={toggle}
      compact={splitPane.state.enabled}
    />
  );

  return (
    <div className="min-h-screen bg-[#050816] text-neutral-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_25%),linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_18%,transparent_80%,rgba(255,255,255,0.04))]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />

      {!splitPane.state.enabled && (
        <div className="fixed left-4 top-20 z-20 flex w-[180px] flex-col gap-3">
          <StatCard label="Total" value={`${totals.done}/${totals.total}`} hint={`${totals.percent}% of tracked stages`} icon={Target} />
          <StatCard label="Focus" value={selectedWorkflow.brand} hint={`${selectedDone}/${selectedWorkflow.stages.length} complete`} icon={ArrowRight} />
          <StatCard label="Kanban" value={`${kanbanDone}/${content.filmKanbanItems.length}`} hint="Film edit lane" icon={KanbanSquare} />
        </div>
      )}

      <main className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {splitPane.state.enabled ? (
          <>
            <CompactHeader
              done={totals.done}
              total={totals.total}
              selectedWorkflowName={selectedWorkflow.brand}
              onToggleSplit={splitPane.toggle}
              onReset={() => setShowResetConfirm(true)}
            />
            <SplitPaneLayout
              leftPane={pipeline}
              rightPane={
                <div className="grid h-full place-items-center border-l border-white/10 bg-black/20 text-center text-neutral-400">
                  Browser pane — Phase 5
                </div>
              }
              leftWidthPercent={splitPane.state.leftWidthPercent}
              isDragging={splitPane.isDragging}
              onDragStart={splitPane.onDragStart}
              onResetWidth={splitPane.resetWidth}
            />
          </>
        ) : (
          <>
            <FullHeader />
            {pipeline}
          </>
        )}
      </main>

      <div className="fixed bottom-4 right-4 z-30">
        {showSearchPanel ? (
          <div className="w-[320px] rounded-2xl border border-white/10 bg-neutral-950/90 p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Search</div>
              <button onClick={() => setShowSearchPanel(false)} className="text-xs text-neutral-400">Close</button>
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the focused workflow"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setQuery("")} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs"><TimerReset className="h-3.5 w-3.5" /> Clear</button>
              <button onClick={() => setShowResetConfirm(true)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs"><RefreshCcw className="h-3.5 w-3.5" /> Reset</button>
              <button onClick={splitPane.toggle} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs"><PanelLeftOpen className="h-3.5 w-3.5" /> Split</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSearchPanel(true)}
            className="rounded-full border border-white/10 bg-neutral-950/90 p-3 text-neutral-200 shadow-2xl backdrop-blur-xl"
            aria-label="Open search panel"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
      </div>

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

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
};

function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="w-[180px] rounded-xl border border-white/10 bg-neutral-950/80 p-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[0.6rem] uppercase tracking-widest text-white/40">{label}</div>
        <Icon className="h-3.5 w-3.5 text-white/40" />
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="mt-1 text-xs text-white/40">{hint}</div>
    </div>
  );
}
