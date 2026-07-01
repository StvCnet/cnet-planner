"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Board } from "@/components/kanban/Board";
import { CalendarView } from "@/components/views/CalendarView";
import { DashboardView } from "@/components/views/DashboardView";
import { DirectoryView } from "@/components/views/DirectoryView";
import { ProjectsView } from "@/components/views/ProjectsView";

const VIEWS = [
  { value: "kanban",    label: "Kanban" },
  { value: "projects",  label: "Proyectos" },
  { value: "calendar",  label: "Calendario" },
  { value: "dashboard", label: "Dashboard" },
  { value: "directory", label: "Directorio AD" },
] as const;

type ViewType = (typeof VIEWS)[number]["value"];

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
};

export function ViewSwitcher() {
  const [activeView, setActiveView] = useState<ViewType>("kanban");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewType)}>
          <TabsList className="glass border-none">
            {VIEWS.map((view) => (
              <TabsTrigger key={view.value} value={view.value}>
                {view.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === "kanban" && (
            <motion.div key="kanban" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="h-full">
              <div className="h-full overflow-x-auto"><Board /></div>
            </motion.div>
          )}
          {activeView === "projects" && (
            <motion.div key="projects" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="h-full">
              <div className="h-full overflow-hidden"><ProjectsView /></div>
            </motion.div>
          )}
          {activeView === "calendar" && (
            <motion.div key="calendar" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="h-full">
              <div className="h-full px-4 py-2 overflow-hidden"><CalendarView /></div>
            </motion.div>
          )}
          {activeView === "dashboard" && (
            <motion.div key="dashboard" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="h-full">
              <div className="h-full px-4 py-2 overflow-y-auto"><DashboardView /></div>
            </motion.div>
          )}
          {activeView === "directory" && (
            <motion.div key="directory" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.15 }} className="h-full">
              <div className="h-full overflow-hidden"><DirectoryView /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
