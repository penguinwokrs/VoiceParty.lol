// Rasterises public/favicon.svg into the PNG icons that manifests and iOS need
// (SVG favicons still aren't universally honoured).
//
//   node scripts/build-icons.mjs
//
// Source of truth is public/favicon.svg, whose geometry mirrors the
// BrandMark component (src/components/BrandMark.tsx). Edit the SVG, re-run.
//
// The PNGs are rendered *full-bleed*: the SVG's rounded plate is dropped and
// the ink background runs to the edge. iOS and Android apply their own mask, so
// baking in our own corners would show as a rounded icon inside a rounded mask.
// The mark sits at 68% of the half-width, inside the maskable 80% safe zone.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "public");

const ICONS = [
	{ file: "apple-touch-icon.png", size: 180 },
	{ file: "icon-192.png", size: 192 },
	{ file: "icon-512.png", size: 512 },
];

const which = (b) => {
	try {
		return execFileSync("which", [b], { encoding: "utf8" }).trim() || null;
	} catch {
		return null;
	}
};
const CHROME =
	process.env.CHROME_BIN ??
	["google-chrome", "chromium", "chromium-browser"].map(which).find(Boolean);
if (!CHROME) {
	console.error(
		"build-icons: no Chrome/Chromium on PATH. Set CHROME_BIN to a browser binary.",
	);
	process.exit(1);
}

const tokens = JSON.parse(
	readFileSync(join(ROOT, "design/tokens.json"), "utf8"),
);
const INK = tokens.color.bg.base.$value;

// Take the mark out of favicon.svg and drop its rounded plate.
const svg = readFileSync(join(OUT, "favicon.svg"), "utf8").replace(
	/<rect[^>]*\/>/,
	"",
);

const browser = await puppeteer.launch({
	executablePath: CHROME,
	args: ["--no-sandbox", "--disable-gpu"],
});

try {
	const page = await browser.newPage();
	for (const { file, size } of ICONS) {
		await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
		await page.setContent(
			`<style>*{margin:0;padding:0}
			 html,body{width:${size}px;height:${size}px;background:${INK}}
			 svg{width:${size}px;height:${size}px;display:block}</style>${svg}`,
			{ waitUntil: "load" },
		);
		const png = Buffer.from(await page.screenshot({ type: "png" }));
		writeFileSync(join(OUT, file), png);
		console.log(`  ✓ ${file} (${size}x${size})`);
	}
} finally {
	await browser.close();
}
