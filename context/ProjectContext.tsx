"use client";

import React, {
  createContext, useContext, useState, useCallback, useEffect, useMemo,
} from "react";
import { Project, ADUser, CardType, ColumnType } from "@/types";
import { useADContext } from "@/context/ADContext";
import { useBoardContext } from "@/context/BoardContext";
import { notifyTaskAssigned } from "@/lib/webhook";

const STORAGE_KEY = "cnet-projects-v1";

interface ProjectContextValue {
  projects: Project[];
  createProject: (name: string, description: string, color: string) => Project;
  deleteProject: (id: string) => void;
  addMember: (projectId: string, user: ADUser) => void;
  removeMember: (projectId: string, userId: string) => void;
  addTask: (projectId: string, task: Pick<CardType, "title" | "description" | "priority" | "dueDate">) => void;
  getProjectsForUser: (userId: string) => Project[];
  projectMemberIds: Set<string>; // IDs of projects the current user belongs to
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { currentUser } = useADContext();
  const { dispatch } = useBoardContext();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProjects(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const persist = useCallback((updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const createProject = useCallback(
    (name: string, description: string, color: string): Project => {
      const project: Project = {
        id: `proj-${Date.now()}`,
        name,
        description,
        color,
        createdBy: currentUser?.id ?? "unknown",
        createdAt: new Date().toISOString(),
        members: currentUser ? [currentUser] : [],
      };
      persist([...projects, project]);
      return project;
    },
    [projects, currentUser, persist]
  );

  const deleteProject = useCallback(
    (id: string) => persist(projects.filter((p) => p.id !== id)),
    [projects, persist]
  );

  const addMember = useCallback(
    (projectId: string, user: ADUser) => {
      persist(
        projects.map((p) =>
          p.id === projectId && !p.members.find((m) => m.id === user.id)
            ? { ...p, members: [...p.members, user] }
            : p
        )
      );
    },
    [projects, persist]
  );

  const removeMember = useCallback(
    (projectId: string, userId: string) => {
      persist(
        projects.map((p) =>
          p.id === projectId
            ? { ...p, members: p.members.filter((m) => m.id !== userId) }
            : p
        )
      );
    },
    [projects, persist]
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
      projects, createProject, deleteProject,
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
