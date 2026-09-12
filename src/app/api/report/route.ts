import { NextResponse } from "next/server";
import { listEntriesInRange } from "@/lib/entries";
import { canSendEmail, sendMail } from "@/lib/email";
import { buildReportPdf, reportFilename } from "@/lib/pdf";
import { formatRange } from "@/lib/dates";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as { from?: string; to?: string };
  const from = body.from || "";
  const to = body.to || "";
  if (!from || !to || from > to) {
    return NextResponse.json({ error: "Período inválido." }, { status: 400 });
  }

  if (!canSendEmail()) {
    return NextResponse.json(
      {
        error:
          "Configure SMTP_HOST, SMTP_USER e SMTP_PASS no .env para enviar o relatório por e-mail.",
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
