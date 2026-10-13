// Lader: lädt die Seite mit der aktuellen Versionsnummer und meldet neue Versionen.
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
const p = await b.newPage();
const urls = [];
p.on("request", (r) => urls.push(r.url()));
p.on("pageerror", (e) => fehler.push(e.message));
await p.goto("http://localhost:8765/test/test.html?drucker=bereit");
await p.waitForTimeout(1000);
const alt = readFileSync("filament-werkstatt-version.js", "utf8");
const v = alt.match(/"(.*)"/)[1];
pruefe(urls.some((u) => u.includes(`filament-werkstatt-kern.js?v=${v}`)), `Kern mit Version ${v} geladen`);
pruefe((await p.locator("filament-werkstatt-panel .kachel").count()) > 10, "Seite läuft über den Lader");
try {
  writeFileSync("filament-werkstatt-version.js", 'export const VERSION = "9.9.9";\n');
  await p.evaluate(() => window.el._updatePruefen());
  await p.waitForTimeout(400);
  pruefe((await p.locator("filament-werkstatt-panel .bu-balken").textContent()).includes("9.9.9"), "Neue Version wird oben gemeldet");
} finally { writeFileSync("filament-werkstatt-version.js", alt); }
await b.close();
console.log(fehler.length ? "\nFehler:\n" + fehler.join("\n") : "\nAlles grün.");
process.exit(fehler.length ? 1 : 0);
