import type { MouseEvent, ReactNode } from "react";

type SplitPaneLayoutProps = {
  leftPane: ReactNode;
  rightPane: ReactNode;
  leftWidthPercent: number;
  isDragging: boolean;
  onDragStart: (event: MouseEvent<HTMLDivElement>) => void;
  onResetWidth: () => void;
};

export default function SplitPaneLayout({
  leftPane,
  rightPane,
  leftWidthPercent,
  isDragging,
  onDragStart,
  onResetWidth,
}: SplitPaneLayoutProps) {
  return (
    <div
      className="grid h-[calc(100vh - 64px)]"
      style={{
        gridTemplateColumns: `${leftWidthPercent}% 6px 1fr`,
        willChange: isDragging ? "grid-template-columns" : "auto",
        contain: "layout",
      }}
    >
      <div className="overflow-y-auto">{leftPane}</div>
      <div
        className="split-divider"
        onMouseDown={onDragStart}
        onDoubleClick={onResetWidth}
        role="separator"
        aria-label="Resize panes"
      />
      <div className="overflow-y-auto">{rightPane}</div>
    </div>
  );
}
