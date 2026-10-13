// Verbuchen: Pop-up nach dem Druck, Abbruch-Balken, Fehldruck-Fragen, rotes Ausrufezeichen, Rückgängig.
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe, mobil = false) {
  const ctx = await b.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, hasTouch: mobil, isMobile: mobil, timezoneId: "Europe/Berlin" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("404") && fehler.push(m.text()));
  await p.goto("http://localhost:8765/test/test.html?drucker=bereit");
  await p.waitForTimeout(800);
  // Testdrucke liegen vor dem ersten Start: Stichtag zurücksetzen, Verlauf neu laden
  await p.evaluate(() => { const x = window.el; x._daten.buchen_ab = "2000-01-01"; x._buGezeigt = null; x._drVerlaufLaden(); });
  await p.waitForTimeout(600);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");

let p = await seite(1400, 900);
pruefe((await el(p).locator(".bu-dialog").count()) === 1, "Pop-up öffnet sich von selbst für den fertigen Druck");
let t = await el(p).locator(".bu-dialog").textContent();
pruefe(t.includes("Kalibrierwürfel") && t.includes("6,8 g laut Slicer"), "Pop-up zeigt Druck und Gewicht");
pruefe(t.includes("220 °C passt zu PLA"), "Vorschlag begründet mit Düsentemperatur");
pruefe(/Anfangslinie \+ 3× Extruder\s*0,40 g/.test(t), "Feste Zusatzposten 0,4 g");
await p.waitForTimeout(300);
pruefe((await el(p).locator("#bu-kosten").textContent()).includes("0,210 kWh"), "Strom aus dem Monatszähler (0,21 kWh)");
await p.screenshot({ path: `${out}/b1-popup.png` });
const rolleName = await el(p).locator(".bu-rolle.an strong").textContent();
const vorher = await p.evaluate((n) => window.el._daten.rollen.find((r) => r.name === n).rest_g, rolleName);
await el(p).locator('[data-aktion="bu-buchen"]').click();
await p.waitForTimeout(400);
const nachher = await p.evaluate((n) => window.el._daten.rollen.find((r) => r.name === n).rest_g, rolleName);
pruefe(vorher == null || Math.abs(vorher - nachher - 7.16) < 0.01, `Abgezogen: ${vorher} → ${nachher} (6,76 + 0,4)`);

// Abbruch-Balken
pruefe((await el(p).locator(".bu-balken.rot").count()) === 1, "Roter Balken für abgebrochenen Druck");
await p.screenshot({ path: `${out}/b2-balken.png` });
await el(p).locator('.bu-balken [data-ergebnis="fehl"]').click();
await p.waitForTimeout(300);
t = await el(p).locator(".bu-dialog").textContent();
pruefe(t.includes("Gedruckt bis") && t.includes("34 %"), "Fortschritt 34 % übernommen");
pruefe(t.includes("250 °C passt zu PETG"), "PETG vorgeschlagen");
pruefe(t.includes("Rollenwechsel"), "Rollenwechsel erkannt, Reststück der alten Rolle");
await p.screenshot({ path: `${out}/b3-fehl.png` });
const petg = await el(p).locator(".bu-rolle.an strong").textContent();
await el(p).locator('[data-aktion="bu-buchen"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".bu-bild").count()) > 10, "Fehlerbilder zur Auswahl");
pruefe((await el(p).locator('[data-aktion="bu-wann"].an').textContent()).includes("Mittendrin"), "Zeitpunkt aus 34 % vorgeschlagen");
await el(p).locator('[data-aktion="bu-bild"][data-id="haftung"]').click();
await el(p).locator('[data-aktion="bu-extra"][data-id="getrocknet"][data-a="nein"]').click();
await p.screenshot({ path: `${out}/b4-fragen.png` });
await el(p).locator('[data-aktion="bu-auswerten"]').click();
await p.waitForTimeout(300);
t = await el(p).locator(".bu-dialog").textContent();
pruefe(t.includes("Löst sich vom Bett") && t.includes("Blasen"), "Ursachen: Haftung + Feuchtigkeit");
pruefe(t.includes("Druckbett: 70 → 75"), "Konkrete Änderung Bett 70 → 75 °C");
await el(p).locator('[data-aktion="bu-haken"]').first().click();
await p.screenshot({ path: `${out}/b5-loesungen.png` });
await el(p).locator('[data-aktion="bu-fehl-speichern"]').click();
await p.waitForTimeout(400);
const r = await p.evaluate((n) => window.el._daten.rollen.find((r) => r.name === n), petg);
pruefe(r.achtung && r.eigen.bett === 75, "Rolle rot markiert, Bett 75 °C übernommen");
pruefe((await el(p).locator(".bu-balken").count()) === 0, "Keine Balken mehr");
pruefe((await el(p).locator(".kachel-achtung").count()) === 1, "Rotes ! auf der Kachel");
await p.screenshot({ path: `${out}/b6-kachel.png` });

// Druckverlauf: Buchung sichtbar, rückgängig
await el(p).locator('.nav-oben [data-id="drucker"]').click();
await p.waitForTimeout(500);
t = await el(p).locator(".dr-verlauf").textContent();
pruefe(t.includes("verbucht") && t.includes("Fehldruck"), "Verlauf zeigt verbucht/Fehldruck");
await el(p).locator('.dr-druck', { hasText: "Kalibrierwürfel" }).click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".dialog").textContent()).includes("Abgezogen"), "Druck-Dialog zeigt Buchung");
await el(p).locator('[data-aktion="bu-rueckgaengig"]').click();
await p.waitForTimeout(300);
const zurueck = await p.evaluate((n) => window.el._daten.rollen.find((r) => r.name === n).rest_g, rolleName);
pruefe(vorher == null || Math.abs(zurueck - (vorher - 0)) < 0.2, `Rückgängig: ${zurueck}`);

// Handy
p = await seite(390, 844, true);
await p.screenshot({ path: `${out}/b7-handy-popup.png` });
await el(p).locator('[data-aktion="bu-fertig"]').first().click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/b8-handy-balken.png` });

await b.close();
if (fehler.length) { console.log("\nFEHLER:\n" + fehler.join("\n")); process.exit(1); }
console.log("\nAlles grün.");
