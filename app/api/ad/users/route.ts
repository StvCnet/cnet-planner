import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DOMAINS = ["@myallsupport.com", "@grupocnet.com"];

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function allowedEmail(email: string): boolean {
  const e = email.toLowerCase();
  return ALLOWED_DOMAINS.some((d) => e.endsWith(d));
}

function mapUser(d: any) {
  const email = d.mail ?? d.userPrincipalName ?? "";
  return {
    id: d.id,
    displayName: d.displayName ?? "",
    email,
    department: d.department ?? "",
    title: d.jobTitle ?? "",
    phone: d.mobilePhone ?? undefined,
    isAdmin: ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email.toLowerCase()),
  };
}

async function fetchAllUsers(token: string): Promise<any[]> {
  const results: any[] = [];
  let url =
    "https://graph.microsoft.com/v1.0/users" +
    "?$select=id,displayName,mail,userPrincipalName,department,jobTitle,mobilePhone" +
    "&$top=999&$orderby=displayName";

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) break;
    const data = await res.json();
    results.push(...(data.value ?? []));
    url = data["@odata.nextLink"] ?? "";
  }
  return results;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json([], { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q");

  if (q && q.trim()) {
    const safe = q.trim().replace(/'/g, "''");
    const url =
      `https://graph.microsoft.com/v1.0/users` +
      `?$filter=startswith(displayName,'${safe}') or startswith(userPrincipalName,'${safe}')` +
      `&$select=id,displayName,mail,userPrincipalName,department,jobTitle,mobilePhone&$top=25`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    return NextResponse.json(
      (data.value ?? [])
        .map(mapUser)
        .filter((u: ReturnType<typeof mapUser>) => allowedEmail(u.email))
    );
  }

  const all = await fetchAllUsers(session.accessToken);
  return NextResponse.json(
    all.map(mapUser).filter((u) => allowedEmail(u.email))
  );
}
