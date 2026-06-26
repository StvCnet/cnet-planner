// Inline add-card form at the bottom of each column
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { Check, X } from "lucide-react";
import { useBoard } from "@/hooks/useBoard";
import { ColumnType, CardType } from "@/types";

interface AddCardProps {
  column: ColumnType;
}

export function AddCard({ column }: AddCardProps) {
  const { dispatch } = useBoard();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      title: text.trim(),
      column,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_CARD", card: newCard });
    setText("");
    setAdding(false);
  };

  const handleCancel = () => {
    setText("");
    setAdding(false);
  };

  return (
    <div className="mt-2">
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 space-y-2">
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                  if (e.key === "Escape") handleCancel();
                }}
                placeholder="Título de la tarjeta..."
                className="w-full resize-none rounded-md border border-[--border-focus] bg-[--bg-elevated] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:ring-1 focus:ring-[--accent-violet]"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-[--accent-violet] px-3 py-1.5 text-xs font-medium text-white hover:bg-[--accent-violet-bright] disabled:opacity-40 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  Agregar
                </button>
                <button
                  onClick={handleCancel}
                  className="rounded-md p-1.5 text-[--text-muted] hover:text-[--text-secondary] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-xs text-[--text-muted] hover:text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
        >
          <FiPlus className="h-4 w-4" />
          Agregar tarjeta
        </button>
      )}
    </div>
  );
}
