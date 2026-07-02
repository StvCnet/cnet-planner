"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ArrowLeft, Users, Trash2, CheckSquare,
  FolderKanban, ChevronRight, X, Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useProjects } from "@/context/ProjectContext";
import { useAD } from "@/hooks/useAD";
import { Project, ADUser, CardType } from "@/types";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useBoard } from "@/hooks/useBoard";

const PROJECT_COLORS = [
  "#073c81", "#7b8d1c", "#7C3AED", "#0891B2",
  "#DC2626", "#D97706", "#059669", "#DB2777",
];

/* ─── Create Project Modal ──────────────────────────────────────────────── */
function CreateProjectModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (name: string, desc: string, color: string, durationWeeks: string) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [duration, setDuration] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[--text-primary]">Nuevo proyecto</h2>
          <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[--text-secondary] mb-1 block">Nombre *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Migración a la nube"
              className="w-full rounded-lg border border-[--border] bg-[--bg-surface] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--border-focus]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-secondary] mb-1 block">Descripción</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="Descripción del proyecto"
              className="w-full rounded-lg border border-[--border] bg-[--bg-surface] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--border-focus] resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-secondary] mb-1 block">Duración estimada</label>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ej. 1-4 semanas"
              className="w-full rounded-lg border border-[--border] bg-[--bg-surface] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--border-focus]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-secondary] mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "var(--text-primary)" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg py-2 text-sm border border-[--border] text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => { if (name.trim()) { onCreate(name.trim(), desc.trim(), color, duration.trim()); onClose(); } }}
            disabled={!name.trim()}
            className="flex-1 rounded-lg py-2 text-sm text-white font-medium transition-colors disabled:opacity-40"
            style={{ background: color }}
          >
            Crear proyecto
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Add Task Modal ────────────────────────────────────────────────────── */
function AddTaskModal({ projectColor, onClose, onAdd }: {
  projectColor: string;
  onClose: () => void;
  onAdd: (task: Pick<CardType, "title" | "description" | "priority" | "dueDate">) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CardType["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[--text-primary]">Nueva tarea</h2>
          <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[--text-secondary] mb-1 block">Título *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descripción de la tarea"
              className="w-full rounded-lg border border-[--border] bg-[--bg-surface] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--border-focus]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-secondary] mb-1 block">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[--border] bg-[--bg-surface] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--border-focus] resize-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-[--text-secondary] mb-1 block">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CardType["priority"])}
                className="w-full rounded-lg border border-[--border] bg-[--bg-surface] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--border-focus]"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-[--text-secondary] mb-1 block">Fecha límite</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-[--border] bg-[--bg-surface] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--border-focus]"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg py-2 text-sm border border-[--border] text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (title.trim()) {
                onAdd({ title: title.trim(), description: description.trim() || undefined, priority, dueDate: dueDate || undefined });
                onClose();
              }
            }}
            disabled={!title.trim()}
            className="flex-1 rounded-lg py-2 text-sm text-white font-medium transition-colors disabled:opacity-40"
            style={{ background: projectColor }}
          >
            Agregar tarea
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Add Member Search ─────────────────────────────────────────────────── */
function AddMemberSearch({ project, onAdd, onClose }: {
  project: Project;
  onAdd: (user: ADUser) => void;
  onClose: () => void;
}) {
  const { searchUsers } = useAD();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ADUser[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const found = await searchUsers(q);
    setResults(found.filter((u) => !project.members.find((m) => m.id === u.id)));
    setLoading(false);
  }, [searchUsers, project.members]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl p-5 shadow-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[--text-primary]">Agregar miembro</h3>
          <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
          placeholder="Buscar por nombre o email..."
          className="w-full rounded-lg border border-[--border] bg-[--bg-surface] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--border-focus] mb-3"
        />
        <div className="max-h-48 overflow-y-auto space-y-1">
          {loading && <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-[--text-muted]" /></div>}
          {!loading && results.map((user) => (
            <button
              key={user.id}
              onClick={() => { onAdd(user); setQuery(""); setResults([]); }}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-[--bg-hover] transition-colors text-left"
            >
              <UserAvatar
                userId={user.id}
                name={user.displayName}
                className="h-8 w-8 shrink-0"
                fallbackClassName="text-xs font-bold"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[--text-primary] truncate">{user.displayName}</p>
                <p className="text-xs text-[--text-muted] truncate">{user.title || user.department}</p>
              </div>
            </button>
          ))}
          {!loading && query && results.length === 0 && (
            <p className="text-xs text-center text-[--text-muted] py-4">No se encontraron usuarios</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Project Detail ────────────────────────────────────────────────────── */
function ProjectDetail({ project, canManage, onBack }: {
  project: Project;
  canManage: boolean;
  onBack: () => void;
}) {
  const { addMember, removeMember, addTask, updateProject } = useProjects();
  const { state } = useBoard();
  const { users } = useAD();
  const creator = users.find((u) => u.id === project.createdBy);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);
  const [duration, setDuration] = useState(project.durationWeeks ?? "");

  const saveDuration = () => {
    setEditingDuration(false);
    const trimmed = duration.trim();
    if (trimmed !== (project.durationWeeks ?? "")) {
      updateProject(project.id, { durationWeeks: trimmed || undefined });
    }
  };

  const projectCards = state.cards.filter((c) => c.projectId === project.id);
  const todoCards = projectCards.filter((c) => c.column === "todo");
  const doingCards = projectCards.filter((c) => c.column === "doing");
  const doneCards = projectCards.filter((c) => c.column === "done");

  const completionRate = projectCards.length > 0
    ? Math.round((doneCards.length / projectCards.length) * 100)
    : 0;

  const totalHours = projectCards.reduce((sum, c) => sum + (c.estimatedHours ?? 0), 0);
  const doneHours = doneCards.reduce((sum, c) => sum + (c.estimatedHours ?? 0), 0);

  const checklistItems = projectCards.flatMap((c) => c.checklists?.flatMap((cl) => cl.items) ?? []);
  const doneChecklistItems = checklistItems.filter((i) => i.completed).length;

  const PRIORITY_COLORS: Record<string, string> = {
    low: "#10B981", medium: "#FBBF24", high: "#F97316", critical: "#EF4444",
  };

  const COLUMN_LABELS: Record<string, string> = {
    todo: "Por hacer", doing: "En progreso", done: "Hecho", backlog: "Atrasado",
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[--border] shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-[--bg-hover] text-[--text-secondary] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="h-8 w-8 rounded-xl shrink-0" style={{ backgroundColor: project.color }} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[--text-primary] truncate">{project.name}</h2>
            {editingDuration ? (
              <input
                autoFocus
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                onBlur={saveDuration}
                onKeyDown={(e) => e.key === "Enter" && saveDuration()}
                placeholder="Ej. 1-4 semanas"
                className="w-32 shrink-0 rounded-full border border-[--border] bg-[--bg-surface] px-2 py-0.5 text-[10px] text-[--text-primary] outline-none focus:border-[--border-focus]"
              />
            ) : (project.durationWeeks || canManage) ? (
              <button
                onClick={() => canManage && setEditingDuration(true)}
                className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors"
                style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}
                disabled={!canManage}
              >
                {project.durationWeeks || "+ duración"}
              </button>
            ) : null}
          </div>
          {project.description && (
            <p className="text-xs text-[--text-muted] truncate">{project.description}</p>
          )}
          {creator && (
            <div className="flex items-center gap-1.5 mt-1">
              <UserAvatar
                userId={creator.id}
                name={creator.displayName}
                className="h-4 w-4"
                fallbackClassName="text-[7px] font-bold"
              />
              <span className="text-[10px] text-[--text-muted]">
                Creado por {creator.displayName}
              </span>
              {creator.isAdmin && (
                <span
                  className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--accent-violet)", color: "white" }}
                >
                  Admin
                </span>
              )}
            </div>
          )}
        </div>
        <div className="ml-auto flex gap-2">
          {canManage && (
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
              style={{ background: project.color }}
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva tarea
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Project dashboard — KPI strip */}
        {projectCards.length > 0 && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              className="rounded-xl p-3 border flex items-center gap-3"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
              <ProgressRing pct={completionRate} size={48} stroke={5} color={project.color} />
              <div className="min-w-0">
                <p className="text-lg font-bold text-[--text-primary]">{completionRate}%</p>
                <p className="text-[10px] text-[--text-muted]">
                  {doneCards.length}/{projectCards.length} tareas
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-3 border space-y-1.5"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[--text-muted]">Horas</p>
              <p className="text-lg font-bold text-[--text-primary]">
                {doneHours.toFixed(1)}
                <span className="text-xs font-normal text-[--text-muted]"> / {totalHours.toFixed(1)}h</span>
              </p>
              <ProgressBar
                pct={totalHours > 0 ? (doneHours / totalHours) * 100 : 0}
                color={project.color}
              />
            </div>

            <div
              className="rounded-xl p-3 border space-y-1.5"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[--text-muted]">Checklists</p>
              <p className="text-lg font-bold text-[--text-primary]">
                {doneChecklistItems}
                <span className="text-xs font-normal text-[--text-muted]"> / {checklistItems.length} ítems</span>
              </p>
              <ProgressBar
                pct={checklistItems.length > 0 ? (doneChecklistItems / checklistItems.length) * 100 : 0}
                color={project.color}
              />
            </div>

            <div
              className="rounded-xl p-3 border space-y-1"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[--text-muted]">Por columna</p>
              <div className="flex items-center justify-between text-xs text-[--text-secondary]">
                <span>Por hacer</span><span className="font-semibold text-[--text-primary]">{todoCards.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[--text-secondary]">
                <span>En progreso</span><span className="font-semibold text-[--text-primary]">{doingCards.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[--text-secondary]">
                <span>Hecho</span><span className="font-semibold text-[--text-primary]">{doneCards.length}</span>
              </div>
            </div>
          </section>
        )}

        {/* Members */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[--text-secondary]" />
              <h3 className="text-sm font-semibold text-[--text-primary]">
                Miembros ({project.members.length})
              </h3>
            </div>
            {canManage && (
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-1 text-xs text-[--accent-violet] hover:underline"
              >
                <Plus className="h-3 w-3" />
                Agregar
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {project.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 rounded-xl px-3 py-2 border"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
              >
                <UserAvatar
                  userId={member.id}
                  name={member.displayName}
                  className="h-7 w-7 shrink-0"
                  fallbackClassName="text-xs font-bold"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[--text-primary] truncate max-w-[120px]">
                    {member.displayName}
                  </p>
                  <p className="text-[10px] text-[--text-muted] truncate max-w-[120px]">
                    {member.title || member.department}
                  </p>
                </div>
                {canManage && member.id !== project.createdBy && (
                  <button
                    onClick={() => removeMember(project.id, member.id)}
                    className="ml-1 text-[--text-muted] hover:text-[--accent-red] transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tasks grouped by column */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="h-4 w-4 text-[--text-secondary]" />
            <h3 className="text-sm font-semibold text-[--text-primary]">
              Tareas ({projectCards.length})
            </h3>
          </div>

          {projectCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[--text-muted]">
              <CheckSquare className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">Sin tareas aún</p>
              {canManage && (
                <button
                  onClick={() => setShowAddTask(true)}
                  className="mt-3 text-xs text-[--accent-violet] hover:underline"
                >
                  Crear la primera tarea
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { cards: todoCards, label: "Por hacer", color: "#073c81" },
                { cards: doingCards, label: "En progreso", color: "#7b8d1c" },
                { cards: doneCards, label: "Hecho", color: "#10B981" },
              ].map(({ cards, label, color }) =>
                cards.length > 0 ? (
                  <div key={label}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[--text-secondary]">
                        {label} ({cards.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 border"
                          style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
                        >
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: PRIORITY_COLORS[card.priority ?? "medium"] }}
                          />
                          <p className="text-sm text-[--text-primary] flex-1 truncate">{card.title}</p>
                          {card.dueDate && (
                            <span className="text-[10px] text-[--text-muted] shrink-0">
                              {new Date(card.dueDate).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                            </span>
                          )}
                          {card.estimatedHours !== undefined && (
                            <span className="text-[10px] font-medium text-[--text-muted] shrink-0">
                              {card.estimatedHours}h
                            </span>
                          )}
                          <div className="flex -space-x-1.5">
                            {card.assignees?.slice(0, 3).map((a) => (
                              <UserAvatar
                                key={a.id}
                                userId={a.id}
                                name={a.displayName}
                                title={a.displayName}
                                className="h-5 w-5 border-2 border-[--bg-surface]"
                                fallbackClassName="text-[8px] font-bold"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddMember && (
          <AddMemberSearch
            project={project}
            onAdd={(user) => addMember(project.id, user)}
            onClose={() => setShowAddMember(false)}
          />
        )}
        {showAddTask && (
          <AddTaskModal
            projectColor={project.color}
            onClose={() => setShowAddTask(false)}
            onAdd={(task) => addTask(project.id, task)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Projects List ─────────────────────────────────────────────────────── */
export function ProjectsView() {
  const { projects, createProject, deleteProject, getProjectsForUser } = useProjects();
  const { data: session } = useSession();
  const { currentUser, users } = useAD();
  const { state } = useBoard();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const isAdmin = session?.isAdmin ?? false;

  const myProjects = currentUser ? getProjectsForUser(currentUser.id) : projects;
  const allProjects = isAdmin ? projects : myProjects;
  const canManage = (project: Project) => isAdmin || project.createdBy === currentUser?.id;

  const taskCount = (projectId: string) =>
    state.cards.filter((c) => c.projectId === projectId).length;

  const doneCount = (projectId: string) =>
    state.cards.filter((c) => c.projectId === projectId && c.column === "done").length;

  // If a selected project was updated externally, keep it in sync
  const currentProject = selectedProject
    ? projects.find((p) => p.id === selectedProject.id) ?? null
    : null;

  if (currentProject) {
    return (
      <ProjectDetail
        project={currentProject}
        canManage={canManage(currentProject)}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[--border] shrink-0">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-[--accent-violet]" />
          <h2 className="text-sm font-semibold text-[--text-primary]">Proyectos</h2>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}
          >
            {allProjects.length}
          </span>
        </div>
        {currentUser && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
            style={{ background: "var(--accent-violet)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo proyecto
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {allProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[--text-muted]">
            <FolderKanban className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm">
              {isAdmin ? "Crea el primer proyecto para tu equipo" : "Aún no tienes proyectos"}
            </p>
            {currentUser && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 text-xs text-[--accent-violet] hover:underline"
              >
                Crear proyecto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {allProjects.map((project) => {
                const total = taskCount(project.id);
                const done = doneCount(project.id);
                const progress = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedProject(project)}
                    className="group relative rounded-2xl p-5 border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      background: "var(--bg-elevated)",
                      borderColor: "var(--border)",
                      boxShadow: "4px 4px 12px rgba(0,0,0,0.06), -2px -2px 8px rgba(255,255,255,0.8)",
                    }}
                  >
                    {/* Color accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                      style={{ backgroundColor: project.color }}
                    />

                    {canManage(project) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[--text-muted] hover:text-[--accent-red] transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <div className="flex items-start gap-3 mt-2">
                      <div
                        className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: `${project.color}20` }}
                      >
                        <FolderKanban className="h-5 w-5" style={{ color: project.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[--text-primary] truncate">
                            {project.name}
                          </h3>
                          {project.durationWeeks && (
                            <span
                              className="shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}
                            >
                              {project.durationWeeks}
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-xs text-[--text-muted] mt-0.5 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        {(() => {
                          const creator = users.find((u) => u.id === project.createdBy);
                          if (!creator) return null;
                          return (
                            <div className="flex items-center gap-1 mt-1.5">
                              <UserAvatar
                                userId={creator.id}
                                name={creator.displayName}
                                className="h-4 w-4"
                                fallbackClassName="text-[7px] font-bold"
                              />
                              <span className="text-[9px] text-[--text-muted] truncate">
                                {creator.displayName}
                              </span>
                              {creator.isAdmin && (
                                <span
                                  className="text-[8px] font-semibold px-1 py-0.5 rounded-full shrink-0"
                                  style={{ background: "var(--accent-violet)", color: "white" }}
                                >
                                  Admin
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] text-[--text-muted] mb-1">
                        <span>{done}/{total} tareas</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[--bg-hover] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, backgroundColor: project.color }}
                        />
                      </div>
                    </div>

                    {/* Members + arrow */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 5).map((m) => (
                          <UserAvatar
                            key={m.id}
                            userId={m.id}
                            name={m.displayName}
                            title={m.displayName}
                            className="h-6 w-6 border-2 border-[--bg-elevated]"
                            fallbackClassName="text-[9px] font-bold"
                          />
                        ))}
                        {project.members.length > 5 && (
                          <div
                            className="h-6 w-6 rounded-full border-2 flex items-center justify-center text-[9px] font-medium"
                            style={{
                              background: "var(--bg-hover)",
                              borderColor: "var(--bg-elevated)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            +{project.members.length - 5}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-[--text-muted] group-hover:text-[--accent-violet] transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateProjectModal
            onClose={() => setShowCreate(false)}
            onCreate={(name, desc, color, duration) => createProject(name, desc, color, duration || undefined)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
