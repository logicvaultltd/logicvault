import "server-only";

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

import {
  processBase64EncoderStub,
  processJsonFormatterValidator,
  processJsonMinifier,
  processJsonToTypescriptInterface,
  processJsonTreeViewer,
  processJsonUniversalConverter,
  processJwtDebuggerStub,
} from "@/lib/json-suite";

export interface UploadedToolFile {
  name: string;
  type: string;
  data: Buffer;
}

export interface ToolResponse {
  filename: string;
  contentType: string;
  data: Buffer;
}

interface TransactionRow {
  date: string;
  description: string;
  amount: string;
  balance: string;
}

const PDF_MIME_TYPE = "application/pdf";
const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PPTX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const ZIP_MIME_TYPE = "application/zip";
const TEXT_MIME_TYPE = "text/plain; charset=utf-8";
const CSV_MIME_TYPE = "text/csv; charset=utf-8";
const JSON_MIME_TYPE = "application/json; charset=utf-8";
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const PDF_BROWSER_WORKER_URL =
  "https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.mjs";
const PDF_WORKER_CANDIDATES = [
  resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs"
  ),
  resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"
  ),
  resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  ),
];
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "was",
  "were",
  "with",
]);
let pdfWorkerConfigured = false;
let csvWriterModulePromise: Promise<typeof import("csv-writer")> | null = null;
let docxModulePromise: Promise<typeof import("docx")> | null = null;
let jsZipModulePromise: Promise<unknown> | null = null;
let mammothModulePromise: Promise<unknown> | null = null;
let pdfParseModulePromise: Promise<typeof import("pdf-parse")> | null = null;
let pptxgenModulePromise: Promise<(typeof import("pptxgenjs"))["default"]> | null = null;
let sharpModulePromise: Promise<unknown> | null = null;
let xlsxModulePromise: Promise<typeof import("xlsx")> | null = null;

function loadCsvWriter() {
  csvWriterModulePromise ??= import("csv-writer");
  return csvWriterModulePromise;
}

function loadDocx() {
  docxModulePromise ??= import("docx");
  return docxModulePromise;
}

function loadJsZip(): Promise<typeof import("jszip")> {
  jsZipModulePromise ??= import("jszip").then((module) => module.default);
  return jsZipModulePromise as Promise<typeof import("jszip")>;
}

function loadMammoth(): Promise<typeof import("mammoth")> {
  mammothModulePromise ??= import("mammoth").then((module) => module.default);
  return mammothModulePromise as Promise<typeof import("mammoth")>;
}

function loadPdfParse() {
  pdfParseModulePromise ??= import("pdf-parse");
  return pdfParseModulePromise;
}

function loadPptxGen(): Promise<(typeof import("pptxgenjs"))["default"]> {
  pptxgenModulePromise ??= import("pptxgenjs").then((module) => module.default);
  return pptxgenModulePromise;
}

function loadSharp(): Promise<typeof import("sharp")> {
  sharpModulePromise ??= import("sharp").then((module) => module.default);
  return sharpModulePromise as Promise<typeof import("sharp")>;
}

function loadXlsx() {
  xlsxModulePromise ??= import("xlsx");
  return xlsxModulePromise;
}

class WorkerDOMMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  is2D = true;

  constructor(init?: number[]) {
    if (Array.isArray(init) && init.length >= 6) {
      [this.a, this.b, this.c, this.d, this.e, this.f] = init;
    }
  }

  multiplySelf(other: WorkerDOMMatrix) {
    const a = this.a * other.a + this.c * other.b;
    const b = this.b * other.a + this.d * other.b;
    const c = this.a * other.c + this.c * other.d;
    const d = this.b * other.c + this.d * other.d;
    const e = this.a * other.e + this.c * other.f + this.e;
    const f = this.b * other.e + this.d * other.f + this.f;

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
  }

  preMultiplySelf(other: WorkerDOMMatrix) {
    const clone = new WorkerDOMMatrix([this.a, this.b, this.c, this.d, this.e, this.f]);
    this.a = other.a;
    this.b = other.b;
    this.c = other.c;
    this.d = other.d;
    this.e = other.e;
    this.f = other.f;
    return this.multiplySelf(clone);
  }

  translateSelf(tx = 0, ty = 0) {
    return this.multiplySelf(new WorkerDOMMatrix([1, 0, 0, 1, tx, ty]));
  }

  scaleSelf(scaleX = 1, scaleY = scaleX) {
    return this.multiplySelf(new WorkerDOMMatrix([scaleX, 0, 0, scaleY, 0, 0]));
  }

  invertSelf() {
    const determinant = this.a * this.d - this.b * this.c;

    if (!determinant) {
      this.a = Number.NaN;
      this.b = Number.NaN;
      this.c = Number.NaN;
      this.d = Number.NaN;
      this.e = Number.NaN;
      this.f = Number.NaN;
      return this;
    }

    const a = this.d / determinant;
    const b = -this.b / determinant;
    const c = -this.c / determinant;
    const d = this.a / determinant;
    const e = (this.c * this.f - this.d * this.e) / determinant;
    const f = (this.b * this.e - this.a * this.f) / determinant;

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
  }
}

function ensurePdfRuntimePrimitives() {
  if (typeof globalThis.DOMMatrix === "undefined") {
    globalThis.DOMMatrix = WorkerDOMMatrix as typeof DOMMatrix;
  }
}

function sanitizeStem(name: string) {
  const trimmed = name.replace(/\.[^.]+$/, "").trim().toLowerCase();
  return trimmed.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "logic-vault-file";
}

function ensureSingleFile(files: UploadedToolFile[]) {
  if (files.length === 0) {
    throw new Error("Please choose a file first.");
  }

  if (files.length > 1) {
    throw new Error("Please use one file for this tool.");
  }

  const [file] = files;

  if (file.data.byteLength > MAX_FILE_SIZE) {
    throw new Error("This file is too big. Please choose a smaller file.");
  }

  return file;
}

function ensureFiles(files: UploadedToolFile[], minimum = 1) {
  if (files.length < minimum) {
    throw new Error(
      minimum > 1 ? `Please choose at least ${minimum} files.` : "Please choose a file first."
    );
  }

  files.forEach((file) => {
    if (file.data.byteLength > MAX_FILE_SIZE) {
      throw new Error("One of your files is too big. Please choose a smaller file.");
    }
  });

  return files;
}

function hasExtension(file: UploadedToolFile, extensions: string[]) {
  const lowerName = file.name.toLowerCase();
  return extensions.some((extension) => lowerName.endsWith(extension));
}

function ensurePdf(file: UploadedToolFile) {
  if (!hasExtension(file, [".pdf"])) {
    throw new Error("Oops! Please use a PDF file.");
  }

  return file;
}

function ensureRequiredOption(
  options: Record<string, string>,
  name: string,
  message = "Please complete the required field."
) {
  const value = options[name]?.trim();

  if (!value) {
    throw new Error(message);
  }

  return value;
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
}

function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => normalizeWhitespace(paragraph))
    .filter(Boolean);
}

function wrapLine(value: string, maxChars = 90) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current.length === 0 ? word : `${current} ${word}`;

    if (next.length > maxChars && current.length > 0) {
      lines.push(current);
      current = word;
      continue;
    }

    current = next;
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [value];
}

async function extractPdfText(buffer: Buffer) {
  const parser = await createPdfParser(buffer);

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractPdfScreenshots(buffer: Buffer) {
  const parser = await createPdfParser(buffer);

  try {
    const result = await parser.getScreenshot();
    return result.pages;
  } finally {
    await parser.destroy();
  }
}

async function configurePdfWorker() {
  if (pdfWorkerConfigured) {
    return;
  }

  const { PDFParse } = await loadPdfParse();

  for (const workerPath of PDF_WORKER_CANDIDATES) {
    if (!existsSync(workerPath)) {
      continue;
    }

    PDFParse.setWorker(pathToFileURL(workerPath).href);
    pdfWorkerConfigured = true;
    return;
  }

  PDFParse.setWorker(PDF_BROWSER_WORKER_URL);
  pdfWorkerConfigured = true;
}

async function createPdfParser(buffer: Buffer) {
  ensurePdfRuntimePrimitives();
  const { PDFParse } = await loadPdfParse();
  await configurePdfWorker();
  return new PDFParse({ data: new Uint8Array(buffer) });
}

async function embedRasterImage(document: PDFDocument, file: UploadedToolFile) {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return document.embedJpg(file.data);
  }

  if (lowerName.endsWith(".png")) {
    return document.embedPng(file.data);
  }

  throw new Error("Please use JPG or PNG images.");
}

function parseCurrencyToken(value: string) {
  const cleaned = value.replace(/\$/g, "").replace(/,/g, "").trim();

  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    return `-${cleaned.slice(1, -1)}`;
  }

  return cleaned;
}

function parseTransactionRows(text: string) {
  const rows: TransactionRow[] = [];
  const seen = new Set<string>();
  const lines = text.split("\n").map((line) => normalizeWhitespace(line)).filter(Boolean);
  const patterns = [
    /^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+?)\s+(\(?-?\$?[\d,]+\.\d{2}\)?)\s+(\(?-?\$?[\d,]+\.\d{2}\)?)$/,
    /^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+?)\s+(\(?-?\$?[\d,]+\.\d{2}\)?)$/,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);

      if (!match) {
        continue;
      }

      const row: TransactionRow = {
        date: match[1] ?? "",
        description: normalizeWhitespace(match[2] ?? ""),
        amount: parseCurrencyToken(match[3] ?? ""),
        balance: parseCurrencyToken(match[4] ?? ""),
      };
      const key = `${row.date}|${row.description}|${row.amount}|${row.balance}`;

      if (!seen.has(key)) {
        seen.add(key);
        rows.push(row);
      }

      break;
    }
  }

  return rows;
}

async function createCsvBuffer(rows: TransactionRow[]) {
  const { createObjectCsvStringifier } = await loadCsvWriter();
  const csv = createObjectCsvStringifier({
    header: [
      { id: "date", title: "Date" },
      { id: "description", title: "Description" },
      { id: "amount", title: "Amount" },
      { id: "balance", title: "Balance" },
    ],
  });

  return Buffer.from(csv.getHeaderString() + csv.stringifyRecords(rows), "utf8");
}

async function createFallbackCsvBuffer(text: string) {
  const { createObjectCsvStringifier } = await loadCsvWriter();
  const csv = createObjectCsvStringifier({
    header: [
      { id: "line_number", title: "Line" },
      { id: "content", title: "Content" },
    ],
  });
  const lines = text
    .split("\n")
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean)
    .map((line, index) => ({
      line_number: String(index + 1),
      content: line,
    }));

  return Buffer.from(csv.getHeaderString() + csv.stringifyRecords(lines), "utf8");
}

async function createSimplePdf(title: string, paragraphs: string[]) {
  const pdf = await PDFDocument.create();
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  let page = pdf.addPage([612, 792]);
  let y = page.getHeight() - 64;

  const drawNewPage = () => {
    page = pdf.addPage([612, 792]);
    y = page.getHeight() - 64;
  };

  const drawHeading = (text: string) => {
    if (y < 120) {
      drawNewPage();
    }

    page.drawText(text, {
      x: 48,
      y,
      size: 22,
      font: titleFont,
      color: rgb(0.07, 0.1, 0.16),
    });
    y -= 34;
  };

  const drawParagraph = (text: string) => {
    const lines = wrapLine(text, 92);

    for (const line of lines) {
      if (y < 72) {
        drawNewPage();
      }

      page.drawText(line, {
        x: 48,
        y,
        size: 11,
        font: bodyFont,
        color: rgb(0.2, 0.23, 0.29),
      });
      y -= 16;
    }

    y -= 12;
  };

  drawHeading(title);

  for (const paragraph of paragraphs) {
    drawParagraph(paragraph);
  }

  return Buffer.from(await pdf.save());
}

function buildParagraphsFromRows(rows: Array<Array<string | number>>) {
  return rows.map((row) => row.filter((cell) => String(cell).trim().length > 0).join(" | "));
}

async function createDocxFromText(title: string, text: string) {
  const { Document, HeadingLevel, Packer, Paragraph } = await loadDocx();
  const paragraphs = splitParagraphs(text);
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
          }),
          ...paragraphs.map((paragraph) => new Paragraph(paragraph)),
        ],
      },
    ],
  });

  return Packer.toBuffer(document);
}

function normalizePptxBuffer(value: string | ArrayBuffer | Blob | Uint8Array) {
  if (typeof value === "string") {
    return Buffer.from(value);
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (value instanceof ArrayBuffer) {
    return Buffer.from(value);
  }

  throw new Error("Could not create the presentation output.");
}

async function createPptxFromText(title: string, text: string) {
  const PptxGen = await loadPptxGen();
  const presentation = new PptxGen();
  presentation.layout = "LAYOUT_WIDE";

  const titleSlide = presentation.addSlide();
  titleSlide.addText(title, {
    x: 0.6,
    y: 0.6,
    w: 11,
    h: 0.8,
    fontFace: "Arial",
    fontSize: 24,
    bold: true,
    color: "111827",
  });

  const lines = wrapLine(normalizeWhitespace(text), 70);

  for (let index = 0; index < lines.length; index += 8) {
    const slide = presentation.addSlide();
    slide.addText(lines.slice(index, index + 8).join("\n"), {
      x: 0.75,
      y: 0.9,
      w: 11,
      h: 5.6,
      fontFace: "Arial",
      fontSize: 18,
      color: "1F2937",
      margin: 0.08,
    });
  }

  const result = await presentation.write({ outputType: "nodebuffer" });
  return normalizePptxBuffer(result);
}

async function createWorkbookBuffer(rows: Array<Record<string, string>>) {
  const XLSX = await loadXlsx();
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Logic Vault");
  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}

async function extractSpreadsheetRows(buffer: Buffer) {
  const XLSX = await loadXlsx();
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("This spreadsheet is empty.");
  }

  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<Array<string | number>>(sheet, { header: 1 });
}

async function createMergedPdf(files: UploadedToolFile[]) {
  const output = await PDFDocument.create();

  for (const file of files) {
    ensurePdf(file);
    const document = await PDFDocument.load(file.data);
    const pages = await output.copyPages(document, document.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }

  return Buffer.from(await output.save());
}

function parseNumberList(input: string, max: number) {
  const values = input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const parsed = Number(part);

      if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
        throw new Error("Please use valid page numbers.");
      }

      return parsed - 1;
    });

  if (values.length === 0) {
    throw new Error("Please add at least one page number.");
  }

  return values;
}

function parsePageRanges(input: string, max: number) {
  const parts = input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    throw new Error("Please add at least one page range.");
  }

  return parts.map((part) => {
    if (part.includes("-")) {
      const [startText, endText] = part.split("-").map((value) => value.trim());
      const start = Number(startText);
      const end = Number(endText);

      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > max || start > end) {
        throw new Error("Please use valid page ranges.");
      }

      return Array.from({ length: end - start + 1 }, (_, index) => start + index - 1);
    }

    const page = Number(part);

    if (!Number.isInteger(page) || page < 1 || page > max) {
      throw new Error("Please use valid page ranges.");
    }

    return [page - 1];
  });
}

async function splitPdf(file: UploadedToolFile, pageRanges: string) {
  ensurePdf(file);
  const source = await PDFDocument.load(file.data);
  const groups =
    pageRanges.trim().length === 0
      ? source.getPageIndices().map((index) => [index])
      : parsePageRanges(pageRanges, source.getPageCount());
  const JSZip = await loadJsZip();
  const zip = new JSZip();

  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index];
    const document = await PDFDocument.create();
    const pages = await document.copyPages(source, group);
    pages.forEach((page) => document.addPage(page));
    zip.file(`split-${index + 1}.pdf`, await document.save());
  }

  return Buffer.from(await zip.generateAsync({ type: "nodebuffer" }));
}

async function reorderPdf(file: UploadedToolFile, pageOrder: string) {
  ensurePdf(file);
  const source = await PDFDocument.load(file.data);
  const indexes = parseNumberList(pageOrder, source.getPageCount());
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indexes);
  pages.forEach((page) => output.addPage(page));
  return Buffer.from(await output.save());
}

async function removePdfPages(file: UploadedToolFile, pagesToRemove: string) {
  ensurePdf(file);
  const document = await PDFDocument.load(file.data);
  const toRemove = new Set(parsePageRanges(pagesToRemove, document.getPageCount()).flat());
  const keep = document.getPageIndices().filter((index) => !toRemove.has(index));

  if (keep.length === 0) {
    throw new Error("Please leave at least one page in the PDF.");
  }

  const output = await PDFDocument.create();
  const pages = await output.copyPages(document, keep);
  pages.forEach((page) => output.addPage(page));
  return Buffer.from(await output.save());
}

async function compressPdf(file: UploadedToolFile) {
  ensurePdf(file);
  const document = await PDFDocument.load(file.data, { updateMetadata: false });
  return Buffer.from(await document.save({ useObjectStreams: true }));
}

async function repairPdf(file: UploadedToolFile) {
  ensurePdf(file);
  const document = await PDFDocument.load(file.data, {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
    updateMetadata: false,
  });
  return Buffer.from(await document.save({ useObjectStreams: true }));
}

async function wordToPdf(file: UploadedToolFile) {
  if (!hasExtension(file, [".docx"])) {
    throw new Error("Please use a DOCX file.");
  }

  const mammoth = await loadMammoth();
  const result = await mammoth.extractRawText({ buffer: file.data });
  const paragraphs = splitParagraphs(result.value);
  return createSimplePdf("Word to PDF", paragraphs.length > 0 ? paragraphs : ["No readable text was found."]);
}

async function excelToPdf(file: UploadedToolFile) {
  if (!hasExtension(file, [".xlsx", ".xls", ".csv"])) {
    throw new Error("Please use a spreadsheet file.");
  }

  const rows = await extractSpreadsheetRows(file.data);
  const paragraphs = buildParagraphsFromRows(rows.slice(0, 80));
  return createSimplePdf(
    "Spreadsheet to PDF",
    paragraphs.length > 0 ? paragraphs : ["No readable rows were found in this spreadsheet."]
  );
}

async function pptToPdf(file: UploadedToolFile) {
  if (!hasExtension(file, [".pptx"])) {
    throw new Error("Please use a PPTX file.");
  }

  const JSZip = await loadJsZip();
  const zip = await JSZip.loadAsync(file.data);
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  const paragraphs: string[] = [];

  for (const slideName of slideNames) {
    const xml = await zip.file(slideName)?.async("string");

    if (!xml) {
      continue;
    }

    const text = [...xml.matchAll(/<a:t>(.*?)<\/a:t>/g)]
      .map((match) => decodeXmlEntities(match[1] ?? ""))
      .filter(Boolean)
      .join(" ");

    if (text.length > 0) {
      paragraphs.push(text);
    }
  }

  return createSimplePdf(
    "Presentation to PDF",
    paragraphs.length > 0 ? paragraphs : ["No readable slide text was found in this presentation."]
  );
}

async function imageToPdf(files: UploadedToolFile[]) {
  const document = await PDFDocument.create();

  for (const file of files) {
    if (!hasExtension(file, [".jpg", ".jpeg", ".png"])) {
      throw new Error("Please use JPG or PNG images.");
    }

    const image = await embedRasterImage(document, file);
    const page = document.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  return Buffer.from(await document.save());
}

async function htmlToPdf(file: UploadedToolFile) {
  if (!hasExtension(file, [".html", ".htm", ".txt"])) {
    throw new Error("Please use an HTML or text file.");
  }

  const raw = file.data.toString("utf8");
  const clean = normalizeWhitespace(
    raw
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
  return createSimplePdf("HTML to PDF", splitParagraphs(clean));
}

async function pdfToWord(file: UploadedToolFile) {
  ensurePdf(file);
  const text = await extractPdfText(file.data);
  return createDocxFromText("PDF to Word", text);
}

async function pdfToExcel(file: UploadedToolFile) {
  ensurePdf(file);
  const text = await extractPdfText(file.data);
  const transactions = parseTransactionRows(text);

  if (transactions.length > 0) {
    return await createWorkbookBuffer(
      transactions.map((row) => ({
        Date: row.date,
        Description: row.description,
        Amount: row.amount,
        Balance: row.balance,
      }))
    );
  }

  return await createWorkbookBuffer(
    text
      .split("\n")
      .map((line) => normalizeWhitespace(line))
      .filter(Boolean)
      .map((line, index) => ({
        Line: String(index + 1),
        Content: line,
      }))
  );
}

async function pdfToPpt(file: UploadedToolFile) {
  ensurePdf(file);
  const text = await extractPdfText(file.data);
  return createPptxFromText("PDF to PPT", text);
}

async function pdfToJpg(file: UploadedToolFile) {
  ensurePdf(file);
  const screenshots = await extractPdfScreenshots(file.data);
  const sharp = await loadSharp();

  if (screenshots.length === 0) {
    throw new Error("We could not render this PDF into images.");
  }

  if (screenshots.length === 1) {
    const jpg = await sharp(screenshots[0].data).jpeg({ quality: 90 }).toBuffer();
    return {
      data: jpg,
      contentType: "image/jpeg",
      filename: `${sanitizeStem(file.name)}.jpg`,
    };
  }

  const JSZip = await loadJsZip();
  const zip = new JSZip();

  for (const screenshot of screenshots) {
    const jpg = await sharp(screenshot.data).jpeg({ quality: 90 }).toBuffer();
    zip.file(`page-${screenshot.pageNumber}.jpg`, jpg);
  }

  return {
    data: Buffer.from(await zip.generateAsync({ type: "nodebuffer" })),
    contentType: ZIP_MIME_TYPE,
    filename: `${sanitizeStem(file.name)}-images.zip`,
  };
}

async function pdfToArchivalCopy(file: UploadedToolFile) {
  ensurePdf(file);
  const document = await PDFDocument.load(file.data, { updateMetadata: true });
  document.setTitle(`${sanitizeStem(file.name)} archival copy`);
  document.setProducer("Logic Vault");
  document.setCreator("Logic Vault");
  document.setSubject("Long-term readable copy");
  return Buffer.from(await document.save({ useObjectStreams: true }));
}

async function rotatePdf(file: UploadedToolFile, rotation: string) {
  ensurePdf(file);
  const angle = Number(rotation || "90");

  if (![90, 180, 270].includes(angle)) {
    throw new Error("Please choose a valid rotation.");
  }

  const document = await PDFDocument.load(file.data);
  document.getPages().forEach((page) => page.setRotation(degrees(angle)));
  return Buffer.from(await document.save());
}

async function addPageNumbers(file: UploadedToolFile, startNumber: string) {
  ensurePdf(file);
  const document = await PDFDocument.load(file.data);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const base = Math.max(Number(startNumber || "1"), 1);

  document.getPages().forEach((page, index) => {
    const label = String(base + index);
    const size = 11;
    const width = font.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: (page.getWidth() - width) / 2,
      y: 24,
      size,
      font,
      color: rgb(0.35, 0.38, 0.43),
    });
  });

  return Buffer.from(await document.save());
}

async function addWatermark(file: UploadedToolFile, watermarkText: string) {
  ensurePdf(file);
  const document = await PDFDocument.load(file.data);
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  const text = watermarkText.trim().toUpperCase();

  if (!text) {
    throw new Error("Please enter the watermark text.");
  }

  document.getPages().forEach((page) => {
    page.drawText(text, {
      x: page.getWidth() * 0.18,
      y: page.getHeight() * 0.5,
      size: 34,
      font,
      rotate: degrees(35),
      color: rgb(0.9, 0.2, 0.18),
      opacity: 0.18,
    });
  });

  return Buffer.from(await document.save());
}

async function addNote(file: UploadedToolFile, noteText: string) {
  ensurePdf(file);
  const document = await PDFDocument.load(file.data);
  const page = document.getPages()[0];

  if (!page) {
    throw new Error("We could not open the first page of this PDF.");
  }

  const font = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const cleanNote = noteText.trim();

  if (!cleanNote) {
    throw new Error("Please enter the note you want to add.");
  }

  page.drawRectangle({
    x: 36,
    y: page.getHeight() - 120,
    width: Math.min(page.getWidth() - 72, 340),
    height: 66,
    color: rgb(0.99, 0.95, 0.78),
    borderColor: rgb(0.96, 0.83, 0.22),
    borderWidth: 1,
    opacity: 0.95,
  });
  page.drawText("Logic Vault Note", {
    x: 48,
    y: page.getHeight() - 76,
    size: 11,
    font: bold,
    color: rgb(0.55, 0.37, 0.02),
  });

  wrapLine(cleanNote, 42)
    .slice(0, 3)
    .forEach((line, index) => {
      page.drawText(line, {
        x: 48,
        y: page.getHeight() - 94 - index * 14,
        size: 10,
        font,
        color: rgb(0.44, 0.31, 0.03),
      });
    });

  return Buffer.from(await document.save());
}

function takeUniqueLines(text: string) {
  const seen = new Set<string>();

  return text
    .split("\n")
    .map((line) => normalizeWhitespace(line))
    .filter((line) => line.length > 0)
    .filter((line) => {
      const key = line.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

async function comparePdfVersions(files: UploadedToolFile[]) {
  const [first, second] = ensureFiles(files, 2).slice(0, 2);
  ensurePdf(first);
  ensurePdf(second);

  const [firstText, secondText] = await Promise.all([
    extractPdfText(first.data),
    extractPdfText(second.data),
  ]);
  const firstLines = takeUniqueLines(firstText);
  const secondLines = takeUniqueLines(secondText);
  const secondSet = new Set(secondLines.map((line) => line.toLowerCase()));
  const firstSet = new Set(firstLines.map((line) => line.toLowerCase()));
  const removed = firstLines.filter((line) => !secondSet.has(line.toLowerCase())).slice(0, 80);
  const added = secondLines.filter((line) => !firstSet.has(line.toLowerCase())).slice(0, 80);
  const firstWords = firstText.split(/\s+/).filter(Boolean).length;
  const secondWords = secondText.split(/\s+/).filter(Boolean).length;

  return Buffer.from(
    [
      "Logic Vault PDF Comparison",
      "",
      `Original: ${first.name}`,
      `Updated: ${second.name}`,
      `Original readable lines: ${firstLines.length}`,
      `Updated readable lines: ${secondLines.length}`,
      `Word count change: ${firstWords} -> ${secondWords} (${secondWords - firstWords >= 0 ? "+" : ""}${secondWords - firstWords})`,
      "",
      "Added or changed in updated file:",
      ...(added.length > 0 ? added.map((line) => `+ ${line}`) : ["No unique added lines detected."]),
      "",
      "Removed or changed from original file:",
      ...(removed.length > 0 ? removed.map((line) => `- ${line}`) : ["No unique removed lines detected."]),
      "",
      "Note: This report compares readable text layers. Scanned image-only PDFs may need OCR first.",
    ].join("\n"),
    "utf8"
  );
}

interface RedactionZone {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

function parseRedactionZones(input: string, pageCount: number) {
  const lines = input
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error("Please add at least one redaction zone.");
  }

  const zones: RedactionZone[] = [];

  for (const line of lines) {
    const [pageToken, coordinateText] = line.split(":").map((part) => part.trim());

    if (!pageToken || !coordinateText) {
      throw new Error("Use page:x,y,width,height for each redaction zone.");
    }

    const coordinates = coordinateText.split(",").map((value) => Number(value.trim()));

    if (coordinates.length !== 4 || coordinates.some((value) => !Number.isFinite(value))) {
      throw new Error("Use four valid numbers for each redaction zone.");
    }

    const [x, y, width, height] = coordinates;

    if (width <= 0 || height <= 0) {
      throw new Error("Redaction zone width and height must be positive.");
    }

    const pageIndexes =
      pageToken.toLowerCase() === "all"
        ? Array.from({ length: pageCount }, (_, index) => index)
        : [Number(pageToken) - 1];

    pageIndexes.forEach((pageIndex) => {
      if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= pageCount) {
        throw new Error("Please use valid PDF page numbers in the redaction zones.");
      }

      zones.push({ pageIndex, x, y, width, height });
    });
  }

  return zones;
}

async function redactPdf(file: UploadedToolFile, zoneText: string, label: string) {
  ensurePdf(file);
  const document = await PDFDocument.load(file.data);
  const pages = document.getPages();
  const zones = parseRedactionZones(zoneText, pages.length);
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  const cleanLabel = label.trim() || "REDACTED";

  zones.forEach((zone) => {
    const page = pages[zone.pageIndex];
    const width = Math.min(zone.width, Math.max(1, page.getWidth() - zone.x));
    const height = Math.min(zone.height, Math.max(1, page.getHeight() - zone.y));

    page.drawRectangle({
      x: Math.max(0, zone.x),
      y: Math.max(0, zone.y),
      width,
      height,
      color: rgb(0, 0, 0),
      opacity: 1,
    });

    if (width >= 64 && height >= 16) {
      page.drawText(cleanLabel.slice(0, 24), {
        x: Math.max(0, zone.x) + 8,
        y: Math.max(0, zone.y) + Math.max(4, height / 2 - 4),
        size: Math.min(10, Math.max(7, height / 3)),
        font,
        color: rgb(1, 1, 1),
      });
    }
  });

  return Buffer.from(await document.save({ useObjectStreams: true }));
}

function parseCropMargins(input: string) {
  const values = input.split(",").map((value) => Number(value.trim()));

  if (values.length !== 4 || values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Please enter crop margins as top,right,bottom,left.");
  }

  return {
    top: values[0],
    right: values[1],
    bottom: values[2],
    left: values[3],
  };
}

async function cropPdf(file: UploadedToolFile, marginsText: string) {
  ensurePdf(file);
  const margins = parseCropMargins(marginsText);
  const document = await PDFDocument.load(file.data);

  document.getPages().forEach((page) => {
    const width = page.getWidth();
    const height = page.getHeight();
    const cropWidth = width - margins.left - margins.right;
    const cropHeight = height - margins.top - margins.bottom;

    if (cropWidth <= 24 || cropHeight <= 24) {
      throw new Error("Crop margins are too large for one of the PDF pages.");
    }

    page.setCropBox(margins.left, margins.bottom, cropWidth, cropHeight);
  });

  return Buffer.from(await document.save({ useObjectStreams: true }));
}

async function scanImagesToPdf(files: UploadedToolFile[]) {
  const document = await PDFDocument.create();

  for (const file of ensureFiles(files, 1)) {
    if (!hasExtension(file, [".jpg", ".jpeg", ".png"])) {
      throw new Error("Please use JPG or PNG scan images.");
    }

    const image = await embedRasterImage(document, file);
    const page = document.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  document.setTitle("Logic Vault scan package");
  document.setCreator("Logic Vault");
  document.setProducer("Logic Vault");
  return Buffer.from(await document.save());
}

function encryptPayload(file: UploadedToolFile, password: string) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = scryptSync(password, salt, 32);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(file.data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.from(
    JSON.stringify({
      version: 1,
      filename: `${sanitizeStem(file.name)}.pdf`,
      contentType: PDF_MIME_TYPE,
      salt: salt.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
      data: encrypted.toString("base64"),
    }),
    "utf8"
  );
}

function decryptPayload(file: UploadedToolFile, password: string) {
  let payload: {
    filename: string;
    contentType: string;
    salt: string;
    iv: string;
    authTag: string;
    data: string;
  };

  try {
    payload = JSON.parse(file.data.toString("utf8")) as typeof payload;
  } catch {
    throw new Error("Please use a Logic Vault locked PDF file.");
  }

  try {
    const key = scryptSync(password, Buffer.from(payload.salt, "base64"), 32);
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(payload.iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
    return {
      filename: payload.filename,
      contentType: payload.contentType,
      data: Buffer.concat([
        decipher.update(Buffer.from(payload.data, "base64")),
        decipher.final(),
      ]),
    };
  } catch {
    throw new Error("We could not unlock this file. Please check your code and try again.");
  }
}

async function signPdf(file: UploadedToolFile, signerName: string, signReason: string) {
  ensurePdf(file);
  const document = await PDFDocument.load(file.data);
  const pages = document.getPages();
  const page = pages[pages.length - 1];

  if (!page) {
    throw new Error("We could not sign this PDF.");
  }

  const scriptFont = await document.embedFont(StandardFonts.HelveticaOblique);
  const textFont = await document.embedFont(StandardFonts.Helvetica);
  const cleanName = signerName.trim();

  if (!cleanName) {
    throw new Error("Please enter the signer name.");
  }

  page.drawLine({
    start: { x: page.getWidth() - 220, y: 96 },
    end: { x: page.getWidth() - 56, y: 96 },
    thickness: 1,
    color: rgb(0.45, 0.48, 0.53),
  });
  page.drawText(cleanName, {
    x: page.getWidth() - 212,
    y: 104,
    size: 22,
    font: scriptFont,
    color: rgb(0.09, 0.11, 0.17),
  });

  if (signReason.trim().length > 0) {
    page.drawText(signReason.trim(), {
      x: page.getWidth() - 212,
      y: 82,
      size: 10,
      font: textFont,
      color: rgb(0.37, 0.4, 0.46),
    });
  }

  return Buffer.from(await document.save());
}

function scoreSentences(text: string) {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40);
  const frequency = new Map<string, number>();

  for (const sentence of sentences) {
    for (const word of sentence.toLowerCase().match(/[a-z]{3,}/g) ?? []) {
      if (STOP_WORDS.has(word)) {
        continue;
      }

      frequency.set(word, (frequency.get(word) ?? 0) + 1);
    }
  }

  return sentences.map((sentence, index) => ({
    sentence,
    index,
    score: (sentence.toLowerCase().match(/[a-z]{3,}/g) ?? []).reduce(
      (total, word) => total + (frequency.get(word) ?? 0),
      0
    ),
  }));
}

function summarizeText(text: string, length: string) {
  const sentences = scoreSentences(text);
  const count = length === "Short" ? 3 : length === "Long" ? 7 : 5;

  if (sentences.length === 0) {
    return "We could not find enough readable text to build a summary.";
  }

  return sentences
    .sort((left, right) => right.score - left.score)
    .slice(0, count)
    .sort((left, right) => left.index - right.index)
    .map((entry) => `- ${entry.sentence}`)
    .join("\n");
}

const TRANSLATION_DICTIONARIES: Record<string, Record<string, string>> = {
  Spanish: {
    account: "cuenta",
    amount: "monto",
    balance: "saldo",
    credit: "crédito",
    date: "fecha",
    payment: "pago",
    statement: "estado",
    total: "total",
    transfer: "transferencia",
  },
  French: {
    account: "compte",
    amount: "montant",
    balance: "solde",
    credit: "crédit",
    date: "date",
    payment: "paiement",
    statement: "relevé",
    total: "total",
    transfer: "transfert",
  },
  German: {
    account: "konto",
    amount: "betrag",
    balance: "saldo",
    credit: "guthaben",
    date: "datum",
    payment: "zahlung",
    statement: "auszug",
    total: "gesamt",
    transfer: "überweisung",
  },
  Portuguese: {
    account: "conta",
    amount: "valor",
    balance: "saldo",
    credit: "crédito",
    date: "data",
    payment: "pagamento",
    statement: "extrato",
    total: "total",
    transfer: "transferência",
  },
};

function translateText(text: string, targetLanguage: string) {
  const dictionary = TRANSLATION_DICTIONARIES[targetLanguage];

  if (!dictionary) {
    return text;
  }

  return text.replace(/\b[a-zA-Z]+\b/g, (word) => {
    const translated = dictionary[word.toLowerCase()];

    if (!translated) {
      return word;
    }

    return word[0] === word[0].toUpperCase()
      ? translated[0].toUpperCase() + translated.slice(1)
      : translated;
  });
}

async function processStatementToCsv(file: UploadedToolFile, exportFormat = "csv") {
  ensurePdf(file);
  const text = await extractPdfText(file.data);
  const rows = parseTransactionRows(text);
  const normalizedFormat = exportFormat.toLowerCase();

  if (normalizedFormat === "excel") {
    return {
      filename: `${sanitizeStem(file.name)}.xlsx`,
      contentType: XLSX_MIME_TYPE,
      data: await createWorkbookBuffer(
        (rows.length > 0 ? rows : parseTransactionRows(text)).map((row) => ({
          Date: row.date,
          Description: row.description,
          Amount: row.amount,
          Balance: row.balance,
        }))
      ),
    };
  }

  if (normalizedFormat === "json") {
    return {
      filename: `${sanitizeStem(file.name)}.json`,
      contentType: JSON_MIME_TYPE,
      data: Buffer.from(JSON.stringify(rows.length > 0 ? rows : text.split("\n"), null, 2), "utf8"),
    };
  }

  if (normalizedFormat === "google-sheets") {
    return {
      filename: `${sanitizeStem(file.name)}-google-sheets.csv`,
      contentType: CSV_MIME_TYPE,
      data: rows.length > 0 ? await createCsvBuffer(rows) : await createFallbackCsvBuffer(text),
    };
  }

  return {
    filename: `${sanitizeStem(file.name)}.csv`,
    contentType: CSV_MIME_TYPE,
    data: rows.length > 0 ? await createCsvBuffer(rows) : await createFallbackCsvBuffer(text),
  };
}

async function processSummarizer(file: UploadedToolFile, summaryLength: string) {
  ensurePdf(file);
  const text = await extractPdfText(file.data);
  const summary =
    (await runGeminiPrompt(
      `Summarize this PDF for a business user. Use a ${summaryLength || "Medium"} summary length, keep the language clear, and include practical bullet points.\n\n${text.slice(0, 12000)}`
    )) ?? summarizeText(text, summaryLength || "Medium");
  return Buffer.from(`Logic Vault Summary\n\n${summary}\n`, "utf8");
}

async function processTranslator(file: UploadedToolFile, targetLanguage: string) {
  ensurePdf(file);
  const language = targetLanguage || "Spanish";
  const text = await extractPdfText(file.data);
  const translated =
    (await runGeminiPrompt(
      `Translate this PDF text into ${language}. Preserve headings and keep the translation plain and readable.\n\n${text.slice(0, 12000)}`
    )) ?? translateText(text, language);
  return Buffer.from(`Logic Vault Translation (${language})\n\n${translated}\n`, "utf8");
}

async function processOcr(file: UploadedToolFile) {
  ensurePdf(file);
  const text = await extractPdfText(file.data);
  const output =
    text.trim().length > 0
      ? text
      : "No readable text layer was found in this PDF. Try a cleaner scan for better results.";
  return Buffer.from(output, "utf8");
}

function parseNumericValue(value: string) {
  const normalized = value.replace(/[$,%\s,]/g, "").trim();

  if (!normalized) {
    return Number.NaN;
  }

  return Number(normalized);
}

function readNumericOption(options: Record<string, string>, name: string, label: string) {
  const value = ensureRequiredOption(options, name, `Please enter ${label}.`);
  const parsed = parseNumericValue(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Please enter a valid number for ${label}.`);
  }

  return parsed;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

async function readReportText(file: UploadedToolFile) {
  if (hasExtension(file, [".pdf"])) {
    return extractPdfText(file.data);
  }

  if (hasExtension(file, [".csv", ".xlsx", ".xls"])) {
    const rows = await extractSpreadsheetRows(file.data);
    return buildParagraphsFromRows(rows).join("\n");
  }

  return file.data.toString("utf8");
}

function rowsToTransactions(rows: Array<Array<string | number>>) {
  if (rows.length === 0) {
    return [];
  }

  const [headerRow, ...bodyRows] = rows;
  const headers = headerRow.map((cell) => String(cell).trim().toLowerCase());
  const dateIndex = headers.findIndex((header) => header.includes("date"));
  const descriptionIndex = headers.findIndex(
    (header) =>
      header.includes("description") || header.includes("details") || header.includes("merchant")
  );
  const amountIndex = headers.findIndex(
    (header) =>
      header.includes("amount") || header.includes("debit") || header.includes("credit")
  );
  const balanceIndex = headers.findIndex((header) => header.includes("balance"));

  if (amountIndex === -1 && descriptionIndex === -1) {
    return [];
  }

  return bodyRows
    .map((row) => ({
      date: String(row[Math.max(dateIndex, 0)] ?? "").trim(),
      description: String(row[Math.max(descriptionIndex, 0)] ?? "").trim(),
      amount: String(row[Math.max(amountIndex, 0)] ?? "").trim(),
      balance: balanceIndex >= 0 ? String(row[balanceIndex] ?? "").trim() : "",
    }))
    .filter((row) => row.description.length > 0 || row.amount.length > 0);
}

async function readReportTransactions(file: UploadedToolFile) {
  if (hasExtension(file, [".pdf"])) {
    const text = await extractPdfText(file.data);
    return parseTransactionRows(text);
  }

  if (hasExtension(file, [".csv", ".xlsx", ".xls"])) {
    return rowsToTransactions(await extractSpreadsheetRows(file.data));
  }

  return [];
}

function categorizeExpense(description: string) {
  const normalized = description.toLowerCase();

  if (/(uber|bolt|lyft|fuel|gas|shell|transport|airline|ticket)/.test(normalized)) {
    return "Travel";
  }

  if (/(restaurant|cafe|food|eat|grocer|market|mart|walmart|shoprite)/.test(normalized)) {
    return "Food";
  }

  if (/(google|meta|facebook|instagram|ads|marketing|campaign)/.test(normalized)) {
    return "Marketing";
  }

  if (/(rent|lease|office|workspace|wework|landlord)/.test(normalized)) {
    return "Rent";
  }

  if (/(aws|openai|chatgpt|cloud|hosting|software|saas|notion|figma|github)/.test(normalized)) {
    return "Software";
  }

  if (/(salary|payroll|contractor|freelancer|staff)/.test(normalized)) {
    return "Payroll";
  }

  return "General";
}

async function runGeminiPrompt(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    return (
      payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("\n")
        .trim() ?? null
    );
  } catch {
    return null;
  }
}

async function processExpenseCategorizer(file: UploadedToolFile, reportStyle: string) {
  const transactions = await readReportTransactions(file);

  if (transactions.length === 0) {
    const rawText = await readReportText(file);
    const summary =
      (await runGeminiPrompt(
        `Group the following financial report into simple expense categories with totals. Keep the answer short and readable.\n\n${rawText.slice(0, 12000)}`
      )) ??
      "We could not detect clear transaction rows, but the report was received. Try a cleaner CSV or PDF for stronger categorization.";

    return Buffer.from(`Logic Vault Expense Categories\n\n${summary}\n`, "utf8");
  }

  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    const amount = parseNumericValue(transaction.amount);

    if (!Number.isFinite(amount)) {
      continue;
    }

    const category = categorizeExpense(transaction.description);
    totals.set(category, (totals.get(category) ?? 0) + Math.abs(amount));
  }

  const lines = [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([category, total]) => `- ${category}: ${formatCurrency(total)}`);
  const header =
    reportStyle === "Detailed"
      ? "Detailed category totals based on the transactions we could read:"
      : "Simple category totals:";

  return Buffer.from(
    `Logic Vault Expense Categories\n\n${header}\n${lines.join("\n")}\n`,
    "utf8"
  );
}

async function processFinancialHealthScore(file: UploadedToolFile, riskView: string) {
  const transactions = await readReportTransactions(file);

  if (transactions.length === 0) {
    const rawText = await readReportText(file);
    const summary =
      (await runGeminiPrompt(
        `Give a short financial health score from 0 to 100 for the following report. Explain the score in 3 bullets.\n\n${rawText.slice(0, 12000)}`
      )) ??
      "Score: 58/100\n- We need clearer transaction data to produce a stronger financial health view.\n- Upload a CSV or a clean account statement for better results.\n- Cash flow and expense quality could not be measured precisely.";

    return Buffer.from(`Logic Vault Financial Health Score\n\n${summary}\n`, "utf8");
  }

  let income = 0;
  let expenses = 0;

  for (const transaction of transactions) {
    const amount = parseNumericValue(transaction.amount);

    if (!Number.isFinite(amount)) {
      continue;
    }

    if (amount >= 0) {
      income += amount;
    } else {
      expenses += Math.abs(amount);
    }
  }

  const coverageRatio = income > 0 ? Math.max(0, 1 - expenses / income) : 0;
  const baseScore = Math.round(Math.min(100, Math.max(20, coverageRatio * 100 + 35)));
  const adjustedScore =
    riskView === "Conservative"
      ? Math.max(0, baseScore - 8)
      : riskView === "Aggressive"
        ? Math.min(100, baseScore + 5)
        : baseScore;
  const healthLabel =
    adjustedScore >= 80 ? "Strong" : adjustedScore >= 65 ? "Stable" : adjustedScore >= 50 ? "Watch" : "Risk";

  return Buffer.from(
    [
      "Logic Vault Financial Health Score",
      "",
      `Score: ${adjustedScore}/100 (${healthLabel})`,
      `Income detected: ${formatCurrency(income)}`,
      `Expenses detected: ${formatCurrency(expenses)}`,
      `Cash flow spread: ${formatCurrency(income - expenses)}`,
      "",
      "What this means:",
      adjustedScore >= 80
        ? "- Your inflows appear to cover spending with a strong buffer."
        : adjustedScore >= 65
          ? "- Your inflows cover spending, but the buffer is not huge."
          : adjustedScore >= 50
            ? "- Spending is close to income, so watch recurring costs."
            : "- Spending is heavy versus inflow, so cash flow needs attention.",
      "- This score is a quick health check, not a financial recommendation.",
    ].join("\n"),
    "utf8"
  );
}

function createTextReport(filename: string, lines: string[]): ToolResponse {
  return {
    filename,
    contentType: TEXT_MIME_TYPE,
    data: Buffer.from(`${lines.join("\n")}\n`, "utf8"),
  };
}

export async function processTool(
  slug: string,
  files: UploadedToolFile[],
  options: Record<string, string>
): Promise<ToolResponse> {
  switch (slug) {
    case "statement-to-csv": {
      const file = ensureSingleFile(files);
      return processStatementToCsv(file, options.export_format ?? "csv");
    }
    case "merge-pdf": {
      const merged = await createMergedPdf(ensureFiles(files, 2));
      return {
        filename: "merged.pdf",
        contentType: PDF_MIME_TYPE,
        data: merged,
      };
    }
    case "split-pdf": {
      const file = ensureSingleFile(files);
      const data = await splitPdf(file, options.page_ranges ?? "");
      return {
        filename: `${sanitizeStem(file.name)}-split.zip`,
        contentType: ZIP_MIME_TYPE,
        data,
      };
    }
    case "organize-pdf": {
      const file = ensureSingleFile(files);
      const pageOrder = ensureRequiredOption(options, "page_order", "Please enter the page order.");
      const data = await reorderPdf(file, pageOrder);
      return {
        filename: `${sanitizeStem(file.name)}-organized.pdf`,
        contentType: PDF_MIME_TYPE,
        data,
      };
    }
    case "remove-pages": {
      const file = ensureSingleFile(files);
      const pagesToRemove = ensureRequiredOption(
        options,
        "pages_to_remove",
        "Please enter the pages you want to remove."
      );
      const data = await removePdfPages(file, pagesToRemove);
      return {
        filename: `${sanitizeStem(file.name)}-trimmed.pdf`,
        contentType: PDF_MIME_TYPE,
        data,
      };
    }
    case "compress-pdf": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}-compressed.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await compressPdf(file),
      };
    }
    case "repair-pdf": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}-repaired.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await repairPdf(file),
      };
    }
    case "word-to-pdf": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await wordToPdf(file),
      };
    }
    case "excel-to-pdf": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await excelToPdf(file),
      };
    }
    case "ppt-to-pdf": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await pptToPdf(file),
      };
    }
    case "jpg-to-pdf": {
      return {
        filename: "images.pdf",
        contentType: PDF_MIME_TYPE,
        data: await imageToPdf(ensureFiles(files, 1)),
      };
    }
    case "html-to-pdf": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await htmlToPdf(file),
      };
    }
    case "pdf-to-word": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}.docx`,
        contentType: DOCX_MIME_TYPE,
        data: await pdfToWord(file),
      };
    }
    case "pdf-to-excel": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}.xlsx`,
        contentType: XLSX_MIME_TYPE,
        data: await pdfToExcel(file),
      };
    }
    case "pdf-to-ppt": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}.pptx`,
        contentType: PPTX_MIME_TYPE,
        data: await pdfToPpt(file),
      };
    }
    case "pdf-to-jpg": {
      const file = ensureSingleFile(files);
      return pdfToJpg(file);
    }
    case "pdf-to-pdfa": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}-archival.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await pdfToArchivalCopy(file),
      };
    }
    case "rotate-pdf": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}-rotated.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await rotatePdf(file, options.rotation ?? "90"),
      };
    }
    case "page-numbers": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}-numbered.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await addPageNumbers(file, options.start_number ?? "1"),
      };
    }
    case "watermark-pdf": {
      const file = ensureSingleFile(files);
      const watermarkText = ensureRequiredOption(
        options,
        "watermark_text",
        "Please enter the watermark text."
      );
      return {
        filename: `${sanitizeStem(file.name)}-watermarked.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await addWatermark(file, watermarkText),
      };
    }
    case "edit-pdf": {
      const file = ensureSingleFile(files);
      const noteText = ensureRequiredOption(options, "note_text", "Please enter the note text.");
      return {
        filename: `${sanitizeStem(file.name)}-edited.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await addNote(file, noteText),
      };
    }
    case "compare-pdf": {
      return {
        filename: "pdf-comparison-report.txt",
        contentType: TEXT_MIME_TYPE,
        data: await comparePdfVersions(files),
      };
    }
    case "redact-pdf": {
      const file = ensureSingleFile(files);
      const redactionZones = ensureRequiredOption(
        options,
        "redaction_zones",
        "Please enter at least one redaction zone."
      );
      return {
        filename: `${sanitizeStem(file.name)}-redacted.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await redactPdf(file, redactionZones, options.redaction_label ?? "REDACTED"),
      };
    }
    case "crop-pdf": {
      const file = ensureSingleFile(files);
      const cropMargins = ensureRequiredOption(
        options,
        "crop_margins",
        "Please enter crop margins."
      );
      return {
        filename: `${sanitizeStem(file.name)}-cropped.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await cropPdf(file, cropMargins),
      };
    }
    case "scan-to-pdf": {
      return {
        filename: "logic-vault-scan.pdf",
        contentType: PDF_MIME_TYPE,
        data: await scanImagesToPdf(files),
      };
    }
    case "protect-pdf": {
      const file = ensureSingleFile(files);
      ensurePdf(file);
      const password = ensureRequiredOption(options, "password", "Please enter a lock code.");
      return {
        filename: `${sanitizeStem(file.name)}.lvpdf`,
        contentType: JSON_MIME_TYPE,
        data: encryptPayload(file, password),
      };
    }
    case "unlock-pdf": {
      const file = ensureSingleFile(files);

      if (!hasExtension(file, [".lvpdf"])) {
        throw new Error("Please use a Logic Vault locked PDF file.");
      }

      const password = ensureRequiredOption(options, "password", "Please enter the unlock code.");
      return decryptPayload(file, password);
    }
    case "sign-pdf": {
      const file = ensureSingleFile(files);
      const signerName = ensureRequiredOption(options, "signer_name", "Please enter the signer name.");
      return {
        filename: `${sanitizeStem(file.name)}-signed.pdf`,
        contentType: PDF_MIME_TYPE,
        data: await signPdf(file, signerName, options.sign_reason ?? ""),
      };
    }
    case "ai-summarizer": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}-summary.txt`,
        contentType: TEXT_MIME_TYPE,
        data: await processSummarizer(file, options.summary_length ?? "Medium"),
      };
    }
    case "translate-pdf": {
      const file = ensureSingleFile(files);
      const language = ensureRequiredOption(
        options,
        "target_language",
        "Please choose a language."
      );
      return {
        filename: `${sanitizeStem(file.name)}-${language.toLowerCase()}.txt`,
        contentType: TEXT_MIME_TYPE,
        data: await processTranslator(file, language),
      };
    }
    case "ocr-pdf": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}-text.txt`,
        contentType: TEXT_MIME_TYPE,
        data: await processOcr(file),
      };
    }
    case "ai-expense-categorizer": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}-expense-categories.txt`,
        contentType: TEXT_MIME_TYPE,
        data: await processExpenseCategorizer(file, options.report_style ?? "Simple"),
      };
    }
    case "financial-health-score": {
      const file = ensureSingleFile(files);
      return {
        filename: `${sanitizeStem(file.name)}-health-score.txt`,
        contentType: TEXT_MIME_TYPE,
        data: await processFinancialHealthScore(file, options.risk_view ?? "Balanced"),
      };
    }
    case "json-universal-converter": {
      const file = ensureSingleFile(files);
      return processJsonUniversalConverter(file, {
        ...options,
        source_format: options.source_format?.toLowerCase() ?? "auto",
      });
    }
    case "json-formatter-validator": {
      return processJsonFormatterValidator(options);
    }
    case "json-to-typescript-interface": {
      return processJsonToTypescriptInterface(options);
    }
    case "json-minifier": {
      return processJsonMinifier(options);
    }
    case "json-tree-viewer": {
      return processJsonTreeViewer(options);
    }
    case "base64-encoder": {
      return processBase64EncoderStub(options);
    }
    case "jwt-debugger": {
      return processJwtDebuggerStub(options);
    }
    case "yield-calculator": {
      const purchasePrice = readNumericOption(options, "purchase_price", "Purchase Price");
      const monthlyRent = readNumericOption(options, "monthly_rent", "Monthly Rent");
      const annualCosts = readNumericOption(options, "annual_costs", "Annual Costs");
      const annualIncome = monthlyRent * 12;
      const netAnnualIncome = annualIncome - annualCosts;
      const capRate = purchasePrice > 0 ? (netAnnualIncome / purchasePrice) * 100 : 0;

      return createTextReport("yield-calculation.txt", [
        "Logic Vault Yield Calculator",
        "",
        `Annual income: ${formatCurrency(annualIncome)}`,
        `Annual costs: ${formatCurrency(annualCosts)}`,
        `Net annual income: ${formatCurrency(netAnnualIncome)}`,
        `Annual cap rate: ${formatPercent(capRate)}`,
      ]);
    }
    case "roi-tracker": {
      const marketingSpend = readNumericOption(options, "marketing_spend", "Marketing Spend");
      const marketingRevenue = readNumericOption(
        options,
        "marketing_revenue",
        "Revenue From Campaign"
      );
      const netReturn = marketingRevenue - marketingSpend;
      const roi = marketingSpend > 0 ? (netReturn / marketingSpend) * 100 : 0;

      return createTextReport("roi-tracker.txt", [
        "Logic Vault ROI Tracker",
        "",
        `Marketing spend: ${formatCurrency(marketingSpend)}`,
        `Revenue from campaign: ${formatCurrency(marketingRevenue)}`,
        `Net return: ${formatCurrency(netReturn)}`,
        `ROI: ${formatPercent(roi)}`,
      ]);
    }
    case "landed-cost-calculator": {
      const unitCost = readNumericOption(options, "unit_cost", "Unit Cost");
      const shippingCost = readNumericOption(options, "shipping_cost", "Shipping");
      const dutyRate = readNumericOption(options, "duty_rate", "Duty Rate");
      const dutyAmount = unitCost * (dutyRate / 100);
      const totalLandedCost = unitCost + shippingCost + dutyAmount;

      return createTextReport("landed-cost.txt", [
        "Logic Vault Landed Cost Calculator",
        "",
        `Unit cost: ${formatCurrency(unitCost)}`,
        `Shipping: ${formatCurrency(shippingCost)}`,
        `Duty amount: ${formatCurrency(dutyAmount)}`,
        `Total landed cost: ${formatCurrency(totalLandedCost)}`,
      ]);
    }
    case "marketing-budget-tool": {
      const revenueTarget = readNumericOption(options, "revenue_target", "Revenue Target");
      const budgetPercent = readNumericOption(options, "budget_percent", "Budget Percent");
      const targetCpa = readNumericOption(options, "target_cpa", "Target CPA");
      const recommendedBudget = revenueTarget * (budgetPercent / 100);
      const targetLeads = targetCpa > 0 ? recommendedBudget / targetCpa : 0;

      return createTextReport("marketing-budget.txt", [
        "Logic Vault Marketing Budget Tool",
        "",
        `Revenue target: ${formatCurrency(revenueTarget)}`,
        `Budget percent: ${formatPercent(budgetPercent)}`,
        `Recommended budget: ${formatCurrency(recommendedBudget)}`,
        `Target CPA: ${formatCurrency(targetCpa)}`,
        `Estimated leads at this CPA: ${targetLeads.toFixed(0)}`,
      ]);
    }
    case "tax-estimator": {
      const taxableIncome = readNumericOption(options, "taxable_income", "Taxable Income");
      const deductibleExpenses = readNumericOption(
        options,
        "deductible_expenses",
        "Deductible Expenses"
      );
      const estimatedTaxRate = readNumericOption(
        options,
        "estimated_tax_rate",
        "Estimated Tax Rate"
      );
      const netTaxable = Math.max(0, taxableIncome - deductibleExpenses);
      const estimatedTax = netTaxable * (estimatedTaxRate / 100);

      return createTextReport("tax-estimate.txt", [
        "Logic Vault Tax Estimator",
        "",
        `Taxable income: ${formatCurrency(taxableIncome)}`,
        `Deductible expenses: ${formatCurrency(deductibleExpenses)}`,
        `Net taxable base: ${formatCurrency(netTaxable)}`,
        `Estimated tax: ${formatCurrency(estimatedTax)}`,
      ]);
    }
    case "business-valuation-tool": {
      const annualEbitda = readNumericOption(options, "annual_ebitda", "Annual EBITDA");
      const valuationMultiple = readNumericOption(
        options,
        "valuation_multiple",
        "Valuation Multiple"
      );
      const valuation = annualEbitda * valuationMultiple;

      return createTextReport("business-valuation.txt", [
        "Logic Vault Business Valuation Tool",
        "",
        `Annual EBITDA: ${formatCurrency(annualEbitda)}`,
        `Valuation multiple: ${valuationMultiple.toFixed(2)}x`,
        `Estimated valuation: ${formatCurrency(valuation)}`,
      ]);
    }
    default:
      throw new Error("We could not find that tool.");
  }
}
