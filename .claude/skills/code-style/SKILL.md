---
name: code-style
description: Use before writing or editing any TypeScript/JavaScript code in this repository. Defines the project's code style conventions (function style, exports, comments/logs language, file size limits). Not needed for pure discussion, planning, or research.
---

# Code Style Conventions

Apply these rules to all TypeScript/JavaScript files in this repo.

## Functions
- Always use arrow functions, never `function` declarations or `function` expressions.
  - Bad: `function foo() {}` / `const foo = function () {}`
  - Good: `const foo = () => {}`

## Exports / Imports
- Always use named exports and named imports.
- Never use `export default` or `import defaultThing from ...`.

## Comments and logs
- English only. Never Bulgarian (or any other non-English language) in code comments, `console.log`/logger messages, or commit-adjacent code text.
- User-facing chat/PR text is unaffected — this rule is about text that lives inside source files.

## File size
- Soft limit: ~50-60 lines per file.
- If a file grows past that, split it: extract cohesive pieces into new files, or group related small pieces into a shared file, rather than letting one file keep growing.

## Frontend is TypeScript too
- Browser code lives as `.ts` sources in `frontend-src/`, compiled by `tsc -p tsconfig.frontend.json` into plain `.js` under `public/js/` (which is gitignored — it's build output, not source).
- Never hand-edit files in `public/js/` directly — edit the matching file in `frontend-src/` and rebuild (`npm run build:frontend`, or it runs automatically as part of `npm run serve`).
- Relative imports between frontend modules still need an explicit `.js` extension (e.g. `import { x } from "./api.js"`) even though the source file is `.ts` — this matches the compiled output filename, same convention as the backend.
