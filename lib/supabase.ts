import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only client (service role key). Never import this from a "use client" file —
// route handlers under app/api/* are already gated by middleware.ts (NextAuth session).
// Created lazily so `next build` doesn't fail at page-data-collection time in
// environments where the env vars aren't set yet (e.g. before Vercel/Docker
// secrets are configured) — routes still throw clearly if actually invoked without them.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return client;
}
