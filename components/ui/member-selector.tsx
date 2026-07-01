"use client";

import * as React from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Plus, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAvatarColor, getInitials } from "@/lib/utils";

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface MemberSelectorProps {
  members: Member[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  maxVisible?: number;
  label?: string;
  className?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

interface AvatarBubbleProps {
  member: Member;
  isSelected: boolean;
  size?: number;
  onClick?: () => void;
}

function AvatarBubble({ member, isSelected, size = 48, onClick }: AvatarBubbleProps) {
  const [imgError, setImgError] = React.useState(false);
  const bg = generateAvatarColor(member.id);
  const initials = getInitials(member.name);
  const showImg = !!member.avatar && !imgError;

  const inner = (
    <div
      className={cn(
        "relative rounded-full overflow-hidden transition-all duration-200 flex items-center justify-center",
        !isSelected && "opacity-50"
      )}
      style={{ width: size, height: size }}
    >
      {showImg ? (
        <img
          src={member.avatar}
          alt={member.name}
          className={cn("w-full h-full object-cover transition-all duration-200", !isSelected && "grayscale")}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-semibold"
          style={{
            backgroundColor: isSelected ? bg : "var(--bg-hover)",
            color: isSelected ? "white" : "var(--text-secondary)",
            fontSize: size < 40 ? 10 : 13,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );

  if (!onClick) return inner;

  return (
    <motion.button
      layoutId={`member-${member.id}`}
      onClick={onClick}
      className="group relative flex flex-col items-center gap-1.5 outline-none cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div
        className={cn(
          "relative rounded-full overflow-hidden transition-all duration-200",
          "group-focus-visible:ring-2 group-focus-visible:ring-[--border-focus] group-focus-visible:ring-offset-2",
          !isSelected && "opacity-50 hover:opacity-75"
        )}
        style={{ width: size, height: size }}
      >
        {showImg ? (
          <img
            src={member.avatar}
            alt={member.name}
            className={cn("w-full h-full object-cover transition-all duration-200", !isSelected && "grayscale")}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-semibold"
            style={{
              backgroundColor: isSelected ? bg : "var(--bg-hover)",
              color: isSelected ? "white" : "var(--text-secondary)",
              fontSize: 13,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      <AnimatePresence>
        {!isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute flex items-center justify-center rounded-full shadow-sm"
            style={{
              bottom: 20,
              right: 0,
              width: 16,
              height: 16,
              background: "var(--text-primary)",
            }}
          >
            <Plus className="w-2.5 h-2.5 text-[--bg-surface]" strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.span
        layoutId={`member-name-${member.id}`}
        className={cn(
          "text-xs font-medium truncate max-w-[60px] transition-colors duration-200",
          isSelected ? "text-[--text-primary]" : "text-[--text-muted]"
        )}
      >
        {member.name.split(" ")[0]}
      </motion.span>
    </motion.button>
  );
}

function AddButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 outline-none cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-200",
          "group-focus-visible:ring-2 group-focus-visible:ring-[--border-focus] group-focus-visible:ring-offset-2",
          isOpen
            ? "border-[--accent-violet] bg-[--accent-violet]/10"
            : "border-[--border] hover:border-[--border-focus] hover:bg-[--bg-hover]"
        )}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus
            className={cn(
              "w-5 h-5 transition-colors duration-200",
              isOpen ? "text-[--accent-violet-bright]" : "text-[--text-secondary]"
            )}
          />
        </motion.div>
      </div>
      <span
        className={cn(
          "text-xs font-medium transition-colors duration-200",
          isOpen ? "text-[--accent-violet-bright]" : "text-[--text-secondary]"
        )}
      >
        Agregar
      </span>
    </motion.button>
  );
}

interface DropdownProps {
  members: Member[];
  selected: string[];
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  emptyText?: string;
}

function Dropdown({
  members,
  selected,
  onSelect,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Buscar por nombre o correo...",
  emptyText = "No se encontraron usuarios.",
}: DropdownProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredMembers = React.useMemo(() => {
    const q = searchQuery.toLowerCase();
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const aS = selected.includes(a.id);
        const bS = selected.includes(b.id);
        if (aS && !bS) return -1;
        if (!aS && bS) return 1;
        return 0;
      });
  }, [members, selected, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute top-full right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden z-50"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {/* Search */}
      <div className="p-3 border-b border-[--border]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-muted]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-colors placeholder:text-[--text-muted]"
            style={{
              background: "var(--bg-hover)",
              color: "var(--text-primary)",
              border: "1px solid transparent",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
            onBlur={(e) => (e.target.style.borderColor = "transparent")}
          />
        </div>
      </div>

      {/* List */}
      <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[--border] [&::-webkit-scrollbar-thumb]:rounded-full">
        <AnimatePresence mode="popLayout">
          {filteredMembers.map((member, index) => {
            const isSel = selected.includes(member.id);
            return (
              <DropdownRow
                key={member.id}
                member={member}
                isSelected={isSel}
                index={index}
                onSelect={onSelect}
              />
            );
          })}
        </AnimatePresence>

        {filteredMembers.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-[--text-muted]">
            {emptyText}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DropdownRow({
  member,
  isSelected,
  index,
  onSelect,
}: {
  member: Member;
  isSelected: boolean;
  index: number;
  onSelect: (id: string) => void;
}) {
  const [imgError, setImgError] = React.useState(false);
  const bg = generateAvatarColor(member.id);
  const showImg = !!member.avatar && !imgError;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.015, duration: 0.12 }}
      onClick={() => onSelect(member.id)}
      className="w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors text-left"
      style={{
        background: isSelected ? "var(--accent-violet-dim, rgba(124,58,237,0.06))" : "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = isSelected
          ? "var(--accent-violet-dim, rgba(124,58,237,0.1))"
          : "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = isSelected
          ? "var(--accent-violet-dim, rgba(124,58,237,0.06))"
          : "transparent";
      }}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-full overflow-hidden flex-shrink-0 transition-all duration-200 flex items-center justify-center",
          !isSelected && "grayscale opacity-60"
        )}
        style={{ background: bg }}
      >
        {showImg ? (
          <img
            src={member.avatar}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-white text-xs font-semibold">
            {getInitials(member.name)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-left min-w-0">
        <div
          className="text-sm font-medium truncate"
          style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}
        >
          {member.name}
        </div>
        {member.email && (
          <div className="text-xs truncate text-[--text-muted]">{member.email}</div>
        )}
      </div>

      {/* Check circle */}
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          background: isSelected ? "var(--accent-violet)" : "transparent",
          border: isSelected ? "none" : "2px solid var(--border)",
        }}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

const MemberSelector = React.forwardRef<HTMLDivElement, MemberSelectorProps>(
  (
    {
      members,
      selected,
      onChange,
      max,
      maxVisible = 5,
      label,
      className,
      searchPlaceholder,
      emptyText,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery("");
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Selected first, then rest in original order (caller pre-sorts by recency)
    const sortedMembers = React.useMemo(() => {
      return [...members].sort((a, b) => {
        const aS = selected.includes(a.id);
        const bS = selected.includes(b.id);
        if (aS && !bS) return -1;
        if (!aS && bS) return 1;
        return 0;
      });
    }, [members, selected]);

    const visibleMembers = sortedMembers.slice(0, maxVisible);

    const toggleMember = (id: string) => {
      const isSel = selected.includes(id);
      if (isSel) {
        onChange(selected.filter((s) => s !== id));
      } else {
        if (max && selected.length >= max) return;
        onChange([...selected, id]);
      }
    };

    return (
      <div ref={ref} className={cn("relative", className)}>
        {label && (
          <div className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wider mb-3">
            {label}
          </div>
        )}
        <div ref={containerRef} className="flex items-start gap-3 flex-wrap">
          <LayoutGroup>
            {visibleMembers.map((member) => (
              <AvatarBubble
                key={member.id}
                member={member}
                isSelected={selected.includes(member.id)}
                onClick={() => toggleMember(member.id)}
              />
            ))}

            <div className="relative">
              <AddButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
              <AnimatePresence>
                {isOpen && (
                  <Dropdown
                    members={members}
                    selected={selected}
                    onSelect={(id) => {
                      toggleMember(id);
                    }}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder={searchPlaceholder}
                    emptyText={emptyText}
                  />
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        </div>
      </div>
    );
  }
);

MemberSelector.displayName = "MemberSelector";

export { MemberSelector };
