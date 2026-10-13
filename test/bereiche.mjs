// Hilfe, Werkstatt, Nerd-Menü, Suche, Sicherung, Profil-Export, Handy-Menü und Schutzmaßnahmen.
import { createRequire } from "module";
import { writeFileSync, readFileSync } from "fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe, mobil = false, erwarteteFehler = false) {
  const ctx = await b.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, hasTouch: mobil, isMobile: mobil, timezoneId: "Europe/Berlin", acceptDownloads: true });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("404") && !(erwarteteFehler && m.text().includes("Filament-Werkstatt")) && fehler.push(m.text()));
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html?drucker=bereit`);
  await p.waitForTimeout(800);
  // Fertige Testdrucke als verbucht markieren, damit kein Pop-up stört
  await p.evaluate(() => { const x = window.el; x._dialog = null; x._bu = null; x._daten.buchen_ab = "2099-01-01"; x._zeichnen(); });
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const FEHLER_ANZAHL = 14;
const nav = async (p, id) => { await el(p).locator(`.nav-oben [data-id="${id}"]`).click(); await p.waitForTimeout(350); };

// ---------------- Desktop ----------------
let p = await seite(1400, 900);
pruefe((await el(p).locator(".nav-oben .nav-punkt").count()) === 8, "8 Bereiche oben in der Navigation");
{
  const lage = await p.evaluate(() => { const r = window.el.shadowRoot, s = r.querySelector(".kopf .kopf-suche"), f = r.querySelector('.nav-oben [data-id="filament"]'); return s && f ? [s.getBoundingClientRect().right, f.getBoundingClientRect().left, r.querySelector(".nav-oben").scrollWidth - r.querySelector(".nav-oben").clientWidth] : null; });
  pruefe(lage && lage[0] <= lage[1] && lage[2] <= 1, "Kopfzeile: Suche links neben „Filament“, Navigation passt ohne Scrollen");
  await p.screenshot({ path: `${out}/k0-kopf.png`, clip: { x: 0, y: 0, width: 1400, height: 72 } });
  await el(p).locator(".kopf .kopf-suche").click();
  await p.waitForTimeout(250);
  pruefe((await el(p).locator(".such-box").count()) === 1, "Such-Feld in der Kopfzeile öffnet die Suche");
  await p.screenshot({ path: `${out}/k1-kopf-suche.png` });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(200);
}

// Hilfe
// Geladene Rolle (vom Drucker-Bereich gesetzt) ist die Standard-Beispielrolle
const geladen = await p.evaluate(() => { const x = window.el, r = x._daten.rollen.find((y) => y.material === "PETG") || x._daten.rollen[1]; x._daten.geladen = r.id; return { id: r.id, name: r.name }; });
await nav(p, "hilfe");
pruefe((await el(p).locator(".p1s-punkt").count()) === 12, "P1S-Zeichnung mit 12 Bereichen");
await el(p).locator('.p1s-punkt[data-id="bett"]').hover();
await p.waitForTimeout(250);
let t = await el(p).locator("#hi-info").textContent();
pruefe(t.includes("Druckbett") && t.includes("Druckplatte"), "Maus über dem Bett zeigt Bett-Einstellungen mit Rollenwerten");
await p.screenshot({ path: `${out}/h1-p1s.png` });
// Display (11) oben am Drucker, gleiche x-Position wie vorher
const disp = await el(p).locator('.p1s-punkt[data-id="display"] .p1s-ring').evaluate((c) => ({ x: +c.getAttribute("cx"), y: +c.getAttribute("cy") }));
pruefe(disp.x === 110 && disp.y < 60, `P1S: Display (11) oben am Gehäuse (y ${disp.y})`);
// Extruder: Auswahl der Beispielrolle, Standard = geladene Rolle
await el(p).locator('.p1s-punkt[data-id="extruder"]').hover();
await p.waitForTimeout(250);
const wahlWert = () => el(p).locator('select[data-hi="rolle"]').first().evaluate((s) => s.value);
pruefe((await el(p).locator('#hi-info select[data-hi="rolle"]').count()) === 1, "Extruder: Rollenauswahl für die Beispielwerte");
pruefe((await wahlWert()) === geladen.id, `Standard ist die geladene Rolle (${geladen.name})`);
const andere = await p.evaluate((g) => { const r = window.el._daten.rollen.find((y) => y.id !== g && y.material !== "PETG" && y.vorschlag && y.vorschlag.tr_temp && y.vorschlag.k); return { id: r.id, name: r.name, material: r.material, tr: (r.eigen && r.eigen.tr_temp) ?? r.vorschlag.tr_temp, k: (r.eigen && r.eigen.k) ?? r.vorschlag.k }; }, geladen.id);
await el(p).locator("#hi-info .hi-rollenwahl .dd-knopf").click();
await p.waitForTimeout(150);
await el(p).locator(`.dd-option[data-wert="${andere.id}"]`).click();
await p.waitForTimeout(300);
t = await el(p).locator("#hi-info").textContent();
pruefe((await wahlWert()) === andere.id && t.includes(String(andere.k).replace(".", ",")), `Extruder zeigt Werte von ${andere.name} (K ${andere.k})`);
await p.screenshot({ path: `${out}/h1b-extruder-rolle.png` });
// Trockner übernimmt dieselbe Auswahl
await el(p).locator('[data-aktion="hi-tab"][data-id="trockner"]').click();
await p.waitForTimeout(300);
await el(p).locator('.p1s-punkt[data-id="feuchte"]').hover();
await p.waitForTimeout(200);
pruefe((await el(p).locator("#hi-tr-info").textContent()).includes("Luftfeuchte"), "Trockner: Feld Luftfeuchte erklärt");
pruefe((await el(p).locator(".tr-rolle").count()) > 10, "Trockner: eigene Rollen mit Trocknungswerten");
const anzeige = await el(p).locator(".tr-wert").evaluateAll((l) => Object.fromEntries(l.map((x) => [x.dataset.wert, x.textContent])));
pruefe(anzeige.material === andere.material.slice(0, 6) && anzeige.soll === `${andere.tr}°` && (await wahlWert()) === andere.id, `Trockner-Display zeigt ${anzeige.material} ${anzeige.soll} (gleiche Rolle wie beim Extruder)`);
// Geometrie: Hover-Felder mittig hinter den Werten, Nummer darunter ohne Überlappung
const geo = await el(p).locator(".trockner-bild").evaluate((svg) => {
  const g = (id) => svg.querySelector(`.p1s-punkt[data-id="${id}"]`);
  const box = (id) => { const r = g(id).querySelector(".p1s-flaeche"); return { x: +r.getAttribute("x"), y: +r.getAttribute("y"), w: +r.getAttribute("width"), h: +r.getAttribute("height") }; };
  const ring = (id) => { const c = g(id).querySelector(".p1s-ring"); return { x: +c.getAttribute("cx"), y: +c.getAttribute("cy"), r: +c.getAttribute("r") }; };
  const chips = [...svg.querySelectorAll(".tr-wert")].map((t) => { const b = box(t.dataset.wert), c = ring(t.dataset.wert), tb = t.getBBox();
    return { mx: Math.abs(b.x + b.w / 2 - (tb.x + tb.width / 2)), my: Math.abs(b.y + b.h / 2 - (tb.y + tb.height / 2)), luecke: c.y - c.r - (b.y + b.h), drin: tb.x >= b.x && tb.x + tb.width <= b.x + b.w }; });
  return { chips, spulen: box("spulen"), auslass: ring("auslass") };
});
pruefe(geo.chips.length === 5 && geo.chips.every((c) => c.mx < 1.5 && c.my < 3 && c.drin), "Trockner: grüne Felder mittig hinter den Werten");
pruefe(geo.chips.every((c) => c.luecke >= 2), "Trockner: Nummern liegen unter den Feldern, ohne Überlappung");
pruefe(geo.spulen.x === 34 && geo.spulen.y === 32 && geo.spulen.w === 372 && geo.spulen.h === 160, "Trockner: Feld 6 füllt den ganzen Innenraum");
pruefe(geo.auslass.x === 220 && geo.auslass.y < 60, "Trockner: Auslass 7 oben in der Mitte");
await p.screenshot({ path: `${out}/h2-trockner.png` });
await el(p).locator('.p1s-punkt[data-id="spulen"] .p1s-ring').hover();
await p.waitForTimeout(250);
pruefe((await el(p).locator("#hi-tr-info").textContent()).includes("Spulenplätze"), "Trockner: Hover über Feld 6");
await el(p).locator(".trockner-bild").screenshot({ path: `${out}/h2b-trockner-innenraum.png` });
await el(p).locator('.p1s-punkt[data-id="material"] .p1s-ring').hover();
await p.waitForTimeout(250);
await el(p).locator(".trockner-bild").screenshot({ path: `${out}/h2c-trockner-material.png` });
// Fehlerbilder: großes Fenster mittig, schließen per X, Klick daneben und Escape
await el(p).locator('[data-aktion="hi-tab"][data-id="fehler"]').click();
await p.waitForTimeout(300);
pruefe((await wahlWert()) === andere.id, "Fehlerbilder: gleiche Beispielrolle");
await el(p).locator('[data-aktion="hi-fehler"][data-id="haftung"]').click();
await p.waitForTimeout(350);
const popup = el(p).locator(".hi-fb-popup");
pruefe((await popup.count()) === 1 && (await popup.textContent()).includes("Betttemperatur"), "Fehlerbild öffnet Fenster mit Lösungen");
const pb = await popup.boundingBox();
pruefe(Math.abs(pb.x + pb.width / 2 - 700) < 4 && Math.abs(pb.y + pb.height / 2 - 450) < 40 && pb.width > 500, `Fenster groß und mittig (${Math.round(pb.width)} px breit)`);
pruefe(await el(p).locator(".hi-fb-ebene").evaluate((e) => e.parentElement.classList.contains("app")), "Fenster liegt über der ganzen Seite");
await p.screenshot({ path: `${out}/h3-fehlerbilder.png` });
await el(p).locator(".hi-fb-x").click();
await p.waitForTimeout(60);
pruefe((await el(p).locator(".fb-karte").count()) === FEHLER_ANZAHL && (await el(p).locator(".hi-fb-ebene.zu").count()) === 1, "Schließen: Karten bleiben stehen, Fenster blendet aus");
await p.waitForTimeout(300);
pruefe((await el(p).locator(".hi-fb-ebene").count()) === 0 && (await el(p).locator(".fb-karte").count()) === FEHLER_ANZAHL, "X schließt das Fenster ohne Flackern");
await el(p).locator('[data-aktion="hi-fehler"][data-id="naht"]').click();
await p.waitForTimeout(350);
t = await popup.textContent();
pruefe(t.includes("Druckaufbau in der Düse") && !t.includes("Druckdruck"), "Sichtbare Naht: Ursache verständlich formuliert");
await p.mouse.click(30, 450);
await p.waitForTimeout(350);
pruefe((await el(p).locator(".hi-fb-ebene").count()) === 0, "Klick neben das Fenster schließt");
await el(p).locator('[data-aktion="hi-fehler"][data-id="warping"]').click();
await p.waitForTimeout(350);
await p.keyboard.press("Escape");
await p.waitForTimeout(350);
pruefe((await el(p).locator(".hi-fb-ebene").count()) === 0, "Escape schließt");
await el(p).locator('[data-aktion="hi-tab"][data-id="kalibrierung"]').click();
await p.waitForTimeout(300);
pruefe((await wahlWert()) === andere.id, "Kalibrierung: gleiche Beispielrolle");
pruefe((await el(p).locator(".kal-liste").first().textContent()).includes(`bei ${andere.material}`), "Temperaturturm: Beispiel passend zum Material");
await el(p).locator('[data-aktion="hi-kal"][data-id="flow"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="hi-kal-schritt"][data-d="1"]').click();
await el(p).locator('[data-aktion="hi-kal-speichern"]').click();
await p.waitForTimeout(300);
pruefe(await p.evaluate((id) => { const r = window.el._daten.rollen.find((x) => x.id === id); return !!(r.kalibriert && r.kalibriert.flow); }, andere.id), "Kalibrierergebnis Flow in der gewählten Rolle gespeichert");
await p.screenshot({ path: `${out}/h4-kalibrierung.png` });

// Werkstatt: Warteschlange
await nav(p, "werkstatt");
await el(p).locator('[data-aktion="ws-neu"]').click();
await p.waitForTimeout(250);
await el(p).locator("#ws-name").fill("Kabelhalter");
await el(p).locator('[data-aktion="ws-g"][data-d="5"]').click();
await el(p).locator('[data-aktion="ws-speichern"]').click();
await el(p).locator('[data-aktion="ws-neu"]').click();
await p.waitForTimeout(200);
await el(p).locator("#ws-name").fill("Großes Gehäuse");
await el(p).locator('[data-ws="gewicht"]').fill("900");
await p.evaluate(() => { window.el._ws.neu.rolleId = window.el._daten.rollen.find((r) => r.rest_g != null && r.rest_g < 800).id; });
await el(p).locator('[data-aktion="ws-speichern"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".ws-auftrag").count()) === 2, "Zwei Aufträge in der Warteschlange");
pruefe((await el(p).locator(".ws-auftrag").nth(1).textContent()).includes("reicht nicht"), "Bestandsprüfung: 900 g reicht nicht");
await p.screenshot({ path: `${out}/w1-warteschlange.png` });
await el(p).locator('[data-aktion="ws-hoch"]').nth(1).click();
await p.waitForTimeout(200);
pruefe((await el(p).locator(".ws-auftrag").first().textContent()).includes("Großes Gehäuse"), "Reihenfolge per Pfeil geändert");
await el(p).locator('[data-aktion="ws-weg"]').first().click();
await p.waitForTimeout(200);
pruefe((await el(p).locator(".ws-auftrag").count()) === 1, "Auftrag entfernt");
await el(p).locator('.toast [data-aktion="toast-knopf"]').click();
await p.waitForTimeout(200);
pruefe((await el(p).locator(".ws-auftrag").count()) === 2, "Rückgängig holt den Auftrag zurück");
// Einkauf
await el(p).locator('[data-aktion="ws-tab"][data-id="einkauf"]').click();
await p.waitForTimeout(300);
t = await el(p).locator(".ws-inhalt").textContent();
pruefe(t.includes("PLA") && (await el(p).locator(".ws-einkauf").count()) > 0, "Einkaufsliste nach Farbe und Material");
await p.screenshot({ path: `${out}/w2-einkauf.png` });
// Bibliothek
await el(p).locator('[data-aktion="ws-tab"][data-id="bibliothek"]').click();
await p.waitForTimeout(400);
pruefe((await el(p).locator(".ws-modell").count()) === 3, "Bibliothek mit 3 Modellen");
await el(p).locator('[data-aktion="ws-nochmal"]').first().click();
await p.waitForTimeout(200);
pruefe(await p.evaluate(() => window.el._daten.warteschlange.length === 3), "Nochmal drucken landet in der Warteschlange");
await p.screenshot({ path: `${out}/w3-bibliothek.png` });
// Wartung
await el(p).locator('[data-aktion="ws-tab"][data-id="wartung"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="ws-erledigt"][data-id="platte"]').click();
await el(p).locator('[data-aktion="ws-getauscht"][data-id="platte"]').click();
await p.waitForTimeout(300);
pruefe(await p.evaluate(() => window.el._daten.wartung.aufgaben.platte.h === 472 && window.el._daten.wartung.teile.find((x) => x.id === "platte").eingebaut_h === 472), "Wartung erledigt und Plattenzähler zurückgesetzt bei 472 h");
await p.screenshot({ path: `${out}/w4-wartung.png` });
pruefe((await el(p).locator(".ws-wartung .ws-info-knopf").count()) === (await el(p).locator(".ws-wartung").count()), "Wartung: jede Aufgabe und jedes Verschleißteil hat einen Info-Knopf");
await el(p).locator('[data-aktion="ws-info"][data-id="a-stangen"]').click();
await p.waitForTimeout(300);
t = await el(p).locator(".ws-info").textContent();
pruefe(t.includes("Kohlefaser") && t.includes("Wofür?") && (await el(p).locator(".ws-info svg.ws-p1s .an").count()) > 0, "Wartung-Info Kohlestangen: Zeichnung mit hervorgehobenen Stangen und Erklärung");
await el(p).locator(".ws-info").scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/w4b-wartung-info.png` });
for (const id of ["a-platte", "a-duese", "a-luefter", "a-spindeln", "a-riemen", "a-ptfe", "a-filter", "a-kalibrieren", "t-duese04", "t-socke"]) {
  await el(p).locator(`[data-aktion="ws-info"][data-id="${id}"]`).click();
  await p.waitForTimeout(60);
  if ((await el(p).locator(`.ws-info[data-ws-info="${id}"] .an`).count()) < 1) pruefe(false, `Wartung-Info ${id} mit Zeichnung`);
}
await el(p).locator('[data-aktion="ws-info"][data-id="t-socke"]').click();
await p.waitForTimeout(150);
pruefe((await el(p).locator(".ws-info").count()) === 0, "Wartung-Info klappt wieder zu");
// Kosten
await el(p).locator('[data-aktion="ws-tab"][data-id="kosten"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-ws="e-strompreis"]').fill("0.42");
await el(p).locator('[data-ws="e-strompreis"]').dispatchEvent("change");
pruefe(await p.evaluate(() => window.el._daten.einstellungen.strompreis === 0.42), "Strompreis per Regler geändert");
await p.screenshot({ path: `${out}/w5-kosten.png` });
// Regler: gelbe Wertbox, antippen zum Eintippen
{
  const regler = el(p).locator('[data-ws="e-strompreis"]');
  const box = await regler.boundingBox();
  pruefe((await el(p).locator(".regler-wert").count()) === 0, "Regler-Wertbox erst bei Benutzung");
  await p.mouse.click(box.x + box.width * (0.42 - 0.1) / 0.7, box.y + box.height / 2);
  await p.waitForTimeout(200);
  pruefe((await el(p).locator(".regler-wert-knopf").count()) === 1 && /0,4\d/.test(await el(p).locator(".regler-wert-knopf").textContent()), "Regler aktiv: aktueller Wert in der gelben Box");
  const bw = await el(p).locator(".regler-wert").boundingBox();
  pruefe(bw.y + bw.height <= box.y + box.height / 2 + 2, "Wertbox sitzt über dem Regler");
  await p.screenshot({ path: `${out}/r1-regler-box.png` });
  await el(p).locator(".regler-wert-knopf").click();
  await p.waitForTimeout(150);
  await p.keyboard.press("Control+a");
  await p.keyboard.type("0,377");
  await p.screenshot({ path: `${out}/r2-regler-eintippen.png` });
  await p.keyboard.press("Enter");
  await p.waitForTimeout(200);
  pruefe(await p.evaluate(() => window.el._daten.einstellungen.strompreis === 0.38 && window.el.shadowRoot.querySelector('[data-ws="e-strompreis"]').value === "0.38"), "Eingetippt 0,377 → auf Schrittweite gerundet 0,38 übernommen");
  pruefe((await el(p).locator("#ws-e-strompreis").textContent()).includes("0,38"), "Abhängige Anzeige geht mit wie beim Ziehen");
  pruefe((await el(p).locator(".regler-wert").textContent()).includes("gerundet"), "Hinweis: gerundet");
  await el(p).locator(".regler-wert-knopf").click();
  await p.keyboard.press("Control+a");
  await p.keyboard.type("5");
  await p.keyboard.press("Enter");
  await p.waitForTimeout(200);
  pruefe(await p.evaluate(() => window.el._daten.einstellungen.strompreis === 0.8) && (await el(p).locator(".regler-wert").textContent()).includes("höchstens"), "Zu große Zahl auf Maximum begrenzt");
  await el(p).locator(".regler-wert-knopf").click();
  await p.keyboard.press("Control+a");
  await p.keyboard.type("0,2");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(150);
  pruefe(await p.evaluate(() => window.el._daten.einstellungen.strompreis === 0.8) && (await el(p).locator(".regler-wert-knopf").count()) === 1 && (await el(p).locator(".dialog, .such-box").count()) === 0, "Escape bricht das Eintippen ab, ohne sonst etwas zu schließen");
  await el(p).locator(".regler-wert-knopf").click();
  await p.keyboard.press("Control+a");
  await p.keyboard.type("abc");
  await p.keyboard.press("Enter");
  await p.waitForTimeout(150);
  pruefe((await el(p).locator(".regler-wert-feld.falsch").count()) === 1 && await p.evaluate(() => window.el._daten.einstellungen.strompreis === 0.8), "Keine Zahl: Feld rot, Wert bleibt");
  await p.keyboard.press("Control+a");
  await p.keyboard.type("0,25");
  await p.evaluate(() => window.el._zeichnen());
  await p.waitForTimeout(150);
  pruefe((await el(p).locator(".regler-wert-feld").inputValue()) === "0,25", "Neuzeichnen: Box und Eingabe bleiben erhalten");
  await el(p).locator(".ws-zwei h3, .ws-zwei .leise").first().click();
  await p.waitForTimeout(200);
  pruefe(await p.evaluate(() => window.el._daten.einstellungen.strompreis === 0.25) && (await el(p).locator(".regler-wert").count()) === 0, "Woanders hintippen übernimmt die Zahl und schließt die Box");
  await el(p).locator('[data-ws="e-mindest_g"]').click();
  await p.waitForTimeout(100);
  await p.evaluate(() => window.el._zeichnen());
  await p.waitForTimeout(100);
  await el(p).locator(".regler-wert-knopf").click();
  await p.keyboard.press("Control+a");
  await p.keyboard.type("333");
  await p.keyboard.press("Enter");
  await p.waitForTimeout(200);
  pruefe(await p.evaluate(() => window.el._daten.einstellungen.mindest_g === 350), "Nach Neuzeichnen: richtiger Regler wiedergefunden, 333 → 350 (Schritt 50)");
}

// Verbuchte Drucke für Statistik und Kosten
await p.evaluate(() => {
  const x = window.el, r = x._daten.rollen;
  const pla = r.find((y) => y.material === "PLA" && y.rest_g != null), petg = r.find((y) => y.material === "PETG" && y.rest_g != null);
  x._daten.drucke.a1 = { gebucht: { am: "2026-10-12T20:00:00Z", rolle: pla.id, g: 7.16, druck_g: 6.76, fix_g: 0.4, ergebnis: "ok", fortschritt: 100, kosten: { filament: 0.18, kwh: 0.21, strom: 0.07 } }, name: "Kalibrierwürfel", start: "2026-10-12T19:15:00+00:00" };
  x._daten.drucke.a2 = { gebucht: { am: "2026-10-11T20:00:00Z", rolle: petg.id, g: 16.8, druck_g: 16.4, fix_g: 0.4, ergebnis: "fehl", fortschritt: 34, kosten: { filament: 0.4, kwh: 0.4, strom: 0.14 } }, fehl: { wann: "frueh", ursachen: ["haftung"], geaendert: ["Druckbett"] }, name: "Halter", start: "2026-10-11T16:02:00+00:00" };
  pla.gewogen_am = "2026-10-01T00:00:00Z";
  x._zeichnen();
});
await el(p).locator('[data-aktion="ws-tab"][data-id="fehl"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".ws-modell.fehl").textContent()).includes("Löst sich"), "Fehldruck-Galerie zeigt Ursache");

// Nerd
await nav(p, "nerd");
t = await el(p).locator(".ne-seite").textContent();
pruefe(t.includes("50 %") && t.includes("Fehlerquote je Material"), "Statistik: 50 % geglückt, Quote je Material");
await p.screenshot({ path: `${out}/n1-statistik.png` });
await el(p).locator('[data-aktion="ne-tab"][data-id="abgleich"]').click();
await p.waitForTimeout(300);
const vor = await p.evaluate(() => { const x = window.el, r = x._daten.rollen.find((y) => y.id === x._daten.drucke.a1.gebucht.rolle); return { id: r.id, rest: r.rest_g, spule: x._neSpuleG(r), mat: r.material }; });
await p.evaluate((v) => { window.el._ne.abRolle = v.id; window.el._zeichnen(); }, vor);
await p.waitForTimeout(200);
// Waage: 1 g mehr verbraucht als gebucht → Faktor > 1
const brutto = Math.round(vor.rest + vor.spule - 1.34);
await el(p).locator('[data-ne="brutto"]').fill(String(brutto));
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/n2-abgleich.png` });
await el(p).locator('[data-aktion="ne-abgleich"]').click();
await p.waitForTimeout(300);
const korr = await p.evaluate((m) => window.el._daten.einstellungen.korrektur[m], vor.mat);
pruefe(korr > 1 && korr <= 1.3, `Korrekturfaktor gelernt (${korr && korr.toFixed(3)})`);
await el(p).locator('[data-aktion="ne-tab"][data-id="gesundheit"]').click();
await p.waitForTimeout(200);
await el(p).locator('[data-aktion="ne-heiz"]').click();
await p.waitForTimeout(800);
t = await el(p).locator(".ne-seite").textContent();
pruefe(t.includes("6 Vorgänge") && t.includes("wird langsamer"), "Aufheizzeiten aus dem Verlauf, Trend erkannt");
await p.screenshot({ path: `${out}/n3-gesundheit.png` });

// Suche
await p.keyboard.press("Control+k");
await p.waitForTimeout(300);
pruefe((await el(p).locator(".such-box").count()) === 1, "Strg+K öffnet die Suche");
await p.keyboard.type("einsatz m3");
await p.waitForTimeout(300);
t = await el(p).locator("#such-ergebnisse").textContent();
pruefe(t.includes("passt dazu") && /M3/.test(t), "Suche „einsatz m3“ mit passenden M3-Schrauben");
await p.screenshot({ path: `${out}/s1-suche.png` });
await el(p).locator("#global-suche").fill("schruabe");
await p.waitForTimeout(300);
pruefe((await el(p).locator(".such-treffer").count()) > 0, "Tippfehler „schruabe“ findet trotzdem");
await el(p).locator("#global-suche").fill("haftung");
await p.waitForTimeout(300);
await p.keyboard.press("Enter");
await p.waitForTimeout(400);
pruefe(await p.evaluate(() => window.el._ansicht === "hilfe"), "Enter öffnet den ersten Treffer (Hilfe)");
if (await el(p).locator(".hi-fb-ebene").count()) {
  pruefe((await el(p).locator(".hi-fb-popup").textContent()).includes("Löst sich"), "Treffer öffnet das Fehlerbild-Fenster");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(350);
}

// Profil-Export
await nav(p, "filament");
await el(p).locator(".kachel").first().click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="tab"][data-id="infos"]').click();
await p.waitForTimeout(200);
let [dl] = await Promise.all([p.waitForEvent("download"), el(p).locator('[data-aktion="profil-export"]').click()]);
const profil = JSON.parse(readFileSync(await dl.path(), "utf8"));
pruefe(profil.type === "filament" && profil.nozzle_temperature && profil.compatible_printers[0].includes("P1S"), "Bambu-Studio-Profil als JSON");
await el(p).locator('[data-aktion="schliessen"]').first().click();
await p.waitForTimeout(200);

// Sicherung: Erinnerung, Herunterladen, Einspielen
await p.evaluate(() => { const e = window.el._daten.einstellungen; e.sicherung_start = "2026-09-01T00:00:00Z"; e.sicherung_am = null; window.el._zeichnen(); });
pruefe((await el(p).locator(".bu-balken.blau").count()) === 1, "Wöchentliche Sicherungs-Erinnerung");
await p.screenshot({ path: `${out}/s2-sicherung.png` });
[dl] = await Promise.all([p.waitForEvent("download"), el(p).locator('.bu-balken [data-aktion="sich-laden"]').click()]);
const sicherung = readFileSync(await dl.path(), "utf8");
pruefe(JSON.parse(sicherung).rollen.length > 10, "Sicherung heruntergeladen");
await p.waitForTimeout(300);
pruefe((await el(p).locator(".bu-balken.blau").count()) === 0, "Erinnerung danach weg");
await nav(p, "system");
const kaputt = `${out}/kaputt.json`;
writeFileSync(kaputt, JSON.stringify({ rollen: [{ id: "x" }] }));
await el(p).locator('[data-sys="import"]').setInputFiles(kaputt);
await p.waitForTimeout(300);
pruefe((await el(p).locator(".toast").textContent()).includes("unvollständig"), "Kaputte Sicherung wird abgelehnt");
const gut = `${out}/gut.json`;
const d = JSON.parse(sicherung); d.rollen = d.rollen.slice(0, 5);
writeFileSync(gut, JSON.stringify(d));
await el(p).locator('[data-sys="import"]').setInputFiles(gut);
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/s3-import.png` });
await el(p).locator('[data-aktion="sich-import-ok"]').click();
await p.waitForTimeout(500);
pruefe(await p.evaluate(() => window.el._daten.rollen.length === 5), "Gültige Sicherung eingespielt");

// Speicher-Konflikt: anderes Gerät speichert dazwischen
await p.evaluate(() => { const v = JSON.parse(speicher.filament_werkstatt); v.geaendert = new Date(Date.now() + 60000).toISOString(); speicher.filament_werkstatt = JSON.stringify(v); window.el._daten.notiz_test = 1; window.el._speichern(); });
await p.waitForTimeout(900);
pruefe((await el(p).locator('[data-aktion="kon-laden"]').count()) === 1, "Konflikt mit anderem Gerät wird erkannt");
await el(p).locator('[data-aktion="kon-behalten"]').click();
await p.waitForTimeout(400);
pruefe(await p.evaluate(() => JSON.parse(speicher.filament_werkstatt).notiz_test === 1), "Eigener Stand nach Bestätigung gespeichert");

// Schutz: Fehler beim Aufbau einer Ansicht → Notansicht statt leerer Seite
await p.close();
p = await seite(1400, 900, false, true);
await p.evaluate(() => { window.el._wsHtml = () => { throw new Error("Testfehler"); }; });
await nav(p, "werkstatt");
pruefe((await el(p).locator(".fehlerkarte").textContent()).includes("Testfehler"), "Fehler in einer Ansicht zeigt Notkarte");
await el(p).locator('.fehlerkarte [data-aktion="ansicht"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".kachel").count()) > 10, "Zurück zur Filament-Übersicht klappt");
await p.close();

// ---------------- Handy ----------------
p = await seite(390, 844, true);
pruefe((await el(p).locator(".nav-unten .nav-punkt").count()) === 5, "Handy: 5 Punkte unten (4 + Mehr)");
await el(p).locator('.nav-unten [data-aktion="mehr"]').click();
await p.waitForTimeout(350);
pruefe((await el(p).locator(".mehr-punkt").count()) === 5, "Mehr-Menü mit Suche, Werkstatt, Hilfe, Nerd, System");
await p.screenshot({ path: `${out}/m1-mehr.png` });
await el(p).locator('.mehr-punkt[data-id="werkstatt"]').click();
await p.waitForTimeout(400);
pruefe(await p.evaluate(() => window.el._ansicht === "werkstatt"), "Handy: Werkstatt geöffnet");
await p.screenshot({ path: `${out}/m2-werkstatt.png` });
await el(p).locator('[data-aktion="ws-tab"][data-id="wartung"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="ws-info"][data-id="a-riemen"]').tap();
await p.waitForTimeout(300);
await el(p).locator(".ws-info").scrollIntoViewIfNeeded();
pruefe((await el(p).locator(".ws-info").textContent()).includes("Zahnriemen"), "Handy: Wartung-Info Riemen");
await p.screenshot({ path: `${out}/m2b-wartung-info.png` });
await el(p).locator('[data-aktion="ws-tab"][data-id="kosten"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-ws="e-mindest_material_g"]').tap();
await p.waitForTimeout(200);
pruefe((await el(p).locator(".regler-wert-knopf").count()) === 1, "Handy: Antippen des Reglers zeigt die gelbe Box");
await el(p).locator(".regler-wert-knopf").tap();
await p.waitForTimeout(200);
await el(p).locator(".regler-wert-feld").fill("1234");
await p.screenshot({ path: `${out}/m2c-regler-eintippen.png` });
await el(p).locator(".regler-wert-feld").press("Enter");
await p.waitForTimeout(200);
pruefe(await p.evaluate(() => window.el._daten.einstellungen.mindest_material_g === 1200) && (await el(p).locator("#ws-e-mindest_material_g").textContent()).includes("1.200"), "Handy: 1234 eingetippt → 1.200 g übernommen");
await p.screenshot({ path: `${out}/m2d-regler-box.png` });
await el(p).locator('.nav-unten [data-aktion="mehr"]').click();
await el(p).locator('.mehr-punkt[data-id="hilfe"]').click();
await p.waitForTimeout(400);
await el(p).locator('.p1s-punkt[data-id="duese"]').tap();
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/m3-hilfe.png` });
await el(p).locator('.p1s-punkt[data-id="extruder"]').tap();
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/m3b-hilfe-extruder.png` });
await el(p).locator('[data-aktion="hi-tab"][data-id="trockner"]').tap();
await p.waitForTimeout(400);
await el(p).locator('.p1s-punkt[data-id="auslass"] .p1s-ring').tap();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/m3c-trockner.png` });
await el(p).locator('[data-aktion="hi-tab"][data-id="fehler"]').tap();
await p.waitForTimeout(400);
await el(p).locator('[data-aktion="hi-fehler"][data-id="naht"]').tap();
await p.waitForTimeout(400);
const mb = await el(p).locator(".hi-fb-popup").boundingBox();
pruefe(mb && mb.x >= 0 && mb.x + mb.width <= 390 && mb.y >= 0 && mb.y + mb.height <= 844 && mb.width > 340, "Handy: Fehlerbild-Fenster passt auf den Bildschirm");
await p.screenshot({ path: `${out}/m3d-fehler-fenster.png` });
await el(p).locator(".hi-fb-x").tap();
await p.waitForTimeout(350);
pruefe((await el(p).locator(".hi-fb-ebene").count()) === 0, "Handy: X schließt das Fenster");
await el(p).locator('.nav-unten [data-aktion="mehr"]').click();
await el(p).locator('.mehr-punkt[data-id="nerd"]').click();
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/m4-nerd.png` });
await el(p).locator('.nav-unten [data-aktion="mehr"]').click();
await el(p).locator('.mehr-punkt.suche-punkt').click();
await p.waitForTimeout(300);
await el(p).locator("#global-suche").fill("petg weis");
await p.waitForTimeout(300);
pruefe((await el(p).locator(".such-treffer").count()) > 0, "Handy-Suche findet „petg weis“");
await p.screenshot({ path: `${out}/m5-suche.png` });
const breit = await p.evaluate(() => { const h = window.el.shadowRoot.querySelector(".haupt"); return h.scrollWidth - h.clientWidth; });
pruefe(breit <= 1, "Handy: kein seitliches Scrollen");

await b.close();
console.log(fehler.length ? "\nFehler:\n" + fehler.join("\n") : "\nAlles grün.");
process.exit(fehler.length ? 1 : 0);
