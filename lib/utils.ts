// Utility helpers: cn() class merger and misc helpers
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAvatarColor(id: string): string {
  const colors = ["#7C3AED", "#10B981", "#3B82F6", "#F59E0B", "#EF4444"];
  const num = parseInt(id.replace(/\D/g, "")) || 0;
  return colors[num % colors.length];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
