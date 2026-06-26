// AD User Search — Command palette for searching Active Directory users
"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAD } from "@/hooks/useAD";
import { ADUser } from "@/types";
import { generateAvatarColor, getInitials } from "@/lib/utils";

interface ADUserSearchProps {
  selectedUsers: ADUser[];
  onSelect: (user: ADUser) => void;
  onDeselect: (userId: string) => void;
}

export function ADUserSearch({ selectedUsers, onSelect, onDeselect }: ADUserSearchProps) {
  const { searchUsers } = useAD();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ADUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const found = await searchUsers(query);
      setResults(found);
      setLoading(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchUsers]);

  const isSelected = (userId: string) => selectedUsers.some((u) => u.id === userId);

  const handleSelect = (user: ADUser) => {
    if (isSelected(user.id)) {
      onDeselect(user.id);
    } else {
      onSelect(user);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start text-[--text-secondary]">
            Buscar usuario AD…
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por nombre, email, departamento..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {loading && (
                <div className="py-4 text-center text-xs text-[--text-secondary]">Buscando...</div>
              )}
              {!loading && results.length === 0 && (
                <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
              )}
              {!loading && results.length > 0 && (
                <CommandGroup>
                  {results.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => handleSelect(user)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback
                          style={{ backgroundColor: generateAvatarColor(user.id) }}
                          className="text-white text-[10px]"
                        >
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[--text-primary] truncate">{user.displayName}</p>
                        <p className="text-xs text-[--text-secondary] truncate">{user.title} · {user.department}</p>
                      </div>
                      {isSelected(user.id) && (
                        <Check className="h-4 w-4 text-[--accent-violet] shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedUsers.map((user) => (
            <motion.button
              key={user.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => onDeselect(user.id)}
              className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-0.5 bg-[--bg-hover] border border-[--border] hover:border-[--accent-red] hover:bg-red-950/20 transition-colors"
              title={`Quitar a ${user.displayName}`}
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback
                  style={{ backgroundColor: generateAvatarColor(user.id) }}
                  className="text-white text-[9px]"
                >
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-[--text-primary]">{user.displayName.split(" ")[0]}</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
