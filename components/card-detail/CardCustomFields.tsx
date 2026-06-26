// Custom fields — dynamic typed fields (text/number/select) for cards
"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomField } from "@/types";

interface CardCustomFieldsProps {
  fields: CustomField[];
  onUpdate: (fields: CustomField[]) => void;
}

function FieldInput({
  field,
  onChange,
}: {
  field: CustomField;
  onChange: (value: string | number | null) => void;
}) {
  if (field.type === "select" && field.options) {
    return (
      <Select
        value={field.value?.toString() ?? ""}
        onValueChange={(v) => onChange(v)}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Seleccionar..." />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "number") {
    return (
      <Input
        type="number"
        value={field.value?.toString() ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="h-8 text-sm"
      />
    );
  }
  return (
    <Input
      type="text"
      value={field.value?.toString() ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-8 text-sm"
    />
  );
}

export function CardCustomFields({ fields, onUpdate }: CardCustomFieldsProps) {
  const [adding, setAdding] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newType, setNewType] = React.useState<"text" | "number" | "select">("text");

  const updateField = (id: string, value: string | number | null) => {
    onUpdate(fields.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const addField = () => {
    if (!newName.trim()) return;
    const field: CustomField = {
      id: `cf-${Date.now()}`,
      name: newName.trim(),
      type: newType,
      value: null,
      options: newType === "select" ? ["Opción 1", "Opción 2", "Opción 3"] : undefined,
    };
    onUpdate([...fields, field]);
    setNewName("");
    setNewType("text");
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label className="text-xs text-[--text-secondary] font-medium">{field.name}</label>
          <FieldInput field={field} onChange={(v) => updateField(field.id, v)} />
        </div>
      ))}

      {adding ? (
        <div className="space-y-2 p-3 bg-[--bg-hover] rounded-md border border-[--border]">
          <Input
            autoFocus
            placeholder="Nombre del campo..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-sm"
          />
          <Select value={newType} onValueChange={(v) => setNewType(v as typeof newType)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="select">Selección</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" onClick={addField} disabled={!newName.trim()} className="h-7 text-xs">
              Agregar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setAdding(false); setNewName(""); }}
              className="h-7 text-xs"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdding(true)}
          className="text-xs text-[--text-secondary] h-7"
        >
          <Plus className="h-3 w-3 mr-1" /> Agregar campo personalizado
        </Button>
      )}
    </div>
  );
}
