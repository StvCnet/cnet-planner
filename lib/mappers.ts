import { CardType, Project } from "@/types";

// Postgres row (snake_case) <-> app types (camelCase). Kept in one place since
// both /api/cards and /api/projects route handlers need the same conversion.

export function cardFromRow(row: any): CardType {
  return {
    id: row.id,
    title: row.title,
    column: row.column,
    description: row.description ?? undefined,
    labels: row.labels ?? [],
    dueDate: row.due_date ?? undefined,
    checklists: row.checklists ?? [],
    assignees: row.assignees ?? [],
    attachments: row.attachments ?? [],
    customFields: row.custom_fields ?? [],
    notes: row.notes ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    priority: row.priority ?? undefined,
    projectId: row.project_id ?? undefined,
    position: row.position ?? 0,
  };
}

export function cardToRow(card: Partial<CardType>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (card.id !== undefined) row.id = card.id;
  if (card.title !== undefined) row.title = card.title;
  if (card.column !== undefined) row.column = card.column;
  if (card.description !== undefined) row.description = card.description;
  if (card.labels !== undefined) row.labels = card.labels;
  if (card.dueDate !== undefined) row.due_date = card.dueDate;
  if (card.checklists !== undefined) row.checklists = card.checklists;
  if (card.assignees !== undefined) row.assignees = card.assignees;
  if (card.attachments !== undefined) row.attachments = card.attachments;
  if (card.customFields !== undefined) row.custom_fields = card.customFields;
  if (card.notes !== undefined) row.notes = card.notes;
  if (card.createdAt !== undefined) row.created_at = card.createdAt;
  if (card.updatedAt !== undefined) row.updated_at = card.updatedAt;
  if (card.priority !== undefined) row.priority = card.priority;
  if (card.projectId !== undefined) row.project_id = card.projectId;
  if (card.position !== undefined) row.position = card.position;
  return row;
}

export function projectFromRow(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    color: row.color,
    createdBy: row.created_by,
    createdAt: row.created_at,
    members: row.members ?? [],
  };
}

export function projectToRow(project: Partial<Project>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (project.id !== undefined) row.id = project.id;
  if (project.name !== undefined) row.name = project.name;
  if (project.description !== undefined) row.description = project.description;
  if (project.color !== undefined) row.color = project.color;
  if (project.createdBy !== undefined) row.created_by = project.createdBy;
  if (project.createdAt !== undefined) row.created_at = project.createdAt;
  if (project.members !== undefined) row.members = project.members;
  return row;
}
