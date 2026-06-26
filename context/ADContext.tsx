"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import { ADUser } from "@/types";

interface ADContextValue {
  users: ADUser[];
  currentUser: ADUser | null;
  loading: boolean;
  searchUsers: (query: string) => Promise<ADUser[]>;
}

const ADContext = createContext<ADContextValue | null>(null);

export function ADProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<ADUser | null>(null);
  const [users, setUsers] = useState<ADUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/ad/me").then((r) => r.json()),
      fetch("/api/ad/users").then((r) => r.json()),
    ])
      .then(([me, all]) => {
        setCurrentUser(me);
        setUsers(Array.isArray(all) ? all : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  const searchUsers = useCallback(async (query: string): Promise<ADUser[]> => {
    const res = await fetch(
      `/api/ad/users?q=${encodeURIComponent(query.trim())}`
    );
    if (!res.ok) return [];
    return res.json();
  }, []);

  return (
    <ADContext.Provider value={{ users, currentUser, loading, searchUsers }}>
      {children}
    </ADContext.Provider>
  );
}

export function useADContext(): ADContextValue {
  const ctx = useContext(ADContext);
  if (!ctx) throw new Error("useADContext must be used within ADProvider");
  return ctx;
}
