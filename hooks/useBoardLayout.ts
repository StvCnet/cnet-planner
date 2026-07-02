"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cnet-board-layout-v1";

export type BoardLayout = "horizontal" | "vertical";

export function useBoardLayout() {
  const [layout, setLayout] = useState<BoardLayout>("horizontal");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "horizontal" || stored === "vertical") setLayout(stored);
    } catch {}
  }, []);

  const toggleLayout = useCallback(() => {
    setLayout((prev) => {
      const next = prev === "horizontal" ? "vertical" : "horizontal";
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  return { layout, toggleLayout };
}
