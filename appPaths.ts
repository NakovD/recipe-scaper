import * as path from "node:path";

// When bundled into a standalone .exe (via yao-pkg), process.execPath is the
// exe itself, and data folders (recipes/, public/) ship as real files next to
// it. In dev, just use the current working directory as before.
const isPackaged = Object.hasOwn(process, "pkg");

export const baseDir = isPackaged
	? path.dirname(process.execPath)
	: process.cwd();
