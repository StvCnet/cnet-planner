// Root board — renders all columns with proper height + burn barrel
"use client";

import React from "react";
import { Column } from "@/components/kanban/Column";
import { BurnBarrel } from "@/components/kanban/BurnBarrel";
import { ColumnType } from "@/types";

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
  return (
    // h-full fills the view; items-stretch so every column is the same height
    <div className="flex h-full items-stretch gap-4 overflow-x-auto px-4 pb-4 pt-2">
      {COLUMNS.map((col) => (
        <Column
          key={col.column}
          title={col.title}
          column={col.column}
          headingColor={col.headingColor}
          borderColor={col.borderColor}
        />
      ))}
      {/* Burn barrel — shrink-0 keeps it from stretching */}
      <div className="shrink-0 flex items-start pt-8">
        <BurnBarrel />
      </div>
    </div>
  );
}
