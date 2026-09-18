import { NextResponse } from "next/server";
import { listEntriesInRange } from "@/lib/entries";
import { canSendEmail, sendMail } from "@/lib/email";
import { buildReportPdf, reportFilename } from "@/lib/pdf";
import { formatRange } from "@/lib/dates";
import { parsePadDays, parseReportSections } from "@/lib/report";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const from = typeof body.from === "string" ? body.from : "";
  const to = typeof body.to === "string" ? body.to : "";
  if (!from || !to || from > to) {
    return NextResponse.json({ error: "Período inválido." }, { status: 400 });
  }

  if (!canSendEmail()) {
    return NextResponse.json(
      {
        error:
          "O envio por e-mail ainda não está ligado. Use Baixar PDF por enquanto.",
      },
      { status: 503 },
    );
  }

  const entries = await listEntriesInRange(session.id, from, to);
  const pdf = await buildReportPdf({
    name: session.name,
    email: session.email,
    from,
    to,
    entries,
    sections: parseReportSections(body),
    pad: parsePadDays(body),
  });
  const filename = reportFilename(from, to);
  const period = formatRange(from, to);

  await sendMail({
    to: session.email,
    subject: `Relatório Billings · ${period}`,
    text: `Segue o PDF das suas anotações de ${period}.`,
    html: `<p>Olá, ${session.name}.</p><p>Segue o relatório em PDF das anotações de <strong>${period}</strong>.</p>`,
    attachments: [
      {
        filename,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });

  return NextResponse.json({ ok: true });
}
