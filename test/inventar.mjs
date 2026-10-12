// Inventar im nachgebauten Home Assistant durchklicken.
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe) {
  const p = await b.newPage({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2 });
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
  p.on("dialog", (d) => d.accept());
  await p.goto("http://localhost:8765/test/test.html");
  await p.waitForTimeout(800);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const inv = (p) => p.evaluate(() => JSON.parse(speicher.filament_werkstatt).inventar);

const p = await seite(1400, 900);
await el(p).locator('.nav-oben [data-id="inventar"]').click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/i1-uebersicht.png` });
pruefe((await el(p).locator(".kachel").count()) === 55, `Startbestand: ${await el(p).locator(".kachel").count()} Sorten`);

await el(p).locator("#inv-suche").fill("m3x12");
await p.waitForTimeout(200);
pruefe((await el(p).locator(".kachel").count()) === 1, "Suche m3x12 findet 1 Schraube");
pruefe((await el(p).locator(".passend-titel").count()) === 1, "Querverweise werden angezeigt");
await p.screenshot({ path: `${out}/i2-suche.png` });
await el(p).locator("#inv-suche").fill("Fedr 5");
await p.waitForTimeout(200);
pruefe((await el(p).locator(".kachel").count()) === 5, `Tippfehler „Fedr 5“ findet ${await el(p).locator(".kachel").count()} Federn mit Ø5`);
await el(p).locator('[data-aktion="inv-alle"]').click();

await el(p).locator('[data-aktion="inv-oeffnen"][data-id="einsatz-M3-5-5"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="inv-menge"][data-d="-1"]').click();
await p.locator("filament-werkstatt-panel").evaluate((x) => {
  const s = x.shadowRoot.querySelector("[data-inv-min]"); s.value = 10;
  s.dispatchEvent(new Event("input", { bubbles: true })); s.dispatchEvent(new Event("change", { bubbles: true }));
});
await p.waitForTimeout(800);
await p.screenshot({ path: `${out}/i3-einsatz.png` });
let e = (await inv(p)).find((t) => t.id === "einsatz-M3-5-5");
pruefe(e.menge === 49 && e.min === 10, "Menge −1 und Mindestbestand gespeichert");
await el(p).locator('.sheet [data-aktion="inv-oeffnen"]').first().click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".sheet-titel h2").textContent()).includes("M3"), "Querverweis öffnet passendes M3-Teil");
await el(p).locator('.sheet-kopf [data-aktion="schliessen"]').click();

await el(p).locator('[data-aktion="inv-oeffnen"][data-id="feder-0.4-5-20"]').click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/i4-feder.png` });
await el(p).locator('.sheet-kopf [data-aktion="schliessen"]').click();

await el(p).locator('[data-aktion="neu"]').click();
await el(p).locator('[data-aktion="inv-neu-kat"][data-id="magnet"]').click();
await el(p).locator('[data-aktion="inv-schritt"][data-k="durchmesser"][data-d="1"]').click();
await el(p).locator('[data-aktion="inv-menge"][data-d="10"]').click();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/i5-neu.png` });
await el(p).locator('[data-aktion="inv-anlegen"]').click();
await p.waitForTimeout(900);
const neu = (await inv(p)).find((t) => t.kat === "magnet" && t.angelegt_am);
pruefe(neu && neu.menge === 20 && neu.durchmesser === 6.1, `Neuer Magnet angelegt (${neu && neu.durchmesser} mm, ${neu && neu.menge} Stk)`);

const m = await seite(390, 844);
await el(m).locator('.nav-unten [data-id="inventar"]').click();
await m.waitForTimeout(300);
await m.screenshot({ path: `${out}/i6-handy.png` });
await el(m).locator('[data-aktion="inv-oeffnen"][data-id="schraube-M3-12"]').click();
await m.waitForTimeout(300);
await m.screenshot({ path: `${out}/i7-handy-detail.png` });

console.log("Fehler:", fehler.length ? fehler : "keine");
await b.close();
process.exit(fehler.length ? 1 : 0);
