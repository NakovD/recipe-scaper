import * as fs from "node:fs";
import * as path from "node:path";

const DIST_DIR = "./dist-pkg";

const copyFresh = (source: string, target: string): void => {
	if (fs.existsSync(target))
		fs.rmSync(target, { recursive: true, force: true });
	fs.cpSync(source, target, { recursive: true });
};

console.log("Copying public/ and recipes/ into dist-pkg/...");
copyFresh("./public", path.join(DIST_DIR, "public"));
copyFresh("./recipes", path.join(DIST_DIR, "recipes"));
console.log("Done. dist-pkg/ is ready to zip and share.");
