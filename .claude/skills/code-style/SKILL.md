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
