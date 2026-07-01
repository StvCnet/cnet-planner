"use client";

import React, {
  createContext, useContext, useReducer, useCallback,
  useState, useEffect,
} from "react";
import { BoardState, BoardAction, CardType, ColumnType } from "@/types";
import { DEFAULT_CARDS } from "@/lib/mock-data";
import { useADContext } from "@/context/ADContext";

const STORAGE_KEY = "cnet-cards-v1";

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

interface BoardContextValue {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  setMyTasksFilter: (val: boolean) => void;
  filteredCards: (column: ColumnType, projectMemberIds?: Set<string>) => CardType[];
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [reducerState, dispatch] = useReducer(boardReducer, { cards: DEFAULT_CARDS });
  const [myTasksFilter, setMyTasksFilter] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { currentUser } = useADContext();

  // Load from localStorage on mount — skip mock data from previous sessions
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const cards: CardType[] = JSON.parse(stored);
        // Discard old mock cards (they have mock user assignees with id "u1"..."u20")
        const isMockData = cards.some((c) =>
          c.assignees?.some((a) => /^u\d+$/.test(a.id))
        );
        if (!isMockData && Array.isArray(cards)) {
          dispatch({ type: "SET_CARDS", cards });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reducerState.cards));
  }, [reducerState.cards, hydrated]);

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
