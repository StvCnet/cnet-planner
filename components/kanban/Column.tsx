// Kanban column — glassmorphism container with DnD drop handling and vertical scroll
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/kanban/Card";
import { AddCard } from "@/components/kanban/AddCard";
import { DropIndicator } from "@/components/kanban/DropIndicator";
import { useBoard } from "@/hooks/useBoard";
import { CardType, ColumnType } from "@/types";
import { cn } from "@/lib/utils";

interface ColumnProps {
  title: string;
  column: ColumnType;
  headingColor: string;
  borderColor: string;
}

const COLUMN_LABEL: Record<ColumnType, string> = {
  backlog: "ATRASADO",
  todo: "POR HACER",
  doing: "EN CURSO",
  done: "COMPLETADO",
};

function getIndicators() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-before]"));
}

function getNearestIndicator(e: React.DragEvent, indicators: HTMLElement[]) {
  const DISTANCE_OFFSET = 50;
  const el = indicators.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = e.clientY - (box.top + DISTANCE_OFFSET);
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
  );
  return el;
}

function highlightIndicator(e: React.DragEvent, column: ColumnType) {
  const indicators = getIndicators().filter((i) => i.dataset.column === column);
  clearHighlights(indicators);
  const el = getNearestIndicator(e, indicators);
  if (el.element) el.element.style.opacity = "1";
}

function clearHighlights(els?: HTMLElement[]) {
  const indicators = els ?? getIndicators();
  indicators.forEach((i) => (i.style.opacity = "0"));
}

export function Column({ title, column, headingColor, borderColor }: ColumnProps) {
  const { filteredCards, dispatch } = useBoard();
  const [active, setActive] = useState(false);
  const cards = filteredCards(column);

  const handleDragStart = (e: React.DragEvent, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    highlightIndicator(e, column);
    setActive(true);
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    clearHighlights();
    setActive(false);
    const cardId = e.dataTransfer.getData("cardId");
    const indicators = getIndicators().filter((i) => i.dataset.column === column);
    const { element } = getNearestIndicator(e, indicators);
    const before = element?.dataset.before ?? "-1";
    if (before !== cardId) {
      dispatch({
        type: "MOVE_CARD",
        cardId,
        toColumn: column,
        beforeId: before === "-1" ? null : before,
      });
    }
  };

  return (
    // h-full so the column fills the board height; flex-col splits header + scrollable body
    <div className="flex flex-col w-72 shrink-0 h-full">
      {/* Column header — fixed height */}
      <div className="flex items-center justify-between mb-2 px-1 shrink-0">
        <h3 className={cn("text-sm font-semibold uppercase tracking-wider", headingColor)}>
          {COLUMN_LABEL[column]}
        </h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[--bg-hover] text-[10px] font-bold text-[--text-secondary]">
          {cards.length}
        </span>
      </div>

      {/* Drop zone — flex-1 + overflow-y-auto keeps cards inside the column */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 overflow-y-auto rounded-xl p-2 transition-all duration-200",
          "border-l-2",
          borderColor,
          active
            ? "bg-[--bg-hover] backdrop-blur-sm border border-[--border-focus]"
            : "glass",
          "min-h-[80px]"
        )}
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} handleDragStart={handleDragStart} />
        ))}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} />
      </motion.div>
    </div>
  );
}
