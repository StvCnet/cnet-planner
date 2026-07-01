// Assignee management — animated member selector with AD photos and recency sorting
"use client";

import * as React from "react";
import { MemberSelector, type Member } from "@/components/ui/member-selector";
import { useAD } from "@/hooks/useAD";
import { useRecentAssignees } from "@/hooks/useRecentAssignees";
import { ADUser } from "@/types";

interface CardAssigneesProps {
  assignees: ADUser[];
  onUpdate: (assignees: ADUser[]) => void;
}

function toMember(u: ADUser): Member {
  return {
    id: u.id,
    name: u.displayName,
    email: u.email,
    avatar: `/api/ad/photo/${u.id}`,
  };
}

export function CardAssignees({ assignees, onUpdate }: CardAssigneesProps) {
  const { users } = useAD();
  const [recentIds, addRecent] = useRecentAssignees();

  // Build member list: selected first (via MemberSelector internals), then
  // recent (not already selected), then everyone else alphabetically.
  const members = React.useMemo(() => {
    const selectedIds = new Set(assignees.map((a) => a.id));
    const recentSet = new Set(recentIds);

    // Deduplicated ordered list: selected → recent non-selected → rest
    const seen = new Set<string>();
    const ordered: ADUser[] = [];

    // 1. Currently assigned (in their existing order)
    for (const u of assignees) {
      if (!seen.has(u.id)) { seen.add(u.id); ordered.push(u); }
    }
    // 2. Recently used but not currently assigned
    for (const id of recentIds) {
      if (!seen.has(id)) {
        const u = users.find((x) => x.id === id);
        if (u) { seen.add(id); ordered.push(u); }
      }
    }
    // 3. Everyone else (already sorted alphabetically from API)
    for (const u of users) {
      if (!seen.has(u.id)) { seen.add(u.id); ordered.push(u); }
    }

    return ordered.map(toMember);
  }, [users, assignees, recentIds]);

  const selectedIds = assignees.map((a) => a.id);

  const handleChange = (newIds: string[]) => {
    // Resolve IDs → ADUser objects (look up in users list + existing assignees)
    const lookup = new Map<string, ADUser>([
      ...users.map((u) => [u.id, u] as [string, ADUser]),
      ...assignees.map((u) => [u.id, u] as [string, ADUser]),
    ]);
    const newAssignees = newIds.map((id) => lookup.get(id)).filter(Boolean) as ADUser[];
    onUpdate(newAssignees);

    // Track newly added IDs as recent
    const prevIds = new Set(assignees.map((a) => a.id));
    const added = newIds.filter((id) => !prevIds.has(id));
    if (added.length) addRecent(added);
  };

  return (
    <MemberSelector
      members={members}
      selected={selectedIds}
      onChange={handleChange}
      maxVisible={4}
      searchPlaceholder="Buscar por nombre o correo..."
      emptyText="No se encontraron usuarios."
    />
  );
}
