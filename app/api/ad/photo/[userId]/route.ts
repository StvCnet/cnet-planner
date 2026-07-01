import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return new NextResponse(null, { status: 401 });
  }

  try {
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${params.userId}/photo/$value`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );
    if (!res.ok) return new NextResponse(null, { status: 404 });

    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
