// ProfileCard — animated neumorphic user card for AD directory (light mode)
"use client";

import { Star, Shield, Video, MessageSquare } from "lucide-react";
import { generateAvatarColor, getInitials } from "@/lib/utils";

export type ProfileCardProps = {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  status: "online" | "offline" | "away";
  avatarUrl?: string;
  tags?: string[];
  isVerified?: boolean;
  isAdmin?: boolean;
  taskCount?: number;
};

export function ProfileCard({
  id,
  name,
  role,
  department,
  email,
  phone,
  status,
  avatarUrl,
  tags = [],
  isVerified,
  isAdmin,
  taskCount,
}: ProfileCardProps) {
  const avatarColor = generateAvatarColor(id);
  const initials = getInitials(name);

  const statusColor =
    status === "online" ? "#7b8d1c" : status === "away" ? "#8a9d00" : "#c0cad3";

  return (
    <div
      className="group relative overflow-hidden rounded-3xl p-6 w-full max-w-xs transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1.5 border"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border)",
        boxShadow:
          "6px 6px 18px rgba(0,0,0,0.10), -4px -4px 12px rgba(255,255,255,0.90)",
      }}
    >
      {/* Status indicator */}
      <div className="absolute right-4 top-4 z-10">
        <div className="relative">
          <div
            className="h-3 w-3 rounded-full border-2 transition-all duration-300 group-hover:scale-125"
            style={{
              backgroundColor: statusColor,
              borderColor: "var(--bg-elevated)",
              boxShadow: status === "online" ? `0 0 10px ${statusColor}80` : undefined,
            }}
          />
          {status === "online" && (
            <div
              className="absolute inset-0 h-3 w-3 rounded-full animate-ping opacity-40"
              style={{ backgroundColor: statusColor }}
            />
          )}
        </div>
      </div>

      {/* Admin / Verified badge */}
      {(isAdmin || isVerified) && (
        <div className="absolute right-4 top-10 z-10">
          <div
            className="rounded-full p-1 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
            style={{
              backgroundColor: "var(--accent-violet)",
              boxShadow: "0 2px 8px rgba(7,60,129,0.35)",
            }}
          >
            {isAdmin ? (
              <Shield className="h-3 w-3 text-white fill-white" />
            ) : (
              <Star className="h-3 w-3 text-white fill-white" />
            )}
          </div>
        </div>
      )}

      {/* Avatar */}
      <div className="mb-4 flex justify-center relative z-10">
        <div className="relative">
          <div
            className="h-24 w-24 overflow-hidden rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
            style={{
              background: `${avatarColor}18`,
              border: `2px solid var(--border)`,
              boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.8)",
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover rounded-full" />
            ) : (
              <span className="text-2xl font-bold select-none" style={{ color: avatarColor }}>
                {initials}
              </span>
            )}
          </div>
          {/* Glowing ring on hover */}
          <div
            className="absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"
            style={{ borderColor: `${avatarColor}60` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="text-center relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5">
        <h3
          className="text-base font-semibold transition-colors duration-300"
          style={{ color: "var(--text-primary)" }}
        >
          {name}
        </h3>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
          {role}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
          {department}
        </p>

        {typeof taskCount === "number" && (
          <p className="mt-1.5 text-xs transition-colors duration-300"
            style={{ color: "var(--text-muted)" }}>
            {taskCount} {taskCount === 1 ? "tarea asignada" : "tareas asignadas"}
          </p>
        )}
      </div>

      {/* Contact */}
      <div className="mt-3 text-center">
        <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{email}</p>
        {phone && (
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{phone}</p>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3 flex justify-center flex-wrap gap-1.5 relative z-10">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all duration-300"
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons — Teams deep links */}
      <div className="mt-5 flex gap-2 relative z-10">
        <a
          href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full py-3 text-sm font-medium transition-all duration-300 hover:scale-95 active:scale-90 flex items-center justify-center gap-1.5"
          style={{
            background: "var(--bg-surface)",
            color: "var(--accent-violet)",
            border: "1px solid var(--border)",
            boxShadow: "3px 3px 8px rgba(0,0,0,0.07), -3px -3px 8px rgba(255,255,255,0.8)",
          }}
          title="Chat en Teams"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-[11px]">Chat</span>
        </a>
        <a
          href={`https://teams.microsoft.com/l/call/0/0?users=${encodeURIComponent(email)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full py-3 text-sm font-medium transition-all duration-300 hover:scale-95 active:scale-90 flex items-center justify-center gap-1.5"
          style={{
            background: "var(--bg-surface)",
            color: "var(--accent-emerald)",
            border: "1px solid var(--border)",
            boxShadow: "3px 3px 8px rgba(0,0,0,0.07), -3px -3px 8px rgba(255,255,255,0.8)",
          }}
          title="Llamada en Teams"
        >
          <Video className="h-4 w-4" />
          <span className="text-[11px]">Llamar</span>
        </a>
      </div>

      {/* Hover border accent */}
      <div
        className="absolute inset-0 rounded-3xl border opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ borderColor: "var(--accent-violet)", opacity: undefined }}
      />
    </div>
  );
}

export default ProfileCard;
