// Notification bell — popover list of task assignments, project invites, and
// admin alerts, backed by context/NotificationContext.tsx (Supabase-synced).
"use client";

import React from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, FolderKanban, CheckSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useNotifications } from "@/context/NotificationContext";
import { Notification } from "@/types";

function Dot() {
  return (
    <svg width="6" height="6" viewBox="0 0 6 6" className="text-[--accent-violet]" aria-hidden="true">
      <circle cx="3" cy="3" r="3" fill="currentColor" />
    </svg>
  );
}

function timeAgo(iso: string) {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: es });
  } catch {
    return "";
  }
}

function TYPE_ICON(type: Notification["type"]) {
  if (type === "project_invite") return FolderKanban;
  if (type === "project_created") return Sparkles;
  return CheckSquare;
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="outline" className="relative h-8 w-8" aria-label="Abrir notificaciones">
          <Bell className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1 h-4 text-[10px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1 max-h-[70vh] overflow-y-auto" align="end">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="text-sm font-semibold text-[--text-primary]">Notificaciones</div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium text-[--accent-violet] hover:underline"
              onClick={markAllAsRead}
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
        <div className="-mx-1 my-1 h-px bg-[--border]" role="separator" aria-orientation="horizontal" />

        {notifications.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
            No tienes notificaciones
          </p>
        )}

        {notifications.map((n) =>
          n.type === "project_invite" ? (
            <div key={n.id} className="p-1">
              <Alert
                layout="complex"
                size="lg"
                onClick={() => !n.read && markAsRead(n.id)}
                className="cursor-pointer"
                icon={
                  <UserAvatar userId={n.createdBy} name={n.createdByName ?? "?"} className="h-8 w-8" />
                }
              >
                <AlertContent>
                  <AlertDescription className="text-[--text-primary]">{n.body}</AlertDescription>
                  <p className="text-xs text-[--text-muted]">{timeAgo(n.createdAt)}</p>
                </AlertContent>
                {!n.read && (
                  <div className="absolute top-3 right-3">
                    <Dot />
                  </div>
                )}
              </Alert>
            </div>
          ) : (
            <div
              key={n.id}
              className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-[--bg-hover] cursor-pointer"
              onClick={() => !n.read && markAsRead(n.id)}
            >
              <div className="relative flex items-start pe-3 gap-2">
                {React.createElement(TYPE_ICON(n.type), {
                  className: "h-4 w-4 mt-0.5 shrink-0 text-[--text-secondary]",
                })}
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-left text-[--text-secondary]">
                    <span className="font-medium text-[--text-primary]">{n.title}</span>
                    <br />
                    {n.body}
                  </p>
                  <div className="text-xs text-[--text-muted]">{timeAgo(n.createdAt)}</div>
                </div>
                {!n.read && (
                  <div className="absolute end-0 self-center">
                    <span className="sr-only">No leída</span>
                    <Dot />
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </PopoverContent>
    </Popover>
  );
}
