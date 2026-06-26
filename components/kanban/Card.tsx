// Draggable card tile with label pills, progress bar, due date, and assignee avatars
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { format, isPast, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardModal } from "@/components/kanban/CardModal";
import { DropIndicator } from "@/components/kanban/DropIndicator";
import { CardType } from "@/types";
import { generateAvatarColor, getInitials, cn } from "@/lib/utils";

interface CardProps {
  card: CardType;
  handleDragStart: (e: React.DragEvent, card: CardType) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#FBBF24",
  high: "#F97316",
  critical: "#EF4444",
};

export function Card({ card, handleDragStart }: CardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const totalItems = card.checklists?.reduce((acc, cl) => acc + cl.items.length, 0) ?? 0;
  const completedItems = card.checklists?.reduce(
    (acc, cl) => acc + cl.items.filter((i) => i.completed).length,
    0
  ) ?? 0;
  const checklistPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const dueDateObj = card.dueDate ? parseISO(card.dueDate) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && !isToday(dueDateObj);

  return (
    <>
      <DropIndicator beforeId={card.id} column={card.column} />
      <motion.div
        layout
        layoutId={card.id}
        draggable
        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, card)}
        onClick={() => setModalOpen(true)}
        whileHover={{ scale: 1.02 }}
        transition={{ layout: { duration: 0.2 }, scale: { duration: 0.1 } }}
        className={cn(
          "relative cursor-pointer rounded-lg border bg-[--bg-surface] p-3 space-y-2.5",
          "border-[--border] hover:border-[--border-focus] transition-colors select-none",
          "shadow-sm hover:shadow-md"
        )}
      >
        {/* Priority dot */}
        {card.priority && (
          <span
            className="absolute top-3 right-3 h-2 w-2 rounded-full"
            style={{ backgroundColor: PRIORITY_COLORS[card.priority] }}
          />
        )}

        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 pr-5">
            {card.labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
            {card.labels.length > 3 && (
              <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[--bg-hover] text-[--text-muted]">
                +{card.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-medium text-[--text-primary] leading-snug pr-5">{card.title}</p>

        {/* Description */}
        {card.description && (
          <p className="text-xs text-[--text-secondary] truncate">{card.description}</p>
        )}

        {/* Checklist progress */}
        {totalItems > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[--text-muted]">
                {completedItems}/{totalItems} ítems
              </span>
              <span className="text-[10px] text-[--text-muted]">{checklistPct}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-[--bg-hover]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${checklistPct}%`,
                  backgroundColor: checklistPct === 100 ? "#10B981" : "#7C3AED",
                }}
              />
            </div>
          </div>
        )}

        {/* Footer: due date + assignees */}
        {(dueDateObj || (card.assignees && card.assignees.length > 0)) && (
          <div className="flex items-center justify-between pt-0.5">
            {dueDateObj ? (
              <span
                className={cn(
                  "flex items-center gap-1 text-[11px]",
                  isOverdue ? "text-[--accent-red]" : isToday(dueDateObj) ? "text-[--accent-yellow]" : "text-[--text-muted]"
                )}
              >
                <CalendarIcon className="h-3 w-3" />
                {format(dueDateObj, "d MMM", { locale: es })}
              </span>
            ) : (
              <span />
            )}

            {card.assignees && card.assignees.length > 0 && (
              <div className="flex -space-x-1.5">
                {card.assignees.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="h-5 w-5 ring-1 ring-[--bg-surface]">
                    <AvatarFallback
                      style={{ backgroundColor: generateAvatarColor(user.id) }}
                      className="text-white text-[8px] font-bold"
                    >
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {card.assignees.length > 3 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[--bg-hover] ring-1 ring-[--bg-surface] text-[8px] text-[--text-muted]">
                    +{card.assignees.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

      <CardModal card={card} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
