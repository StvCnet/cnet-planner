// Shared TypeScript types for CompuDo — all components import from here

export type ColumnType = "backlog" | "todo" | "doing" | "done";

export interface Label {
  id: string;
  name: string;
  color: string; // hex
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // ISO date string
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
  options?: string[]; // for type "select"
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: "link" | "file";
  addedAt: string;
}

export interface ADUser {
  id: string;
  displayName: string;
  email: string;
  department: string;
  title: string;
  avatar?: string; // initials fallback if no URL
  isAdmin?: boolean;
  phone?: string;
}

export interface CardType {
  id: string;
  title: string;
  column: ColumnType;
  description?: string;
  labels?: Label[];
  dueDate?: string; // ISO date string
  checklists?: Checklist[];
  assignees?: ADUser[];
  attachments?: Attachment[];
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
  priority?: "low" | "medium" | "high" | "critical";
}

export type BoardAction =
  | { type: "MOVE_CARD"; cardId: string; toColumn: ColumnType; beforeId: string | null }
  | { type: "ADD_CARD"; card: CardType }
  | { type: "DELETE_CARD"; cardId: string }
  | { type: "UPDATE_CARD"; cardId: string; updates: Partial<CardType> }
  | { type: "REORDER_CARD"; cardId: string; beforeId: string | null; column: ColumnType };

export interface BoardState {
  cards: CardType[];
  myTasksFilter: boolean;
  currentUser: ADUser | null;
}
