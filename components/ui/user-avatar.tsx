// Avatar that shows the user's real AD photo when available, falling back to
// initials (Radix Avatar already swaps to Fallback on image load error/404).
"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, generateAvatarColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  userId?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
  fallbackBackground?: string;
  title?: string;
}

export function UserAvatar({
  userId, name, className, fallbackClassName, fallbackBackground, title,
}: UserAvatarProps) {
  return (
    <Avatar className={className} title={title}>
      {userId && <AvatarImage src={`/api/ad/photo/${userId}`} alt={name} />}
      <AvatarFallback
        className={cn("text-white", fallbackClassName)}
        style={{ background: fallbackBackground ?? generateAvatarColor(userId ?? name) }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
