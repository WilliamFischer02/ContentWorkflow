import { useEffect, useState } from "react";

export function useScrollActiveId(elementIds: string[], focusRatio = 0.34): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!elementIds.length) return;

    const updateActive = () => {
      const viewportAnchor = window.innerHeight * focusRatio;
      let closestId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const id of elementIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportAnchor);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = id;
        }
      }

      setActiveId(closestId);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [elementIds, focusRatio]);

  return activeId;
}
