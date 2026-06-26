"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProfileCard } from "@/components/ui/info-card";
import { useAD } from "@/hooks/useAD";
import { useBoard } from "@/hooks/useBoard";
import { ADUser } from "@/types";

function deterministicStatus(id: string): "online" | "away" | "offline" {
  const n = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (["online", "online", "away", "offline"] as const)[n % 4];
}

export function DirectoryView() {
  const { users, currentUser, loading } = useAD();
  const { state } = useBoard();
  const [query, setQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Todos");

  const taskCountByUser = useMemo(() => {
    const map = new Map<string, number>();
    state.cards.forEach((card) => {
      card.assignees?.forEach((a) => {
        map.set(a.id, (map.get(a.id) ?? 0) + 1);
      });
    });
    return map;
  }, [state.cards]);

  // Derive departments from real users
  const departments = useMemo(() => {
    const depts = new Set<string>();
    users.forEach((u) => { if (u.department) depts.add(u.department); });
    return ["Todos", ...Array.from(depts).sort()];
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter((u: ADUser) => {
      const matchesDept = selectedDept === "Todos" || u.department === selectedDept;
      const matchesQuery =
        !q ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q);
      return matchesDept && matchesQuery;
    });
  }, [users, query, selectedDept]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-[--text-muted]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Cargando directorio de Entra ID…</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 pt-4 pb-3 border-b border-[--border]">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="h-5 w-5 text-[--accent-violet] shrink-0" />
          <h2 className="text-sm font-semibold text-[--text-primary]">
            Directorio Entra ID
          </h2>
          <Badge variant="secondary" className="text-[10px] h-5">
            {filtered.length} usuarios
          </Badge>
          {currentUser?.isAdmin && (
            <Badge className="text-[10px] h-5 gap-1 bg-[--accent-violet]/20 text-[--accent-violet] border border-[--accent-violet]/30">
              <Shield className="h-2.5 w-2.5" />
              Admin
            </Badge>
          )}
        </div>

        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-muted]" />
            <Input
              placeholder="Buscar usuario, rol, departamento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-8 text-sm bg-[--bg-elevated]"
            />
          </div>
        </div>
      </div>

      {/* Department filter pills */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-none border-b border-[--border]">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
              selectedDept === dept
                ? "bg-[--accent-violet] text-white shadow-md"
                : "bg-[--bg-elevated] text-[--text-secondary] hover:bg-[--bg-hover] border border-[--border]"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="popLayout">
          {sorted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-48 text-[--text-muted]"
            >
              <Users className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No se encontraron usuarios</p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
            >
              {sorted.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileCard
                    id={user.id}
                    name={user.displayName}
                    role={user.title}
                    department={user.department}
                    email={user.email}
                    phone={user.phone}
                    status={deterministicStatus(user.id)}
                    isAdmin={user.isAdmin}
                    isVerified={false}
                    tags={user.department ? [user.department] : []}
                    taskCount={taskCountByUser.get(user.id) ?? 0}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
