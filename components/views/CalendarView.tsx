// Monthly calendar view — shows cards on their due dates as clickable dots
"use client";

import React, { useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths,
  subMonths, parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardModal } from "@/components/kanban/CardModal";
import { useBoard } from "@/hooks/useBoard";
import { CardType } from "@/types";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#FBBF24",
  high: "#F97316",
  critical: "#EF4444",
  default: "#7C3AED",
};

export function CalendarView() {
  const { state } = useBoard();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const cardsWithDate = state.cards.filter((c) => c.dueDate);
  const cardsWithoutDate = state.cards.filter((c) => !c.dueDate);

  const getCardsForDay = (day: Date): CardType[] =>
    cardsWithDate.filter((c) => isSameDay(parseISO(c.dueDate!), day));

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {/* Calendar grid */}
      <div className="flex-1 min-w-0">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-[--bg-hover] text-[--text-secondary] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-base font-semibold text-[--text-primary] capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-[--bg-hover] text-[--text-secondary] transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-[--text-muted] py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayCards = getCardsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[80px] rounded-lg p-1.5 border transition-colors",
                  inMonth ? "border-[--border] bg-[--bg-surface]" : "border-transparent bg-transparent",
                  today && "border-[--accent-violet] ring-1 ring-[--accent-violet]/30"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs mb-1",
                    today ? "bg-[--accent-violet] text-white font-bold" : "",
                    !today && inMonth ? "text-[--text-primary]" : "text-[--text-muted]"
                  )}
                >
                  {format(day, "d")}
                </span>

                <div className="flex flex-col gap-0.5">
                  {dayCards.slice(0, 3).map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className="flex items-center gap-1 w-full text-left group"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: PRIORITY_COLORS[card.priority ?? "default"] }}
                      />
                      <span className="text-[10px] text-[--text-secondary] group-hover:text-[--text-primary] truncate transition-colors">
                        {card.title}
                      </span>
                    </button>
                  ))}
                  {dayCards.length > 3 && (
                    <span className="text-[10px] text-[--text-muted] pl-2.5">
                      +{dayCards.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* No-date sidebar */}
      <div className="w-52 shrink-0 glass rounded-xl p-3 overflow-y-auto">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[--text-secondary] mb-3">
          Sin fecha ({cardsWithoutDate.length})
        </h3>
        <div className="space-y-2">
          {cardsWithoutDate.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="w-full text-left p-2 rounded-lg bg-[--bg-hover] hover:border-[--border-focus] border border-transparent transition-colors"
            >
              <p className="text-xs font-medium text-[--text-primary] truncate">{card.title}</p>
              <p className="text-[10px] text-[--text-muted] mt-0.5 capitalize">{card.column}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Card modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardModal
            card={selectedCard}
            open={!!selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
