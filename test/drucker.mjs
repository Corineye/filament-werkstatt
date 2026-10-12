// Drucker-Ansicht im nachgebauten Home Assistant: druckt, aus, Verlauf mit Kommentar.
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe, szenario) {
  const ctx = await b.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, timezoneId: "Europe/Berlin" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("404") && fehler.push(m.text()));
  await p.goto(`http://localhost:8765/test/test.html?drucker=${szenario}`);
  await p.waitForTimeout(800);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");

let p = await seite(1400, 900, "druckt");
await el(p).locator('.nav-oben [data-id="drucker"]').click();
await p.waitForTimeout(900);
const text = await el(p).locator(".haupt").textContent();
pruefe(text.includes("Kabelhalter Schreibtisch") && text.includes("62 %") && text.includes("Schicht 87/140"), "Druck mit Name, Fortschritt und Schicht");
pruefe(text.includes("219 °C") && text.includes("Ziel 220 °C") && text.includes("142 W"), "Temperaturen und Strom aus Home Assistant");
pruefe(text.includes("Textured PEI Plate") && text.includes("Gehärteter Stahl") && text.includes("472 h"), "Druckerinfos übersetzt");
pruefe((await el(p).locator(".dr-druck").count()) === 3, "Druckverlauf mit 3 Drucken");
pruefe((await el(p).locator('.dr-druck img').count()) === 1, "Endfoto zum passenden Druck gefunden");
pruefe(await el(p).locator("#dr-kamera-bild").evaluate((i) => i.complete && i.naturalWidth > 0), "Kamerabild geladen");
await p.screenshot({ path: `${out}/d1-druckt.png` });

// Live-Werte ändern sich, ohne dass die Seite neu aufgebaut wird
await p.evaluate(() => { const s = window.hass.states["sensor.p1s_01p00c572701906_druckfortschritt"]; window.hass = { ...window.hass, states: { ...window.hass.states, "sensor.p1s_01p00c572701906_druckfortschritt": { ...s, state: "63" } } }; window.el.hass = window.hass; });
await p.waitForTimeout(1300);
pruefe((await el(p).locator(".dr-ring-text strong").textContent()) === "63 %", "Fortschritt aktualisiert sich live");

// Kommentar
await el(p).locator('[data-aktion="dr-druck"][data-uid="a2"]').click();
await p.waitForTimeout(300);
await el(p).locator("#dr-kommentar").fill("Ecke hat sich gelöst, Bett war nicht sauber. Nächstes Mal vorher mit Spüli waschen.");
await p.screenshot({ path: `${out}/d2-kommentar.png` });
await el(p).locator('[data-aktion="dr-kommentar-speichern"]').click();
await p.waitForTimeout(900);
const daten = await p.evaluate(() => JSON.parse(speicher.filament_werkstatt));
pruefe(daten.drucke.a2 && daten.drucke.a2.kommentar.startsWith("Ecke"), "Kommentar gespeichert");
pruefe((await el(p).locator(".dr-kommentar").count()) === 1, "Kommentar steht im Verlauf");

// Drucker aus
const a = await seite(1400, 900, "aus");
await el(a).locator('.nav-oben [data-id="drucker"]').click();
await a.waitForTimeout(800);
pruefe((await el(a).locator(".haupt").textContent()).includes("Drucker ist aus"), "Steckdose aus wird erkannt");
await a.screenshot({ path: `${out}/d3-aus.png` });

// Handy
const m = await seite(390, 844, "druckt");
await el(m).locator('.nav-unten [data-id="drucker"]').click();
await m.waitForTimeout(900);
await m.screenshot({ path: `${out}/d4-handy.png` });
await el(m).locator(".haupt").evaluate((x) => (x.scrollTop = 900));
await m.waitForTimeout(200);
await m.screenshot({ path: `${out}/d5-handy-unten.png` });
await el(m).locator(".haupt").evaluate((x) => (x.scrollTop = 99999));
await m.waitForTimeout(200);
await m.screenshot({ path: `${out}/d6-handy-verlauf.png` });

console.log("Fehler:", fehler.length ? fehler : "keine");
await b.close();
process.exit(fehler.length ? 1 : 0);
