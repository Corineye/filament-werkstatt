// Rollen v0.12: voreingestellter Preis, Kauflink, Sterne, Feuchte/Trocknen, lernende Restgewicht-Korrektur.
// Aufruf: TEST_PORT=8765 node test/filament.mjs <bilderordner>
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe, mobil = false, suche = "") {
  const ctx = await b.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, hasTouch: mobil, isMobile: mobil, timezoneId: "Europe/Berlin" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("404") && fehler.push(m.text()));
  p.on("dialog", (d) => d.accept());
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html${suche}`);
  await p.waitForTimeout(800);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const rolle = (p, id) => p.evaluate((i) => JSON.parse(JSON.stringify(window.el._daten.rollen.find((r) => r.id === i))), id);
const vorTagen = (n) => { const d = new Date(Date.now() - n * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const heute = vorTagen(0);
const GRAU = "bambu-pla-basic-grau";

let p = await seite(1400, 900);
// ---- Preis: ohne eigenen Preis 19,99 € je Rolle
let preis = await p.evaluate((id) => window.el._preisProGramm(window.el._daten.rollen.find((r) => r.id === id)), GRAU);
pruefe(preis.voreingestellt && Math.abs(preis.wert - 0.01999) < 1e-6, "Voreingestellt 19,99 € je 1-kg-Rolle (≈ 2 ct/g)");
preis = await p.evaluate(() => window.el._preisProGramm({ nenn_g: 250 }));
pruefe(Math.abs(preis.wert - 19.99 / 250) < 1e-9, "Bezogen auf die Spulengröße (250 g)");
pruefe(await p.evaluate(() => { const x = window.el._preisProGramm({ preis_kg: 25 }); return !x.voreingestellt && x.wert === 0.025; }), "Eigener Preis gewinnt");

await el(p).locator(`[data-id="${GRAU}"]`).click();
await el(p).locator('[data-aktion="tab"][data-id="infos"]').click();
await p.waitForTimeout(250);
let t = await el(p).locator("#info-preis_kg").textContent();
pruefe(t.includes("19,99 €") && t.includes("voreingestellt"), "Infos: Preis 19,99 € mit Markierung „voreingestellt“");
pruefe((await el(p).locator(".kauflink").textContent()).includes("Kein Kauflink angegeben"), "Ohne Link: „Kein Kauflink angegeben“");
await p.screenshot({ path: `${out}/f1-infos-voreingestellt.png` });

// ---- Kauflink
await el(p).locator('[data-aktion="fi-link-bearbeiten"]').click();
await el(p).locator("#kauflink").fill("ftp://example.com/rolle");
await el(p).locator('[data-aktion="fi-link-speichern"]').click();
await p.waitForTimeout(250);
pruefe(!(await rolle(p, GRAU)).kauflink && (await el(p).locator("#kauflink.fehler").count()) === 1, "ftp-Link wird abgelehnt, Feld rot");
await el(p).locator("#kauflink").fill("https://example.com/shop/pla-basic-grau?ref=1");
await el(p).locator('[data-aktion="fi-link-speichern"]').click();
await p.waitForTimeout(250);
pruefe((await rolle(p, GRAU)).kauflink === "https://example.com/shop/pla-basic-grau?ref=1", "https-Link gespeichert");
const a = el(p).locator("a.kauf-knopf");
pruefe((await a.textContent()).includes("Hier klicken zum Kaufen") && (await a.getAttribute("target")) === "_blank" && (await a.getAttribute("rel")) === "noopener noreferrer", "Knopf „Hier klicken zum Kaufen“, neuer Tab, noopener");
pruefe(!(await el(p).locator(".sheet-inhalt").textContent()).includes("example.com"), "Die Adresse selbst wird nicht angezeigt");

// ---- Sterne
await el(p).locator('[data-aktion="fi-stern"][data-n="4"]').click();
await p.waitForTimeout(150);
pruefe((await rolle(p, GRAU)).bewertung === 4 && (await el(p).locator(".stern.an").count()) === 4, "4 Sterne gesetzt");
await p.screenshot({ path: `${out}/f2-infos-kauflink-sterne.png` });
await el(p).locator('[data-aktion="fi-stern"][data-n="4"]').click();
await p.waitForTimeout(150);
pruefe((await rolle(p, GRAU)).bewertung == null && (await el(p).locator(".stern.an").count()) === 0, "Gleicher Stern nochmal löscht die Bewertung");
await el(p).locator('[data-aktion="fi-stern"][data-n="5"]').click();

// Eigener Preis: Markierung verschwindet
await el(p).locator('[data-info="preis_kg"]').fill("24");
await el(p).locator('[data-info="preis_kg"]').dispatchEvent("change");
await p.waitForTimeout(150);
t = await el(p).locator("#info-preis_kg").textContent();
pruefe(t.includes("24,00 €") && !t.includes("voreingestellt"), "Eigener Preis ohne Markierung");

// ---- Feuchte
pruefe(await p.evaluate((id) => window.el._feuchteHinweis(window.el._daten.rollen.find((r) => r.id === id)) === null, GRAU), "Verschlossene Rolle: kein Feuchte-Hinweis");
await el(p).locator('[data-fi-datum="geoeffnet_am"]').fill(vorTagen(70));
await el(p).locator('[data-fi-datum="geoeffnet_am"]').dispatchEvent("change");
await p.waitForTimeout(250);
let h = await p.evaluate((id) => window.el._feuchteHinweis(window.el._daten.rollen.find((r) => r.id === id)), GRAU);
pruefe(h && h.faellig && h.text.includes("70 Tagen") && h.text.includes("60"), `PLA 70 Tage offen: fällig (${h && h.text})`);
pruefe((await el(p).locator(".feuchte-hinweis").count()) === 1, "Hinweis im Detail");
await el(p).locator(".feuchte-block").scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/f3-infos-feuchte.png` });
await el(p).locator('[data-aktion="tab"][data-id="einstellungen"]').click();
await p.waitForTimeout(200);
pruefe((await el(p).locator(".feuchte-hinweis").count()) === 1, "Hinweis auch oben in den Einstellungen");
await el(p).locator('[data-aktion="schliessen"]').first().click();
await p.waitForTimeout(400);
pruefe((await el(p).locator(`.kachel[data-id="${GRAU}"] .badge-trocknen`).count()) === 1, "Kachel zeigt „Trocknen?“");
await p.screenshot({ path: `${out}/f4-kachel-trocknen.png` });
await p.evaluate(() => { const r = window.el._daten.rollen.find((x) => x.id === "sunlu-tpu-schwarz"); r.geoeffnet_am = (() => { const d = new Date(Date.now() - 12 * 86400000); return d.toISOString().slice(0, 10); })(); });
h = await p.evaluate(() => window.el._feuchteHinweis(window.el._daten.rollen.find((r) => r.id === "sunlu-tpu-schwarz")));
pruefe(h && !h.faellig, "TPU nach 12 Tagen: bald fällig (Frist 14 Tage)");
await el(p).locator(`[data-id="${GRAU}"]`).click();
await p.waitForTimeout(250);
await el(p).locator('.feuchte-hinweis [data-aktion="fi-getrocknet"]').click();
await p.waitForTimeout(250);
let r = await rolle(p, GRAU);
pruefe(r.getrocknet_am === heute && (await el(p).locator(".feuchte-hinweis").count()) === 0, "„Heute getrocknet“ setzt das Datum, Hinweis weg");

// ---- Korrektur lernen beim Wiegen
await p.evaluate((id) => {
  const x = window.el, r = x._daten.rollen.find((y) => y.id === id);
  r.rest_g = 500.4; r.gewogen_am = "2026-01-01T00:00:00Z";
  x._daten.drucke.k1 = { gebucht: { am: "2026-02-01T00:00:00Z", rolle: id, g: 100.4, druck_g: 100, slicer_g: 100, korr: 1, fix_g: 0.4, ergebnis: "ok" }, name: "Test" };
  r.rest_g -= 100.4;
  x._rechner = null; x._zeichnen();
}, GRAU);
await el(p).locator('[data-aktion="tab"][data-id="rest"]').click();
await p.waitForTimeout(200);
pruefe((await el(p).locator(".korrektur-block").textContent()).includes("Keine Korrektur"), "Vor dem Wiegen: keine Korrektur");
// Waage: 4 g weniger übrig als verbucht → Slicer unterschätzt um 4 %
const spule = await p.evaluate((id) => window.el._neSpuleG(window.el._daten.rollen.find((r) => r.id === id)), GRAU);
await el(p).locator('[data-rechner="brutto"]').fill(String(400 - 4 + spule));
await el(p).locator('[data-aktion="rest-speichern"]').click();
await p.waitForTimeout(300);
r = await rolle(p, GRAU);
pruefe(r.korrektur && r.korrektur.n === 1 && Math.abs(r.korrektur.f - 1.04) < 0.001, `Faktor je Rolle gelernt (${r.korrektur && r.korrektur.f.toFixed(3)})`);
pruefe(await p.evaluate(() => window.el._daten.einstellungen.korrektur.PLA > 1 && window.el._daten.einstellungen.korrektur_n.PLA === 1), "Faktor je Material gelernt");
t = await el(p).locator(".korrektur-block").textContent();
pruefe(/Korrektur \+4 % \(gelernt aus 1 Wiegung\)/.test(t), `Anzeige „${t.replace(/\s+/g, " ").trim().slice(0, 60)}“`);
await el(p).locator(".korrektur-block").scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/f5-rest-korrektur.png` });
let bed = await p.evaluate((id) => window.el._buBedarf({ gewicht: 10 }, window.el._daten.rollen.find((r) => r.id === id), 100), GRAU);
pruefe(Math.abs(bed.druck - 10 * r.korrektur.f) < 1e-9 && bed.slicer === 10, "Verbuchen rechnet mit dem gelernten Faktor");
// Unplausible Wiegung zählt nicht
await p.evaluate((id) => {
  const x = window.el, r = x._daten.rollen.find((y) => y.id === id);
  x._daten.drucke.k2 = { gebucht: { am: new Date().toISOString(), rolle: id, g: 20.4, druck_g: 20.9, slicer_g: 20, korr: 1.044, fix_g: 0.4, ergebnis: "ok" }, name: "Test 2" };
  r.rest_g -= 20.4; x._rechner = null; x._zeichnen();
}, GRAU);
await el(p).locator('[data-rechner="brutto"]').fill(String(Math.round(r.rest_g - 20.4 - 200 + spule)));
await el(p).locator('[data-aktion="rest-speichern"]').click();
await p.waitForTimeout(300);
r = await rolle(p, GRAU);
pruefe(r.korrektur.n === 1, "Absurde Abweichung wird ignoriert");
await el(p).locator('[data-aktion="fi-korr-weg"]').click();
await p.waitForTimeout(250);
r = await rolle(p, GRAU);
t = await el(p).locator(".korrektur-block").textContent();
pruefe(!r.korrektur && t.includes("PLA, gelernt aus 1 Wiegung"), "Zurücksetzen: Rolle fällt auf den Materialfaktor zurück");
await el(p).locator('[data-aktion="schliessen"]').first().click();
await p.waitForTimeout(300);

// ---- Neue Rolle: „Heute geöffnet?“
async function neueRolle(pp, wahl, farbe) {
  await el(pp).locator('[data-aktion="neu"]').click();
  await pp.waitForTimeout(250);
  await el(pp).locator("#neu-hersteller").selectOption("Elegoo");
  await el(pp).locator('[data-neu="farbe"]').fill(farbe);
  await el(pp).locator(`[data-aktion="fi-neu-offen"][data-id="${wahl}"]`).click();
  await pp.waitForTimeout(150);
}
await neueRolle(p, "datum", "Mint");
pruefe((await el(p).locator('[data-neu="geoeffnet_datum"]').count()) === 1, "„Datum wählen“ zeigt ein Datumsfeld");
await el(p).locator('[data-neu="geoeffnet_datum"]').fill(vorTagen(3));
await el(p).locator('[data-neu="geoeffnet_datum"]').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/f6-neu-geoeffnet.png` });
await el(p).locator('[data-aktion="neu-anlegen"]').click();
await p.waitForTimeout(250);
let neu = await p.evaluate(() => window.el._daten.rollen.find((r) => r.farbe === "Mint"));
pruefe(neu && neu.geoeffnet_am === vorTagen(3), "Gewähltes Datum gespeichert");
await neueRolle(p, "zu", "Zu");
await el(p).locator('[data-aktion="neu-anlegen"]').click();
await neueRolle(p, "heute", "Heute");
await el(p).locator('[data-aktion="neu-anlegen"]').click();
await p.waitForTimeout(250);
neu = await p.evaluate(() => window.el._daten.rollen.filter((r) => ["Zu", "Heute"].includes(r.farbe)).map((r) => r.geoeffnet_am || null));
pruefe(neu[0] === null && neu[1] === heute, "„Noch verschlossen“ ohne Datum, „Heute“ mit heutigem Datum");

// ---- Verbuchen: Kosten mit voreingestelltem Preis
p = await seite(1400, 900, false, "?drucker=bereit");
await p.evaluate(() => { const x = window.el; x._daten.buchen_ab = "2000-01-01"; x._buGezeigt = null; x._drVerlaufLaden(); });
await p.waitForTimeout(700);
t = await el(p).locator("#bu-kosten").textContent();
pruefe(t.includes("voreingestellt") && /Filament.*0,14 €/.test(t.replace(/\s+/g, " ")), `Verbuchen: Filamentkosten mit Markierung (${t.replace(/\s+/g, " ").trim().slice(0, 70)})`);
await el(p).locator(".bu-dialog").screenshot({ path: `${out}/f7-verbuchen-kosten.png` });
await el(p).locator('[data-aktion="bu-buchen"]').click();
await p.waitForTimeout(300);
const g = await p.evaluate(() => window.el._daten.drucke.a1.gebucht);
pruefe(g.kosten.filament > 0.13 && g.kosten.voreingestellt && g.slicer_g === 6.76 && g.korr === 1, "Buchung speichert Kosten, Slicer-Gewicht und Faktor");

// ---- Handy
const m = await seite(390, 844, true);
await m.evaluate(() => { const r = window.el._daten.rollen.find((x) => x.id === "bambu-pla-matte-rot"); r.geoeffnet_am = "2026-01-02"; r.kauflink = "https://example.com/rot"; r.bewertung = 3; window.el._zeichnen(); });
await m.waitForTimeout(200);
pruefe((await el(m).locator('.kachel[data-id="bambu-pla-matte-rot"] .badge-trocknen').count()) === 1, "Handy: Kachel mit „Trocknen?“");
await m.screenshot({ path: `${out}/f8-handy-kacheln.png` });
await el(m).locator('[data-id="bambu-pla-matte-rot"]').click();
await m.waitForTimeout(400);
await m.screenshot({ path: `${out}/f9-handy-detail-hinweis.png` });
await el(m).locator('[data-aktion="tab"][data-id="infos"]').click();
await m.waitForTimeout(300);
await el(m).locator(".kauflink").scrollIntoViewIfNeeded();
await m.screenshot({ path: `${out}/f10-handy-infos.png` });
await el(m).locator(".feuchte-block").scrollIntoViewIfNeeded();
await m.screenshot({ path: `${out}/f11-handy-feuchte.png` });
const breit = await m.evaluate(() => document.documentElement.scrollWidth);
pruefe(breit <= 390, "Handy: kein seitliches Scrollen");
await el(m).locator('[data-aktion="tab"][data-id="rest"]').click();
await m.waitForTimeout(300);
await el(m).locator(".korrektur-block").scrollIntoViewIfNeeded();
await m.screenshot({ path: `${out}/f12-handy-rest.png` });

await b.close();
console.log(fehler.length ? `\nFehler:\n${fehler.join("\n")}` : "\nAlles grün.");
process.exit(fehler.length ? 1 : 0);
