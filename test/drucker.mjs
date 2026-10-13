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
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html?drucker=${szenario}`);
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

// Einschalten mit Nachfrage
await el(a).locator('[data-aktion="dr-schalten"][data-ziel="an"]').first().click();
await a.waitForTimeout(300);
await a.screenshot({ path: `${out}/d7-einschalten-frage.png` });
await el(a).locator('[data-aktion="dr-schalten-ok"]').click();
await a.waitForTimeout(1800);
pruefe((await a.evaluate(() => window.dienste)).join() === "switch.turn_on:switch.3d_drucker", "Einschalten ruft switch.turn_on auf");
pruefe((await el(a).locator(".haupt").textContent()).includes("Drucker startet"), "Nach dem Einschalten: Drucker startet");

// Ausschalten während eines Drucks warnt
await el(p).locator('[data-aktion="dr-schalten"][data-ziel="aus"]').click();
await p.waitForTimeout(300);
const warnung = await el(p).locator(".dialog").textContent();
pruefe(warnung.includes("es läuft ein Druck") && warnung.includes("219 °C heiß"), "Ausschalten warnt bei laufendem Druck und heißer Düse");
await p.screenshot({ path: `${out}/d8-ausschalten-warnung.png` });
await el(p).locator('.dialog [data-aktion="dialog-zu"]').click();
pruefe((await p.evaluate(() => window.dienste)).length === 0, "Abbrechen schaltet nichts");

// ---- Geladenes Filament wählen ----
const daten2 = () => p.evaluate(() => JSON.parse(speicher.filament_werkstatt));
const toast = async () => ((await el(p).locator(".toast").count()) ? await el(p).locator(".toast").textContent() : "");
pruefe((await el(p).locator("#dr-filament").textContent()).includes("Kein Filament geladen"), "Anfangs kein Filament geladen");
await el(p).locator("#dr-filament .dd-knopf").click();
await p.waitForTimeout(200);
await el(p).locator(".dd-liste .dd-option", { hasText: "PLA Matte Rosa" }).click();
await p.waitForTimeout(900);
pruefe((await daten2()).geladen === "esun-pla-matte-rosa", "Rolle über die Auswahl als geladen gespeichert");
pruefe((await el(p).locator("#dr-filament.geladen").textContent()).includes("PLA Matte Rosa"), "Karte zeigt die geladene Rolle grün");
await p.screenshot({ path: `${out}/d9-filament-geladen.png` });

// ---- Zieltemperatur ----
await p.evaluate(() => { window.dienstDaten.length = 0; });
await el(p).locator('[data-dr-temp="duese"]').fill("350");
await el(p).locator('[data-aktion="dr-temp"][data-k="duese"]:not([data-wert])').click();
await p.waitForTimeout(200);
pruefe((await toast()).includes("nur 0–300 °C") && (await p.evaluate(() => dienstDaten.length)) === 0, "Düse 350 °C wird abgelehnt");
pruefe(await el(p).locator('[data-dr-temp="duese"].fehler').count() === 1 && (await el(p).locator('[data-dr-temp="duese"]').inputValue()) === "350", "Falscher Wert bleibt rot markiert stehen");
await el(p).locator('[data-dr-temp="bett"]').fill("120");
await el(p).locator('[data-dr-temp="bett"]').press("Enter");
await p.waitForTimeout(200);
pruefe((await toast()).includes("nur 0–110 °C"), "Druckbett 120 °C wird abgelehnt (Enter)");
await el(p).locator('[data-dr-temp="duese"]').fill("230");
await el(p).locator('[data-aktion="dr-temp"][data-k="duese"]:not([data-wert])').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".dialog").textContent()).includes("Es läuft ein Druck"), "Während des Drucks wird nachgefragt");
await p.screenshot({ path: `${out}/d10-temperatur-frage.png` });
await el(p).locator('[data-aktion="dr-temp-ok"]').click();
await p.waitForTimeout(1500);
let dd = await p.evaluate(() => dienstDaten);
pruefe(dd.length === 1 && dd[0].domain === "number" && dd[0].dienst === "set_value" && dd[0].value === 230 && dd[0].entity_id === "number.p1s_01p00c572701906_zieltemperatur_der_duse", "Düse: number.set_value mit 230");
pruefe((await toast()).includes("Ziel 230 °C übernommen"), "Rückmeldung nach dem Setzen");
await p.screenshot({ path: `${out}/d11-temperatur-gesetzt.png` });
// Schnellknopf mit dem Wert der geladenen Rolle
const chip = el(p).locator('.dr-rolle-chip[data-k="duese"]');
pruefe(await chip.count() === 1 && (await el(p).locator('.dr-rolle-chip[data-k="bett"]').count()) === 0, "Schnellknopf mit Düsentemperatur der geladenen Rolle (Bett passt schon: keiner)");

// ---- Lüfter ----
await p.evaluate(() => { dienstDaten.length = 0; });
await el(p).locator('[data-aktion="dr-luefter"][data-k="l_kopf"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".dialog").textContent()).includes("Druckkopflüfter") && (await el(p).locator(".dialog .dr-stufen .chip").count()) === 6, "Lüfter-Editor mit 6 Schnellknöpfen");
await p.screenshot({ path: `${out}/d12-luefter.png` });
await el(p).locator('.dialog [data-aktion="dr-luefter-setzen"][data-wert="30"]').click();
await p.waitForTimeout(1500);
dd = await p.evaluate(() => dienstDaten);
pruefe(dd.length === 1 && dd[0].domain === "fan" && dd[0].dienst === "set_percentage" && dd[0].percentage === 30 && dd[0].entity_id === "fan.p1s_01p00c572701906_druckkopflufter", "Schnellknopf 30 % → fan.set_percentage");
pruefe((await el(p).locator(".dialog").count()) === 0 && (await toast()).includes("läuft mit 30 %"), "Editor schließt sich mit Rückmeldung");
pruefe((await el(p).locator('[data-k="l_kopf"] strong').textContent()) === "30 %", "Kachel zeigt den neuen Wert");
await el(p).locator('[data-aktion="dr-luefter"][data-k="l_bauteil"]').click();
await p.waitForTimeout(200);
await el(p).locator("[data-dr-luefter]").fill("130");
await el(p).locator('.dialog [data-aktion="dr-luefter-setzen"]:not([data-wert])').click();
await p.waitForTimeout(200);
pruefe((await toast()).includes("nur 0–100 %") && (await p.evaluate(() => dienstDaten.length)) === 1, "130 % wird abgelehnt");
await el(p).locator("[data-dr-luefter]").fill("45");
await el(p).locator("[data-dr-luefter]").press("Enter");
await p.waitForTimeout(1500);
dd = await p.evaluate(() => dienstDaten);
pruefe(dd[1] && dd[1].percentage === 50 && (await toast()).includes("gerundet von 45"), "Eigener Wert 45 % → 50 % (10er-Schritte)");
await el(p).locator('[data-aktion="dr-luefter"][data-k="l_bauteil"]').click();
await p.waitForTimeout(200);
await el(p).locator('.dialog [data-aktion="dr-luefter-setzen"][data-wert="0"]').click();
await p.waitForTimeout(1500);
dd = await p.evaluate(() => dienstDaten);
pruefe(dd[2] && dd[2].dienst === "turn_off" && dd[2].entity_id === "fan.p1s_01p00c572701906_bauteillufter", "Aus → fan.turn_off");
pruefe((await el(p).locator('[data-aktion="dr-luefter"][data-k="l_hotend"]').count()) === 0, "Hotend-Lüfter ist nicht einstellbar");

// ---- Verbuchen schlägt die geladene Rolle zuerst vor ----
await el(p).locator('[data-aktion="dr-druck"][data-uid="a1"]').click();
await p.waitForTimeout(300);
await el(p).locator('.dialog [data-aktion="bu-start"]').click();
await p.waitForTimeout(500);
const erste = await el(p).locator(".bu-rolle").first().textContent();
pruefe(erste.includes("PLA Matte Rosa") && erste.includes("ist geladen"), "Verbuchen: geladene Rolle steht zuerst");
await el(p).locator('.bu-dialog [data-aktion="bu-fertig"]').click();
await p.waitForTimeout(300);

// ---- Kein Filament geladen ----
await el(p).locator('#dr-filament [data-aktion="dr-laden"]').click();
await p.waitForTimeout(900);
pruefe((await daten2()).geladen === null && (await el(p).locator("#dr-filament").textContent()).includes("Kein Filament geladen"), "„Kein Filament geladen“ setzt zurück");

// ---- Filament-Ansicht: Knopf „Geladen“ und grüne Kachel ----
await el(p).locator('.nav-oben [data-id="filament"]').click();
await p.waitForTimeout(400);
pruefe((await el(p).locator(".kachel.geladen").count()) === 0, "Ohne geladene Rolle keine grüne Kachel");
await el(p).locator('.kachel[data-id="esun-pla-matte-rosa"]').click();
await p.waitForTimeout(400);
await el(p).locator('.sheet .geladen-knopf').click();
await p.waitForTimeout(900);
pruefe((await daten2()).geladen === "esun-pla-matte-rosa" && (await el(p).locator(".sheet .geladen-knopf.an").count()) === 1, "Detail: Knopf „Geladen“ setzt die Rolle als geladen");
await p.screenshot({ path: `${out}/d13-detail-geladen.png` });
await el(p).locator('.sheet [data-aktion="schliessen"]').first().click();
await p.waitForTimeout(400);
const kachel = el(p).locator(".kachel.geladen");
pruefe((await kachel.count()) === 1 && (await kachel.textContent()).includes("geladen") && (await kachel.getAttribute("data-id")) === "esun-pla-matte-rosa", "Kachel der geladenen Rolle grün mit „geladen“");
pruefe(await kachel.evaluate((k) => getComputedStyle(k).borderTopColor.includes("91, 227, 125")), "Kachel hat einen grünen Rand");
await p.screenshot({ path: `${out}/d14-kacheln.png` });
await el(p).locator('.kachel[data-id="esun-pla-matte-rosa"]').click();
await p.waitForTimeout(400);
await el(p).locator('.sheet .geladen-knopf.an').click();
await p.waitForTimeout(900);
pruefe((await daten2()).geladen === null, "Detail: nochmal antippen = nicht mehr geladen");

// ---- Drucker bereit: Temperatur ohne Nachfrage ----
const r = await seite(1400, 900, "bereit");
await el(r).locator('.nav-oben [data-id="drucker"]').click();
await r.waitForTimeout(800);
await el(r).locator('[data-dr-temp="bett"]').fill("60");
await el(r).locator('[data-dr-temp="bett"]').press("Enter");
await r.waitForTimeout(1500);
const rd = await r.evaluate(() => dienstDaten);
pruefe((await el(r).locator(".dialog").count()) === 0 && rd.length === 1 && rd[0].value === 60 && rd[0].entity_id === "number.p1s_01p00c572701906_zieltemperatur_des_druckbett", "Bereit: Bett 60 °C ohne Nachfrage gesetzt");
await el(r).locator('[data-dr-temp="duese"]').fill("280");
await el(r).locator('[data-dr-temp="duese"]').press("Enter");
await r.waitForTimeout(300);
pruefe((await el(r).locator(".dialog").textContent()).includes("sehr heiß"), "Bereit: 280 °C fragt nach (sehr heiß)");
await el(r).locator('.dialog [data-aktion="dialog-zu"]').click();
pruefe((await r.evaluate(() => dienstDaten.length)) === 1, "Abbrechen sendet nichts");

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
// Handy: Filament laden, Temperaturen, Lüfter-Editor, Kacheln
await el(m).locator("#dr-filament").scrollIntoViewIfNeeded();
await el(m).locator("#dr-filament .dd-knopf").click();
await m.waitForTimeout(200);
await el(m).locator(".dd-liste .dd-option", { hasText: "PLA Matte Rosa" }).click();
await m.waitForTimeout(900);
await el(m).locator("#dr-filament").evaluate((x) => x.scrollIntoView());
await m.waitForTimeout(200);
await m.screenshot({ path: `${out}/d15-handy-filament.png` });
await el(m).locator(".dr-temp").first().evaluate((x) => x.scrollIntoView());
await m.waitForTimeout(200);
await m.screenshot({ path: `${out}/d16-handy-temperatur.png` });
const breiteOk = await el(m).locator(".haupt").evaluate((x) => x.scrollWidth <= x.clientWidth + 1);
pruefe(breiteOk, "Handy: nichts ragt seitlich heraus");
await el(m).locator('[data-aktion="dr-luefter"][data-k="l_kopf"]').click();
await m.waitForTimeout(300);
await m.screenshot({ path: `${out}/d17-handy-luefter.png` });
await el(m).locator('.dialog [data-aktion="dialog-zu"]').click();
await el(m).locator('.nav-unten [data-id="filament"]').click();
await m.waitForTimeout(500);
await m.screenshot({ path: `${out}/d18-handy-kacheln.png` });

console.log("Fehler:", fehler.length ? fehler : "keine");
await b.close();
process.exit(fehler.length ? 1 : 0);
