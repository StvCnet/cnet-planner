import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { notificationFromRow, notificationToRow } from "@/lib/mappers";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(null, { status: 401 });

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json([]);

  const { data, error } = await getSupabase()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(notificationFromRow));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(null, { status: 401 });

  const notification = await req.json();
  const { data, error } = await getSupabase()
    .from("notifications")
    .insert(notificationToRow(notification))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(notificationFromRow(data));
}
