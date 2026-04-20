import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Document, Packer, Paragraph } from "docx";
import { PDFDocument, StandardFonts } from "pdf-lib";
import pptxgen from "pptxgenjs";
import sharp from "sharp";
import * as XLSX from "xlsx";

import { TOOLS } from "../src/lib/tools-registry.ts";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(SCRIPT_DIR, "..");
const ROOT = join(WORKSPACE_ROOT, "tmp-tool-audit", "runtime");
const BASE_URL = (process.env.TOOL_SMOKE_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });

async function makePdf(filename, lines) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let y = 720;

  for (const line of lines) {
    page.drawText(line, { x: 48, y, size: 14, font });
    y -= 24;
  }

  const path = join(ROOT, filename);
  writeFileSync(path, Buffer.from(await pdf.save()));
  return path;
}

async function makeMultiPagePdf(filename, pages) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (const lines of pages) {
    const page = pdf.addPage([612, 792]);
    let y = 720;

    for (const line of lines) {
      page.drawText(line, { x: 48, y, size: 14, font });
      y -= 24;
    }
  }

  const path = join(ROOT, filename);
  writeFileSync(path, Buffer.from(await pdf.save()));
  return path;
}

async function makeDocx(filename, lines) {
  const document = new Document({
    sections: [{ children: lines.map((line) => new Paragraph(line)) }],
  });
  const path = join(ROOT, filename);
  writeFileSync(path, await Packer.toBuffer(document));
  return path;
}

function makeXlsx(filename, rows) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const path = join(ROOT, filename);
  writeFileSync(path, XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
  return path;
}

async function makePptx(filename, lines) {
  const presentation = new pptxgen();
  presentation.layout = "LAYOUT_WIDE";
  const slide = presentation.addSlide();
  slide.addText(lines.join("\n"), { x: 0.7, y: 0.7, w: 11, h: 4.5, fontSize: 20 });
  const buffer = await presentation.write({ outputType: "nodebuffer" });
  const path = join(ROOT, filename);
  writeFileSync(path, Buffer.from(buffer));
  return path;
}

async function makeImage(filename, color) {
  const path = join(ROOT, filename);
  let pipeline = sharp({
    create: {
      width: 640,
      height: 480,
      channels: 3,
      background: color,
    },
  });

  if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
    pipeline = pipeline.jpeg();
  } else if (filename.toLowerCase().endsWith(".webp")) {
    pipeline = pipeline.webp();
  } else {
    pipeline = pipeline.png();
  }

  await pipeline.toFile(path);
  return path;
}

function makeText(filename, content) {
  const path = join(ROOT, filename);
  writeFileSync(path, content);
  return path;
}

const fixtures = {};

fixtures.pdfOne = await makePdf("one.pdf", ["Logic Vault sample PDF one"]);
fixtures.pdfTwo = await makePdf("two.pdf", ["Logic Vault sample PDF two"]);
fixtures.pdfTwoPages = await makeMultiPagePdf("two-pages.pdf", [
  ["Logic Vault page one"],
  ["Logic Vault page two"],
]);
fixtures.statementPdf = await makePdf("statement.pdf", [
  "04/01/2026 Payroll 2500.00 4250.00",
  "04/03/2026 Grocery Store -150.25 4099.75",
  "04/04/2026 Software Subscription -49.00 4050.75",
]);
fixtures.docx = await makeDocx("sample.docx", ["Logic Vault DOCX sample", "Second paragraph"]);
fixtures.xlsx = makeXlsx("sample.xlsx", [
  ["Date", "Description", "Amount"],
  ["2026-04-01", "Invoice", 2200],
  ["2026-04-02", "Expense", -120],
]);
fixtures.csv = makeText("sample.csv", "Date,Description,Amount\n2026-04-01,Invoice,2200\n");
fixtures.pptx = await makePptx("sample.pptx", ["Logic Vault deck", "Slide line two"]);
fixtures.jpg = await makeImage("sample.jpg", { r: 220, g: 80, b: 80 });
fixtures.png = await makeImage("sample.png", { r: 80, g: 120, b: 220 });
fixtures.webp = join(ROOT, "sample.webp");
await sharp(readFileSync(fixtures.png)).webp().toFile(fixtures.webp);
fixtures.html = makeText(
  "sample.html",
  "<html><body><h1>Logic Vault</h1><p>HTML sample for conversion.</p></body></html>",
);
fixtures.xml = makeText("sample.xml", "<root><item><name>alpha</name></item></root>");
fixtures.yaml = makeText("sample.yaml", "name: alpha\nvalue: 42\n");
fixtures.json = makeText("sample.json", '{ "user": { "id": 1, "email": "a@example.com" } }');

async function postTool(slug, { fields = {}, files = [] } = {}) {
  const form = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    form.append(key, String(value));
  }

  for (const filePath of files) {
    const name = filePath.split("/").at(-1) ?? filePath.split("\\").at(-1) ?? "file.bin";
    form.append("files", new Blob([readFileSync(filePath)]), name);
  }

  const response = await fetch(`${BASE_URL}/api/process/${slug}/`, {
    method: "POST",
    body: form,
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    return { ok: false, status: response.status, body };
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    ok: true,
    status: response.status,
    size: arrayBuffer.byteLength,
    contentType,
    data: Buffer.from(arrayBuffer),
  };
}

const scenarios = {
  "statement-to-csv": { files: [fixtures.statementPdf], fields: { statement_type: "Checking" } },
  "merge-pdf": { files: [fixtures.pdfOne, fixtures.pdfTwo] },
  "split-pdf": { files: [fixtures.pdfOne], fields: { page_ranges: "1" } },
  "organize-pdf": { files: [fixtures.pdfOne], fields: { page_order: "1" } },
  "remove-pages": { files: [fixtures.pdfTwoPages], fields: { pages_to_remove: "1" } },
  "compress-pdf": { files: [fixtures.pdfOne] },
  "repair-pdf": { files: [fixtures.pdfOne] },
  "word-to-pdf": { files: [fixtures.docx] },
  "excel-to-pdf": { files: [fixtures.xlsx] },
  "ppt-to-pdf": { files: [fixtures.pptx] },
  "jpg-to-pdf": { files: [fixtures.jpg, fixtures.png] },
  "html-to-pdf": { files: [fixtures.html] },
  "pdf-to-word": { files: [fixtures.pdfOne] },
  "pdf-to-excel": { files: [fixtures.pdfOne] },
  "pdf-to-ppt": { files: [fixtures.pdfOne] },
  "pdf-to-jpg": { files: [fixtures.pdfOne] },
  "pdf-to-pdfa": { files: [fixtures.pdfOne] },
  "rotate-pdf": { files: [fixtures.pdfOne], fields: { rotation: "90" } },
  "page-numbers": { files: [fixtures.pdfOne], fields: { start_number: "1" } },
  "watermark-pdf": { files: [fixtures.pdfOne], fields: { watermark_text: "CONFIDENTIAL" } },
  "edit-pdf": { files: [fixtures.pdfOne], fields: { note_text: "Reviewed" } },
  "compare-pdf": { files: [fixtures.pdfOne, fixtures.pdfTwo] },
  "redact-pdf": {
    files: [fixtures.pdfOne],
    fields: { redaction_zones: "1:72,650,240,36", redaction_label: "REDACTED" },
  },
  "crop-pdf": { files: [fixtures.pdfOne], fields: { crop_margins: "10,10,10,10" } },
  "scan-to-pdf": { files: [fixtures.jpg, fixtures.png] },
  "protect-pdf": { files: [fixtures.pdfOne], fields: { password: "vault-secret" } },
  "unlock-pdf": { files: [], fields: { password: "vault-secret" } },
  "sign-pdf": {
    files: [fixtures.pdfOne],
    fields: { signer_name: "Jamie Rivera", sign_reason: "Approved" },
  },
  "ai-summarizer": { files: [fixtures.pdfOne], fields: { summary_length: "Short" } },
  "translate-pdf": { files: [fixtures.pdfOne], fields: { target_language: "Spanish" } },
  "ocr-pdf": { files: [fixtures.statementPdf] },
  "ai-expense-categorizer": {
    files: [fixtures.statementPdf],
    fields: { report_style: "Simple" },
  },
  "financial-health-score": {
    files: [fixtures.statementPdf],
    fields: { risk_view: "Balanced" },
  },
  "json-universal-converter": {
    files: [fixtures.xml],
    fields: { source_format: "XML", root_key: "records" },
  },
  "json-formatter-validator": { fields: { json_input: readFileSync(fixtures.json, "utf8") } },
  "json-to-typescript-interface": {
    fields: { json_input: readFileSync(fixtures.json, "utf8"), interface_name: "ApiResponse" },
  },
  "json-minifier": { fields: { json_input: readFileSync(fixtures.json, "utf8") } },
  "json-tree-viewer": { fields: { json_input: readFileSync(fixtures.json, "utf8") } },
  "base64-encoder": { fields: { plain_text: "Hello Logic Vault" } },
  "jwt-debugger": { fields: { jwt_token: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature" } },
  "yield-calculator": {
    fields: { purchase_price: "250000", monthly_rent: "2200", annual_costs: "3600" },
  },
  "roi-tracker": { fields: { marketing_spend: "5000", marketing_revenue: "14000" } },
  "landed-cost-calculator": {
    fields: { unit_cost: "18", shipping_cost: "4", duty_rate: "8" },
  },
  "marketing-budget-tool": {
    fields: { revenue_target: "100000", budget_percent: "12", target_cpa: "40" },
  },
  "tax-estimator": {
    fields: { taxable_income: "80000", deductible_expenses: "12000", estimated_tax_rate: "22" },
  },
  "business-valuation-tool": {
    fields: { annual_ebitda: "150000", valuation_multiple: "4.5" },
  },
};

const results = [];
let pendingUnlockScenario = null;

for (const tool of TOOLS) {
  const scenario = scenarios[tool.id];

  if (!scenario) {
    results.push({
      slug: tool.id,
      ok: false,
      status: "missing-scenario",
      body: "No scenario defined",
    });
    continue;
  }

  if (tool.id === "unlock-pdf" && scenario.files.length === 0) {
    pendingUnlockScenario = { slug: tool.id, scenario };
    continue;
  }

  const result = await postTool(tool.id, scenario);

  if (tool.id === "protect-pdf" && result.ok) {
    const lockedPath = join(ROOT, "locked.lvpdf");
    writeFileSync(lockedPath, result.data);
    scenarios["unlock-pdf"].files = [lockedPath];
  }

  results.push({
    slug: tool.id,
    ok: result.ok,
    status: result.status,
    body: result.body,
    size: result.size,
    contentType: result.contentType,
  });
}

if (pendingUnlockScenario) {
  const result = await postTool(pendingUnlockScenario.slug, pendingUnlockScenario.scenario);
  results.push({
    slug: pendingUnlockScenario.slug,
    ok: result.ok,
    status: result.status,
    body: result.body,
    size: result.size,
    contentType: result.contentType,
  });
}

const failures = results.filter((result) => !result.ok);
console.log(
  JSON.stringify(
    {
      baseUrl: BASE_URL,
      total: results.length,
      failed: failures.length,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length > 0) {
  process.exitCode = 1;
}
