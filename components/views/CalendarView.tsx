"use client";

import React, { useState, useEffect } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths,
  subMonths, parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { CardModal } from "@/components/kanban/CardModal";
import { useBoard } from "@/hooks/useBoard";
import { CardType } from "@/types";
import { OutlookEvent } from "@/app/api/calendar/route";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#FBBF24",
  high: "#F97316",
  critical: "#EF4444",
  default: "#7b8d1c",
};

export function CalendarView() {
  const { state } = useBoard();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [outlookEvents, setOutlookEvents] = useState<OutlookEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  // Fetch Outlook events whenever month changes
  useEffect(() => {
    setLoadingEvents(true);
    const start = calStart.toISOString();
    const end = calEnd.toISOString();
    fetch(`/api/calendar?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((data) => setOutlookEvents(Array.isArray(data) ? data : []))
      .catch(() => setOutlookEvents([]))
      .finally(() => setLoadingEvents(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const cardsWithDate = state.cards.filter((c) => c.dueDate);
  const cardsWithoutDate = state.cards.filter((c) => !c.dueDate);

  const getCardsForDay = (day: Date): CardType[] =>
    cardsWithDate.filter((c) => isSameDay(parseISO(c.dueDate!), day));

  const getOutlookForDay = (day: Date): OutlookEvent[] =>
    outlookEvents.filter((e) => {
      try { return isSameDay(parseISO(e.start), day); } catch { return false; }
    });

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
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[--text-primary] capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h2>
            {loadingEvents && <Loader2 className="h-3.5 w-3.5 animate-spin text-[--text-muted]" />}
          </div>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-[--bg-hover] text-[--text-secondary] transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[--accent-emerald]" />
            <span className="text-[10px] text-[--text-muted]">Tareas Kanban</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[--accent-violet]" />
            <span className="text-[10px] text-[--text-muted]">Outlook Calendar</span>
          </div>
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
            const dayEvents = getOutlookForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[90px] rounded-lg p-1.5 border transition-colors",
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
                  {/* Kanban tasks */}
                  {dayCards.slice(0, 2).map((card) => (
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

                  {/* Outlook events */}
                  {dayEvents.slice(0, 2).map((ev) => (
                    <a
                      key={ev.id}
                      href={ev.webLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 w-full text-left group"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0 border"
                        style={{ borderColor: "var(--accent-violet)", backgroundColor: "transparent" }}
                      />
                      <span className="text-[10px] text-[--accent-violet]/70 group-hover:text-[--accent-violet] truncate transition-colors">
                        {ev.subject}
                      </span>
                    </a>
                  ))}

                  {(dayCards.length + dayEvents.length) > 4 && (
                    <span className="text-[10px] text-[--text-muted] pl-2.5">
                      +{dayCards.length + dayEvents.length - 4} más
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-52 shrink-0 flex flex-col gap-3 overflow-y-auto">
        {/* Tasks without date */}
        <div className="glass rounded-xl p-3">
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

        {/* Outlook events this month */}
        {outlookEvents.length > 0 && (
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-3">
              <CalendarDays className="h-3.5 w-3.5 text-[--accent-violet]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[--text-secondary]">
                Outlook ({outlookEvents.length})
              </h3>
            </div>
            <div className="space-y-2">
              {outlookEvents.slice(0, 8).map((ev) => (
                <a
                  key={ev.id}
                  href={ev.webLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-left p-2 rounded-lg bg-[--bg-hover] hover:bg-[--bg-surface] border border-transparent hover:border-[--accent-violet]/30 transition-colors"
                >
                  <p className="text-xs font-medium text-[--accent-violet] truncate">{ev.subject}</p>
                  <p className="text-[10px] text-[--text-muted] mt-0.5">
                    {ev.isAllDay
                      ? "Todo el día"
                      : format(parseISO(ev.start), "d MMM · HH:mm", { locale: es })}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
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
