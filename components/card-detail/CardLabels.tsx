// Card label picker — color-coded label management for a card
"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/types";

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#FBBF24", "#10B981",
  "#3B82F6", "#7C3AED", "#EC4899", "#8B5CF6",
];

interface CardLabelsProps {
  labels: Label[];
  onUpdate: (labels: Label[]) => void;
}

export function CardLabels({ labels, onUpdate }: CardLabelsProps) {
  const [open, setOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newColor, setNewColor] = React.useState(PRESET_COLORS[0]);

  const addLabel = () => {
    if (!newName.trim()) return;
    const label: Label = {
      id: `label-${Date.now()}`,
      name: newName.trim(),
      color: newColor,
    };
    onUpdate([...labels, label]);
    setNewName("");
  };

  const removeLabel = (id: string) => {
    onUpdate(labels.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {labels.map((label) => (
          <span
            key={label.id}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
            <button
              onClick={() => removeLabel(label.id)}
              className="ml-0.5 hover:opacity-70 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs text-[--text-secondary] h-7">
            <Plus className="h-3 w-3 mr-1" /> Agregar etiqueta
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Nueva etiqueta</p>
            <Input
              placeholder="Nombre de etiqueta..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLabel()}
              className="h-8 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                    newColor === color ? "ring-2 ring-white ring-offset-1 ring-offset-[--bg-elevated]" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewColor(color)}
                />
              ))}
            </div>
            <Button size="sm" onClick={addLabel} disabled={!newName.trim()} className="w-full h-8">
              Agregar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
