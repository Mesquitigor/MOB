import { NextResponse } from "next/server";
import { listEntriesInRange } from "@/lib/entries";
import { buildReportPdf, reportFilename } from "@/lib/pdf";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  if (!from || !to || from > to) {
    return NextResponse.json({ error: "Período inválido." }, { status: 400 });
  }

  const entries = await listEntriesInRange(session.id, from, to);
  const pdf = await buildReportPdf({
    name: session.name,
    email: session.email,
    from,
    to,
    entries,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportFilename(from, to)}"`,
    },
  });
}
