"use client";

import * as React from "react";
import {
  Link, FileText, Plus, Cloud, Folder, FolderOpen,
  ChevronRight, Home, Loader2, AlertCircle, X,
  FileImage, FileSpreadsheet, FileVideo, FileAudio,
  Trash2, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Attachment } from "@/types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { OneDriveItem, OneDrive } from "@/app/api/onedrive/route";

interface CardAttachmentsProps {
  attachments: Attachment[];
  onUpdate: (attachments: Attachment[]) => void;
}

/* ── File-type icon ──────────────────────────────────────────────────────── */
function FileIcon({ ext, className }: { ext?: string; className?: string }) {
  const cls = `h-4 w-4 shrink-0 ${className ?? ""}`;
  if (!ext) return <FileText className={cls} />;
  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"].includes(ext))
    return <FileImage className={cls} style={{ color: "#10B981" }} />;
  if (["xlsx", "xls", "csv"].includes(ext))
    return <FileSpreadsheet className={cls} style={{ color: "#22C55E" }} />;
  if (["mp4", "mov", "avi", "webm"].includes(ext))
    return <FileVideo className={cls} style={{ color: "#A855F7" }} />;
  if (["mp3", "wav", "ogg", "m4a"].includes(ext))
    return <FileAudio className={cls} style={{ color: "#F59E0B" }} />;
  if (["pdf"].includes(ext))
    return <FileText className={cls} style={{ color: "#EF4444" }} />;
  if (["docx", "doc"].includes(ext))
    return <FileText className={cls} style={{ color: "#3B82F6" }} />;
  return <FileText className={cls} style={{ color: "var(--text-secondary)" }} />;
}

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── OneDrive browser dialog ─────────────────────────────────────────────── */
function OneDriveBrowser({ onSelect, onClose }: {
  onSelect: (item: OneDriveItem) => void;
  onClose: () => void;
}) {
  const [drives, setDrives] = React.useState<OneDrive[]>([]);
  const [currentDriveId, setCurrentDriveId] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<OneDriveItem[]>([]);
  const [breadcrumb, setBreadcrumb] = React.useState<{ id: string | null; name: string }[]>([
    { id: null, name: "Inicio" },
  ]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  /* Load drives on mount */
  React.useEffect(() => {
    fetch("/api/onedrive")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setDrives(data.drives ?? []);
        // Auto-select first drive
        if (data.drives?.length) openDrive(data.drives[0].id, data.drives[0].name);
        else setLoading(false);
      })
      .catch(() => setError("No se pudo conectar con OneDrive."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDrive = (driveId: string, driveName: string) => {
    setCurrentDriveId(driveId);
    setBreadcrumb([{ id: null, name: "Inicio" }, { id: driveId, name: driveName }]);
    loadItems(driveId, null);
  };

  const loadItems = (driveId: string, itemId: string | null) => {
    setLoading(true);
    setError(null);
    const url = itemId
      ? `/api/onedrive?driveId=${driveId}&itemId=${itemId}`
      : `/api/onedrive?driveId=${driveId}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setItems(data.items ?? []);
      })
      .catch(() => setError("Error al cargar archivos."))
      .finally(() => setLoading(false));
  };

  const openFolder = (item: OneDriveItem) => {
    setBreadcrumb((prev) => [...prev, { id: item.id, name: item.name }]);
    loadItems(item.driveId, item.id);
  };

  const navigateTo = (index: number) => {
    const crumb = breadcrumb[index];
    const trimmed = breadcrumb.slice(0, index + 1);
    setBreadcrumb(trimmed);
    if (index === 0) {
      // Back to drive list
      setCurrentDriveId(null);
      setItems([]);
      return;
    }
    if (currentDriveId) {
      loadItems(currentDriveId, crumb.id);
    }
  };

  return (
    <div className="flex flex-col h-[480px]">
      {/* Drive tabs */}
      {drives.length > 1 && (
        <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-[--border] shrink-0 overflow-x-auto">
          {drives.map((d) => (
            <button
              key={d.id}
              onClick={() => openDrive(d.id, d.name)}
              className="text-xs px-3 py-1.5 rounded-t font-medium whitespace-nowrap transition-colors"
              style={{
                background: currentDriveId === d.id ? "var(--bg-surface)" : "transparent",
                color: currentDriveId === d.id ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: currentDriveId === d.id ? "2px solid var(--accent-violet)" : "2px solid transparent",
              }}
            >
              <Cloud className="inline h-3 w-3 mr-1.5" />
              {d.name}
            </button>
          ))}
        </div>
      )}

      {/* Breadcrumb */}
      {breadcrumb.length > 1 && (
        <div className="flex items-center gap-1 px-4 py-2 border-b border-[--border] shrink-0 text-xs text-[--text-secondary] overflow-x-auto">
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />}
              <button
                onClick={() => navigateTo(i)}
                className={`flex items-center gap-1 hover:text-[--text-primary] transition-colors shrink-0 ${i === breadcrumb.length - 1 ? "text-[--text-primary] font-medium" : ""}`}
              >
                {i === 0 && <Home className="h-3 w-3" />}
                {i === 1 && <Cloud className="h-3 w-3" />}
                {i > 1 && <Folder className="h-3 w-3" />}
                {i > 0 && crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-[--text-muted]" />
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-32 gap-3 px-4 text-center">
            <AlertCircle className="h-8 w-8 text-[--accent-red] opacity-50" />
            <p className="text-sm text-[--text-secondary]">{error}</p>
            {error.toLowerCase().includes("acceso") && (
              <p className="text-xs text-[--text-muted]">
                Puede que necesites volver a iniciar sesión para conceder acceso a OneDrive.
              </p>
            )}
          </div>
        )}
        {!loading && !error && !currentDriveId && (
          <div className="p-4 grid grid-cols-2 gap-2">
            {drives.map((d) => (
              <button
                key={d.id}
                onClick={() => openDrive(d.id, d.name)}
                className="flex items-center gap-2 p-3 rounded-lg border border-[--border] hover:border-[--border-focus] hover:bg-[--bg-hover] transition-colors text-left"
              >
                <Cloud className="h-5 w-5 text-[--accent-violet] shrink-0" />
                <span className="text-sm text-[--text-primary] truncate">{d.name}</span>
              </button>
            ))}
          </div>
        )}
        {!loading && !error && currentDriveId && items.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-[--text-muted]">
            Carpeta vacía
          </div>
        )}
        {!loading && !error && items.map((item) => (
          <button
            key={item.id}
            onClick={() => item.type === "folder" ? openFolder(item) : onSelect(item)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[--bg-hover] transition-colors text-left group"
          >
            {item.type === "folder" ? (
              <FolderOpen className="h-4 w-4 text-[--accent-yellow] shrink-0 group-hover:text-yellow-400" />
            ) : (
              <FileIcon ext={item.extension} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[--text-primary] truncate">{item.name}</p>
              {item.type === "file" && (
                <p className="text-xs text-[--text-muted]">
                  {formatSize(item.size)}
                  {item.modifiedAt && ` · ${format(parseISO(item.modifiedAt), "d MMM yyyy", { locale: es })}`}
                </p>
              )}
            </div>
            {item.type === "folder" && (
              <ChevronRight className="h-4 w-4 text-[--text-muted] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            {item.type === "file" && (
              <span className="text-[10px] text-[--accent-violet] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                Adjuntar
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function CardAttachments({ attachments, onUpdate }: CardAttachmentsProps) {
  const [addingLink, setAddingLink] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [name, setName] = React.useState("");
  const [browserOpen, setBrowserOpen] = React.useState(false);

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
    setAddingLink(false);
  };

  const addOneDriveFile = (item: OneDriveItem) => {
    const attachment: Attachment = {
      id: `att-od-${Date.now()}`,
      name: item.name,
      url: item.webUrl,
      type: "onedrive",
      addedAt: new Date().toISOString(),
    };
    onUpdate([...attachments, attachment]);
    setBrowserOpen(false);
  };

  const removeAttachment = (id: string) => {
    onUpdate(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-2">
      {/* Existing attachments */}
      {attachments.map((att) => (
        <div
          key={att.id}
          className="flex items-center gap-2 p-2 rounded-md bg-[--bg-hover] border border-[--border] group"
        >
          {att.type === "onedrive" ? (
            <Cloud className="h-4 w-4 text-[--accent-violet] shrink-0" />
          ) : att.type === "link" ? (
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
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-[--bg-surface] text-[--text-muted] hover:text-[--text-primary] transition-colors"
              title="Abrir"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => removeAttachment(att.id)}
              className="p-1 rounded hover:bg-[--bg-surface] text-[--text-muted] hover:text-red-400 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}

      {/* Add link form */}
      {addingLink ? (
        <div className="space-y-2 p-2 bg-[--bg-hover] rounded-md border border-[--border]">
          <Input
            autoFocus
            placeholder="URL del enlace..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addLink(); if (e.key === "Escape") setAddingLink(false); }}
            className="h-8 text-sm"
          />
          <Input
            placeholder="Nombre (opcional)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addLink} disabled={!url.trim()} className="h-7 text-xs">Agregar</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAddingLink(false); setUrl(""); setName(""); }} className="h-7 text-xs">Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAddingLink(true)}
            className="text-xs text-[--text-secondary] h-7 justify-start"
          >
            <Plus className="h-3 w-3 mr-1" /> Agregar enlace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBrowserOpen(true)}
            className="text-xs text-[--text-secondary] h-7 justify-start"
          >
            <Cloud className="h-3 w-3 mr-1" /> Explorar OneDrive / SharePoint
          </Button>
        </div>
      )}

      {/* OneDrive browser dialog */}
      <Dialog open={browserOpen} onOpenChange={(o) => !o && setBrowserOpen(false)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[--border]">
            <DialogTitle className="text-sm font-semibold text-[--text-primary] flex items-center gap-2">
              <Cloud className="h-4 w-4 text-[--accent-violet]" />
              OneDrive / SharePoint
            </DialogTitle>
          </div>
          <OneDriveBrowser
            onSelect={addOneDriveFile}
            onClose={() => setBrowserOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
