"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
import { useAD } from "@/hooks/useAD";
import { Note } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface CardNotesProps {
  notes: Note[];
  onUpdate: (notes: Note[]) => void;
}

const COLORS: Record<Note["color"], { bg: string; strip: string; text: string; muted: string }> = {
  yellow: { bg: "#FEF9C3", strip: "#FDE047", text: "#713F12", muted: "#92400E" },
  green:  { bg: "#DCFCE7", strip: "#86EFAC", text: "#14532D", muted: "#166534" },
  blue:   { bg: "#DBEAFE", strip: "#93C5FD", text: "#1E3A5F", muted: "#1E40AF" },
  pink:   { bg: "#FCE7F3", strip: "#F9A8D4", text: "#701A45", muted: "#9D174D" },
  orange: { bg: "#FFEDD5", strip: "#FDBA74", text: "#7C2D12", muted: "#9A3412" },
  purple: { bg: "#F3E8FF", strip: "#C4B5FD", text: "#3B0764", muted: "#6D28D9" },
};

const COLOR_KEYS = Object.keys(COLORS) as Note["color"][];

/* Deterministic rotation from note id */
function noteRotation(id: string): number {
  const n = parseInt(id.replace(/\D/g, "").slice(-4) || "0", 10);
  const steps = [-1.2, 0.8, -0.4, 1.5, -0.9, 0.3, -1.5, 1.0];
  return steps[n % steps.length];
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Single sticky note ────────────────────────────────────────────────────── */
function StickyNote({
  note,
  isOwn,
  onDelete,
  onEdit,
}: {
  note: Note;
  isOwn: boolean;
  onDelete: () => void;
  onEdit: (text: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(note.text);
  const c = COLORS[note.color];
  const rot = noteRotation(note.id);

  const saveEdit = () => {
    setEditing(false);
    if (draft.trim() && draft !== note.text) onEdit(draft.trim());
    else setDraft(note.text);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, rotate: rot }}
      animate={{ opacity: 1, scale: 1, rotate: rot }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.03, rotate: 0, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative flex flex-col rounded-sm"
      style={{
        background: c.bg,
        boxShadow: "2px 4px 10px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.12)",
        width: 160,
        minHeight: 140,
      }}
    >
      {/* Top sticky strip */}
      <div className="h-7 w-full rounded-t-sm flex items-center px-2 justify-between" style={{ background: c.strip }}>
        <div
          className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
          style={{ background: c.text }}
          title={note.authorName}
        >
          {getInitials(note.authorName)}
        </div>
        {isOwn && (
          <button
            onClick={onDelete}
            className="rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: c.text }}
            title="Eliminar nota"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Note body */}
      <div className="flex-1 p-2.5 flex flex-col gap-1.5">
        {editing ? (
          <div className="flex flex-col gap-1.5 flex-1">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
                if (e.key === "Escape") { setEditing(false); setDraft(note.text); }
              }}
              rows={4}
              maxLength={400}
              className="w-full resize-none outline-none text-xs leading-relaxed rounded"
              style={{ background: "transparent", color: c.text, fontFamily: "inherit" }}
            />
            <button
              onClick={saveEdit}
              className="self-end text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: c.strip, color: c.text }}
            >
              <Check className="h-2.5 w-2.5" />
            </button>
          </div>
        ) : (
          <p
            onClick={isOwn ? () => setEditing(true) : undefined}
            className={`text-xs leading-relaxed flex-1 whitespace-pre-wrap break-words ${isOwn ? "cursor-text" : ""}`}
            style={{ color: c.text }}
          >
            {note.text || <span style={{ opacity: 0.4 }}>Toca para editar…</span>}
          </p>
        )}

        <p className="text-[9px] mt-auto" style={{ color: c.muted, opacity: 0.7 }}>
          {formatDistanceToNow(parseISO(note.createdAt), { addSuffix: true, locale: es })}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Add note form ─────────────────────────────────────────────────────────── */
function AddNoteCard({
  onAdd,
  onCancel,
}: {
  onAdd: (text: string, color: Note["color"]) => void;
  onCancel: () => void;
}) {
  const [text, setText] = React.useState("");
  const [color, setColor] = React.useState<Note["color"]>("yellow");
  const c = COLORS[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col rounded-sm"
      style={{
        background: c.bg,
        boxShadow: "2px 4px 10px rgba(0,0,0,0.22)",
        width: 160,
        minHeight: 140,
      }}
    >
      {/* Strip with color picker */}
      <div className="h-7 w-full rounded-t-sm flex items-center px-2 gap-1" style={{ background: c.strip }}>
        {COLOR_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setColor(k)}
            className="h-3.5 w-3.5 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: COLORS[k].bg,
              borderColor: color === k ? COLORS[k].text : "transparent",
            }}
          />
        ))}
      </div>

      <div className="flex-1 p-2.5 flex flex-col gap-2">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu nota..."
          rows={4}
          maxLength={400}
          className="w-full resize-none outline-none text-xs leading-relaxed rounded flex-1"
          style={{ background: "transparent", color: c.text, fontFamily: "inherit" }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && text.trim()) onAdd(text.trim(), color);
          }}
        />
        <div className="flex gap-1">
          <button
            onClick={() => text.trim() && onAdd(text.trim(), color)}
            disabled={!text.trim()}
            className="flex-1 text-[10px] font-semibold py-0.5 rounded disabled:opacity-40 transition-opacity"
            style={{ background: c.strip, color: c.text }}
          >
            Guardar
          </button>
          <button
            onClick={onCancel}
            className="text-[10px] px-2 py-0.5 rounded opacity-60 hover:opacity-100"
            style={{ color: c.text }}
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main export ───────────────────────────────────────────────────────────── */
export function CardNotes({ notes, onUpdate }: CardNotesProps) {
  const { currentUser } = useAD();
  const [adding, setAdding] = React.useState(false);

  const addNote = (text: string, color: Note["color"]) => {
    const note: Note = {
      id: `note-${Date.now()}`,
      text,
      color,
      authorId: currentUser?.id ?? "unknown",
      authorName: currentUser?.displayName ?? "Usuario",
      createdAt: new Date().toISOString(),
    };
    onUpdate([...(notes ?? []), note]);
    setAdding(false);
  };

  const deleteNote = (id: string) => {
    onUpdate((notes ?? []).filter((n) => n.id !== id));
  };

  const editNote = (id: string, text: string) => {
    onUpdate((notes ?? []).map((n) => (n.id === id ? { ...n, text } : n)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-start">
        <AnimatePresence mode="popLayout">
          {(notes ?? []).map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              isOwn={note.authorId === currentUser?.id}
              onDelete={() => deleteNote(note.id)}
              onEdit={(text) => editNote(note.id, text)}
            />
          ))}
          {adding && (
            <AddNoteCard
              key="add-form"
              onAdd={addNote}
              onCancel={() => setAdding(false)}
            />
          )}
        </AnimatePresence>

        {!adding && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setAdding(true)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-sm border-2 border-dashed transition-all duration-200 hover:border-[--border-focus] hover:bg-[--bg-hover]"
            style={{
              width: 160,
              minHeight: 140,
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">Agregar nota</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
