// Full card detail modal/sheet with all editable sections
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardLabels } from "@/components/card-detail/CardLabels";
import { CardChecklist } from "@/components/card-detail/CardChecklist";
import { CardDueDate } from "@/components/card-detail/CardDueDate";
import { CardAssignees } from "@/components/card-detail/CardAssignees";
import { CardAttachments } from "@/components/card-detail/CardAttachments";
import { CardCustomFields } from "@/components/card-detail/CardCustomFields";
import { useBoard } from "@/hooks/useBoard";
import { CardType, Label, Checklist, ADUser, Attachment, CustomField } from "@/types";

interface CardModalProps {
  card: CardType;
  open: boolean;
  onClose: () => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baja", color: "#10B981" },
  { value: "medium", label: "Media", color: "#FBBF24" },
  { value: "high", label: "Alta", color: "#F97316" },
  { value: "critical", label: "Crítica", color: "#EF4444" },
] as const;

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[--text-secondary]">{title}</h4>
      {children}
    </div>
  );
}

function ModalContent({ card, onClose }: { card: CardType; onClose: () => void }) {
  const { dispatch } = useBoard();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [editingTitle, setEditingTitle] = useState(false);

  const update = (updates: Partial<CardType>) => {
    dispatch({ type: "UPDATE_CARD", cardId: card.id, updates });
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (title.trim() && title !== card.title) {
      update({ title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (card.description ?? "")) {
      update({ description });
    }
  };

  const handleDelete = () => {
    dispatch({ type: "DELETE_CARD", cardId: card.id });
    onClose();
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Title */}
        <div>
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
              className="w-full bg-transparent text-lg font-semibold text-[--text-primary] focus:outline-none border-b border-[--accent-violet] pb-1"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-lg font-semibold text-[--text-primary] cursor-pointer hover:text-[--accent-violet-bright] transition-colors"
            >
              {card.title}
            </h2>
          )}
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[--text-secondary]">Descripción</h4>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="Agrega una descripción más detallada..."
            rows={4}
            className="w-full bg-[--bg-surface]"
          />
        </div>

        {/* Checklists */}
        {card.checklists && card.checklists.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[--text-secondary]">Checklists</h4>
            <CardChecklist
              checklists={card.checklists}
              onUpdate={(checklists: Checklist[]) => update({ checklists })}
            />
          </div>
        )}

        {/* Custom fields */}
        {card.customFields && card.customFields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[--text-secondary]">Campos personalizados</h4>
            <CardCustomFields
              fields={card.customFields}
              onUpdate={(customFields: CustomField[]) => update({ customFields })}
            />
          </div>
        )}

        {/* Add checklist / custom field buttons if none exist */}
        {(!card.checklists || card.checklists.length === 0) && (
          <CardChecklist
            checklists={[]}
            onUpdate={(checklists: Checklist[]) => update({ checklists })}
          />
        )}

        {(!card.customFields || card.customFields.length === 0) && (
          <CardCustomFields
            fields={[]}
            onUpdate={(customFields: CustomField[]) => update({ customFields })}
          />
        )}
      </div>

      {/* Sidebar */}
      <div className="md:w-56 shrink-0 space-y-5">
        <SidebarSection title="Etiquetas">
          <CardLabels
            labels={card.labels ?? []}
            onUpdate={(labels: Label[]) => update({ labels })}
          />
        </SidebarSection>

        <SidebarSection title="Fecha límite">
          <CardDueDate
            dueDate={card.dueDate}
            onUpdate={(dueDate: string | undefined) => update({ dueDate })}
          />
        </SidebarSection>

        <SidebarSection title="Prioridad">
          <Select
            value={card.priority ?? ""}
            onValueChange={(v) => update({ priority: v as CardType["priority"] })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Sin prioridad" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SidebarSection>

        <SidebarSection title="Responsables">
          <CardAssignees
            assignees={card.assignees ?? []}
            onUpdate={(assignees: ADUser[]) => update({ assignees })}
          />
        </SidebarSection>

        <SidebarSection title="Adjuntos">
          <CardAttachments
            attachments={card.attachments ?? []}
            onUpdate={(attachments: Attachment[]) => update({ attachments })}
          />
        </SidebarSection>

        <SidebarSection title="Campos personalizados">
          <CardCustomFields
            fields={card.customFields ?? []}
            onUpdate={(customFields: CustomField[]) => update({ customFields })}
          />
        </SidebarSection>

        <Separator />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar tarjeta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tarjeta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La tarjeta &quot;{card.title}&quot; será eliminada permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function CardModal({ card, open, onClose }: CardModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetTitle className="sr-only">{card.title}</SheetTitle>
          <ModalContent card={card} onClose={onClose} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="sr-only">{card.title}</DialogTitle>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              <ModalContent card={card} onClose={onClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
