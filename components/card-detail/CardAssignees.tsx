// Assignee management — AD user search + avatar list for card assignees
"use client";

import * as React from "react";
import { ADUserSearch } from "@/components/ad/ADUserSearch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ADUser } from "@/types";
import { generateAvatarColor, getInitials } from "@/lib/utils";

interface CardAssigneesProps {
  assignees: ADUser[];
  onUpdate: (assignees: ADUser[]) => void;
}

export function CardAssignees({ assignees, onUpdate }: CardAssigneesProps) {
  const handleSelect = (user: ADUser) => {
    onUpdate([...assignees, user]);
  };

  const handleDeselect = (userId: string) => {
    onUpdate(assignees.filter((u) => u.id !== userId));
  };

  return (
    <div className="space-y-3">
      {assignees.length > 0 && (
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {assignees.map((user) => (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-default">
                    <AvatarFallback
                      style={{ backgroundColor: generateAvatarColor(user.id) }}
                      className="text-white text-[11px] font-semibold"
                    >
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-[--text-muted]">{user.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      )}
      <ADUserSearch
        selectedUsers={assignees}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
      />
    </div>
  );
}
