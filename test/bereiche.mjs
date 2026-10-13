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
  await p.goto("http://localhost:8765/test/test.html?drucker=bereit");
  await p.waitForTimeout(800);
  // Fertige Testdrucke als verbucht markieren, damit kein Pop-up stört
  await p.evaluate(() => { const x = window.el; x._dialog = null; x._bu = null; x._daten.buchen_ab = "2099-01-01"; x._zeichnen(); });
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const nav = async (p, id) => { await el(p).locator(`.nav-oben [data-id="${id}"]`).click(); await p.waitForTimeout(350); };

// ---------------- Desktop ----------------
let p = await seite(1400, 900);
pruefe((await el(p).locator(".nav-oben .nav-punkt").count()) === 8, "8 Bereiche oben in der Navigation");

// Hilfe
await nav(p, "hilfe");
pruefe((await el(p).locator(".p1s-punkt").count()) === 12, "P1S-Zeichnung mit 12 Bereichen");
await el(p).locator('.p1s-punkt[data-id="bett"]').hover();
await p.waitForTimeout(250);
let t = await el(p).locator("#hi-info").textContent();
pruefe(t.includes("Druckbett") && t.includes("Druckplatte"), "Maus über dem Bett zeigt Bett-Einstellungen mit Rollenwerten");
await p.screenshot({ path: `${out}/h1-p1s.png` });
await el(p).locator('[data-aktion="hi-tab"][data-id="trockner"]').click();
await p.waitForTimeout(300);
await el(p).locator('.p1s-punkt[data-id="feuchte"]').hover();
await p.waitForTimeout(200);
pruefe((await el(p).locator("#hi-tr-info").textContent()).includes("Luftfeuchte"), "Trockner: Feld Luftfeuchte erklärt");
pruefe((await el(p).locator(".tr-rolle").count()) > 10, "Trockner: eigene Rollen mit Trocknungswerten");
await p.screenshot({ path: `${out}/h2-trockner.png` });
await el(p).locator('[data-aktion="hi-tab"][data-id="fehler"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="hi-fehler"]').first().click();
await p.waitForTimeout(500);
pruefe((await el(p).locator(".fb-details").count()) === 1, "Fehlerbild klappt mit Lösungen auf");
await p.screenshot({ path: `${out}/h3-fehlerbilder.png` });
await el(p).locator('[data-aktion="hi-tab"][data-id="kalibrierung"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="hi-kal"][data-id="flow"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="hi-kal-schritt"][data-d="1"]').click();
await el(p).locator('[data-aktion="hi-kal-speichern"]').click();
await p.waitForTimeout(300);
pruefe(await p.evaluate(() => window.el._daten.rollen.some((r) => r.kalibriert && r.kalibriert.flow)), "Kalibrierergebnis Flow in der Rolle gespeichert");
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
// Kosten
await el(p).locator('[data-aktion="ws-tab"][data-id="kosten"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-ws="e-strompreis"]').fill("0.42");
await el(p).locator('[data-ws="e-strompreis"]').dispatchEvent("change");
pruefe(await p.evaluate(() => window.el._daten.einstellungen.strompreis === 0.42), "Strompreis per Regler geändert");
await p.screenshot({ path: `${out}/w5-kosten.png` });

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
await el(p).locator('.nav-unten [data-aktion="mehr"]').click();
await el(p).locator('.mehr-punkt[data-id="hilfe"]').click();
await p.waitForTimeout(400);
await el(p).locator('.p1s-punkt[data-id="duese"]').tap();
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/m3-hilfe.png` });
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
