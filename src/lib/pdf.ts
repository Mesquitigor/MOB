import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { STAMP_META, BILLINGS_RULES, ANNOTATION_TIPS, SENSATION_META, MUCUS_META, type DayEntryView, type StampType } from "@/lib/billings";
import { formatRange } from "@/lib/dates";

const TEAL = rgb(0.08, 0.31, 0.33);
const INK = rgb(0.12, 0.2, 0.2);
const MUTED = rgb(0.36, 0.43, 0.43);
const LINE = rgb(0.86, 0.83, 0.78);
const CREAM = rgb(0.97, 0.95, 0.91);

const PDF_STAMP_SHORT: Record<StampType, string> = {
  MENSTRUATION: "MENST.",
  SPOTTING: "MANCHAS",
  DRY: "SECA",
  FERTILE: "FERTIL",
  INFERTILE: "PBI",
};

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

const encodable = new Map<string, boolean>();

function prepare(font: PDFFont, value: string) {
  const normalized = value
    .normalize("NFC")
    .replace(/[—–−]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
  let out = "";
  for (const char of normalized) {
    const key = `${font.name}:${char}`;
    let ok = encodable.get(key);
    if (ok === undefined) {
      try {
        font.encodeText(char);
        ok = true;
      } catch {
        ok = false;
      }
      encodable.set(key, ok);
    }
    if (ok) out += char;
  }
  return out;
}

function clip(font: PDFFont, value: string, size: number, max: number) {
  const source = prepare(font, value);
  if (textWidth(font, source, size) <= max) return source;
  let next = source;
  while (next.length > 1 && textWidth(font, `${next}...`, size) > max) {
    next = next.slice(0, -1);
  }
  return `${next}...`;
}

function wrap(font: PDFFont, value: string, size: number, max: number) {
  const lines: string[] = [];
  let line = "";

  const push = () => {
    if (line) lines.push(line);
    line = "";
  };

  for (const word of prepare(font, value).split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(font, candidate, size) > max) {
      push();
      line = word;
    } else {
      line = candidate;
    }
    while (textWidth(font, line, size) > max && line.length > 1) {
      let cut = line.length - 1;
      while (cut > 1 && textWidth(font, line.slice(0, cut), size) > max) cut -= 1;
      lines.push(line.slice(0, cut));
      line = line.slice(cut);
    }
  }
  push();

  return lines.length ? lines : [""];
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
  let y = height - 56;
  const contentWidth = width - 72;

  const draw = (
    value: string,
    options: { x: number; y: number; size: number; font: PDFFont; color: RGB },
  ) => {
    page.drawText(prepare(options.font, value), options);
  };

  const topBar = () => {
    page.drawRectangle({ x: 0, y: height - 28, width, height: 28, color: TEAL });
    draw("MOB  ·  Método de Ovulação Billings", {
      x: 36,
      y: height - 18,
      size: 10,
      font: bold,
      color: rgb(1, 1, 1),
    });
  };

  const ensure = (need: number, onBreak?: () => void) => {
    if (y - need < 42) {
      page = doc.addPage(pageSize);
      ({ width, height } = page.getSize());
      topBar();
      y = height - 56;
      onBreak?.();
    }
  };

  topBar();

  draw("Relatório de anotações", { x: 36, y, size: 18, font: bold, color: INK });
  y -= 18;
  draw(input.name, { x: 36, y, size: 11, font, color: MUTED });
  y -= 14;
  draw(formatRange(input.from, input.to).replace(/\./g, ""), { x: 36, y, size: 11, font, color: MUTED });
  y -= 14;
  draw(`${input.entries.length} dia(s) anotado(s)`, { x: 36, y, size: 10, font, color: MUTED });
  y -= 18;

  if (input.entries.length) {
    draw("Gráfico do período", { x: 36, y, size: 11, font: bold, color: TEAL });
    y -= 10;
    let x = 36;
    const stampSize = 16;
    for (const entry of input.entries) {
      if (x + stampSize > width - 36) {
        x = 36;
        ensure(stampSize + 8);
        y -= stampSize + 4;
      }
      drawStamp(page, x, y - stampSize, stampSize, entry.stamp);
      x += stampSize + 3;
    }
    y -= stampSize + 18;
  }

  ensure(70);
  draw("Anotações", { x: 36, y, size: 11, font: bold, color: TEAL });
  y -= 16;

  const columns = [
    { label: "Dia", x: 36, w: 28 },
    { label: "Data", x: 66, w: 78 },
    { label: "Selo", x: 148, w: 58 },
    { label: "Sinto", x: 210, w: 78 },
    { label: "Vejo", x: 292, w: 86 },
    { label: "Rel.", x: 382, w: 28 },
    { label: "Ápice", x: 414, w: 36 },
    { label: "Nota", x: 454, w: 105 },
  ];

  const header = () => {
    page.drawRectangle({ x: 32, y: y - 4, width: width - 64, height: 16, color: CREAM });
    for (const col of columns) {
      draw(col.label, { x: col.x, y, size: 8, font: bold, color: MUTED });
    }
    y -= 16;
  };

  header();

  if (!input.entries.length) {
    draw("Nenhuma anotação neste período.", { x: 36, y, size: 10, font, color: MUTED });
    y -= 20;
  }

  for (const entry of input.entries) {
    const noteLines = wrap(font, entry.notes.trim() || "-", 8, columns[7].w - 4);
    const rowH = Math.max(16, 6 + noteLines.length * 10);
    ensure(rowH + 6, header);

    drawStamp(page, 36, y - 3, 10, entry.stamp);
    const shortDate = entry.date.split("-").reverse().join("/");
    const values = [
      String(entry.cycleDay ?? "-"),
      shortDate,
      PDF_STAMP_SHORT[entry.stamp],
      entry.sensation ? SENSATION_META[entry.sensation].label : "-",
      entry.mucus && entry.mucus !== "NONE" ? MUCUS_META[entry.mucus].label : "-",
      entry.intercourse ? "sim" : "-",
      entry.peak ? "sim" : "-",
    ];

    values.forEach((value, index) => {
      const col = columns[index];
      draw(clip(font, value, 8, col.w - 4), {
        x: index === 0 ? 50 : col.x,
        y,
        size: 8,
        font,
        color: INK,
      });
    });
    noteLines.forEach((line, index) => {
      draw(line, { x: columns[7].x, y: y - index * 10, size: 8, font, color: INK });
    });
    y -= rowH;
    page.drawLine({
      start: { x: 32, y: y + 10 },
      end: { x: width - 32, y: y + 10 },
      thickness: 0.3,
      color: LINE,
    });
  }

  y -= 18;
  ensure(120);
  draw("Cores e símbolos", { x: 36, y, size: 11, font: bold, color: TEAL });
  y -= 18;
  (Object.keys(STAMP_META) as StampType[]).forEach((stamp) => {
    const lines = wrap(font, `${STAMP_META[stamp].label}  -  ${STAMP_META[stamp].description}`, 8, contentWidth - 22);
    ensure(8 + lines.length * 12);
    drawStamp(page, 36, y - 4, 12, stamp);
    lines.forEach((line, index) => {
      draw(line, { x: 54, y: y - index * 11, size: 8, font, color: INK });
    });
    y -= Math.max(16, lines.length * 11 + 4);
  });

  y -= 8;
  ensure(90);
  draw("Como anotar", { x: 36, y, size: 11, font: bold, color: TEAL });
  y -= 14;
  ANNOTATION_TIPS.forEach((tip) => {
    const lines = wrap(font, `•  ${tip}`, 8, contentWidth);
    ensure(4 + lines.length * 12);
    lines.forEach((line) => {
      draw(line, { x: 36, y, size: 8, font, color: INK });
      y -= 12;
    });
  });

  y -= 8;
  ensure(110);
  draw("Regras do método", { x: 36, y, size: 11, font: bold, color: TEAL });
  y -= 14;
  BILLINGS_RULES.forEach((rule) => {
    const lines = wrap(font, rule.text, 8, contentWidth);
    ensure(22 + lines.length * 11);
    draw(`Regra ${rule.number}  ${rule.title}`, { x: 36, y, size: 8, font: bold, color: INK });
    y -= 11;
    lines.forEach((line) => {
      draw(line, { x: 36, y, size: 8, font, color: MUTED });
      y -= 11;
    });
    y -= 4;
  });

  y -= 6;
  const disclaimer = wrap(
    font,
    "Material de apoio às anotações. Não substitui o acompanhamento com instrutora credenciada.",
    7,
    contentWidth,
  );
  ensure(8 + disclaimer.length * 10);
  disclaimer.forEach((line) => {
    draw(line, { x: 36, y, size: 7, font, color: MUTED });
    y -= 10;
  });

  return Buffer.from(await doc.save());
}

export function reportFilename(from: string, to: string) {
  return `mob-billings-${from}-a-${to}.pdf`;
}
