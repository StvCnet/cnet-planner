import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { cardFromRow, cardToRow } from "@/lib/mappers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(null, { status: 401 });

  const { data, error } = await getSupabase()
    .from("cards")
    .select("*")
    .order("position", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(cardFromRow));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(null, { status: 401 });

  const card = await req.json();
  const { data, error } = await getSupabase()
    .from("cards")
    .insert(cardToRow(card))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(cardFromRow(data));
}
