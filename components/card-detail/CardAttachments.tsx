// Attachment list — mock file/link attachment display for cards
"use client";

import * as React from "react";
import { Link, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Attachment } from "@/types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface CardAttachmentsProps {
  attachments: Attachment[];
  onUpdate: (attachments: Attachment[]) => void;
}

export function CardAttachments({ attachments, onUpdate }: CardAttachmentsProps) {
  const [adding, setAdding] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [name, setName] = React.useState("");

  const addLink = () => {
    if (!url.trim()) return;
    const attachment: Attachment = {
      id: `att-${Date.now()}`,
      name: name.trim() || url,
      url: url.trim(),
      type: "link",
      addedAt: new Date().toISOString(),
    };
    onUpdate([...attachments, attachment]);
    setUrl("");
    setName("");
    setAdding(false);
  };

  return (
    <div className="space-y-2">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="flex items-center gap-2 p-2 rounded-md bg-[--bg-hover] border border-[--border] hover:border-[--border-focus] transition-colors"
        >
          {att.type === "link" ? (
            <Link className="h-4 w-4 text-[--accent-blue] shrink-0" />
          ) : (
            <FileText className="h-4 w-4 text-[--text-secondary] shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[--text-primary] truncate">{att.name}</p>
            <p className="text-xs text-[--text-muted]">
              {format(parseISO(att.addedAt), "d MMM yyyy", { locale: es })}
            </p>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="space-y-2 p-2 bg-[--bg-hover] rounded-md border border-[--border]">
          <Input
            autoFocus
            placeholder="URL del enlace..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 text-sm"
          />
          <Input
            placeholder="Nombre (opcional)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addLink} disabled={!url.trim()} className="h-7 text-xs">
              Agregar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setAdding(false); setUrl(""); setName(""); }}
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
          <Plus className="h-3 w-3 mr-1" /> Agregar enlace
        </Button>
      )}
    </div>
  );
}
