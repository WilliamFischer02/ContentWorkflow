import { useEffect, useMemo, useState } from "react";
import { ArrowRight, KanbanSquare, Target } from "lucide-react";
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
  const splitPane = useSplitPane();

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
    if (exists) setSelectedWorkflowId(derivedId);
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
      value: `${kanbanDone} / ${content?.filmKanbanItems.length ?? 0}`,
      hint: "Clip-level progress for the long-form edit lane",
      icon: KanbanSquare,
    },
  ];

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

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
              onDragStart={splitPane.onDragStart}
              onResetWidth={splitPane.resetWidth}
            />
          </>
        ) : (
          <>
            <FullHeader
              query={query}
              onQueryChange={setQuery}
              onClearQuery={() => setQuery("")}
              onReset={() => setShowResetConfirm(true)}
              onToggleSplit={splitPane.toggle}
              stageCards={stageCards}
            />
            {pipeline}
          </>
        )}
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
