import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json([], { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q");

  let url: string;
  if (q && q.trim()) {
    const safe = encodeURIComponent(q.trim());
    url = `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName,'${safe}') or startswith(userPrincipalName,'${safe}')&$select=id,displayName,mail,userPrincipalName,department,jobTitle,mobilePhone&$top=20`;
  } else {
    url = "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,department,jobTitle,mobilePhone&$top=100&$orderby=displayName";
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Graph API error:", text);
    return NextResponse.json([], { status: res.status });
  }

  const data = await res.json();
  const users = (data.value ?? []).map((d: any) => ({
    id: d.id,
    displayName: d.displayName ?? "",
    email: d.mail ?? d.userPrincipalName ?? "",
    department: d.department ?? "",
    title: d.jobTitle ?? "",
    phone: d.mobilePhone ?? undefined,
  }));

  return NextResponse.json(users);
}
