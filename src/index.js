// jsonl-cli: validate, count, and inspect JSON Lines (JSONL) files.

export function validateLine(line) {
  const trimmed = String(line).trim();
  if (trimmed === "") return { ok: true, error: null };
  try {
    JSON.parse(trimmed);
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: `invalid json: ${err.message}` };
  }
}

export function parseJsonl(text) {
  const input = String(text ?? "");
  // Split keeping line numbers; drop a single trailing empty from final newline.
  const lines = input === "" ? [] : input.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "" && input.endsWith("\n")) {
    lines.pop();
  }
  let valid = 0;
  let invalid = 0;
  const errors = [];
  lines.forEach((line, idx) => {
    const r = validateLine(line);
    if (r.ok) valid++;
    else {
      invalid++;
      errors.push({ line: idx + 1, error: r.error });
    }
  });
  return { total: lines.length, valid, invalid, errors };
}

export function countValid(text) {
  return parseJsonl(text).valid;
}
