import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { degrees, PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { STAMP_META, BILLINGS_RULES, ANNOTATION_TIPS, SENSATION_META, MUCUS_META, type DayEntryView, type StampType } from "@/lib/billings";
import { addDaysISO, eachDate, formatDay, todayISO } from "@/lib/dates";
import { DEFAULT_REPORT_SECTIONS, type ReportSections } from "@/lib/report";

const WINE = rgb(0.43, 0.267, 0.314);
const INK = rgb(0.2, 0.157, 0.141);
const MUTED = rgb(0.54, 0.49, 0.46);
const LINE = rgb(0.55, 0.55, 0.55);

const LANDSCAPE: [number, number] = [841.89, 595.28];
const PORTRAIT: [number, number] = [595.28, 841.89];
const DAYS_PER_PAGE = 35;

function hex(value: string): RGB {
  const clean = value.replace("#", "");
  return rgb(
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  );
}

function drawStamp(page: PDFPage, x: number, y: number, size: number, stamp: StampType) {
  const meta = STAMP_META[stamp];
  const isWhite = stamp === "FERTILE";
  page.drawRectangle({
    x,
    y,
    width: size,
    height: size,
    color: hex(meta.color),
    borderColor: isWhite ? WINE : hex(meta.color),
    borderWidth: isWhite ? 0.7 : 0,
  });

  const cx = x + size / 2;
  const cy = y + size / 2;
  const ink = stamp === "SPOTTING" ? rgb(0.07, 0.07, 0.07) : isWhite || stamp === "INFERTILE" ? WINE : rgb(1, 1, 1);

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

function chartDates(from: string, to: string, pad?: number) {
  const dates = eachDate(from, to);
  if (!pad || dates.length >= pad) return dates;
  let last = dates[dates.length - 1] ?? from;
  while (dates.length < pad) {
    last = addDaysISO(last, 1);
    dates.push(last);
  }
  return dates;
}

function chunks<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out.length ? out : [[]];
}

function sensationLabel(entry: DayEntryView | undefined) {
  if (!entry?.sensation) return "";
  return SENSATION_META[entry.sensation].label.toUpperCase();
}

function mucusLabel(entry: DayEntryView | undefined) {
  if (!entry) return "";
  if (!entry.mucus || entry.mucus === "NONE") return entry.sensation ? "NADA" : "";
  return MUCUS_META[entry.mucus].label.toUpperCase();
}

async function embedLogo(doc: PDFDocument) {
  try {
    const bytes = await readFile(join(process.cwd(), "public/logo-mark.png"));
    return doc.embedPng(bytes);
  } catch {
    return null;
  }
}

export async function buildReportPdf(input: {
  name: string;
  email: string;
  from: string;
  to: string;
  entries: DayEntryView[];
  sections?: ReportSections;
  pad?: number;
}) {
  const sections = input.sections ?? DEFAULT_REPORT_SECTIONS;
  const byDate = new Map(input.entries.map((entry) => [entry.date, entry]));
  const dates = chartDates(input.from, input.to, input.pad);
  const pagesDates = chunks(dates, DAYS_PER_PAGE);

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(doc);
  const printed = todayISO().split("-").reverse().join("/");
  const [startYear, startMonth, startDay] = input.from.split("-");
  const startLabel = `${startDay}/${startMonth}/${startYear.slice(2)}`;

  const draw = (
    page: PDFPage,
    value: string,
    options: { x: number; y: number; size: number; font: PDFFont; color: RGB; rotate?: number },
  ) => {
    page.drawText(prepare(options.font, value), {
      x: options.x,
      y: options.y,
      size: options.size,
      font: options.font,
      color: options.color,
      rotate: options.rotate ? degrees(options.rotate) : undefined,
    });
  };

  for (let pageIndex = 0; pageIndex < pagesDates.length; pageIndex += 1) {
    const page = doc.addPage(LANDSCAPE);
    const { width, height } = page.getSize();
    const margin = 28;
    const headerH = 54;
    const labelW = 78;
    const tableLeft = margin + labelW;
    const tableRight = width - margin;
    const tableWidth = tableRight - tableLeft;
    const cols = Math.max(pagesDates[pageIndex].length, 1);
    const colW = tableWidth / DAYS_PER_PAGE;
    const usedWidth = colW * pagesDates[pageIndex].length;

    if (logo) {
      page.drawImage(logo, { x: margin, y: height - 42, width: 22, height: 22 });
    }
    draw(page, "MÉTODO BILLINGS", {
      x: margin + (logo ? 28 : 0),
      y: height - 28,
      size: 13,
      font: bold,
      color: WINE,
    });
    const userLine = `USUÁRIO: ${input.name.toUpperCase()}`;
    const printLine = `IMPRESSO EM ${printed}`;
    draw(page, userLine, {
      x: width - margin - textWidth(bold, prepare(bold, userLine), 8),
      y: height - 22,
      size: 8,
      font: bold,
      color: INK,
    });
    draw(page, printLine, {
      x: width - margin - textWidth(font, printLine, 7),
      y: height - 34,
      size: 7,
      font,
      color: MUTED,
    });

    const cycleTitle = `CICLO INÍCIO EM ${startLabel}`;
    draw(page, cycleTitle, {
      x: margin,
      y: height - headerH - 2,
      size: 8,
      font: bold,
      color: INK,
    });

    type Row = { key: string; label: string; height: number };
    const rows: Row[] = [
      { key: "cycle", label: "Dia do ciclo", height: 18 },
      ...(sections.symbols ? [{ key: "symbols", label: "Simb.", height: 22 }] : []),
      { key: "date", label: "Dia", height: 28 },
      { key: "sensation", label: "Sinto", height: 92 },
      { key: "mucus", label: "Vejo", height: 92 },
      ...(sections.rules ? [{ key: "rules", label: "Regra", height: 64 }] : []),
    ];

    const tableTop = height - headerH - 18;
    const tableHeight = rows.reduce((sum, row) => sum + row.height, 0);
    const tableBottom = tableTop - tableHeight;

    page.drawRectangle({
      x: margin,
      y: tableBottom,
      width: labelW + usedWidth,
      height: tableHeight,
      borderColor: LINE,
      borderWidth: 0.8,
    });

    let rowY = tableTop;
    for (const row of rows) {
      rowY -= row.height;
      page.drawLine({
        start: { x: margin, y: rowY },
        end: { x: margin + labelW + usedWidth, y: rowY },
        thickness: 0.5,
        color: LINE,
      });
      draw(page, row.label, {
        x: margin + 4,
        y: rowY + row.height / 2 - 3,
        size: 7,
        font: bold,
        color: INK,
      });
    }

    pagesDates[pageIndex].forEach((date, index) => {
      const x = tableLeft + index * colW;
      const entry = byDate.get(date);
      const globalDay = pageIndex * DAYS_PER_PAGE + index + 1;
      page.drawLine({
        start: { x, y: tableTop },
        end: { x, y: tableBottom },
        thickness: 0.4,
        color: LINE,
      });

      let y = tableTop;
      for (const row of rows) {
        y -= row.height;
        const cx = x + colW / 2;
        if (row.key === "cycle") {
          const label = String(entry?.cycleDay ?? globalDay);
          draw(page, label, {
            x: cx - textWidth(bold, label, 7) / 2,
            y: y + 5,
            size: 7,
            font: bold,
            color: INK,
          });
        } else if (row.key === "symbols" && entry) {
          const size = 12;
          drawStamp(page, cx - size / 2, y + (row.height - size) / 2, size, entry.stamp);
        } else if (row.key === "date") {
          const [day, month] = formatDay(date).toUpperCase().split(" ");
          draw(page, day, {
            x: cx - textWidth(bold, day, 6) / 2,
            y: y + 14,
            size: 6,
            font: bold,
            color: INK,
          });
          if (month) {
            draw(page, month, {
              x: cx - textWidth(font, month, 5.5) / 2,
              y: y + 5,
              size: 5.5,
              font,
              color: MUTED,
            });
          }
        } else if (row.key === "sensation" || row.key === "mucus") {
          const value = row.key === "sensation" ? sensationLabel(entry) : mucusLabel(entry);
          if (!value) continue;
          const size = 6;
          const text = clip(font, value, size, row.height - 10);
          draw(page, text, {
            x: cx + size / 2 - 1,
            y: y + 6,
            size,
            font,
            color: INK,
            rotate: 90,
          });
        }
      }
    });

    page.drawLine({
      start: { x: tableLeft + usedWidth, y: tableTop },
      end: { x: tableLeft + usedWidth, y: tableBottom },
      thickness: 0.8,
      color: LINE,
    });

    const disclaimer = "Apoio às anotações. Não substitui instrutora credenciada.";
    draw(page, disclaimer, {
      x: margin,
      y: 18,
      size: 7,
      font,
      color: MUTED,
    });
  }

  const appendixNeeded = sections.legend || sections.tips || sections.rules;
  if (appendixNeeded) {
    let page = doc.addPage(PORTRAIT);
    let { width, height } = page.getSize();
    const contentWidth = width - 72;
    let y = height - 48;

    const drawText = (
      value: string,
      options: { x: number; y: number; size: number; font: PDFFont; color: RGB },
    ) => {
      page.drawText(prepare(options.font, value), options);
    };

    const ensure = (need: number) => {
      if (y - need >= 42) return;
      page = doc.addPage(PORTRAIT);
      ({ width, height } = page.getSize());
      y = height - 48;
    };

    if (sections.legend) {
      drawText("Cores e símbolos", { x: 36, y, size: 12, font: bold, color: WINE });
      y -= 18;
      (Object.keys(STAMP_META) as StampType[]).forEach((stamp) => {
        const lines = wrap(font, `${STAMP_META[stamp].label}  -  ${STAMP_META[stamp].description}`, 8, contentWidth - 22);
        ensure(8 + lines.length * 12);
        drawStamp(page, 36, y - 4, 12, stamp);
        lines.forEach((line, index) => {
          drawText(line, { x: 54, y: y - index * 11, size: 8, font, color: INK });
        });
        y -= Math.max(16, lines.length * 11 + 4);
      });
      y -= 10;
    }

    if (sections.tips) {
      ensure(90);
      drawText("Como anotar", { x: 36, y, size: 12, font: bold, color: WINE });
      y -= 14;
      ANNOTATION_TIPS.forEach((tip) => {
        const lines = wrap(font, `-  ${tip}`, 8, contentWidth);
        ensure(4 + lines.length * 12);
        lines.forEach((line) => {
          drawText(line, { x: 36, y, size: 8, font, color: INK });
          y -= 12;
        });
      });
      y -= 8;
    }

    if (sections.rules) {
      ensure(110);
      drawText("Regras do método", { x: 36, y, size: 12, font: bold, color: WINE });
      y -= 14;
      BILLINGS_RULES.forEach((rule) => {
        const lines = wrap(font, rule.text, 8, contentWidth);
        ensure(22 + lines.length * 11);
        drawText(`Regra ${rule.number}  ${rule.title}`, { x: 36, y, size: 8, font: bold, color: INK });
        y -= 11;
        lines.forEach((line) => {
          drawText(line, { x: 36, y, size: 8, font, color: MUTED });
          y -= 11;
        });
        y -= 4;
      });
    }
  }

  return Buffer.from(await doc.save());
}

export function reportFilename(from: string, to: string) {
  return `mob-billings-${from}-a-${to}.pdf`;
}
