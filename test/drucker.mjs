// Drucker-Ansicht im nachgebauten Home Assistant: druckt, aus, Verlauf mit Kommentar.
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe, szenario, extra = {}) {
  const ctx = await b.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, timezoneId: "Europe/Berlin", ...extra });
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
pruefe(await el(p).locator("#dr-titelbild-gross").evaluate((i) => i.complete && i.naturalWidth > 0), "Titelbild groß geladen (statt Kamera)");
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

// =====================================================================================
// v0.12: Zeitleiste, Steuerung, Titelbild, Raumklima, Druckwarnung, Stromdiagramme, Ausschalten
// =====================================================================================
const schuss = process.env.SCHUSS_PFAD || out;
const setzeZustand = (s, id, state, attr) => s.evaluate(([id, state, attr]) => {
  const alt = window.hass.states[id] || { entity_id: id, attributes: {} };
  window.hass = { ...window.hass, states: { ...window.hass.states, [id]: { ...alt, state: String(state), attributes: { ...alt.attributes, ...(attr || {}) } } } };
  window.el.hass = window.hass;
}, [id, state, attr]);
const neuZeichnen = (s) => s.evaluate(() => window.el._zeichnen());
const S = "sensor.p1s_01p00c572701906_";

const v = await seite(1400, 900, "druckt");
await el(v).locator('.nav-oben [data-id="drucker"]').click();
await v.waitForTimeout(900);
// Zeitleiste
const zl = await el(v).locator(".dr-zeitleiste").textContent();
const endeErwartet = await v.evaluate(() => new Date(window.hass.states["sensor.p1s_01p00c572701906_endzeit"].state).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
pruefe(zl.includes("Schicht 87 von 140") && zl.includes("noch 43 min") && zl.includes(`fertig um ${endeErwartet}`), "Zeitleiste: Schicht x von y, Restzeit, fertig um HH:MM");
pruefe((await el(v).locator('.dr-zl-balken i').getAttribute("style")).includes("width:62%"), "Zeitleiste: Fortschrittsbalken 62 %");
pruefe((await el(v).locator(".dr-status img").count()) === 0, "Kein doppeltes kleines Titelbild mehr in der Statuskarte");
pruefe((await el(v).locator(".dr-bild-karte").textContent()).includes("Aktueller Druck") && (await el(v).locator(".dr-bild-karte").textContent()).includes("Kabelhalter"), "Titelbild-Karte: aktueller Druck mit Namen");
pruefe(await v.evaluate(() => !window.wsLog.some((x) => x.includes("camera")) && typeof window.el._drKameraPruefen === "undefined"), "Kamera-Abfrage ist entfernt");
// Druckwarnung: Druck 23,4 g, Rolle hat nur 15 g
pruefe((await el(v).locator(".dr-druck-warnung").count()) === 0 && (await v.evaluate(() => window.el._druckWarnung())) === null, "Ohne geladene Rolle keine Druckwarnung");
await v.evaluate(() => { window.el._daten.geladen = "deeplee-pla-plus-braun"; window.el._zeichnen(); });
await v.waitForTimeout(300);
const dw = await v.evaluate(() => window.el._druckWarnung());
pruefe(dw && dw.rolleId === "deeplee-pla-plus-braun" && dw.text.includes("23,4 g") && dw.text.includes("15 g"), "_druckWarnung(): Druck braucht mehr als die Rolle hat");
pruefe((await el(v).locator(".dr-druck-warnung").textContent()).includes("nur noch 15 g"), "Rotes Banner in der Drucker-Ansicht");
await v.screenshot({ path: `${schuss}/01-zeitleiste-steuerung-warnung.png` });
await v.evaluate(() => { window.el._daten.geladen = "bambu-pla-matte-rot"; window.el._zeichnen(); });   // 519 g: reicht
await v.waitForTimeout(200);
pruefe((await el(v).locator(".dr-druck-warnung").count()) === 0, "Rolle mit genug Rest: keine Warnung");

// Steuerung: Pause mit Nachfrage
await v.evaluate(() => { window.dienstDaten.length = 0; });
pruefe((await el(v).locator('[data-aktion="dr-steuer"][data-art="fortsetzen"]').count()) === 0, "Beim Drucken kein Fortsetzen-Knopf");
await el(v).locator('[data-aktion="dr-steuer"][data-art="pause"]').click();
await v.waitForTimeout(300);
pruefe((await el(v).locator(".dialog").textContent()).includes("Druck pausieren?"), "Pause fragt nach");
await v.screenshot({ path: `${schuss}/02-pause-frage.png` });
await el(v).locator('[data-aktion="dr-steuer-ok"]').click();
await v.waitForTimeout(1800);
let sd = await v.evaluate(() => window.dienstDaten);
pruefe(sd.length === 1 && sd[0].domain === "button" && sd[0].dienst === "press" && sd[0].entity_id === "button.p1s_01p00c572701906_druck_pausieren", "Pause → button.press");
pruefe((await el(v).locator(".dr-status .pille").textContent()) === "Pausiert" && (await el(v).locator('[data-aktion="dr-steuer"][data-art="fortsetzen"]').count()) === 1
  && (await el(v).locator('[data-aktion="dr-steuer"][data-art="pause"]').count()) === 0, "Pausiert: Fortsetzen statt Pause");
pruefe((await el(v).locator(".dr-zeitleiste").textContent()).includes("pausiert"), "Zeitleiste zeigt „pausiert“");
await v.screenshot({ path: `${schuss}/03-pausiert.png` });
await el(v).locator('[data-aktion="dr-steuer"][data-art="fortsetzen"]').click();
await v.waitForTimeout(1800);
sd = await v.evaluate(() => window.dienstDaten);
pruefe((await el(v).locator(".dialog").count()) === 0 && sd[1] && sd[1].entity_id === "button.p1s_01p00c572701906_druck_fortsetzen", "Fortsetzen ohne Nachfrage → button.press");
// Stopp: Nachfrage, Abbrechen sendet nichts
await el(v).locator('[data-aktion="dr-steuer"][data-art="stopp"]').click();
await v.waitForTimeout(300);
const stoppText = await el(v).locator(".dialog").textContent();
pruefe(stoppText.includes("Druck abbrechen?") && stoppText.includes("Kabelhalter"), "Stopp fragt nach");
await v.screenshot({ path: `${schuss}/04-stopp-frage.png` });
await el(v).locator('.dialog [data-aktion="dialog-zu"]').click();
await v.waitForTimeout(200);
pruefe((await v.evaluate(() => window.dienstDaten.length)) === 2, "Stopp abgebrochen: nichts gesendet");
// Licht
await el(v).locator('[data-aktion="dr-licht"]').click();
await v.waitForTimeout(1500);
sd = await v.evaluate(() => window.dienstDaten);
pruefe(sd[2] && sd[2].domain === "light" && sd[2].dienst === "turn_off" && (await el(v).locator('[data-aktion="dr-licht"]').textContent()).includes("Licht aus"), "Licht aus → light.turn_off, Knopf zeigt „Licht aus“");
// Geschwindigkeit
await el(v).locator('[data-aktion="dr-tempo"][data-wert="sport"]').click();
await v.waitForTimeout(1500);
sd = await v.evaluate(() => window.dienstDaten);
pruefe(sd[3] && sd[3].domain === "select" && sd[3].dienst === "select_option" && sd[3].option === "sport" && sd[3].entity_id === "select.p1s_01p00c572701906_druckgeschwindigkeit", "Sport → select.select_option");
pruefe((await el(v).locator('.dr-tempo .chip.an').textContent()).includes("Sport") && (await el(v).locator(".dr-werte").first().textContent()).includes("Sport"), "Chip und Tempo-Anzeige auf Sport");

// Stromdiagramme
await v.evaluate(() => { window.wsLog.length = 0; });
await el(v).locator('[data-aktion="dr-strom"]').click();
await v.waitForTimeout(900);
let ws = await v.evaluate(() => window.wsLog);
pruefe(ws.includes("history/history_during_period:watt") && ws.includes("recorder/statistics_during_period:hour"), "Strom 24 h: Verlauf der Leistung und Stunden-Statistik geladen");
pruefe((await el(v).locator(".dr-strom-sheet .dr-diagramm svg").count()) === 2 && (await el(v).locator(".dr-strom-sheet .dr-dg-saeule").count()) >= 2, "Zwei Diagramme, Säulen vorhanden");
pruefe((await el(v).locator(".dr-strom-sheet .dr-dg-linie").getAttribute("d")).length > 50, "Leistungskurve gezeichnet");
const summen = await el(v).locator(".dr-strom-summen").textContent();
pruefe(summen.includes("kWh") && summen.includes("€") && summen.includes("315 W"), "Summen: Verbrauch, Kosten, Spitze 315 W");
pruefe((await el(v).locator(".dr-strom-fuss").textContent()).includes("0,35 €/kWh"), "Preis 0,35 €/kWh aus den Einstellungen");
// Wert unter dem Finger/Mauszeiger
const box = await el(v).locator('.dr-diagramm[data-art="watt"] svg').boundingBox();
await v.mouse.move(box.x + box.width * 0.97, box.y + box.height * 0.45);
await v.waitForTimeout(200);
pruefe(/\d W/.test(await el(v).locator('.dr-diagramm[data-art="watt"] .dr-dg-info').textContent()) && (await el(v).locator(".dr-dg-zeiger").first().evaluate((z) => z.style.display !== "none")), "Darüberfahren zeigt Leistung an der Stelle");
await v.screenshot({ path: `${schuss}/05-strom-24h.png` });
const sbox = await el(v).locator('.dr-diagramm[data-art="kwh"] svg').boundingBox();
await v.mouse.click(sbox.x + sbox.width * 0.75, sbox.y + sbox.height * 0.6);
await v.waitForTimeout(200);
pruefe(/kWh/.test(await el(v).locator('.dr-diagramm[data-art="kwh"] .dr-dg-info').textContent()) && (await el(v).locator(".dr-dg-saeule.an").count()) <= 1, "Antippen einer Säule zeigt kWh und €");
// 7 Tage mit Shop-Strompreis
await v.evaluate(() => { window.el._daten.shop = { einstellungen: { kwh_preis: 0.5 } }; });
await el(v).locator('[data-aktion="dr-strom-bereich"][data-b="7d"]').click();
await v.waitForTimeout(900);
ws = await v.evaluate(() => window.wsLog);
pruefe(ws.includes("recorder/statistics_during_period:day") && (await el(v).locator(".dr-strom-sheet .chip.an").textContent()) === "7 Tage", "7 Tage: Tages-Statistik");
const saeulen7 = await el(v).locator(".dr-dg-saeule").count();
pruefe(saeulen7 >= 4 && saeulen7 <= 7 && (await el(v).locator(".dr-dg-wert").first().textContent()).includes("€"), "7 Tage: Tagessäulen mit Kosten pro Tag");
pruefe((await el(v).locator(".dr-strom-fuss").textContent()).includes("0,50 €/kWh") && (await el(v).locator(".dr-strom-fuss").textContent()).includes("Shop"), "kWh-Preis aus den Shop-Einstellungen");
await v.screenshot({ path: `${schuss}/06-strom-7-tage.png` });
await el(v).locator('[data-aktion="dr-strom-bereich"][data-b="30d"]').click();
await v.waitForTimeout(900);
const saeulen30 = await el(v).locator(".dr-dg-saeule").count();
pruefe(saeulen30 >= 15 && saeulen30 <= 30, "30 Tage: bis zu 30 Tagessäulen");
await v.screenshot({ path: `${schuss}/07-strom-30-tage.png` });
await el(v).locator('.dr-strom-sheet [data-aktion="dialog-zu"]').click();
await v.waitForTimeout(300);
pruefe((await el(v).locator(".dr-strom-sheet").count()) === 0, "Sheet schließt sich");

// Raumklima
pruefe((await el(v).locator(".dr-raum-karte").textContent()).includes("21,4 °C") && (await el(v).locator(".dr-raum-karte").textContent()).includes("48 %")
  && (await el(v).locator(".dr-raum-karte").textContent()).includes("Passt zum Drucken"), "Raumklima-Karte mit Temperatur und Feuchte");
await v.evaluate(() => {
  const r = window.el._daten.rollen;
  r.push({ ...r[0], id: "test-abs", name: "ABS Schwarz", material: "ABS", art: "Basic", hex: "#1f1f1f", rest_g: 800 });
  r.push({ ...r[0], id: "test-petg", name: "PETG Test", material: "PETG", art: "Basic", hex: "#2e7dd1", rest_g: 800 });
  window.el._daten.geladen = "test-abs";
});
await setzeZustand(v, "sensor.luft_sensor_arbeitszimmer_temperatur", "16.2");
await v.waitForTimeout(1400);
let rk = await v.evaluate(() => window.el._raumklima());
pruefe(rk.temp === 16.2 && rk.warnungen.some((w) => w.text.includes("Warping")), "ABS + 16,2 °C: Warping-Warnung");
pruefe((await el(v).locator(".dr-raum-karte").textContent()).includes("Warping"), "Warnung steht in der Raumklima-Karte (live)");
await setzeZustand(v, "sensor.luft_sensor_arbeitszimmer_temperatur", "21");
await setzeZustand(v, S + "druckstatus", "finish");
await setzeZustand(v, S + "endzeit", new Date(Date.now() - 20 * 60000).toISOString());
rk = await v.evaluate(() => window.el._raumklima());
pruefe(rk.warnungen.length === 1 && rk.warnungen[0].text.includes("lüften") && rk.warnungen[0].text.includes("ABS"), "ABS-Druck vor 20 min fertig: Lüften");
await setzeZustand(v, S + "endzeit", new Date(Date.now() - 90 * 60000).toISOString());
rk = await v.evaluate(() => window.el._raumklima());
pruefe(rk.warnungen.length === 0, "Nach über einer Stunde keine Lüften-Erinnerung mehr");
await setzeZustand(v, "sensor.luft_sensor_arbeitszimmer_luftfeuchtigkeit", "68");
rk = await v.evaluate(() => window.el._raumklima());
pruefe(rk.feuchte === 68 && rk.warnungen.length === 1 && rk.warnungen[0].stufe === "amber" && rk.warnungen[0].text.includes("trocken lagern"), "68 % mit ABS: Hinweis trocken lagern");
await v.evaluate(() => { window.el._daten.geladen = "test-petg"; });
rk = await v.evaluate(() => window.el._raumklima());
pruefe(rk.warnungen.length === 1 && rk.warnungen[0].stufe === "rot" && rk.warnungen[0].text.includes("PETG"), "68 % mit PETG: stärkere Warnung");
await v.evaluate(() => { window.el._konfig = { ...(window.el._konfig || {}), raum_temp: "sensor.anderer_raum" }; });
await setzeZustand(v, "sensor.anderer_raum", "12.5");
rk = await v.evaluate(() => window.el._raumklima());
pruefe(rk.temp === 12.5, "Raumsensor aus den Einstellungen hat Vorrang");
await v.evaluate(() => { window.el._daten.geladen = "test-abs"; });
await neuZeichnen(v);
await v.waitForTimeout(300);
await el(v).locator(".dr-raum-karte").scrollIntoViewIfNeeded();
await v.screenshot({ path: `${schuss}/08-raumklima-warnungen.png` });

// Ausschalten: im Ruhezustand direkt, sonst mit Nachfrage
const ruhe = await seite(1400, 900, "bereit");
await el(ruhe).locator('.nav-oben [data-id="drucker"]').click();
await ruhe.waitForTimeout(800);
pruefe((await el(ruhe).locator('[data-aktion="dr-steuer"]').count()) === 0 && (await el(ruhe).locator(".dr-tempo").count()) === 0 && (await el(ruhe).locator('[data-aktion="dr-licht"]').count()) === 1, "Bereit: nur Licht, keine Druck-Knöpfe und kein Tempo");
pruefe((await el(ruhe).locator(".dr-bild-karte").textContent()).includes("Letzter Druck") && (await el(ruhe).locator("#dr-titelbild-gross").count()) === 1, "Ohne Druck: letztes Titelbild");
await ruhe.screenshot({ path: `${schuss}/09-bereit-letzter-druck.png` });
await el(ruhe).locator('[data-aktion="dr-schalten"][data-ziel="aus"]').click();
await ruhe.waitForTimeout(1600);
pruefe((await el(ruhe).locator(".dialog").count()) === 0 && (await ruhe.evaluate(() => window.dienste)).join() === "switch.turn_off:switch.3d_drucker", "Ruhezustand und kalt: direkt ausgeschaltet");
const heiss = await seite(1400, 900, "bereit");
await setzeZustand(heiss, S + "temperatur_der_duse", "85");
await setzeZustand(heiss, S + "druckbetttemperatur", "52");
await el(heiss).locator('.nav-oben [data-id="drucker"]').click();
await heiss.waitForTimeout(800);
await el(heiss).locator('[data-aktion="dr-schalten"][data-ziel="aus"]').click();
await heiss.waitForTimeout(300);
const hText = await el(heiss).locator(".dialog").textContent();
pruefe(hText.includes("ist noch heiß. Wirklich ausschalten?") && hText.includes("85 °C heiß") && hText.includes("52 °C warm"), "Heiß: Nachfrage mit Grund (Düse und Bett)");
await heiss.screenshot({ path: `${schuss}/10-ausschalten-heiss.png` });
pruefe((await heiss.evaluate(() => window.dienste)).length === 0, "Heiß: nichts geschaltet ohne Bestätigung");
// Kein Titelbild vorhanden
const leer = await seite(1400, 900, "aus");
await setzeZustand(leer, "image.p1s_01p00c572701906_titelbild", "unavailable");
await el(leer).locator('.nav-oben [data-id="drucker"]').click();
await leer.waitForTimeout(800);
pruefe((await el(leer).locator(".dr-bild-karte").textContent()).includes("Kein Druck"), "Ohne Titelbild: „Kein Druck“");
pruefe((await el(leer).locator(".dr-steuer").count()) === 0, "Drucker aus: keine Steuerung");

// Handy
const hm = await seite(390, 844, "druckt", { isMobile: true, hasTouch: true });
await el(hm).locator('.nav-unten [data-id="drucker"]').click();
await hm.waitForTimeout(900);
await hm.evaluate(() => { window.el._daten.geladen = "deeplee-pla-plus-braun"; window.el._zeichnen(); });
await hm.waitForTimeout(300);
await hm.screenshot({ path: `${schuss}/11-handy-status.png` });
await el(hm).locator(".dr-steuer").scrollIntoViewIfNeeded();
await hm.screenshot({ path: `${schuss}/12-handy-steuerung.png` });
await el(hm).locator(".dr-bild-karte").scrollIntoViewIfNeeded();
await hm.screenshot({ path: `${schuss}/13-handy-titelbild.png` });
await el(hm).locator(".dr-raum-karte").scrollIntoViewIfNeeded();
await hm.screenshot({ path: `${schuss}/14-handy-raumklima.png` });
pruefe(await el(hm).locator(".haupt").evaluate((x) => x.scrollWidth <= x.clientWidth + 1), "Handy: Drucker-Ansicht ragt nicht heraus");
await el(hm).locator('[data-aktion="dr-strom"]').scrollIntoViewIfNeeded();
await el(hm).locator('[data-aktion="dr-strom"]').tap();
await hm.waitForTimeout(1000);
pruefe(await el(hm).locator(".dr-strom-sheet .sheet-inhalt").evaluate((x) => x.scrollWidth <= x.clientWidth + 1), "Handy: Strom-Sheet ragt nicht heraus");
const hbox = await el(hm).locator('.dr-diagramm[data-art="watt"] svg').boundingBox();
await hm.touchscreen.tap(hbox.x + hbox.width * 0.9, hbox.y + hbox.height * 0.4);
await hm.waitForTimeout(200);
pruefe(/\d W/.test(await el(hm).locator('.dr-diagramm[data-art="watt"] .dr-dg-info').textContent()), "Handy: Antippen zeigt den Wert");
await hm.screenshot({ path: `${schuss}/15-handy-strom-24h.png` });
await el(hm).locator('[data-aktion="dr-strom-bereich"][data-b="7d"]').tap();
await hm.waitForTimeout(900);
await el(hm).locator('.dr-diagramm[data-art="kwh"]').scrollIntoViewIfNeeded();
await hm.screenshot({ path: `${schuss}/16-handy-strom-7-tage.png` });

console.log("Fehler:", fehler.length ? fehler : "keine");
await b.close();
process.exit(fehler.length ? 1 : 0);
