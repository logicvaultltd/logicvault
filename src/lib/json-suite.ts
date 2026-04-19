import { XMLParser } from "fast-xml-parser";
import * as XLSX from "xlsx";
import { parse as parseYaml } from "yaml";

export interface JsonSuiteFile {
  name: string;
  type: string;
  data: Buffer;
}

export interface JsonSuiteResult {
  filename: string;
  contentType: string;
  data: Buffer;
}

const JSON_MIME_TYPE = "application/json; charset=utf-8";
const TEXT_MIME_TYPE = "text/plain; charset=utf-8";

function sanitizeStem(name: string) {
  const trimmed = name.replace(/\.[^.]+$/, "").trim().toLowerCase();
  return trimmed.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "logic-vault-json";
}

function hasExtension(file: JsonSuiteFile, extensions: string[]) {
  const lowerName = file.name.toLowerCase();
  return extensions.some((extension) => lowerName.endsWith(extension));
}

function readTextOption(
  options: Record<string, string>,
  name: string,
  message: string
) {
  const value = options[name]?.trim();

  if (!value) {
    throw new Error(message);
  }

  return value;
}

function computeLineAndColumn(raw: string, position: number) {
  let line = 1;
  let column = 1;

  for (let index = 0; index < Math.min(position, raw.length); index += 1) {
    if (raw[index] === "\n") {
      line += 1;
      column = 1;
      continue;
    }

    column += 1;
  }

  return { line, column };
}

function formatJsonSyntaxError(raw: string, error: unknown) {
  if (!(error instanceof Error)) {
    return "The JSON is not valid.";
  }

  const positionMatch = error.message.match(/position (\d+)/i);
  const position = positionMatch ? Number(positionMatch[1]) : null;

  if (position === null || Number.isNaN(position)) {
    return `The JSON is not valid. ${error.message}`;
  }

  const { line, column } = computeLineAndColumn(raw, position);
  return `JSON syntax error at line ${line}, column ${column}. ${error.message}`;
}

function parseJsonText(raw: string) {
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(formatJsonSyntaxError(raw, error));
  }
}

function createJsonResult(filename: string, value: unknown, spacing = 2): JsonSuiteResult {
  return {
    filename,
    contentType: JSON_MIME_TYPE,
    data: Buffer.from(`${JSON.stringify(value, null, spacing)}\n`, "utf8"),
  };
}

function createTextResult(filename: string, value: string): JsonSuiteResult {
  return {
    filename,
    contentType: TEXT_MIME_TYPE,
    data: Buffer.from(`${value.trim()}\n`, "utf8"),
  };
}

function detectSourceFormat(file: JsonSuiteFile, formatOption: string) {
  const requested = formatOption.trim().toLowerCase();

  if (requested && requested !== "auto") {
    return requested;
  }

  if (hasExtension(file, [".xml"])) {
    return "xml";
  }

  if (hasExtension(file, [".csv"])) {
    return "csv";
  }

  if (hasExtension(file, [".yaml", ".yml"])) {
    return "yaml";
  }

  throw new Error("Please choose XML, CSV, or YAML so we know how to read this file.");
}

function convertCsvToJson(file: JsonSuiteFile) {
  const workbook = XLSX.read(file.data, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("This CSV file is empty.");
  }

  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

function convertXmlToJson(file: JsonSuiteFile) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    trimValues: true,
  });

  return parser.parse(file.data.toString("utf8"));
}

function convertYamlToJson(file: JsonSuiteFile) {
  return parseYaml(file.data.toString("utf8"));
}

export function processJsonUniversalConverter(
  file: JsonSuiteFile,
  options: Record<string, string>
): JsonSuiteResult {
  const sourceFormat = detectSourceFormat(file, options.source_format ?? "auto");
  let payload: unknown;

  switch (sourceFormat) {
    case "xml":
      payload = convertXmlToJson(file);
      break;
    case "csv":
      payload = convertCsvToJson(file);
      break;
    case "yaml":
      payload = convertYamlToJson(file);
      break;
    default:
      throw new Error("Please use XML, CSV, or YAML for this converter.");
  }

  const rootKey = options.root_key?.trim();
  const result = rootKey ? { [rootKey]: payload } : payload;
  return createJsonResult(`${sanitizeStem(file.name)}.json`, result);
}

export function processJsonFormatterValidator(options: Record<string, string>): JsonSuiteResult {
  const raw = readTextOption(options, "json_input", "Paste JSON into the editor first.");
  const payload = parseJsonText(raw);
  return createJsonResult("formatted.json", payload);
}

export function processJsonMinifier(options: Record<string, string>): JsonSuiteResult {
  const raw = readTextOption(options, "json_input", "Paste JSON into the editor first.");
  const payload = parseJsonText(raw);

  return {
    filename: "minified.json",
    contentType: JSON_MIME_TYPE,
    data: Buffer.from(JSON.stringify(payload), "utf8"),
  };
}

function toPascalCase(value: string) {
  const cleaned = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();

  if (!cleaned) {
    return "RootModel";
  }

  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function safePropertyKey(key: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function createInterfaceGenerator() {
  const definitions = new Map<string, string>();
  const takenNames = new Set<string>();

  const takeName = (requested: string) => {
    let nextName = toPascalCase(requested);
    let index = 2;

    while (takenNames.has(nextName)) {
      nextName = `${toPascalCase(requested)}${index}`;
      index += 1;
    }

    takenNames.add(nextName);
    return nextName;
  };

  const inferType = (value: unknown, requestedName: string): string => {
    if (value === null) {
      return "null";
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "unknown[]";
      }

      const itemTypes = Array.from(
        new Set(value.map((item) => inferType(item, `${requestedName}Item`)))
      );

      if (itemTypes.length === 1) {
        return `${itemTypes[0]}[]`;
      }

      return `Array<${itemTypes.join(" | ")}>`;
    }

    switch (typeof value) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "object": {
        const interfaceName = takeName(requestedName);
        definitions.set(interfaceName, "");
        const properties = Object.entries(value as Record<string, unknown>).map(
          ([key, propertyValue]) =>
            `  ${safePropertyKey(key)}: ${inferType(
              propertyValue,
              `${interfaceName}${toPascalCase(key)}`
            )};`
        );
        definitions.set(
          interfaceName,
          `export interface ${interfaceName} {\n${properties.join("\n")}\n}`
        );
        return interfaceName;
      }
      default:
        return "unknown";
    }
  };

  return {
    inferRoot(value: unknown, requestedName: string) {
      const rootType = inferType(value, requestedName);
      const output = Array.from(definitions.values()).filter(Boolean);

      if (!definitions.has(rootType) && !output.some((line) => line.includes(`interface ${rootType} `))) {
        output.push(`export type ${toPascalCase(requestedName)} = ${rootType};`);
      }

      return output.join("\n\n");
    },
  };
}

export function processJsonToTypescriptInterface(
  options: Record<string, string>
): JsonSuiteResult {
  const raw = readTextOption(options, "json_input", "Paste JSON into the editor first.");
  const interfaceName = options.interface_name?.trim() || "RootModel";
  const payload = parseJsonText(raw);
  const generator = createInterfaceGenerator();
  const output = generator.inferRoot(payload, interfaceName);

  return createTextResult(`${sanitizeStem(interfaceName)}.ts`, output);
}

export function processJsonTreeViewer(options: Record<string, string>): JsonSuiteResult {
  const raw = readTextOption(options, "json_input", "Paste JSON into the editor first.");
  const payload = parseJsonText(raw);
  return createJsonResult("json-tree.json", payload);
}

export function processBase64EncoderStub(options: Record<string, string>): JsonSuiteResult {
  const raw = readTextOption(
    options,
    "plain_text",
    "Paste text into the editor first so we can reserve the stub route for you."
  );

  return createTextResult(
    "base64-encoder-stub.txt",
    [
      "Logic Vault Base64 Encoder",
      "",
      "This developer utility is reserved and indexed, but the live encoder is still being hardened for release.",
      `Queued input length: ${raw.length} characters.`,
      "Keep this route bookmarked. The active encoder will ship in the next developer tools wave.",
    ].join("\n")
  );
}

export function processJwtDebuggerStub(options: Record<string, string>): JsonSuiteResult {
  const raw = readTextOption(
    options,
    "jwt_token",
    "Paste a token into the editor first so we can reserve the debugger route for you."
  );

  return createTextResult(
    "jwt-debugger-stub.txt",
    [
      "Logic Vault JWT Debugger",
      "",
      "This debugger route is live as a placeholder while the secure token inspector is finalized.",
      `Queued token length: ${raw.length} characters.`,
      "The signed-claims viewer will arrive as a hardened follow-up release.",
    ].join("\n")
  );
}
