#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { parseJsonl, checkInputSize, parseMaxInputBytes, checkJsonl } from "../src/index.js";

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log(`jsonl — validate and inspect JSON Lines (JSONL)\n\nUsage:\n  jsonl [file] [options]\n  cat file.jsonl | jsonl [options]\n\nOptions:\n  --json     Machine-readable summary\n  --check          Exit 1 on invalid input (CI mode), silent on success\n  -h, --help Show this help\n`);
  process.exit(0);
}

const fileArg = args.find((a) => !a.startsWith("--"));
const text = fileArg ? readFileSync(fileArg, "utf8") : readFileSync(0, "utf8");
const maxBytes = parseMaxInputBytes(args);
const sizeCheck = checkInputSize(text, maxBytes);
if (!sizeCheck.ok) {
  console.error(`error: ${sizeCheck.error}`);
  process.exit(1);
}
if (args.includes("--check")) {
  const c = checkJsonl(text);
  if (args.includes("--json")) {
    console.log(JSON.stringify({ ok: c.ok, errors: c.errors }));
  } else if (!c.ok) {
    for (const e of c.errors) console.error(`line ${e.line}: ${e.error}`);
  }
  process.exit(c.ok ? 0 : 1);
}
const r = parseJsonl(text);
if (args.includes("--json")) console.log(JSON.stringify(r));
else {
  console.log(`total: ${r.total}`);
  console.log(`valid: ${r.valid}`);
  console.log(`invalid: ${r.invalid}`);
  for (const e of r.errors) console.error(`line ${e.line}: ${e.error}`);
}
process.exit(r.invalid > 0 ? 1 : 0);
