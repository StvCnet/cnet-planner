// Hook to consume BoardContext — use this in all components
"use client";

import { useBoardContext } from "@/context/BoardContext";

export function useBoard() {
  return useBoardContext();
}
