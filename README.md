# jsonl-cli

Lightweight CLI to validate, count, and inspect JSON Lines (JSONL) files. No dependencies.

## Install

```sh
npm install -g @yunaremaia/jsonl-cli
```

## Usage

```sh
jsonl file.jsonl
cat file.jsonl | jsonl --json
```

### JSON output

`--json` and `--check --json` print the same object, with keys in this order:

```json
{ "ok": true, "total": 3, "valid": 3, "invalid": 0, "errors": [] }
```

- `ok` is `true` exactly when `invalid` is `0`.
- `errors` lists `{ "line", "error" }` for each invalid line.

## Development

```sh
npm test
npm run lint
```

## License

MIT
