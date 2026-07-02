-- Agrega horas estimadas por tarea y duracion en semanas por proyecto.
-- Ejecutar en el SQL editor de Supabase (Database > SQL Editor > New query).

alter table cards add column if not exists estimated_hours numeric;
alter table projects add column if not exists duration_weeks text;
