export type ColumnType = "backlog" | "todo" | "doing" | "done";

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "select";
  value: string | number | null;
  options?: string[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: "link" | "file" | "onedrive";
  addedAt: string;
}

export interface Note {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  color: "yellow" | "green" | "blue" | "pink" | "orange" | "purple";
}

export interface ADUser {
  id: string;
  displayName: string;
  email: string;
  department: string;
  title: string;
  avatar?: string;
  isAdmin?: boolean;
  phone?: string;
}

export interface CardType {
  id: string;
  title: string;
  column: ColumnType;
  description?: string;
  labels?: Label[];
  dueDate?: string;
  checklists?: Checklist[];
  assignees?: ADUser[];
  attachments?: Attachment[];
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
  priority?: "low" | "medium" | "high" | "critical";
  projectId?: string;
  notes?: Note[];
  position?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdBy: string;
  createdAt: string;
  members: ADUser[];
}

export type BoardAction =
  | { type: "MOVE_CARD"; cardId: string; toColumn: ColumnType; beforeId: string | null }
  | { type: "ADD_CARD"; card: CardType }
  | { type: "DELETE_CARD"; cardId: string }
  | { type: "UPDATE_CARD"; cardId: string; updates: Partial<CardType> }
  | { type: "REORDER_CARD"; cardId: string; beforeId: string | null; column: ColumnType }
  | { type: "SET_CARDS"; cards: CardType[] };

export interface BoardState {
  cards: CardType[];
  myTasksFilter: boolean;
  currentUser: ADUser | null;
}
