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

function clampWidth(value: number) {
  return Math.max(25, Math.min(75, value));
}

export function useSplitPane() {
  const [state, setState] = useState<SplitPaneState>(() => {
    try {
      const raw = window.localStorage.getItem(SPLIT_PANE_STORAGE_KEY);
      if (!raw) return DEFAULT_STATE;
      const parsed = JSON.parse(raw) as PersistedState;
      return {
        enabled: !!parsed.enabled,
        leftWidthPercent: clampWidth(parsed.leftWidthPercent ?? DEFAULT_STATE.leftWidthPercent),
      };
    } catch {
      return DEFAULT_STATE;
    }
  });

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
      const nextWidth = clampWidth((event.clientX / window.innerWidth) * 100);
      setState((prev) => ({ ...prev, leftWidthPercent: nextWidth }));
    };

    const onMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
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
      toggle: () => setState((prev) => ({ ...prev, enabled: !prev.enabled })),
      setLeftWidth: (percent: number) =>
        setState((prev) => ({ ...prev, leftWidthPercent: clampWidth(percent) })),
      onDragStart: () => {
        draggingRef.current = true;
        document.body.classList.add("dragging-split");
      },
      resetWidth: () => setState((prev) => ({ ...prev, leftWidthPercent: 42 })),
    }),
    [state],
  );

  return api;
}
