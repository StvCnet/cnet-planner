"use client";

import React, { createContext, useContext, useReducer, useCallback, useState } from "react";
import { BoardState, BoardAction, CardType, ColumnType } from "@/types";
import { DEFAULT_CARDS } from "@/lib/mock-data";
import { useADContext } from "@/context/ADContext";

const initialReducerState = { cards: DEFAULT_CARDS };
type ReducerState = { cards: CardType[] };

function boardReducer(state: ReducerState, action: BoardAction): ReducerState {
  switch (action.type) {
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
      const withoutCard = state.cards.filter((c) => c.id !== action.cardId);
      const movedCard: CardType = { ...card, column: action.toColumn, updatedAt: new Date().toISOString() };
      if (action.beforeId === null) return { ...state, cards: [...withoutCard, movedCard] };
      const beforeIdx = withoutCard.findIndex((c) => c.id === action.beforeId);
      const newCards = [...withoutCard];
      newCards.splice(beforeIdx === -1 ? newCards.length : beforeIdx, 0, movedCard);
      return { ...state, cards: newCards };
    }

    case "REORDER_CARD": {
      const card = state.cards.find((c) => c.id === action.cardId);
      if (!card) return state;
      const withoutCard = state.cards.filter((c) => c.id !== action.cardId);
      const updatedCard: CardType = { ...card, column: action.column, updatedAt: new Date().toISOString() };
      if (action.beforeId === null) return { ...state, cards: [...withoutCard, updatedCard] };
      const beforeIdx = withoutCard.findIndex((c) => c.id === action.beforeId);
      const newCards = [...withoutCard];
      newCards.splice(beforeIdx === -1 ? newCards.length : beforeIdx, 0, updatedCard);
      return { ...state, cards: newCards };
    }

    default:
      return state;
  }
}

interface BoardContextValue {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  setMyTasksFilter: (val: boolean) => void;
  filteredCards: (column: ColumnType) => CardType[];
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [reducerState, dispatch] = useReducer(boardReducer, initialReducerState);
  const [myTasksFilter, setMyTasksFilter] = useState(false);
  const { currentUser } = useADContext();

  const state: BoardState = {
    cards: reducerState.cards,
    myTasksFilter,
    currentUser,
  };

  const filteredCards = useCallback(
    (column: ColumnType): CardType[] => {
      const columnCards = reducerState.cards.filter((c) => c.column === column);
      if (!myTasksFilter || !currentUser) return columnCards;
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
