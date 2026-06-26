// Drop indicator line shown when dragging a card over a drop zone
import React from "react";

interface DropIndicatorProps {
  beforeId: string | null;
  column: string;
}

export function DropIndicator({ beforeId, column }: DropIndicatorProps) {
  return (
    <div
      data-before={beforeId ?? "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full rounded-full bg-[--accent-violet] opacity-0"
    />
  );
}
