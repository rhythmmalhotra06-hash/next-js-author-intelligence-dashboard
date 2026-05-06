#!/usr/bin/env node
// Capture screenshots for the Author Relations guide deck (public/guide.html).
// Requires the dev server running on PORT (default 3000) and `playwright` installed.
//
// Run from the dashboard/ folder:
//   npm run guide:shots
//
// Override port:
//   PORT=3001 npm run guide:shots

import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "public", "guide-images");
const BASE = `http://localhost:${process.env.PORT || 3000}`;

mkdirSync(OUT, { recursive: true });

const targets = [
  { url: "/overview",               file: "01-overview.png" },
  { url: "/author/shi%20heng%20yi", file: "02-author.png"   },
  { url: "/finance",                file: "03-finance.png"  },
  { url: "/speaking",               file: "04-mastery.png"  },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

for (const t of targets) {
  let attempt = 0;
  while (attempt < 4) {
    attempt++;
    process.stdout.write(`→ ${t.url}${attempt > 1 ? ` (attempt ${attempt})` : ""} ... `);
    await page.goto(BASE + t.url, { waitUntil: "networkidle", timeout: 120_000 });
    await page.waitForTimeout(1500);
    const html = await page.content();
    if (html.includes("RATE_LIMIT_REACHED") || html.includes("Runtime Error")) {
      console.log("rate-limited, waiting 60s...");
      await page.waitForTimeout(60_000);
      continue;
    }
    const out = path.join(OUT, t.file);
    await page.screenshot({ path: out, fullPage: false });
    console.log("ok", out);
    break;
  }
}

await browser.close();
