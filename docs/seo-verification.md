# SEO / AIO verification

How to verify the SEO and AI-optimization setup after deploying.

## What's in place

- **Per-language `<head>`** — `functions/_middleware.ts` rewrites the SPA's
  `index.html` at the edge (Cloudflare Pages) based on the URL language prefix
  (`/`, `/ja`, `/ko`), so crawlers and social scrapers (which don't run the
  React app) get localized `<title>`, `description`, Open Graph, Twitter Card,
  `<html lang>`, canonical, and `hreflang` alternates.
- **Language URLs** — English at `/` (x-default), Japanese at `/ja`, Korean at
  `/ko`; the same for `/join`.
- **Structured data** — `WebApplication` + `HowTo` JSON-LD in `index.html`.
- **Crawler files** — `public/robots.txt`, `public/sitemap.xml` (with
  `hreflang` alternates), `public/site.webmanifest`.
- **AIO** — `public/llms.txt` (llmstxt.org convention).
- **OG images** — `og-image.png` (en), `og-image-ja.png`, `og-image-ko.png`
  (1200×630).

## Quick checks (after deploy)

Replace `voiceparty.lol` with the deployed host.

```sh
# Localized title + hreflang are injected by the edge middleware
curl -s https://voiceparty.lol/    | grep -Ei '<title>|hreflang|og:locale'
curl -s https://voiceparty.lol/ja  | grep -Ei '<title>|hreflang|og:locale'
curl -s https://voiceparty.lol/ko  | grep -Ei '<title>|hreflang|og:locale'

# Crawler files resolve
curl -sI https://voiceparty.lol/robots.txt
curl -sI https://voiceparty.lol/sitemap.xml
curl -sI https://voiceparty.lol/llms.txt
curl -sI https://voiceparty.lol/og-image.png
```

Expect the `/ja` and `/ko` responses to show the localized `<title>`,
`og:locale` (`ja_JP` / `ko_KR`), and the same set of `hreflang` alternates
(`en`, `ja`, `ko`, `x-default`).

## Validators

- **Rich Results Test** — https://search.google.com/test/rich-results
  Enter `https://voiceparty.lol/` and confirm the `HowTo` (and
  `WebApplication`) items are detected without errors.
- **Schema Markup Validator** — https://validator.schema.org/
  Paste the page URL or the JSON-LD to validate both blocks.
- **Facebook Sharing Debugger** — https://developers.facebook.com/tools/debug/
  Check the OG preview per language URL (`/`, `/ja`, `/ko`).
- **X (Twitter) Card Validator** / any card preview tool — confirm the
  `summary_large_image` card and image render.
- **hreflang** — Google Search Console → International Targeting, or any
  hreflang checker, to confirm reciprocal alternates.

## Notes

- Session rooms (`/join/<id>`) are returned with `noindex, follow` by the
  middleware — they are shareable but shouldn't be indexed.
- The middleware runs only on Cloudflare Pages. In local `vite` dev the head
  stays in its English default (no edge rewriting); this is expected.
