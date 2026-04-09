import { useEffect, useMemo, useRef, useState } from "react";
import { SPLIT_PANE_STORAGE_KEY } from "../constants";

type SplitPaneState = {
  enabled: boolean;
  leftWidthPercent: number;
};

type PersistedState = Partial<SplitPaneState>;

const DEFAULT_STATE: SplitPaneState = {
  enabled: false,
  leftWidthPercent: 42,
};

const MIN_LEFT_PX = 380;
const MIN_RIGHT_PX = 300;

function clampWidthByViewport(value: number, viewportWidth: number) {
  const minLeftPercent = (MIN_LEFT_PX / viewportWidth) * 100;
  const maxLeftPercent = ((viewportWidth - MIN_RIGHT_PX - 6) / viewportWidth) * 100;
  return Math.min(Math.max(value, minLeftPercent), maxLeftPercent);
}

export function useSplitPane() {
  const [state, setState] = useState<SplitPaneState>(() => {
    try {
      const raw = window.localStorage.getItem(SPLIT_PANE_STORAGE_KEY);
      if (!raw) return DEFAULT_STATE;
      const parsed = JSON.parse(raw) as PersistedState;
      return {
        enabled: !!parsed.enabled,
        leftWidthPercent: clampWidthByViewport(
          parsed.leftWidthPercent ?? DEFAULT_STATE.leftWidthPercent,
          window.innerWidth,
        ),
      };
    } catch {
      return DEFAULT_STATE;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(SPLIT_PANE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore persistence failures
    }
  }, [state]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;
      const nextWidth = clampWidthByViewport((event.clientX / window.innerWidth) * 100, window.innerWidth);
      setState((prev) => ({ ...prev, leftWidthPercent: nextWidth }));
    };

    const onMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      document.body.classList.remove("dragging-split");
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const api = useMemo(
    () => ({
      state,
      isDragging,
      toggle: () => setState((prev) => ({ ...prev, enabled: !prev.enabled })),
      setLeftWidth: (percent: number) =>
        setState((prev) => ({ ...prev, leftWidthPercent: clampWidthByViewport(percent, window.innerWidth) })),
      onDragStart: () => {
        draggingRef.current = true;
        setIsDragging(true);
        document.body.classList.add("dragging-split");
      },
      resetWidth: () =>
        setState((prev) => ({ ...prev, leftWidthPercent: clampWidthByViewport(42, window.innerWidth) })),
    }),
    [isDragging, state],
  );

  return api;
}
