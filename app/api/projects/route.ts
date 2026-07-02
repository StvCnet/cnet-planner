import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { projectFromRow, projectToRow } from "@/lib/mappers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(null, { status: 401 });

  const { data, error } = await getSupabase()
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(projectFromRow));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(null, { status: 401 });

  const project = await req.json();
  const { data, error } = await getSupabase()
    .from("projects")
    .insert(projectToRow(project))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(projectFromRow(data));
}
