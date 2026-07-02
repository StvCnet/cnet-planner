"use client";

import React, {
  createContext, useContext, useState, useCallback, useEffect, useMemo,
} from "react";
import { Project, ADUser, CardType, ColumnType } from "@/types";
import { useADContext } from "@/context/ADContext";
import { useBoardContext } from "@/context/BoardContext";
import { notifyTaskAssigned } from "@/lib/webhook";

const POLL_INTERVAL_MS = 20000;

interface ProjectContextValue {
  projects: Project[];
  createProject: (name: string, description: string, color: string, durationWeeks?: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMember: (projectId: string, user: ADUser) => void;
  removeMember: (projectId: string, userId: string) => void;
  addTask: (projectId: string, task: Pick<CardType, "title" | "description" | "priority" | "dueDate">) => void;
  getProjectsForUser: (userId: string) => Project[];
  projectMemberIds: Set<string>; // IDs of projects the current user belongs to
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

async function apiRequest(url: string, method: string, body?: unknown) {
  try {
    await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error(`Project sync failed (${method} ${url})`, err);
  }
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { currentUser } = useADContext();
  const { dispatch } = useBoardContext();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const data: Project[] = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  }, []);

  // Initial load from the shared backend (replaces the old localStorage hydration).
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Pick up projects/members created or changed by other users.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchProjects();
    }, POLL_INTERVAL_MS);
    const onFocus = () => fetchProjects();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchProjects]);

  const createProject = useCallback(
    (name: string, description: string, color: string, durationWeeks?: string): Project => {
      const project: Project = {
        id: `proj-${Date.now()}`,
        name,
        description,
        color,
        createdBy: currentUser?.id ?? "unknown",
        createdAt: new Date().toISOString(),
        members: currentUser ? [currentUser] : [],
        durationWeeks,
      };
      setProjects((prev) => [...prev, project]);
      apiRequest("/api/projects", "POST", project);
      return project;
    },
    [currentUser]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      apiRequest(`/api/projects/${id}`, "PATCH", updates);
    },
    []
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      apiRequest(`/api/projects/${id}`, "DELETE");
    },
    []
  );

  const addMember = useCallback(
    (projectId: string, user: ADUser) => {
      setProjects((prev) => {
        const project = prev.find((p) => p.id === projectId);
        if (!project || project.members.find((m) => m.id === user.id)) return prev;
        const members = [...project.members, user];
        apiRequest(`/api/projects/${projectId}`, "PATCH", { members });
        return prev.map((p) => (p.id === projectId ? { ...p, members } : p));
      });
    },
    []
  );

  const removeMember = useCallback(
    (projectId: string, userId: string) => {
      setProjects((prev) => {
        const project = prev.find((p) => p.id === projectId);
        if (!project) return prev;
        const members = project.members.filter((m) => m.id !== userId);
        apiRequest(`/api/projects/${projectId}`, "PATCH", { members });
        return prev.map((p) => (p.id === projectId ? { ...p, members } : p));
      });
    },
    []
  );

  const addTask = useCallback(
    (
      projectId: string,
      task: Pick<CardType, "title" | "description" | "priority" | "dueDate">
    ) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;
      const now = new Date().toISOString();
      const cardId = `card-${Date.now()}`;
      dispatch({
        type: "ADD_CARD",
        card: {
          ...task,
          id: cardId,
          projectId,
          assignees: project.members,
          column: "todo" as ColumnType,
          createdAt: now,
          updatedAt: now,
        },
      });
      project.members.forEach((member) =>
        notifyTaskAssigned({
          taskId: cardId,
          taskTitle: task.title,
          taskDescription: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          column: "todo",
          assigneeName: member.displayName,
          assigneeEmail: member.email,
          assignedByName: currentUser?.displayName ?? "Admin",
          assignedByEmail: currentUser?.email ?? "",
        })
      );
    },
    [projects, dispatch]
  );

  const getProjectsForUser = useCallback(
    (userId: string) => projects.filter((p) => p.members.some((m) => m.id === userId)),
    [projects]
  );

  const projectMemberIds = useMemo(() => {
    if (!currentUser) return new Set<string>();
    const userProjects = getProjectsForUser(currentUser.id);
    const ids = new Set<string>();
    userProjects.forEach((p) => p.members.forEach((m) => ids.add(m.id)));
    return ids;
  }, [currentUser, getProjectsForUser]);

  return (
    <ProjectContext.Provider value={{
      projects, createProject, updateProject, deleteProject,
      addMember, removeMember, addTask,
      getProjectsForUser, projectMemberIds,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
