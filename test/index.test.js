import test from "node:test";
import assert from "node:assert/strict";
import { parseJsonl, validateLine, countValid, checkInputSize, parseMaxInputBytes, checkJsonl } from "../src/index.js";

test("validateLine accepts valid JSON", () => {
  assert.deepEqual(validateLine('{"a":1}'), { ok: true, error: null });
});

test("validateLine rejects invalid JSON with message", () => {
  const r = validateLine("{bad");
  assert.equal(r.ok, false);
  assert.match(r.error, /invalid json/i);
});

test("validateLine treats blank lines as valid (skipped)", () => {
  assert.deepEqual(validateLine(""), { ok: true, error: null });
  assert.deepEqual(validateLine("   "), { ok: true, error: null });
});

test("parseJsonl counts valid and invalid lines", () => {
  const text = '{"a":1}\n{bad\n{"b":2}\n';
  const r = parseJsonl(text);
  assert.equal(r.total, 3);
  assert.equal(r.valid, 2);
  assert.equal(r.invalid, 1);
  assert.deepEqual(r.errors, [{ line: 2, error: r.errors[0].error }]);
  assert.match(r.errors[0].error, /invalid json/i);
});

test("parseJsonl handles empty input", () => {
  const r = parseJsonl("");
  assert.equal(r.total, 0);
  assert.equal(r.valid, 0);
  assert.equal(r.invalid, 0);
  assert.deepEqual(r.errors, []);
});

test("parseJsonl handles trailing newline without extra empty line", () => {
  const r = parseJsonl('{"a":1}\n');
  assert.equal(r.total, 1);
  assert.equal(r.valid, 1);
});

test("countValid returns number of valid lines", () => {
  assert.equal(countValid('{"a":1}\n{bad\n{"b":2}'), 2);
});

test("checkInputSize accepts input within cap", () => {
  assert.deepEqual(checkInputSize("abc", 10), { ok: true, error: null });
});

test("checkInputSize rejects input over cap", () => {
  const r = checkInputSize("a".repeat(11), 10);
  assert.equal(r.ok, false);
  assert.match(r.error, /exceeds/i);
});

test("checkInputSize counts bytes not chars", () => {
  // 'é' is 2 bytes in UTF-8
  assert.deepEqual(checkInputSize("é", 2), { ok: true, error: null });
  assert.equal(checkInputSize("é", 1).ok, false);
});

test("parseMaxInputBytes parses --max-input-bytes flag", () => {
  assert.equal(parseMaxInputBytes([], 10 * 1024 * 1024), 10 * 1024 * 1024);
  assert.equal(parseMaxInputBytes(["--max-input-bytes=100"], 10), 100);
  assert.equal(parseMaxInputBytes(["--max-input-bytes=abc"], 10), 10);
});

test("checkJsonl returns ok for valid input", () => {
  assert.deepEqual(checkJsonl('{"a":1}\n{"b":2}\n'), { ok: true, errors: [] });
});

test("checkJsonl collects errors for invalid lines", () => {
  const r = checkJsonl('{"a":1}\n{bad\n');
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 1);
  assert.equal(r.errors[0].line, 2);
  assert.match(r.errors[0].error, /invalid json/i);
});
