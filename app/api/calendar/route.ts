import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export interface OutlookEvent {
  id: string;
  subject: string;
  start: string;
  end: string;
  isAllDay: boolean;
  webLink: string;
  color: string;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json([], { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!startParam || !endParam) {
    return NextResponse.json([], { status: 400 });
  }

  const url =
    `https://graph.microsoft.com/v1.0/me/calendarView` +
    `?startDateTime=${startParam}&endDateTime=${endParam}` +
    `&$select=id,subject,start,end,isAllDay,webLink` +
    `&$top=100&$orderby=start/dateTime`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      Prefer: 'outlook.timezone="America/Bogota"',
    },
  });

  if (!res.ok) {
    console.error("Calendar API error:", await res.text());
    return NextResponse.json([]);
  }

  const data = await res.json();
  const events: OutlookEvent[] = (data.value ?? []).map((e: any) => ({
    id: e.id,
    subject: e.subject ?? "(Sin título)",
    start: e.start?.dateTime ?? e.start?.date ?? "",
    end: e.end?.dateTime ?? e.end?.date ?? "",
    isAllDay: e.isAllDay ?? false,
    webLink: e.webLink ?? "",
    color: "#073c81",
  }));

  return NextResponse.json(events);
}
