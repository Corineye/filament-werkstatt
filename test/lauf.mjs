import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2];
const b = await chromium.launch();
const fehler = [];
async function seite(breite, hoehe) {
  const p = await b.newPage({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2 });
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
  await p.goto("http://localhost:8765/test/test.html");
  await p.waitForTimeout(800);
  return p;
}
const sr = (p) => p.locator("filament-werkstatt-panel");
// Desktop
let p = await seite(1400, 900);
await p.screenshot({ path: `${out}/1-uebersicht.png` });
await sr(p).locator('[data-id="deeplee-pla-plus-braun"]').click();
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/2-nicht-probiert.png` });
await sr(p).locator('[data-aktion="probiert"]').click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/3-probiert-dialog.png` });
await sr(p).locator('[data-aktion="test-anpassen"]').click();
await p.waitForTimeout(300);
// Regler bewegen und Plus drücken
await sr(p).locator('[data-aktion="schritt"][data-k="duese"][data-d="1"]').click();
await sr(p).locator('[data-aktion="schritt"][data-k="duese"][data-d="1"]').click();
await p.screenshot({ path: `${out}/4-anpassen.png` });
await sr(p).locator('[data-aktion="speichern-einst"]').click();
await p.waitForTimeout(900);
const gespeichert = await p.evaluate(() => JSON.parse(speicher.filament_werkstatt).rollen.find(r => r.id === "deeplee-pla-plus-braun"));
console.log("Braun probiert:", gespeichert.probiert, "duese:", gespeichert.eigen.duese);
await sr(p).locator('[data-aktion="tab"][data-id="rest"]').click();
await p.waitForTimeout(300);
await sr(p).locator('[data-aktion="brutto"][data-d="10"]').click();
await p.screenshot({ path: `${out}/5-restrechner.png` });
await sr(p).locator('[data-aktion="rest-speichern"]').click();
await p.waitForTimeout(900);
console.log("Rest Braun:", await p.evaluate(() => JSON.parse(speicher.filament_werkstatt).rollen.find(r => r.id === "deeplee-pla-plus-braun").rest_g));
await sr(p).locator('[data-aktion="schliessen"].icon-knopf').click();
await sr(p).locator('[data-aktion="oeffnen"][data-id="elegoo-rapid-petg-beige"]').click();
await p.waitForTimeout(300);
await sr(p).locator('[data-aktion="gruppe"][data-id="tempo"]').click();
await p.screenshot({ path: `${out}/6-probiert-rolle.png` });
// Mobil
const m = await seite(390, 844);
await m.screenshot({ path: `${out}/7-handy.png` });
await sr(m).locator('[data-id="lvvj3d-wood-teak"]').click();
await m.waitForTimeout(400);
await m.screenshot({ path: `${out}/8-handy-detail.png` });
await sr(m).locator('[data-aktion="schliessen"].icon-knopf').click();
await sr(m).locator('.nav-unten [data-id="system"]').click();
await m.waitForTimeout(500);
await m.screenshot({ path: `${out}/9-handy-system.png` });
// Suche
await sr(p).locator('[data-aktion="schliessen"].icon-knopf').click();
await sr(p).locator("#suche").fill("wood");
await p.waitForTimeout(200);
console.log("Kacheln bei 'wood':", await sr(p).locator(".kachel").count());
console.log("Fehler:", fehler.length ? fehler : "keine");
await b.close();
