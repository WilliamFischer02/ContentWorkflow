import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore localStorage issues
    }
  }, [key, state]);

  const setValue = (value: T | ((prev: T) => T)) => {
    setState((prev) => (typeof value === "function" ? (value as (p: T) => T)(prev) : value));
  };

  return [state, setValue];
}
