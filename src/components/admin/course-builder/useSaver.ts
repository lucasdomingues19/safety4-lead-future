import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "saved" | "pending" | "saving" | "error";

/**
 * Debounced autosave shared by the whole builder. Each edit schedules a save
 * under a key (e.g. "lesson:<id>"); later edits to the same key replace the
 * pending one, so typing produces one write. `status` drives the header's
 * "Saving… / All changes saved" indicator.
 */
export const useSaver = () => {
  const timers = useRef(new Map<string, number>());
  const pending = useRef(new Map<string, () => Promise<void>>());
  const inFlight = useRef(0);
  const [status, setStatus] = useState<SaveStatus>("saved");

  const refresh = useCallback((failed = false) => {
    if (failed) setStatus("error");
    else if (inFlight.current > 0) setStatus("saving");
    else if (pending.current.size > 0) setStatus("pending");
    else setStatus((s) => (s === "error" ? "error" : "saved"));
  }, []);

  const run = useCallback(async (key: string) => {
    const fn = pending.current.get(key);
    if (!fn) return;
    pending.current.delete(key);
    timers.current.delete(key);
    inFlight.current += 1;
    refresh();
    try {
      await fn();
      inFlight.current -= 1;
      setStatus((s) => (s === "error" ? "saved" : s));
      refresh();
    } catch (err) {
      console.error("autosave failed", key, err);
      inFlight.current -= 1;
      refresh(true);
    }
  }, [refresh]);

  const schedule = useCallback((key: string, fn: () => Promise<void>, delay = 700) => {
    pending.current.set(key, fn);
    const t = timers.current.get(key);
    if (t) window.clearTimeout(t);
    timers.current.set(key, window.setTimeout(() => run(key), delay));
    setStatus("pending");
  }, [run]);

  const flush = useCallback(async () => {
    const keys = [...pending.current.keys()];
    keys.forEach((k) => { const t = timers.current.get(k); if (t) window.clearTimeout(t); });
    await Promise.all(keys.map(run));
  }, [run]);

  // Warn before leaving with unsaved edits, and save them on tab hide.
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (pending.current.size || inFlight.current) { e.preventDefault(); e.returnValue = ""; }
    };
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [flush]);

  return { status, schedule, flush };
};

export type Saver = ReturnType<typeof useSaver>;
