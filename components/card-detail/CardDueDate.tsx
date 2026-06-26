// Due date picker — calendar popover for selecting a card due date
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface CardDueDateProps {
  dueDate?: string;
  onUpdate: (date: string | undefined) => void;
}

export function CardDueDate({ dueDate, onUpdate }: CardDueDateProps) {
  const [open, setOpen] = React.useState(false);
  const selected = dueDate ? parseISO(dueDate) : undefined;

  const handleSelect = (date: Date | undefined) => {
    onUpdate(date ? date.toISOString() : undefined);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start text-left font-normal h-9"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[--text-secondary]" />
            {selected ? (
              <span className="text-[--text-primary]">
                {format(selected, "d MMM yyyy", { locale: es })}
              </span>
            ) : (
              <span className="text-[--text-muted]">Sin fecha límite</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {selected && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-[--text-muted] hover:text-[--accent-red]"
          onClick={() => onUpdate(undefined)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
