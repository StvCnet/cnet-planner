// Hook to consume ADContext — use this in all components
"use client";

import { useADContext } from "@/context/ADContext";

export function useAD() {
  return useADContext();
}
