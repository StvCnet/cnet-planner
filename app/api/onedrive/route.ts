import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export interface OneDriveItem {
  id: string;
  name: string;
  type: "folder" | "file";
  mimeType?: string;
  size?: number;
  webUrl: string;
  driveId: string;
  modifiedAt: string;
  extension?: string;
}

export interface OneDrive {
  id: string;
  name: string;
  driveType: string;
  webUrl: string;
}

function ext(name: string) {
  const m = name.match(/\.([^.]+)$/);
  return m ? m[1].toLowerCase() : "";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = session.accessToken;
  const driveId = req.nextUrl.searchParams.get("driveId");
  const itemId = req.nextUrl.searchParams.get("itemId");

  try {
    /* ── List all drives ───────────────────────────────────────────────────── */
    if (!driveId) {
      const res = await fetch(
        "https://graph.microsoft.com/v1.0/me/drives?$select=id,name,driveType,webUrl",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json({ error: err.error?.message ?? "No se pudo acceder a OneDrive", code: res.status }, { status: res.status });
      }
      const data = await res.json();
      const EXCLUDED = ["personalcachelibrary", "preservation hold library", "site assets"];
      const drives: OneDrive[] = (data.value ?? [])
        .filter((d: any) => !EXCLUDED.includes((d.name ?? "").toLowerCase()))
        .map((d: any) => ({
          id: d.id,
          name: d.name || "Mi OneDrive",
          driveType: d.driveType,
          webUrl: d.webUrl ?? "",
        }));
      return NextResponse.json({ drives });
    }

    /* ── Browse folder contents ────────────────────────────────────────────── */
    const url = itemId
      ? `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/children`
      : `https://graph.microsoft.com/v1.0/drives/${driveId}/root/children`;

    const res = await fetch(
      url +
        "?$select=id,name,file,folder,webUrl,size,lastModifiedDateTime,parentReference" +
        "&$top=200&$orderby=name",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.error?.message ?? "Error al listar archivos", code: res.status }, { status: res.status });
    }
    const data = await res.json();
    const items: OneDriveItem[] = (data.value ?? []).map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.folder ? "folder" : "file",
      mimeType: item.file?.mimeType,
      size: item.size,
      webUrl: item.webUrl ?? "",
      driveId,
      modifiedAt: item.lastModifiedDateTime ?? "",
      extension: item.folder ? undefined : ext(item.name),
    }));
    // Folders first, then files
    items.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "folder" ? -1 : 1;
    });
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
