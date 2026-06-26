import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json(null, { status: 401 });
  }

  const res = await fetch(
    "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,department,jobTitle,mobilePhone",
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!res.ok) {
    return NextResponse.json(null, { status: res.status });
  }

  const d = await res.json();
  return NextResponse.json({
    id: d.id,
    displayName: d.displayName ?? "",
    email: d.mail ?? d.userPrincipalName ?? "",
    department: d.department ?? "",
    title: d.jobTitle ?? "",
    phone: d.mobilePhone ?? undefined,
  });
}
