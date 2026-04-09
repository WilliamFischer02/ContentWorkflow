import { useCallback, useEffect, useState } from "react";
import { siteContent } from "../data/siteContent";
import type { SiteContent } from "../types";

export function useContentLoader(): { content: SiteContent | null; error: string | null } {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setContent(siteContent);
      setError(null);
    } catch {
      setError("Unable to load workflow content.");
    }
  }, []);

  useEffect(() => {
    void loadContent();

    const onFocus = () => {
      void loadContent();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadContent();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadContent]);

  return { content, error };
}
