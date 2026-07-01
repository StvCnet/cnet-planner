# CompuDo — Project Goal Prompt
> Enterprise-grade personal project & task management platform  
> Use this file as the **Goal** in Claude to generate the full project.

---

## 0. Mission Statement

Build **CompuDo** — a self-hosted, enterprise-quality Kanban & project management app for personal use. It must unify every feature from Trello Free + Premium and simulate Active Directory (AD) user integration. The target user is a **Cloud Analyst** working in a corporate environment.

The deliverable is a complete, runnable **Next.js 14 (App Router)** codebase, structured file by file, ready to `npm install && npm run dev`.

---

## 1. Tech Stack (Non-Negotiable)

| Layer | Technology |
|---|---|
| Framework | Next.js 14 — App Router (`app/` directory) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 |
| Component library | shadcn/ui (manually added components) |
| Animations | framer-motion v11 |
| Drag & Drop | Native HTML5 DnD (as in base code) + framer-motion `layout` |
| Icons | lucide-react + react-icons (FiPlus, FiTrash, FaFire) |
| State management | React Context + useReducer (no external store needed) |
| Fonts | Inter (body) + `next/font/google` |

### shadcn/ui components to install
Run these via the shadcn CLI before generating code:
```bash
npx shadcn@latest init
npx shadcn@latest add dialog tabs avatar command popover badge progress checkbox calendar select separator sheet tooltip
```

### Additional npm dependencies
```bash
npm install framer-motion react-icons date-fns
```

---

## 2. Design System

### 2.1 Color Tokens (Dark Mode Only)
Define these as CSS variables in `app/globals.css` and as Tailwind `extend.colors`:

```
--bg-base:       #0A0A0F   /* deepest background */
--bg-surface:    #111118   /* cards, columns */
--bg-elevated:   #1A1A24   /* modals, popovers */
--bg-hover:      #22222E   /* hover states */
--border:        #2A2A3A   /* subtle borders */
--border-focus:  #4A4A6A   /* focused/active borders */

--text-primary:  #F0F0F5   /* headings, body */
--text-secondary:#8B8BA8   /* captions, meta */
--text-muted:    #4A4A5A   /* placeholder */

--accent-violet: #7C3AED   /* primary accent — "Do" in logo */
--accent-violet-bright: #A855F7
--accent-gradient: linear-gradient(135deg, #7C3AED, #06B6D4)
--accent-emerald:#10B981   /* Done column, success */
--accent-yellow: #FBBF24   /* TODO column, warnings */
--accent-blue:   #3B82F6   /* In Progress column */
--accent-red:    #EF4444   /* delete / burn barrel */

--glass-bg:      rgba(26, 26, 36, 0.7)
--glass-border:  rgba(255, 255, 255, 0.06)
```

### 2.2 Typography
- **Display / Logo:** `font-bold tracking-tight` — "Compu" in `--text-primary`, "Do" in gradient via `bg-clip-text`
- **Column headings:** `text-sm font-semibold uppercase tracking-wider`
- **Card titles:** `text-sm font-medium text-[--text-primary]`
- **Meta / labels:** `text-xs text-[--text-secondary]`

### 2.3 Glassmorphism Recipe
Apply to columns and modals:
```css
background: var(--glass-bg);
backdrop-filter: blur(12px);
border: 1px solid var(--glass-border);
border-radius: 12px;
```

### 2.4 Signature Design Element
The **"Do" in CompuDo** is the signature element. It must have:
1. A `linear-gradient(135deg, #7C3AED, #06B6D4)` applied via `bg-clip-text text-transparent`
2. A **continuous shimmer animation** using framer-motion `animate` — a glowing highlight sweep (keyframes: opacity 0 → 1 → 0 across the text width)
3. A **subtle pulse** on the whole word `Do` on first load (scale 1 → 1.08 → 1, duration 0.6s)

---

## 3. File & Folder Structure

Generate **every file** listed below. Do not leave stubs.

```
compudo/
├── app/
│   ├── globals.css              # CSS variables, Tailwind base
│   ├── layout.tsx               # Root layout: fonts, providers, Header
│   ├── page.tsx                 # Default board page
│   └── favicon.ico
│
├── components/
│   ├── ui/                      # shadcn/ui generated components (do not edit)
│   │   └── [shadcn components]
│   │
│   ├── layout/
│   │   ├── Header.tsx           # App header with logo, AD user, My Tasks toggle
│   │   └── ViewSwitcher.tsx     # Tabs: Kanban | Calendar | Dashboard
│   │
│   ├── kanban/
│   │   ├── Board.tsx            # Root board: columns + burn barrel
│   │   ├── Column.tsx           # Single column with DnD logic
│   │   ├── Card.tsx             # Card tile (draggable)
│   │   ├── CardModal.tsx        # Full card detail dialog
│   │   ├── AddCard.tsx          # Inline add card form
│   │   ├── DropIndicator.tsx    # DnD drop indicator line
│   │   └── BurnBarrel.tsx       # Delete zone
│   │
│   ├── card-detail/
│   │   ├── CardLabels.tsx       # Color label picker
│   │   ├── CardChecklist.tsx    # Checklist with progress bar
│   │   ├── CardDueDate.tsx      # Date picker popover
│   │   ├── CardAssignees.tsx    # AD user search + avatars
│   │   ├── CardAttachments.tsx  # Attachment list (mock)
│   │   └── CardCustomFields.tsx # Dynamic custom fields
│   │
│   ├── views/
│   │   ├── CalendarView.tsx     # Monthly calendar with card dots
│   │   └── DashboardView.tsx    # Stats + simple bar chart
│   │
│   └── ad/
│       └── ADUserSearch.tsx     # Command palette for AD user lookup
│
├── context/
│   ├── BoardContext.tsx         # Cards state, reducer, actions
│   └── ADContext.tsx            # Mock AD users, current user
│
├── lib/
│   ├── utils.ts                 # cn() + helpers
│   ├── mock-data.ts             # DEFAULT_CARDS (cloud analyst data)
│   └── ad-mock.ts               # Mock AD directory (20 users)
│
├── types/
│   └── index.ts                 # All shared TypeScript types
│
├── hooks/
│   ├── useBoard.ts              # Consumes BoardContext
│   └── useAD.ts                 # Consumes ADContext
│
├── tailwind.config.ts           # Extended with custom colors + animation
├── tsconfig.json                # Strict mode
└── package.json
```

---

## 4. TypeScript Types (`types/index.ts`)

Define and export **all** of the following. Every component must import from here.

```typescript
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
}

export interface CardType {
  id: string;
  title: string;
  column: ColumnType;
  description?: string;
  labels?: Label[];
  dueDate?: string;          // ISO date string
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
```

---

## 5. Mock Data (`lib/mock-data.ts`)

Populate with **cloud analyst** tasks. Use realistic corporate language. All dates must be relative to "today" (use `date-fns` `addDays(new Date(), N)`).

### Required cards (minimum — expand to 12–15 total):

| Title | Column | Priority | Labels | Has Checklist |
|---|---|---|---|---|
| Calcular precios de copias de seguridad de datos | todo | high | GCP, Storage | Yes |
| Revisión mensual de infraestructura cloud | doing | medium | AWS, Review | Yes |
| Auditoría de facturación de GCP — Q2 | todo | critical | GCP, Billing | No |
| Despliegue de scripts de automatización Terraform | doing | high | Terraform, IaC | Yes |
| Migrar workloads legacy a contenedores | backlog | medium | Docker, K8s | Yes |
| Configurar alertas de presupuesto en AWS | todo | high | AWS, Cost | No |
| Revisar SLAs de proveedores de nube | backlog | low | Governance | No |
| Documentar arquitectura multi-cloud | backlog | medium | Docs | No |
| Optimizar instancias EC2 subutilizadas | doing | medium | AWS, Cost | Yes |
| Validar backup diario de bases de datos RDS | done | high | AWS, Backup | No |
| Presentar reporte de costos cloud — Dirección | done | critical | GCP, AWS | No |
| Implementar políticas IAM mínimo privilegio | todo | high | Security, IAM | Yes |

Each card must include:
- At least 2–3 `labels` with distinct colors
- A `dueDate` (some past, some upcoming, some null)
- Realistic `description` (1–2 sentences in Spanish)
- `createdAt` and `updatedAt` timestamps
- At least 4 cards must have a `checklist` with 3–5 items (some checked)

---

## 6. Mock Active Directory (`lib/ad-mock.ts`)

Create an array of 20 `ADUser` objects representing a corporate IT/Cloud team.

```typescript
// Example shape — generate 20 varied entries
export const AD_USERS: ADUser[] = [
  {
    id: "u1",
    displayName: "Carlos Mendoza",
    email: "c.mendoza@corp.com",
    department: "Cloud Engineering",
    title: "Senior Cloud Architect",
  },
  {
    id: "u2",
    displayName: "Valentina Torres",
    email: "v.torres@corp.com",
    department: "DevOps",
    title: "DevOps Engineer",
  },
  // ... 18 more, mix of Cloud, Security, DevOps, QA, PM roles
];

// The "logged in" user — used for "My Tasks" filter
export const CURRENT_AD_USER: ADUser = AD_USERS[0];
```

Avatar fallback: Use first+last initials styled as a colored circle (generate a deterministic color from the user's `id`).

---

## 7. Context & State

### `context/BoardContext.tsx`
- Wraps the entire app
- Holds `BoardState` and dispatches `BoardAction`
- `useReducer` handles all card mutations
- Exposes a `myTasksFilter` boolean and a `setMyTasksFilter` toggle
- When `myTasksFilter === true`, filter cards to only show those where `card.assignees` includes `currentUser.id`

### `context/ADContext.tsx`
- Provides `AD_USERS`, `CURRENT_AD_USER`
- Exposes `searchUsers(query: string): ADUser[]` — filters `AD_USERS` by `displayName` or `email`, simulating an async AD lookup with a 300ms artificial delay (`setTimeout` wrapped in a Promise)

---

## 8. Component Specifications

### 8.1 `components/layout/Header.tsx`

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo: Compu + "Do" animated]   [My Tasks ⚡ toggle]  [👤 Avatar + Name]  │
└──────────────────────────────────────────────────────────────┘
```

- **Logo:** `<span>Compu</span><span className="gradient shimmer">Do</span>`
  - "Compu": `text-white font-bold text-2xl`
  - "Do": gradient text + framer-motion shimmer + entry pulse
- **My Tasks toggle:** A `<Switch>` (shadcn) or styled button that activates `myTasksFilter`. When active: glows violet, shows count badge of filtered tasks.
- **User avatar:** Shows `CURRENT_AD_USER` initials in a colored circle (Avatar from shadcn). Clicking opens a popover with name, email, department.
- **Header style:** `backdrop-blur-lg bg-[--glass-bg] border-b border-[--glass-border] sticky top-0 z-50`

### 8.2 `components/layout/ViewSwitcher.tsx`

Tabs below the header (or integrated into page):
- **Kanban** (default)
- **Calendario**
- **Dashboard**

Use shadcn `<Tabs>` with a pill/underline variant. Animate tab content transitions with framer-motion `AnimatePresence`.

### 8.3 `components/kanban/Column.tsx`

Extends the base kanban code with:
- **Glassmorphism** container (see recipe above)
- Column header shows title + card count badge
- A color-coded left border per column:
  - backlog → `border-l-2 border-[--text-muted]`
  - todo → `border-l-2 border-[--accent-yellow]`
  - doing → `border-l-2 border-[--accent-blue]`
  - done → `border-l-2 border-[--accent-emerald]`
- `AddCard` button at the bottom of each column

### 8.4 `components/kanban/Card.tsx`

Visual anatomy (from top to bottom):
```
┌─────────────────────────────────┐  ← glass card, border border-[--border]
│ [Label pills row]               │
│ Title text (sm, medium weight)  │
│ [Description truncated 1 line]  │
│ ──────────────────────────────  │
│ [Checklist progress bar + %]    │  ← only if has checklist
│ [📅 due date]  [👤 assignees]   │  ← footer row
└─────────────────────────────────┘
```

- Clicking anywhere on the card opens `<CardModal>`
- Priority indicator: a small colored dot in the top-right corner
- Overdue due dates render in red
- `motion.div` with `layout layoutId={id}` for smooth DnD repositioning
- `whileHover={{ scale: 1.02 }}` for subtle hover lift

### 8.5 `components/kanban/CardModal.tsx`

Full-screen `<Dialog>` (shadcn) with two-column layout on desktop, single-column on mobile:

**Left column (main content):**
- Editable title (click to edit, inline input)
- Rich description textarea (auto-resize)
- Checklists section: each checklist has a title, progress bar, and items with checkboxes + optional due date
- Custom Fields section: render each field by type (text input / number input / select)

**Right sidebar:**
- **Labels** — popover color picker (8 preset colors + name input)
- **Due Date** — shadcn Calendar popover
- **Assignees** — AD user search using `<Command>` palette; shows avatar list of current assignees
- **Attachments** — list with icon + name + "Add link" button (mock only)
- **Priority** — select dropdown (low / medium / high / critical)
- **Add Custom Field** — button opens inline form: field name + type selector
- **Delete card** — destructive button, confirms with a `<AlertDialog>`

All changes in the modal must update `BoardContext` via dispatch in real time.

### 8.6 `components/card-detail/CardChecklist.tsx`

- Each `Checklist` renders as a section with:
  - Title (editable inline)
  - `<Progress>` bar (shadcn) showing `completedCount / totalCount * 100`
  - Items: `<Checkbox>` + text (editable) + optional `<Badge>` for item due date
  - "Add item" inline form
  - Assign per-item due date via a small Calendar popover next to each item
- Completing all items triggers a framer-motion `confetti`-like pulse on the progress bar

### 8.7 `components/ad/ADUserSearch.tsx`

- Uses shadcn `<Command>` inside a `<Popover>`
- `<CommandInput>` triggers `ADContext.searchUsers()` with 300ms debounce
- Results display: Avatar initials + displayName + title + department
- Selected users show as stacked avatars in the card footer and in the modal sidebar
- Already-selected users have a checkmark and can be clicked again to deselect

### 8.8 `components/views/CalendarView.tsx`

Monthly grid calendar:
- Each day cell shows colored dot(s) for cards due that day
- Clicking a dot opens the `<CardModal>` for that card
- Navigation: prev/next month arrows
- Today's date highlighted with accent ring
- Cards with no due date are shown in a "No date" sidebar panel

### 8.9 `components/views/DashboardView.tsx`

Stats overview with:
- **KPI cards (top row, 4 cards):**
  - Total tasks | Completed | In Progress | Overdue
  - Each card: large number + label + trend arrow (mock)
- **Bar chart:** Tasks by column (use inline SVG or a simple `div`-based bar chart — no external chart lib unless recharts is available)
- **Completion rate:** Circular progress (CSS conic-gradient)
- **Tasks by assignee:** List with avatar + name + count
- All numbers derived live from `BoardContext`

---

## 9. Animations Specification

All animations use **framer-motion**. Never use raw CSS `@keyframes` unless unavoidable.

| Element | Animation |
|---|---|
| "Do" logo shimmer | `animate={{ backgroundPosition: ["200% center", "-200% center"] }}` on a gradient background-clip text, `repeat: Infinity`, `duration: 3` |
| "Do" logo entry pulse | `initial={{ scale: 0.8, opacity: 0 }}` → `animate={{ scale: 1, opacity: 1 }}` with `spring` |
| Card drag | `motion.div layout layoutId={id}` — framer handles reorder |
| Column drop highlight | Tailwind `transition-colors` on background + opacity |
| Card open (modal) | `AnimatePresence` + `initial={{ opacity: 0, scale: 0.95, y: 10 }}` → `animate={{ opacity: 1, scale: 1, y: 0 }}` |
| View switcher tab content | `AnimatePresence mode="wait"` + slide from right on enter |
| Checklist item complete | `motion.span` strikethrough + opacity fade |
| Progress bar fill | `motion.div` width transition on value change |
| Burn barrel | FaFire `animate-bounce` (Tailwind) when active |
| Card add | `motion.div` `initial={{ opacity: 0, height: 0 }}` → `animate={{ opacity: 1, height: "auto" }}` |
| My Tasks toggle on | Badge count pops with `scale: [1, 1.3, 1]` |

---

## 10. Responsive Behavior

- **Desktop (≥1280px):** Full 4-column Kanban layout + sidebar in modal
- **Tablet (768–1280px):** Horizontally scrollable Kanban columns, modal goes single-column
- **Mobile (<768px):** Stacked list view (columns accordion-style), modal is full-screen sheet (shadcn `<Sheet>`)

The `ViewSwitcher` tabs always remain accessible at all breakpoints.

---

## 11. Implementation Order

Claude must generate files in this exact order to avoid import errors:

1. `types/index.ts`
2. `lib/utils.ts`
3. `lib/ad-mock.ts`
4. `lib/mock-data.ts`
5. `tailwind.config.ts` + `app/globals.css`
6. `context/ADContext.tsx`
7. `context/BoardContext.tsx`
8. `hooks/useBoard.ts` + `hooks/useAD.ts`
9. `components/ad/ADUserSearch.tsx`
10. `components/card-detail/` — all 5 components
11. `components/kanban/DropIndicator.tsx`
12. `components/kanban/BurnBarrel.tsx`
13. `components/kanban/AddCard.tsx`
14. `components/kanban/CardModal.tsx`
15. `components/kanban/Card.tsx`
16. `components/kanban/Column.tsx`
17. `components/kanban/Board.tsx`
18. `components/views/CalendarView.tsx`
19. `components/views/DashboardView.tsx`
20. `components/layout/ViewSwitcher.tsx`
21. `components/layout/Header.tsx`
22. `app/layout.tsx`
23. `app/page.tsx`
24. `package.json`

---

## 12. `app/layout.tsx` Requirements

```tsx
// Must include:
// - Inter font via next/font/google
// - <html lang="es" className="dark">
// - <BoardProvider> wrapping children
// - <ADProvider> wrapping children
// - <Header /> above {children}
// - Metadata: title "CompuDo", description "Tu gestor de proyectos cloud"
```

---

## 13. `app/page.tsx` Requirements

```tsx
// Must include:
// - <ViewSwitcher /> which renders <Board />, <CalendarView />, or <DashboardView />
// - Reads myTasksFilter from BoardContext and passes down
// - No extra wrapper padding — Board handles its own scroll
```

---

## 14. Acceptance Criteria

The generated project passes when ALL of the following are true:

- [ ] `npm run dev` starts with zero TypeScript errors
- [ ] All 4 columns render with cloud analyst mock cards
- [ ] Cards can be dragged between columns (DnD works)
- [ ] Dragging to BurnBarrel deletes the card
- [ ] Clicking a card opens `<CardModal>` with all sections visible
- [ ] Editing card title/description in modal persists in the board
- [ ] Checklist items can be checked/unchecked; progress bar updates
- [ ] AD user search finds users from `AD_USERS` mock with simulated delay
- [ ] Assigned users appear as avatar stack on the card tile
- [ ] "My Tasks" toggle filters the board to current user's cards only
- [ ] Calendar view shows due-date cards on correct days
- [ ] Dashboard view shows live-calculated stats
- [ ] "Do" logo has continuous shimmer animation (visible at all times)
- [ ] Dark mode applied globally — no white backgrounds anywhere
- [ ] Glassmorphism applied to columns and modals
- [ ] Adding a new card via "Add card" button works in every column
- [ ] Custom fields can be added and saved to a card
- [ ] Mobile: modal opens as full-screen `<Sheet>`

---

## 15. Code Quality Rules

- **No `any` types** — use the shared types from `types/index.ts`
- **No inline styles** — Tailwind classes only (except framer-motion `style` prop for gradient)
- **No hardcoded strings** — user-facing labels go as constants
- **Every component** must have typed props interface defined above the component
- **Barrel imports:** each folder exports an `index.ts` where appropriate
- **Comments:** Each file begins with a 1-line comment stating its purpose

---

## 16. Key Constraints & Gotchas

1. **Gradient text on "Do":** Use `style={{ backgroundImage: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}` with Tailwind `bg-clip-text text-transparent` — do NOT use Tailwind gradient classes for this because they conflict with framer-motion's `animate` on the same element.

2. **DnD + framer-motion:** The base code uses native HTML5 DnD events. Keep that system intact. `motion.div` with `layout` handles the reorder animation passively — do NOT replace DnD with `@dnd-kit` or `react-beautiful-dnd`.

3. **shadcn Dialog vs Sheet:** On mobile (detected via `useMediaQuery` hook or Tailwind `sm:` class check), swap `<Dialog>` for `<Sheet side="bottom">` for the card modal.

4. **Checklist progress:** Calculate inline: `const pct = items.length ? Math.round(items.filter(i => i.completed).length / items.length * 100) : 0`

5. **Date formatting:** Use `date-fns` `format`, `isPast`, `isToday`, `addDays` — never `new Date().toLocaleDateString()`.

6. **AD search debounce:** Implement with `useEffect` + `setTimeout` returning a cleanup. Do not use any external debounce library.

7. **Color generation for avatars:** `const colors = ["#7C3AED","#10B981","#3B82F6","#F59E0B","#EF4444"]; const color = colors[parseInt(user.id.replace(/\D/g,"")) % colors.length]`

---

*End of CompuDo Goal Prompt — generate all files above, complete and production-ready.*
