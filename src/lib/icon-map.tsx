import type { LucideProps } from "lucide-react";
import {
  Activity,
  Archive,
  BadgePercent,
  Binary,
  BrainCircuit,
  Braces,
  Brackets,
  Briefcase,
  Calculator,
  Crop,
  Diff,
  Eraser,
  FileCode,
  FileJson,
  FileOutput,
  FileSpreadsheet,
  FileText,
  Files,
  Hash,
  Image as ImageIcon,
  KeyRound,
  Languages,
  Landmark,
  ListTree,
  Lock,
  PenTool,
  Presentation,
  RotateCw,
  Rows3,
  ScanLine,
  ScanSearch,
  ScanText,
  Scissors,
  Sparkles,
  TrendingUp,
  Trash2,
  Unlock,
  Wallet,
  Wrench,
} from "lucide-react";

import type { ToolAccent } from "@/lib/tools-registry";

export function IconByName({
  iconName,
  ...props
}: { iconName: string } & LucideProps) {
  switch (iconName) {
    case "statement-to-csv":
    case "excel-to-pdf":
    case "pdf-to-excel":
      return <FileSpreadsheet {...props} />;
    case "json-universal-converter":
      return <FileJson {...props} />;
    case "json-formatter-validator":
      return <Braces {...props} />;
    case "json-to-typescript-interface":
      return <FileCode {...props} />;
    case "json-minifier":
      return <Brackets {...props} />;
    case "json-tree-viewer":
      return <ListTree {...props} />;
    case "base64-encoder":
      return <Binary {...props} />;
    case "jwt-debugger":
      return <KeyRound {...props} />;
    case "yield-calculator":
      return <Landmark {...props} />;
    case "roi-tracker":
      return <TrendingUp {...props} />;
    case "landed-cost-calculator":
      return <Wallet {...props} />;
    case "marketing-budget-tool":
      return <BadgePercent {...props} />;
    case "tax-estimator":
      return <Calculator {...props} />;
    case "business-valuation-tool":
      return <Briefcase {...props} />;
    case "merge-pdf":
      return <Files {...props} />;
    case "split-pdf":
      return <Scissors {...props} />;
    case "organize-pdf":
      return <Rows3 {...props} />;
    case "remove-pages":
      return <Trash2 {...props} />;
    case "compress-pdf":
      return <Archive {...props} />;
    case "repair-pdf":
      return <Wrench {...props} />;
    case "ppt-to-pdf":
    case "pdf-to-ppt":
      return <Presentation {...props} />;
    case "jpg-to-pdf":
    case "pdf-to-jpg":
      return <ImageIcon {...props} />;
    case "html-to-pdf":
    case "pdf-to-word":
    case "word-to-pdf":
      return <FileText {...props} />;
    case "rotate-pdf":
      return <RotateCw {...props} />;
    case "page-numbers":
      return <Hash {...props} />;
    case "watermark-pdf":
    case "sign-pdf":
    case "edit-pdf":
      return <PenTool {...props} />;
    case "compare-pdf":
      return <Diff {...props} />;
    case "redact-pdf":
      return <Eraser {...props} />;
    case "crop-pdf":
      return <Crop {...props} />;
    case "scan-to-pdf":
      return <ScanLine {...props} />;
    case "unlock-pdf":
      return <Unlock {...props} />;
    case "protect-pdf":
      return <Lock {...props} />;
    case "ai-summarizer":
      return <Sparkles {...props} />;
    case "ai-expense-categorizer":
      return <BrainCircuit {...props} />;
    case "financial-health-score":
      return <Activity {...props} />;
    case "translate-pdf":
      return <Languages {...props} />;
    case "ocr-pdf":
      return <ScanText {...props} />;
    case "pdf-to-pdfa":
      return <FileOutput {...props} />;
    default:
      return <ScanSearch {...props} />;
  }
}

export function getAccentClasses(accent: ToolAccent) {
  switch (accent) {
    case "red":
      return {
        icon: "lv-neon-icon-shell lv-neon-electric text-vault-electric",
        button: "lv-button-primary",
        badge: "lv-accent-badge-red",
      };
    case "blue":
      return {
        icon: "lv-neon-icon-shell lv-neon-cobalt text-vault-cyan",
        button: "lv-button-primary",
        badge: "lv-accent-badge-blue",
      };
    case "green":
      return {
        icon: "lv-neon-icon-shell lv-neon-lime text-vault-lime",
        button: "lv-button-primary",
        badge: "lv-accent-badge-green",
      };
    case "purple":
      return {
        icon: "lv-neon-icon-shell lv-neon-cyan text-vault-violet",
        button: "lv-button-primary",
        badge: "lv-accent-badge-purple",
      };
    case "orange":
      return {
        icon: "lv-neon-icon-shell lv-neon-cyan text-vault-cyan",
        button: "lv-button-primary",
        badge: "lv-accent-badge-orange",
      };
    default:
      return {
        icon: "lv-neon-icon-shell lv-neon-cobalt text-vault-violet",
        button: "lv-button-primary",
        badge: "lv-accent-badge-slate",
      };
  }
}
