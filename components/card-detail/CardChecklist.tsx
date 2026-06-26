// Checklist section — per-checklist with progress bar and item management
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check } from "lucide-react";
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
}: {
  checklist: Checklist;
  onChange: (updated: Checklist) => void;
}) {
  const [adding, setAdding] = React.useState(false);
  const [newText, setNewText] = React.useState("");

  const completed = checklist.items.filter((i) => i.completed).length;
  const total = checklist.items.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

  const toggleItem = (itemId: string) => {
    const updated: Checklist = {
      ...checklist,
      items: checklist.items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    };
    onChange(updated);
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
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[--text-primary]">{checklist.title}</h4>
        <span className="text-xs text-[--text-secondary]">{pct}%</span>
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
        <ChecklistSection key={cl.id} checklist={cl} onChange={updateChecklist} />
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
