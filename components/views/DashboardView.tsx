// Dashboard view — KPI cards, bar chart, completion rate, tasks by assignee
"use client";

import React from "react";
import { isPast, isToday, parseISO } from "date-fns";
import { TrendingUp, TrendingDown, CheckCircle2, Clock, AlertTriangle, LayoutList } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useBoard } from "@/hooks/useBoard";
import { useProjects } from "@/context/ProjectContext";
import { ColumnType } from "@/types";

const COLUMN_COLORS: Record<ColumnType, string> = {
  backlog: "#4A4A5A",
  todo: "#FBBF24",
  doing: "#3B82F6",
  done: "#10B981",
};

const COLUMN_LABELS: Record<ColumnType, string> = {
  backlog: "Backlog",
  todo: "Por Hacer",
  doing: "En Curso",
  done: "Completado",
};

export function DashboardView() {
  const { state } = useBoard();
  const { projects } = useProjects();
  const { cards } = state;

  const total = cards.length;
  const done = cards.filter((c) => c.column === "done").length;
  const inProgress = cards.filter((c) => c.column === "doing").length;
  const overdue = cards.filter(
    (c) =>
      c.dueDate &&
      c.column !== "done" &&
      isPast(parseISO(c.dueDate)) &&
      !isToday(parseISO(c.dueDate))
  ).length;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const byColumn: Record<ColumnType, number> = {
    backlog: cards.filter((c) => c.column === "backlog").length,
    todo: cards.filter((c) => c.column === "todo").length,
    doing: cards.filter((c) => c.column === "doing").length,
    done: cards.filter((c) => c.column === "done").length,
  };

  const maxColCount = Math.max(...Object.values(byColumn), 1);

  // Tasks by assignee
  const assigneeMap = new Map<string, { name: string; id: string; count: number }>();
  cards.forEach((card) => {
    card.assignees?.forEach((user) => {
      if (assigneeMap.has(user.id)) {
        assigneeMap.get(user.id)!.count++;
      } else {
        assigneeMap.set(user.id, { name: user.displayName, id: user.id, count: 1 });
      }
    });
  });
  const assigneeList = Array.from(assigneeMap.values()).sort((a, b) => b.count - a.count).slice(0, 6);

  const totalHours = cards.reduce((sum, c) => sum + (c.estimatedHours ?? 0), 0);
  const doneHours = cards
    .filter((c) => c.column === "done")
    .reduce((sum, c) => sum + (c.estimatedHours ?? 0), 0);
  const hoursPct = totalHours > 0 ? Math.round((doneHours / totalHours) * 100) : 0;

  const kpis = [
    {
      label: "Total tareas",
      value: total,
      icon: LayoutList,
      color: "#7C3AED",
      trend: "+2",
      up: true,
    },
    {
      label: "Completadas",
      value: done,
      icon: CheckCircle2,
      color: "#10B981",
      trend: `${completionRate}%`,
      up: true,
    },
    {
      label: "En curso",
      value: inProgress,
      icon: Clock,
      color: "#3B82F6",
      trend: "+1",
      up: true,
    },
    {
      label: "Vencidas",
      value: overdue,
      icon: AlertTriangle,
      color: "#EF4444",
      trend: overdue > 0 ? `+${overdue}` : "0",
      up: false,
    },
    {
      label: "Horas estimadas",
      value: `${totalHours.toFixed(1)}h`,
      icon: Clock,
      color: "#F59E0B",
      trend: `${hoursPct}%`,
      up: true,
    },
    {
      label: "Horas completadas",
      value: `${doneHours.toFixed(1)}h`,
      icon: CheckCircle2,
      color: "#10B981",
      trend: `${(totalHours - doneHours).toFixed(1)}h rest.`,
      up: false,
    },
  ];

  return (
    <div className="space-y-6 overflow-y-auto pb-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              <span
                className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-[--accent-emerald]" : "text-[--accent-red]"}`}
              >
                {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.trend}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-[--text-primary]">{kpi.value}</p>
              <p className="text-xs text-[--text-secondary] mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 glass rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[--text-primary]">Tareas por columna</h3>
          <div className="space-y-3">
            {(Object.keys(byColumn) as ColumnType[]).map((col) => (
              <div key={col} className="flex items-center gap-3">
                <span className="w-20 text-xs text-[--text-secondary] text-right shrink-0">
                  {COLUMN_LABELS[col]}
                </span>
                <div className="flex-1 h-6 bg-[--bg-hover] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max((byColumn[col] / maxColCount) * 100, byColumn[col] > 0 ? 8 : 0)}%`,
                      backgroundColor: COLUMN_COLORS[col],
                    }}
                  >
                    <span className="text-[10px] text-white font-bold">
                      {byColumn[col]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion rate */}
        <div className="glass rounded-xl p-5 flex flex-col items-center justify-center space-y-3">
          <h3 className="text-sm font-semibold text-[--text-primary] self-start">Tasa de completado</h3>
          <ProgressRing
            pct={completionRate}
            size={120}
            stroke={10}
            color="#10B981"
            label={`${completionRate}%`}
            sublabel="completado"
          />
          <p className="text-xs text-[--text-secondary]">
            {done} de {total} tareas
          </p>
        </div>
      </div>

      {/* Tasks by assignee */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[--text-primary]">Tareas por responsable</h3>
        {assigneeList.length === 0 ? (
          <p className="text-sm text-[--text-muted]">Sin responsables asignados</p>
        ) : (
          <div className="space-y-2">
            {assigneeList.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <UserAvatar
                  userId={a.id}
                  name={a.name}
                  className="h-7 w-7 shrink-0"
                  fallbackClassName="text-[10px] font-semibold"
                />
                <span className="flex-1 text-sm text-[--text-primary] truncate">{a.name}</span>
                <span className="text-sm font-bold text-[--text-secondary] shrink-0">{a.count}</span>
                <ProgressBar
                  pct={(a.count / (assigneeList[0]?.count || 1)) * 100}
                  className="w-24"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[--text-primary]">Proyectos</h3>
        {projects.length === 0 ? (
          <p className="text-sm text-[--text-muted]">Sin proyectos aún</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((p) => {
              const pCards = cards.filter((c) => c.projectId === p.id);
              const pDone = pCards.filter((c) => c.column === "done").length;
              const pPct = pCards.length > 0 ? Math.round((pDone / pCards.length) * 100) : 0;
              return (
                <div
                  key={p.id}
                  className="rounded-xl p-3 border space-y-2"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
                    <span className="text-xs font-semibold text-[--text-primary] truncate flex-1">
                      {p.name}
                    </span>
                    {p.durationWeeks && (
                      <span className="text-[9px] text-[--text-muted] shrink-0">{p.durationWeeks}</span>
                    )}
                  </div>
                  <ProgressBar pct={pPct} color={p.color} />
                  <div className="flex justify-between text-[10px] text-[--text-muted]">
                    <span>{pDone}/{pCards.length} tareas</span>
                    <span>{pPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
