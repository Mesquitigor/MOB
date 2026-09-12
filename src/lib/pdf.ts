import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { STAMP_META, BILLINGS_RULES, ANNOTATION_TIPS, SENSATION_META, MUCUS_META, type DayEntryView, type StampType } from "@/lib/billings";
import { formatRange } from "@/lib/dates";

const TEAL = rgb(0.08, 0.31, 0.33);
const INK = rgb(0.12, 0.2, 0.2);
const MUTED = rgb(0.36, 0.43, 0.43);
const LINE = rgb(0.86, 0.83, 0.78);
const CREAM = rgb(0.97, 0.95, 0.91);

function hex(value: string): RGB {
  const clean = value.replace("#", "");
  return rgb(
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  );
}

function drawStamp(
  page: PDFPage,
  x: number,
  y: number,
  size: number,
  stamp: StampType,
) {
  const meta = STAMP_META[stamp];
  const isWhite = stamp === "FERTILE";
  page.drawRectangle({
    x,
    y,
    width: size,
    height: size,
    color: hex(meta.color),
    borderColor: isWhite ? TEAL : hex(meta.color),
    borderWidth: isWhite ? 0.8 : 0,
  });

  const cx = x + size / 2;
  const cy = y + size / 2;
  const ink = stamp === "SPOTTING" ? rgb(0.07, 0.07, 0.07) : isWhite || stamp === "INFERTILE" ? TEAL : rgb(1, 1, 1);

  if (meta.symbol === "closed-dot") {
    page.drawCircle({ x: cx, y: cy, size: size * 0.18, color: ink });
  } else if (meta.symbol === "dots") {
    page.drawCircle({ x: cx - size * 0.16, y: cy + size * 0.08, size: size * 0.07, color: ink });
    page.drawCircle({ x: cx + size * 0.16, y: cy + size * 0.08, size: size * 0.07, color: ink });
    page.drawCircle({ x: cx, y: cy - size * 0.12, size: size * 0.07, color: ink });
  } else if (meta.symbol === "dash") {
    page.drawRectangle({
      x: cx - 0.7,
      y: cy - size * 0.22,
      width: 1.4,
      height: size * 0.44,
      color: ink,
    });
  } else if (meta.symbol === "equal") {
    page.drawRectangle({ x: cx - size * 0.18, y: cy + 1.2, width: size * 0.36, height: 1.4, color: ink });
    page.drawRectangle({ x: cx - size * 0.18, y: cy - 2.6, width: size * 0.36, height: 1.4, color: ink });
  } else {
    page.drawCircle({
      x: cx,
      y: cy,
      size: size * 0.18,
      borderColor: ink,
      borderWidth: 1.1,
    });
  }
}

function textWidth(font: PDFFont, value: string, size: number) {
  return font.widthOfTextAtSize(value, size);
}

function clip(font: PDFFont, value: string, size: number, max: number) {
  const source = value.replace(/[^\u0000-\u00FF]/g, " ");
  if (textWidth(font, source, size) <= max) return source;
  let next = source;
  while (next.length > 1 && textWidth(font, `${next}...`, size) > max) {
    next = next.slice(0, -1);
  }
  return `${next}...`;
}

export async function buildReportPdf(input: {
  name: string;
  email: string;
  from: string;
  to: string;
  entries: DayEntryView[];
}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [595.28, 841.89];
  let page = doc.addPage(pageSize);
  let { width, height } = page.getSize();
  let y = height - 36;

  const ensure = (need: number) => {
    if (y - need < 42) {
      page = doc.addPage(pageSize);
      ({ width, height } = page.getSize());
      y = height - 42;
    }
  };

  page.drawRectangle({ x: 0, y: height - 28, width, height: 28, color: TEAL });
  page.drawText("MOB  ·  Metodo de Ovulacao Billings", {
    x: 36,
    y: height - 18,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  y = height - 56;
  page.drawText("Relatorio de anotacoes", { x: 36, y, size: 18, font: bold, color: INK });
  y -= 18;
  page.drawText(input.name, { x: 36, y, size: 11, font, color: MUTED });
  y -= 14;
  page.drawText(formatRange(input.from, input.to), { x: 36, y, size: 11, font, color: MUTED });
  y -= 14;
  page.drawText(`${input.entries.length} dia(s) anotado(s)`, { x: 36, y, size: 10, font, color: MUTED });
  y -= 18;

  if (input.entries.length) {
    page.drawText("Grafico do periodo", { x: 36, y, size: 11, font: bold, color: TEAL });
    y -= 10;
    let x = 36;
    const stampSize = 16;
    for (const entry of input.entries) {
      if (x + stampSize > width - 36) {
        x = 36;
        y -= stampSize + 4;
        ensure(stampSize + 8);
      }
      drawStamp(page, x, y - stampSize, stampSize, entry.stamp);
      x += stampSize + 3;
    }
    y -= stampSize + 18;
  }

  ensure(70);
  page.drawText("Anotacoes", { x: 36, y, size: 11, font: bold, color: TEAL });
  y -= 16;

  const columns = [
    { label: "Dia", x: 36, w: 28 },
    { label: "Data", x: 66, w: 78 },
    { label: "Selo", x: 148, w: 72 },
    { label: "Sinto", x: 224, w: 78 },
    { label: "Vejo", x: 306, w: 86 },
    { label: "Rel.", x: 396, w: 28 },
    { label: "Apice", x: 426, w: 36 },
    { label: "Nota", x: 466, w: 93 },
  ];

  const header = () => {
    page.drawRectangle({ x: 32, y: y - 4, width: width - 64, height: 16, color: CREAM });
    for (const col of columns) {
      page.drawText(col.label, { x: col.x, y, size: 8, font: bold, color: MUTED });
    }
    y -= 16;
  };

  header();

  if (!input.entries.length) {
    page.drawText("Nenhuma anotacao neste periodo.", { x: 36, y, size: 10, font, color: MUTED });
    y -= 20;
  }

  for (const entry of input.entries) {
    ensure(36);
    if (y < 64) {
      page = doc.addPage(pageSize);
      ({ width, height } = page.getSize());
      y = height - 42;
      header();
    }

    drawStamp(page, 36, y - 3, 10, entry.stamp);
    const shortDate = entry.date.split("-").reverse().join("/");
    const values = [
      String(entry.cycleDay ?? "-"),
      shortDate,
      STAMP_META[entry.stamp].short,
      entry.sensation ? SENSATION_META[entry.sensation].label : "-",
      entry.mucus && entry.mucus !== "NONE" ? MUCUS_META[entry.mucus].label : "-",
      entry.intercourse ? "sim" : "-",
      entry.peak ? "sim" : "-",
      entry.notes.trim() || "-",
    ];

    values.forEach((value, index) => {
      const col = columns[index];
      page.drawText(clip(font, value, 8, col.w - 4), {
        x: index === 0 ? 50 : col.x,
        y,
        size: 8,
        font,
      color: INK,
    });
    });
    y -= 16;
    page.drawLine({
      start: { x: 32, y: y + 10 },
      end: { x: width - 32, y: y + 10 },
      thickness: 0.3,
      color: LINE,
    });
  }

  y -= 18;
  ensure(120);
  page.drawText("Cores e simbolos", { x: 36, y, size: 11, font: bold, color: TEAL });
  y -= 18;
  (Object.keys(STAMP_META) as StampType[]).forEach((stamp) => {
    ensure(22);
    drawStamp(page, 36, y - 4, 12, stamp);
    page.drawText(`${STAMP_META[stamp].label}  —  ${STAMP_META[stamp].description}`, {
      x: 54,
      y,
      size: 8,
      font,
      color: INK,
    });
    y -= 16;
  });

  y -= 8;
  ensure(90);
  page.drawText("Como anotar", { x: 36, y, size: 11, font: bold, color: TEAL });
  y -= 14;
  ANNOTATION_TIPS.forEach((tip) => {
    ensure(14);
    page.drawText(`•  ${tip}`, { x: 36, y, size: 8, font, color: INK });
    y -= 12;
  });

  y -= 8;
  ensure(110);
  page.drawText("Regras do metodo", { x: 36, y, size: 11, font: bold, color: TEAL });
  y -= 14;
  BILLINGS_RULES.forEach((rule) => {
    ensure(28);
    page.drawText(`Regra ${rule.number}  ${rule.title}`, { x: 36, y, size: 8, font: bold, color: INK });
    y -= 11;
    page.drawText(rule.text, { x: 36, y, size: 8, font, color: MUTED });
    y -= 14;
  });

  y -= 6;
  ensure(28);
  page.drawText(
    "Material de apoio as anotacoes. Nao substitui o acompanhamento com instrutora credenciada.",
    { x: 36, y, size: 7, font, color: MUTED },
  );

  return Buffer.from(await doc.save());
}

export function reportFilename(from: string, to: string) {
  return `mob-billings-${from}-a-${to}.pdf`;
}
