// Burn Barrel — drag target that deletes cards when dropped
"use client";

import React, { useState } from "react";
import { FaFire } from "react-icons/fa";
import { FiTrash } from "react-icons/fi";
import { useBoard } from "@/hooks/useBoard";

export function BurnBarrel() {
  const { dispatch } = useBoard();
  const [active, setActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => setActive(false);

  const handleDrop = (e: React.DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");
    dispatch({ type: "DELETE_CARD", cardId });
    setActive(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`grid h-48 w-48 shrink-0 place-content-center rounded-xl border border-dashed transition-all duration-200 ${
        active
          ? "border-[--accent-red] bg-red-50 text-[--accent-red]"
          : "border-[--border] text-[--text-muted] hover:border-[--text-muted] bg-[--bg-surface]"
      }`}
    >
      {active ? (
        <FaFire className="text-4xl animate-bounce" />
      ) : (
        <FiTrash className="text-3xl" />
      )}
      <p className="mt-2 text-xs font-medium text-center px-2">
        {active ? "¡Suelta para eliminar!" : "Arrastra aquí para eliminar"}
      </p>
    </div>
  );
}
