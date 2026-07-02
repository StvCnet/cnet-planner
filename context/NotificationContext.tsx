"use client";

import React, {
  createContext, useContext, useState, useCallback, useEffect, useMemo,
} from "react";
import { Notification } from "@/types";
import { useADContext } from "@/context/ADContext";

const POLL_INTERVAL_MS = 20000;

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useADContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return;
      const data: Notification[] = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchNotifications(currentUser.id);
  }, [currentUser, fetchNotifications]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchNotifications(currentUser.id);
    }, POLL_INTERVAL_MS);
    const onFocus = () => fetchNotifications(currentUser.id);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [currentUser, fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    }).catch((err) => console.error("Failed to mark notification as read", err));
  }, []);

  const markAllAsRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch("/api/notifications/mark-all-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id }),
    }).catch((err) => console.error("Failed to mark all notifications as read", err));
  }, [currentUser]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
