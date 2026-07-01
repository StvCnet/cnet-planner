// Checklist section — per-checklist with progress bar and item management
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Pencil, Trash2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checklist, ChecklistItem } from "@/types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface CardChecklistProps {
  checklists: Checklist[];
  onUpdate: (checklists: Checklist[]) => void;
}

function ChecklistSection({
  checklist,
  onChange,
  onDelete,
}: {
  checklist: Checklist;
  onChange: (updated: Checklist) => void;
  onDelete: () => void;
}) {
  const [adding, setAdding] = React.useState(false);
  const [newText, setNewText] = React.useState("");
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState(checklist.title);
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [itemDraft, setItemDraft] = React.useState("");

  const completed = checklist.items.filter((i) => i.completed).length;
  const total = checklist.items.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

  const toggleItem = (itemId: string) => {
    onChange({
      ...checklist,
      items: checklist.items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const deleteItem = (itemId: string) => {
    onChange({ ...checklist, items: checklist.items.filter((i) => i.id !== itemId) });
  };

  const saveTitle = () => {
    setEditingTitle(false);
    const t = titleDraft.trim();
    if (t && t !== checklist.title) onChange({ ...checklist, title: t });
    else setTitleDraft(checklist.title);
  };

  const startEditItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setItemDraft(item.text);
  };

  const saveItem = (itemId: string) => {
    const text = itemDraft.trim();
    if (text) {
      onChange({
        ...checklist,
        items: checklist.items.map((i) => (i.id === itemId ? { ...i, text } : i)),
      });
    }
    setEditingItemId(null);
    setItemDraft("");
  };

  const addItem = () => {
    if (!newText.trim()) return;
    const newItem: ChecklistItem = {
      id: `ci-${Date.now()}`,
      text: newText.trim(),
      completed: false,
    };
    onChange({ ...checklist, items: [...checklist.items, newItem] });
    setNewText("");
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(checklist.title); }
            }}
            className="flex-1 bg-transparent text-sm font-semibold text-[--text-primary] border-b border-[--accent-violet] outline-none pb-0.5"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex-1 text-left text-sm font-semibold text-[--text-primary] hover:text-[--accent-violet] transition-colors group flex items-center gap-1.5"
          >
            {checklist.title}
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-[--text-secondary]">{pct}%</span>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-[--bg-hover] text-[--text-muted] hover:text-red-400 transition-colors"
            title="Eliminar checklist"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <motion.div
        animate={{ scale: allDone ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 0.4 }}
      >
        <Progress value={pct} className={allDone ? "[&>div]:bg-[--accent-emerald]" : ""} />
      </motion.div>

      <div className="space-y-1.5">
        <AnimatePresence>
          {checklist.items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 group"
            >
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
              />

              {editingItemId === item.id ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    autoFocus
                    value={itemDraft}
                    onChange={(e) => setItemDraft(e.target.value)}
                    onBlur={() => saveItem(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveItem(item.id);
                      if (e.key === "Escape") { setEditingItemId(null); setItemDraft(""); }
                    }}
                    className="flex-1 bg-transparent text-sm text-[--text-primary] border-b border-[--accent-violet] outline-none pb-0.5"
                  />
                  <button onClick={() => saveItem(item.id)} className="text-[--accent-emerald]">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setEditingItemId(null); setItemDraft(""); }} className="text-[--text-muted]">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <motion.label
                    htmlFor={item.id}
                    className="flex-1 text-sm cursor-pointer select-none"
                    animate={{ opacity: item.completed ? 0.5 : 1 }}
                  >
                    <motion.span
                      animate={{ textDecoration: item.completed ? "line-through" : "none" }}
                      className={item.completed ? "text-[--text-secondary]" : "text-[--text-primary]"}
                    >
                      {item.text}
                    </motion.span>
                  </motion.label>
                  {item.dueDate && (
                    <span className="text-[10px] text-[--text-muted] shrink-0">
                      {format(parseISO(item.dueDate), "d MMM", { locale: es })}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditItem(item)}
                      className="p-1 rounded hover:bg-[--bg-hover] text-[--text-muted] hover:text-[--text-primary] transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 rounded hover:bg-[--bg-hover] text-[--text-muted] hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {adding ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="Nuevo elemento..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem();
              if (e.key === "Escape") { setAdding(false); setNewText(""); }
            }}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={addItem} className="h-8">
            <Check className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdding(true)}
          className="text-xs text-[--text-secondary] h-7"
        >
          <Plus className="h-3 w-3 mr-1" /> Agregar elemento
        </Button>
      )}
    </div>
  );
}

export function CardChecklist({ checklists, onUpdate }: CardChecklistProps) {
  const updateChecklist = (updated: Checklist) => {
    onUpdate(checklists.map((cl) => (cl.id === updated.id ? updated : cl)));
  };

  const deleteChecklist = (id: string) => {
    onUpdate(checklists.filter((cl) => cl.id !== id));
  };

  const addChecklist = () => {
    const newCl: Checklist = {
      id: `cl-${Date.now()}`,
      title: "Nueva lista",
      items: [],
    };
    onUpdate([...checklists, newCl]);
  };

  return (
    <div className="space-y-6">
      {checklists.map((cl) => (
        <ChecklistSection
          key={cl.id}
          checklist={cl}
          onChange={updateChecklist}
          onDelete={() => deleteChecklist(cl.id)}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addChecklist}
        className="text-xs border-dashed border-[--border] text-[--text-secondary] h-8"
      >
        <Plus className="h-3 w-3 mr-1" /> Agregar checklist
      </Button>
    </div>
  );
}
