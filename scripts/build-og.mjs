// Renders the Open Graph share cards (1200x630, EN/JA/KO/zh-TW) from tokens.
//
//   node scripts/build-og.mjs          # writes public/og-image{,-ja,-ko,-zh-TW}.png
//   node scripts/build-og.mjs --check  # fail if the PNGs are stale (CI)
//
// The cards are the main acquisition surface, so they must not drift from the
// theme. Copy is lifted from src/i18n/locales/*.ts and colours from
// design/tokens.json — change either and re-run this script.
//
// Rendering goes through headless Chrome rather than an SVG rasteriser because
// the JP/KR headlines need real font shaping. Fonts are served over HTTP from
// node_modules/@fontsource (file:// would trip Chrome's font CORS rules).
//
// Chrome is driven over CDP (puppeteer-core, using the system browser — no
// bundled download). The `--screenshot` CLI flag can't be used: it sizes the
// image to the *window*, not the viewport, so window decoration leaves a white
// band at the bottom. setViewport gives us an exact 1200x630.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = join(ROOT, "public");
const CHECK = process.argv.includes("--check");

// ---------------------------------------------------------------- tokens
const tokens = JSON.parse(
	readFileSync(join(ROOT, "design/tokens.json"), "utf8"),
);
const c = (path) => path.split(".").reduce((o, k) => o[k], tokens.color).$value;

const T = {
	ember: c("brand.ember"),
	bgBase: c("bg.base"),
	bgTop: c("bg.gradientTop"),
	surface: c("bg.surface"),
	textPrimary: c("text.primary"),
	textSecondary: c("text.secondary"),
	success: c("state.success"),
};

// ---------------------------------------------------------------- content
// Mirrors landing.* in src/i18n/locales/. Kept literal (not imported) so this
// script stays runnable without a TS toolchain.
const LOCALES = [
	{
		id: "en",
		file: "og-image.png",
		lang: "en",
		headline: "The call before you commit.",
		lead: "Send one link and hear them on voice — before anyone trades a Discord.",
		trust: ["No download", "Works in the browser", "Faster than pings"],
	},
	{
		id: "ja",
		file: "og-image-ja.png",
		lang: "ja",
		headline: "合流を決める、その前の一声。",
		lead: "リンクをひとつ送るだけ。Discordを交換する前に、声で確かめられる。",
		trust: ["ダウンロード不要", "ブラウザだけで完結", "ピンより速い"],
	},
	{
		id: "ko",
		file: "og-image-ko.png",
		lang: "ko",
		headline: "합류를 정하기 전, 그 한마디.",
		lead: "링크 하나만 보내면 Discord를 교환하기 전에 목소리로 확인할 수 있습니다.",
		trust: ["다운로드 불필요", "브라우저만으로 완결", "핑보다 빠르게"],
	},
	{
		id: "zh-TW",
		file: "og-image-zh-TW.png",
		lang: "zh-Hant-TW",
		headline: "決定組隊前，先聽一句。",
		lead: "傳一條連結，在交換 Discord 之前先用語音確認彼此。",
		trust: ["免下載", "瀏覽器就能用", "比信號更快"],
	},
];

// The mark, inlined — same geometry as src/components/BrandMark.tsx.
const MARK = `
<svg viewBox="0 0 32 32" fill="none" width="64" height="64">
  <circle cx="16" cy="16" r="3" fill="${T.ember}"/>
  <g stroke="${T.ember}" stroke-width="2.5" stroke-linecap="round">
    <path d="M20.82 10.26A7.5 7.5 0 0 1 20.82 21.74"/>
    <path d="M11.18 21.74A7.5 7.5 0 0 1 11.18 10.26"/>
    <path d="M23.71 6.81A12 12 0 0 1 23.71 25.19"/>
    <path d="M8.29 25.19A12 12 0 0 1 8.29 6.81"/>
  </g>
</svg>`;

const FONT_CSS = [
	"/node_modules/@fontsource/space-grotesk/700.css",
	"/node_modules/@fontsource/inter/400.css",
	"/node_modules/@fontsource/jetbrains-mono/500.css",
	"/node_modules/@fontsource/noto-sans-jp/400.css",
	"/node_modules/@fontsource/noto-sans-jp/700.css",
	"/node_modules/@fontsource/noto-sans-kr/400.css",
	"/node_modules/@fontsource/noto-sans-kr/700.css",
	"/node_modules/@fontsource/noto-sans-tc/400.css",
	"/node_modules/@fontsource/noto-sans-tc/700.css",
];

// Han unification means JP and TC share codepoints but draw them differently
// (説/說, 戸/戶). Whichever font comes first in the stack wins, so each card
// must lead with its own language's face or the glyphs are subtly wrong.
const CJK = {
	en: "'Noto Sans JP', 'Noto Sans KR', 'Noto Sans TC'",
	ja: "'Noto Sans JP', 'Noto Sans KR', 'Noto Sans TC'",
	ko: "'Noto Sans KR', 'Noto Sans JP', 'Noto Sans TC'",
	"zh-TW": "'Noto Sans TC', 'Noto Sans JP', 'Noto Sans KR'",
};

const html = (L) => `<!doctype html>
<html lang="${L.lang}"><head><meta charset="utf-8">
${FONT_CSS.map((h) => `<link rel="stylesheet" href="${h}">`).join("\n")}
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    background:
      radial-gradient(90% 130% at 100% 0%, color-mix(in srgb, ${T.ember} 13%, transparent), transparent 58%),
      linear-gradient(180deg, ${T.bgTop} 0%, ${T.bgBase} 100%);
    color: ${T.textPrimary};
    font-family: 'Inter', ${CJK[L.id]}, system-ui, sans-serif;
    position: relative;
    overflow: hidden;
  }
  /* Faint ink grid — the "Ink" half of Signal on Ink. */
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(80% 80% at 50% 40%, #000 30%, transparent 75%);
  }
  .wrap {
    position: relative; z-index: 1;
    height: 100%; padding: 68px 76px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .wordmark {
    font-family: 'Space Grotesk', ${CJK[L.id]}, sans-serif;
    font-weight: 700; font-size: 40px; letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  h1 {
    font-family: 'Space Grotesk', ${CJK[L.id]}, sans-serif;
    font-weight: 700; letter-spacing: -0.022em; line-height: 1.06;
    font-size: ${L.id === "en" ? 86 : 74}px;
    max-width: 22ch; text-wrap: balance;
    margin-top: 22px;
  }
  .lead {
    margin-top: 22px; max-width: 60ch;
    font-size: 25px; line-height: 1.5; color: ${T.textSecondary};
  }
  .pills { display: flex; gap: 14px; }
  .pill {
    display: inline-flex; align-items: center; gap: 11px;
    padding: 13px 22px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.16);
    background: ${T.surface};
    font-size: 21px; font-weight: 500;
  }
  .pill i {
    width: 8px; height: 8px; border-radius: 50%;
    background: ${T.success}; flex: none;
  }
  .url {
    margin-left: auto; align-self: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 21px; color: ${T.ember};
  }
</style></head>
<body>
  <div class="grid"></div>
  <div class="wrap">
    <div>
      <div class="brand">${MARK}<div class="wordmark">VoiceCrew</div></div>
      <h1>${L.headline}</h1>
      <p class="lead">${L.lead}</p>
    </div>
    <div style="display:flex; align-items:center;">
      <div class="pills">
        ${L.trust.map((x) => `<span class="pill"><i></i>${x}</span>`).join("")}
      </div>
      <div class="url">voicecrew.gg</div>
    </div>
  </div>
</body></html>`;

// ---------------------------------------------------------------- static server
const MIME = {
	".css": "text/css",
	".woff2": "font/woff2",
	".woff": "font/woff",
	".html": "text/html",
};
// Serves the cards from memory at /og/<id>, and @fontsource assets from
// node_modules — same origin, so Chrome will actually load the fonts.
const server = createServer((req, res) => {
	const path = decodeURIComponent(req.url.split("?")[0]);

	const card = LOCALES.find((L) => path === `/og/${L.id}`);
	if (card) {
		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		res.end(html(card));
		return;
	}

	const file = join(ROOT, path);
	if (!file.startsWith(join(ROOT, "node_modules")) || !existsSync(file)) {
		res.writeHead(404).end();
		return;
	}
	res.writeHead(200, {
		"Content-Type": MIME[extname(file)] ?? "application/octet-stream",
	});
	res.end(readFileSync(file));
});

// puppeteer needs an absolute path, so resolve the name through `which`.
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
		"build-og: no Chrome/Chromium on PATH. Set CHROME_BIN to a browser binary.",
	);
	process.exit(1);
}

const sha = (buf) => createHash("sha256").update(buf).digest("hex");

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const stale = [];

const browser = await puppeteer.launch({
	executablePath: CHROME,
	args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"],
});

try {
	const page = await browser.newPage();
	await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

	for (const L of LOCALES) {
		await page.goto(`http://127.0.0.1:${port}/og/${L.id}`, {
			waitUntil: "networkidle0",
		});
		await page.evaluateHandle("document.fonts.ready");

		const next = Buffer.from(await page.screenshot({ type: "png" }));
		const dest = join(OUT_DIR, L.file);
		const prev = existsSync(dest) ? readFileSync(dest) : null;

		if (prev && sha(prev) === sha(next)) {
			console.log(`  = ${L.file} (unchanged)`);
			continue;
		}
		if (CHECK) {
			stale.push(L.file);
			continue;
		}
		writeFileSync(dest, next);
		console.log(`  ✓ ${L.file} (${(next.length / 1024).toFixed(0)} kB)`);
	}
} finally {
	await browser.close();
	server.close();
}

if (CHECK && stale.length) {
	console.error(
		`build-og: stale OG images: ${stale.join(", ")}. Run \`pnpm og:build\`.`,
	);
	process.exit(1);
}
