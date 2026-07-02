"use client";

import React, {
  createContext, useContext, useReducer, useCallback,
  useState, useEffect, useRef,
} from "react";
import { BoardState, BoardAction, CardType, ColumnType } from "@/types";
import { useADContext } from "@/context/ADContext";

const POLL_INTERVAL_MS = 20000;

type ReducerState = { cards: CardType[] };

function boardReducer(state: ReducerState, action: BoardAction): ReducerState {
  switch (action.type) {
    case "SET_CARDS":
      return { cards: action.cards };

    case "ADD_CARD":
      return { ...state, cards: [...state.cards, action.card] };

    case "DELETE_CARD":
      return { ...state, cards: state.cards.filter((c) => c.id !== action.cardId) };

    case "UPDATE_CARD":
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.cardId
            ? { ...c, ...action.updates, updatedAt: new Date().toISOString() }
            : c
        ),
      };

    case "MOVE_CARD": {
      const card = state.cards.find((c) => c.id === action.cardId);
      if (!card) return state;
      const without = state.cards.filter((c) => c.id !== action.cardId);
      const moved: CardType = { ...card, column: action.toColumn, updatedAt: new Date().toISOString() };
      if (action.beforeId === null) return { ...state, cards: [...without, moved] };
      const idx = without.findIndex((c) => c.id === action.beforeId);
      const next = [...without];
      next.splice(idx === -1 ? next.length : idx, 0, moved);
      return { ...state, cards: next };
    }

    case "REORDER_CARD": {
      const card = state.cards.find((c) => c.id === action.cardId);
      if (!card) return state;
      const without = state.cards.filter((c) => c.id !== action.cardId);
      const updated: CardType = { ...card, column: action.column, updatedAt: new Date().toISOString() };
      if (action.beforeId === null) return { ...state, cards: [...without, updated] };
      const idx = without.findIndex((c) => c.id === action.beforeId);
      const next = [...without];
      next.splice(idx === -1 ? next.length : idx, 0, updated);
      return { ...state, cards: next };
    }

    default:
      return state;
  }
}

// Fractional positioning (Trello-style): a new/moved card gets a position
// between its new neighbors within the same column so ordering survives a
// refetch (poll, focus, reload) without renumbering every sibling.
function nextPosition(cards: CardType[], column: ColumnType): number {
  const siblings = cards.filter((c) => c.column === column);
  const max = siblings.length ? Math.max(...siblings.map((c) => c.position ?? 0)) : 0;
  return max + 1000;
}

function positionBetween(
  cards: CardType[],
  cardId: string,
  column: ColumnType,
  beforeId: string | null
): number {
  const siblings = cards.filter((c) => c.column === column && c.id !== cardId);
  if (beforeId === null) {
    const max = siblings.length ? Math.max(...siblings.map((c) => c.position ?? 0)) : 0;
    return max + 1000;
  }
  const idx = siblings.findIndex((c) => c.id === beforeId);
  if (idx === -1) {
    const max = siblings.length ? Math.max(...siblings.map((c) => c.position ?? 0)) : 0;
    return max + 1000;
  }
  const before = siblings[idx];
  const prev = siblings[idx - 1];
  const beforePos = before.position ?? 0;
  const prevPos = prev ? prev.position ?? 0 : beforePos - 2000;
  return (prevPos + beforePos) / 2;
}

async function apiRequest(url: string, method: string, body?: unknown) {
  try {
    await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error(`Board sync failed (${method} ${url})`, err);
  }
}

interface BoardContextValue {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  setMyTasksFilter: (val: boolean) => void;
  filteredCards: (column: ColumnType, projectMemberIds?: Set<string>) => CardType[];
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [reducerState, rawDispatch] = useReducer(boardReducer, { cards: [] });
  const [myTasksFilter, setMyTasksFilter] = useState(false);
  const { currentUser } = useADContext();

  // Keep a ref in sync with the latest cards so the dispatch wrapper (a stable
  // useCallback) can read current state without needing to be recreated on
  // every card change, and without going stale inside closures.
  const cardsRef = useRef<CardType[]>([]);
  cardsRef.current = reducerState.cards;

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/cards");
      if (!res.ok) return;
      const cards: CardType[] = await res.json();
      rawDispatch({ type: "SET_CARDS", cards });
    } catch (err) {
      console.error("Failed to load cards", err);
    }
  }, []);

  // Initial load from the shared backend (replaces the old localStorage hydration).
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Pick up cards created/edited by other users without needing a manual reload.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchCards();
    }, POLL_INTERVAL_MS);
    const onFocus = () => fetchCards();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchCards]);

  // Applies the action optimistically to local state (same reducer as before)
  // and mirrors the mutation to the shared backend in the background.
  const dispatch = useCallback((action: BoardAction) => {
    switch (action.type) {
      case "ADD_CARD": {
        const position = nextPosition(cardsRef.current, action.card.column);
        const card = { ...action.card, position };
        rawDispatch({ type: "ADD_CARD", card });
        apiRequest("/api/cards", "POST", card);
        return;
      }

      case "UPDATE_CARD": {
        rawDispatch(action);
        apiRequest(`/api/cards/${action.cardId}`, "PATCH", action.updates);
        return;
      }

      case "DELETE_CARD": {
        rawDispatch(action);
        apiRequest(`/api/cards/${action.cardId}`, "DELETE");
        return;
      }

      case "MOVE_CARD": {
        const position = positionBetween(cardsRef.current, action.cardId, action.toColumn, action.beforeId);
        rawDispatch(action);
        apiRequest(`/api/cards/${action.cardId}`, "PATCH", { column: action.toColumn, position });
        return;
      }

      case "REORDER_CARD": {
        const position = positionBetween(cardsRef.current, action.cardId, action.column, action.beforeId);
        rawDispatch(action);
        apiRequest(`/api/cards/${action.cardId}`, "PATCH", { column: action.column, position });
        return;
      }

      default:
        rawDispatch(action);
    }
  }, []);

  const state: BoardState = {
    cards: reducerState.cards,
    myTasksFilter,
    currentUser,
  };

  const filteredCards = useCallback(
    (column: ColumnType, projectMemberIds?: Set<string>): CardType[] => {
      const columnCards = reducerState.cards.filter((c) => c.column === column);

      if (!myTasksFilter || !currentUser) {
        // For todo column, also show project tasks where user is a member
        if (column === "todo" && projectMemberIds && currentUser) {
          return columnCards.filter(
            (c) =>
              !c.projectId || // personal task
              projectMemberIds.has(currentUser.id) || // user is in a project that owns this card
              c.assignees?.some((a) => a.id === currentUser.id) // explicitly assigned
          );
        }
        return columnCards;
      }

      return columnCards.filter((c) =>
        c.assignees?.some((a) => a.id === currentUser.id)
      );
    },
    [reducerState.cards, myTasksFilter, currentUser]
  );

  return (
    <BoardContext.Provider value={{ state, dispatch, setMyTasksFilter, filteredCards }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext(): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoardContext must be used within BoardProvider");
  return ctx;
}
