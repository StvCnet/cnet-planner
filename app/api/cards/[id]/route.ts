import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { cardFromRow, cardToRow } from "@/lib/mappers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(null, { status: 401 });

  const updates = await req.json();
  const { data, error } = await getSupabase()
    .from("cards")
    .update(cardToRow(updates))
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(cardFromRow(data));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(null, { status: 401 });

  const { error } = await getSupabase().from("cards").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
