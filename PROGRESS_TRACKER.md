# ContentWorkflow — Build Progress

## Current Phase: 5 — Mini Browser Pane
## Current Task: 5.1 — Create browser state management
## Status: IN_PROGRESS
## Last Updated: 2026-04-09T05:26:34Z

---

## Phase Checklist

### Phase 1: Foundation Refactor
- [x] 1.1 — Extract types to src/types.ts
- [x] 1.2 — Extract constants to src/constants.ts
- [x] 1.3 — Create src/hooks/useLocalStorage.ts
- [x] 1.4 — Create src/hooks/useScrollActiveId.ts
- [x] 1.5 — Create src/hooks/useContentLoader.ts
- [x] 1.6 — Extract WorkflowStageList to src/components/pipeline/WorkflowStageList.tsx
- [x] 1.7 — Extract WorkflowRow → WorkflowCard at src/components/pipeline/WorkflowCard.tsx
- [x] 1.8 — Slim down App.tsx
- [x] 1.9 — Create PROGRESS_TRACKER.md

### Phase 2: Quick Win UX Fixes
- [x] 2.1 — Add confirmation modal to Reset Checks
- [x] 2.2 — Add per-workflow progress bars
- [x] 2.3 — Reduce inactive workflow opacity
- [x] 2.4 — Mark placeholder links as unlinked
- [x] 2.5 — Remove 20-second polling from content refresh logic
- [x] 2.6 — Timestamp completions + relative time utility

### Phase 3: Focus & Navigation UX
- [ ] 3.1 — Add "You Are Here" sticky banner
- [ ] 3.2 — Add "Today's Focus" selector
- [ ] 3.3 — Add accordion collapse for inactive workflows
- [ ] 3.4 — Add keyboard navigation
- [ ] 3.5 — Move kanban inline within film workflow

### Phase 4: Split-Pane Layout
- [x] 4.1 — Create useSplitPane hook
- [x] 4.2 — Create SplitPaneLayout component
- [x] 4.3 — Create CompactHeader component
- [x] 4.4 — Create PipelinePane component
- [x] 4.5 — Update App.tsx split-pane routing
- [x] 4.6 — Add split-pane toggle to headers
- [x] 4.7 — Add split-pane CSS rules

### Phase 5: Mini Browser Pane
- [ ] 5.1 — Create browser state management  ← CURRENT
- [ ] 5.2 — Create BrowserTabBar
- [ ] 5.3 — Create BrowserUrlBar
- [ ] 5.4 — Create BrowserFrame
- [ ] 5.5 — Add stage-to-search integration
- [ ] 5.6 — Add browser empty state
- [ ] 5.7 — Wire BrowserContext through App

### Phase 6: Drag-and-Drop Kanban
- [ ] 6.1 — Install @dnd-kit dependencies
- [ ] 6.2 — Refactor KanbanBoard to use @dnd-kit
- [ ] 6.3 — Add drag visual feedback
- [ ] 6.4 — Keep checkbox toggle + auto complete on Done column

### Phase 7: Polish & Edge Cases
- [ ] 7.1 — Mobile responsiveness pass
- [ ] 7.2 — Accessibility labels and ARIA pass
- [ ] 7.3 — Animation refinements
- [ ] 7.4 — Editable stage URLs via localStorage
- [ ] 7.5 — Add favicon assets + index links
- [ ] 7.6 — Add React error boundary
- [ ] 7.7 — Final build + typecheck + preview verification

## Blockers
- None currently.
