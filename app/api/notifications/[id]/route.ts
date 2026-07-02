import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { notificationFromRow, notificationToRow } from "@/lib/mappers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(null, { status: 401 });

  const updates = await req.json();
  const { data, error } = await getSupabase()
    .from("notifications")
    .update(notificationToRow(updates))
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(notificationFromRow(data));
}
