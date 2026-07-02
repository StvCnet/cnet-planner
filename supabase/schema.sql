-- Compudo: tablas compartidas para tareas (cards) y proyectos.
-- Ejecutar en el SQL editor de Supabase (Database > SQL Editor > New query).
-- Reemplaza el almacenamiento en localStorage que hacia que cada usuario
-- viera solo sus propias tareas.

create table if not exists projects (
  id text primary key,
  name text not null,
  description text,
  color text,
  created_by text,
  created_at timestamptz not null default now(),
  members jsonb not null default '[]'::jsonb,
  duration_weeks text
);

create table if not exists cards (
  id text primary key,
  title text not null,
  "column" text not null,
  description text,
  due_date timestamptz,
  priority text,
  project_id text references projects(id) on delete set null,
  position double precision not null default 0,
  assignees jsonb not null default '[]'::jsonb,
  labels jsonb not null default '[]'::jsonb,
  checklists jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  custom_fields jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  estimated_hours numeric
);

create index if not exists cards_column_idx on cards ("column");
create index if not exists cards_project_id_idx on cards (project_id);

-- No se habilita RLS a proposito: estas tablas solo se leen/escriben desde
-- las rutas app/api/* del servidor usando la service role key, y todas esas
-- rutas ya estan protegidas por middleware.ts (sesion de NextAuth requerida).
-- La service role key ignora RLS de todas formas, asi que dejar RLS
-- deshabilitado evita una capa de configuracion redundante.
