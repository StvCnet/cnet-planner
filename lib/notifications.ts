import { Notification } from "@/types";

export type CreateNotificationInput = Omit<Notification, "id" | "read" | "createdAt">;

// Fire-and-forget write to the shared notifications table — the recipient picks it
// up on their own poll/focus refetch (context/NotificationContext.tsx), same pattern
// as card/project sync in context/BoardContext.tsx and context/ProjectContext.tsx.
export async function createNotification(input: CreateNotificationInput) {
  const notification: Notification = {
    ...input,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
    });
  } catch (err) {
    console.error("Failed to create notification", err);
  }
}
