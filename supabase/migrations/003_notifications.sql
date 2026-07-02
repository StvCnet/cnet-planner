-- Panel de notificaciones (asignaciones, invitaciones a proyecto, alertas a admin).
-- Ejecutar en el SQL editor de Supabase (Database > SQL Editor > New query).

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  type text not null,
  title text not null,
  body text,
  card_id text references cards(id) on delete cascade,
  project_id text references projects(id) on delete cascade,
  created_by text,
  created_by_name text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on notifications (user_id, created_at desc);
