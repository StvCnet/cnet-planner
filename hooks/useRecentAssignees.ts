"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cnet-recent-assignees-v1";
const MAX_RECENT = 20;

export function useRecentAssignees() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {}
  }, []);

  const addRecent = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setRecentIds((prev) => {
      const next = [
        ...ids,
        ...prev.filter((id) => !ids.includes(id)),
      ].slice(0, MAX_RECENT);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return [recentIds, addRecent] as const;
}
