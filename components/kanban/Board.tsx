// Root board — renders all columns with proper height + burn barrel
"use client";

import React from "react";
import { Columns3, Rows3 } from "lucide-react";
import { Column } from "@/components/kanban/Column";
import { BurnBarrel } from "@/components/kanban/BurnBarrel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBoardLayout } from "@/hooks/useBoardLayout";
import { ColumnType } from "@/types";
import { cn } from "@/lib/utils";

interface ColumnConfig {
  title: string;
  column: ColumnType;
  headingColor: string;
  borderColor: string;
}

const COLUMNS: ColumnConfig[] = [
  { title: "Atrasado",   column: "backlog", headingColor: "text-[--text-muted]",     borderColor: "border-[--text-muted]" },
  { title: "Por hacer",  column: "todo",    headingColor: "text-[--accent-yellow]",   borderColor: "border-[--accent-yellow]" },
  { title: "En curso",   column: "doing",   headingColor: "text-[--accent-blue]",     borderColor: "border-[--accent-blue]" },
  { title: "Completado", column: "done",    headingColor: "text-[--accent-emerald]",  borderColor: "border-[--accent-emerald]" },
];

export function Board() {
  const { layout, toggleLayout } = useBoardLayout();
  const isVertical = layout === "vertical";

  return (
    <div className="flex h-full flex-col">
      {/* Layout toggle */}
      <div className="flex justify-end px-4 pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleLayout}
                className="flex items-center justify-center h-7 w-7 rounded-md text-[--text-secondary] hover:bg-[--bg-hover] hover:text-[--text-primary] transition-colors"
                aria-label="Cambiar organización del tablero"
              >
                {isVertical ? <Rows3 className="h-4 w-4" /> : <Columns3 className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {isVertical ? "Organización vertical" : "Organización horizontal"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* flex-1 + min-h-0 so this fills the remaining height below the toggle bar and can
          actually scroll instead of overflowing; items-stretch equalizes column heights (horizontal only) */}
      <div
        className={cn(
          "flex gap-4 px-4 pb-4 pt-2 flex-1 min-h-0",
          isVertical ? "flex-col overflow-y-auto" : "items-stretch overflow-x-auto"
        )}
      >
        {COLUMNS.map((col) => (
          <Column
            key={col.column}
            title={col.title}
            column={col.column}
            headingColor={col.headingColor}
            borderColor={col.borderColor}
            layout={layout}
          />
        ))}
        {/* Burn barrel — shrink-0 keeps it from stretching */}
        <div className={cn("shrink-0 flex items-start", isVertical ? "justify-center" : "pt-8")}>
          <BurnBarrel />
        </div>
      </div>
    </div>
  );
}
