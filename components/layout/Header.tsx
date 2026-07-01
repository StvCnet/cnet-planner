// App header — Compunet logo, My Tasks toggle, AD user avatar
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, LogOut, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBoard } from "@/hooks/useBoard";
import { useAD } from "@/hooks/useAD";
import { useSession } from "next-auth/react";
import { generateAvatarColor, getInitials } from "@/lib/utils";

export function Header() {
  const { state, setMyTasksFilter } = useBoard();
  const { currentUser } = useAD();
  const { data: session } = useSession();
  const { myTasksFilter, cards } = state;
  const isAdmin = session?.isAdmin ?? false;

  const myTaskCount = currentUser
    ? cards.filter((c) => c.assignees?.some((a) => a.id === currentUser.id)).length
    : 0;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg border-b border-[--glass-border]"
      style={{ background: "var(--glass-bg)" }}>
      <div className="flex items-center justify-between h-14 px-4 max-w-[1920px] mx-auto">
        {/* Logo */}
        <div className="flex items-center select-none">
          <Image
            src="/compunet.png"
            alt="Compunet"
            width={140}
            height={40}
            style={{ objectFit: "contain", height: "36px", width: "auto" }}
            priority
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* My Tasks Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2.5">
                  <Zap
                    className="h-4 w-4 transition-colors"
                    style={{ color: myTasksFilter ? "#7C3AED" : "#4A4A5A" }}
                  />
                  <Switch
                    checked={myTasksFilter}
                    onCheckedChange={setMyTasksFilter}
                    aria-label="Mis tareas"
                  />
                  <span className="text-xs text-[--text-secondary] hidden sm:inline">Mis tareas</span>
                  {myTasksFilter && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      <Badge variant="default" className="text-[10px] h-4 px-1.5">
                        {myTaskCount}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {myTasksFilter ? "Mostrando solo tus tareas" : "Ver solo mis tareas"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User avatar */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:bg-[--bg-hover] p-1 pr-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    style={{ backgroundColor: generateAvatarColor(currentUser?.id ?? "u1") }}
                    className="text-white text-xs font-bold"
                  >
                    {currentUser ? getInitials(currentUser.displayName) : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[--text-primary] hidden sm:block">
                  {currentUser?.displayName.split(" ")[0]}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      style={{ backgroundColor: generateAvatarColor(currentUser?.id ?? "u1") }}
                      className="text-white text-sm font-bold"
                    >
                      {currentUser ? getInitials(currentUser.displayName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[--text-primary] truncate">
                      {currentUser?.displayName}
                    </p>
                    <p className="text-xs text-[--text-secondary] truncate">
                      {currentUser?.title}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-[--text-secondary]">
                  <p className="truncate">{currentUser?.email}</p>
                  <p>{currentUser?.department}</p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "var(--accent-violet)", color: "white" }}>
                      <LogOut className="h-2.5 w-2.5" style={{ display: "none" }} />
                      <Shield className="h-2.5 w-2.5" />
                      Administrador
                    </span>
                  )}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="flex items-center gap-2 w-full text-xs text-[--accent-red] hover:bg-red-50 rounded-md px-2 py-1.5 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
