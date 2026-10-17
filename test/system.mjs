// System: automatische Sicherung im Medienordner (Liste, Wiederherstellen, Jetzt sichern)
// und „Nach Updates suchen“ (HACS-Update-Entität, sonst GitHub).
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe, mobil, such, github) {
  const ctx = await b.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, hasTouch: mobil, isMobile: mobil, timezoneId: "Europe/Berlin" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("404") && !m.text().includes("Failed to load resource") && fehler.push(m.text()));
  p.on("dialog", (d) => { p.dialoge = [...(p.dialoge || []), d.message()]; d.accept(); });
  // GitHub nicht wirklich fragen: Versionsnummer vorgeben oder Ausfall simulieren
  await p.route("https://raw.githubusercontent.com/**", (r) => github === "aus" ? r.abort() : r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ domain: "filament_werkstatt", version: github || "0.12.0" }) }));
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html?drucker=bereit&${such}`);
  await p.waitForTimeout(800);
  await p.evaluate(() => { const x = window.el; x._dialog = null; x._bu = null; x._daten.buchen_ab = "2099-01-01"; x._zeichnen(); });
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const zuSystem = async (p) => { await p.evaluate(() => { const x = window.el; x._mehrOffen = false; x._ansicht = "system"; x._zeichnen(); }); await p.waitForTimeout(350); };
const keinQuerScroll = (p) => p.evaluate(() => { const h = window.el.shadowRoot.querySelector(".haupt"); return h.scrollWidth <= h.clientWidth + 1; });

// ---------------- Desktop: Integration sichert, HACS-Entität vorhanden ----------------
let p = await seite(1400, 900, false, "sich=auto&upd=hacs");
await p.evaluate(() => { const e = window.el._daten.einstellungen; e.sicherung_start = "2026-01-01T00:00:00Z"; e.sicherung_am = null; window.el._zeichnen(); });
await p.waitForTimeout(200);
pruefe((await el(p).locator(".bu-balken.blau").count()) === 0, "Automatische Sicherung läuft: keine wöchentliche Download-Erinnerung");
await el(p).locator('.nav-oben [data-id="system"]').click();
await p.waitForTimeout(400);
let t = await el(p).locator(".sich-auto-kopf").textContent();
pruefe(t.replace(/\s+/g, " ").includes("Automatische Sicherung: letzte heute 03:00 · 14 gespeichert"), `Kopfzeile: „${t.replace(/\s+/g, " ").trim()}“`);
pruefe((await el(p).locator(".sich-zeile").count()) === 5, "Fünf Sicherungen sichtbar");
pruefe((await el(p).locator('[data-aktion="sich-laden"]').count()) === 1, "Herunterladen bleibt möglich");
await el(p).locator('[data-aktion="sich-auto-alle"]').click();
await p.waitForTimeout(200);
pruefe((await el(p).locator(".sich-zeile").count()) === 14, "„Alle 14 zeigen“ klappt die Liste auf");
await el(p).locator('[data-aktion="sich-auto-alle"]').click();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/sys1-system.png`, fullPage: true });
await el(p).locator(".karte").nth(2).screenshot({ path: `${out}/sys2-sicherung.png` });

// Wiederherstellen: gleicher Dialog wie beim Einspielen
await el(p).locator('[data-aktion="sich-auto-wieder"]').nth(1).click();
await p.waitForTimeout(300);
t = await el(p).locator(".dialog").textContent();
pruefe(t.includes("Sicherung einspielen?") && t.includes("Automatische Sicherung vom"), "Wiederherstellen fragt nach (Einspiel-Dialog)");
pruefe(await p.evaluate(() => window.wsLog.some((x) => x.startsWith("filament_werkstatt/sicherung_lesen:") && x.includes(window.autoSich[1].datei))), "Gewählte Datei wird gelesen");
await el(p).locator('[data-aktion="sich-import-ok"]').click();
await p.waitForTimeout(500);
pruefe(await p.evaluate(() => window.el._daten.rollen.length === 7 && JSON.parse(window.speicher.filament_werkstatt_sicherung).rollen.length > 7), "Wiederhergestellt (7 Rollen), alter Stand zwischengespeichert");

// Jetzt sichern
await el(p).locator('[data-aktion="sich-auto-jetzt"]').click();
await p.waitForTimeout(400);
pruefe(await p.evaluate(() => window.wsLog.includes("filament_werkstatt/sicherung_jetzt")), "„Jetzt sichern“ ruft die Integration");
pruefe((await el(p).locator(".toast").textContent()).includes("Medienordner"), "Meldung nach dem Sichern");
pruefe((await el(p).locator(".sich-zeile").first().textContent()).includes("7 Rollen"), "Liste zeigt die neue Sicherung");

// Update über HACS
await el(p).locator('[data-aktion="upd-suchen"]').click();
await p.waitForTimeout(1200);
pruefe(await p.evaluate(() => window.dienste.includes("homeassistant.update_entity:update.filament_werkstatt_update")), "HACS-Entität wird vorher aktualisiert");
t = (await el(p).locator(".upd-karte").innerText()).replace(/\s+/g, " ");
pruefe(t.includes("Installiert 0.12.0") && t.includes("0.12.1") && t.includes("Update verfügbar") && t.includes("HACS"), "Installierte und neueste Version über HACS");
pruefe(t.includes("Raumklima auf Drucker") && t.includes("nächtliche Sicherung"), "Zusammenfassung und Änderungen werden gezeigt");
await el(p).locator(".upd-karte").screenshot({ path: `${out}/sys3-update-hacs.png` });
await el(p).locator('[data-aktion="upd-installieren"]').click();
await p.waitForTimeout(400);
pruefe((p.dialoge || []).some((x) => x.includes("0.12.1")), "Aktualisieren fragt nach");
pruefe(await p.evaluate(() => window.dienstDaten.some((d) => d.domain === "update" && d.dienst === "install" && d.entity_id === "update.filament_werkstatt_update")), "update.install auf der HACS-Entität");
t = (await el(p).locator(".upd-karte").innerText()).replace(/\s+/g, " ");
pruefe(t.includes("Neustart nötig") && t.includes("muss Home Assistant neu starten"), "Danach: Neustart nötig");
await el(p).locator(".upd-karte").screenshot({ path: `${out}/sys4-neustart.png` });
await el(p).locator('[data-aktion="upd-neustart"]').click();
await p.waitForTimeout(300);
pruefe(await p.evaluate(() => window.dienstDaten.some((d) => d.domain === "homeassistant" && d.dienst === "restart")), "Neustart nach Rückfrage");
pruefe((await el(p).locator(".upd-karte").textContent()).includes("startet neu"), "Meldung: startet neu");
await p.context().close();

// ---------------- Handy: ohne HACS-Entität, Version von GitHub ----------------
p = await seite(390, 844, true, "sich=auto&upd=github", "0.12.3");
await zuSystem(p);
await el(p).locator('[data-aktion="upd-suchen"]').click();
await p.waitForTimeout(600);
t = (await el(p).locator(".upd-karte").innerText()).replace(/\s+/g, " ");
pruefe(t.includes("0.12.3") && t.includes("GitHub") && t.includes("in HACS"), "Ohne HACS-Entität: GitHub-Version und Hinweis auf HACS");
pruefe((await el(p).locator('[data-aktion="upd-installieren"]').count()) === 0, "Ohne HACS-Entität kein Installieren-Knopf");
pruefe(await keinQuerScroll(p), "Handy: nichts ragt seitlich heraus");
await p.screenshot({ path: `${out}/sys5-handy.png`, fullPage: true });
await el(p).locator(".upd-karte").screenshot({ path: `${out}/sys6-handy-update.png` });
await el(p).locator(".karte").nth(2).screenshot({ path: `${out}/sys7-handy-sicherung.png` });
await p.context().close();

// ---------------- Ältere Integration: alles wie früher ----------------
p = await seite(1400, 900, false, "", "aus");
await p.evaluate(() => { const e = window.el._daten.einstellungen; e.sicherung_start = "2026-01-01T00:00:00Z"; e.sicherung_am = null; window.el._zeichnen(); });
await p.waitForTimeout(300);
pruefe((await el(p).locator(".bu-balken.blau").count()) === 1, "Ohne automatische Sicherung: wöchentliche Erinnerung wie bisher");
await zuSystem(p);
pruefe((await el(p).locator(".sich-auto-kopf").textContent()).includes("nicht verfügbar"), "System: automatische Sicherung nicht verfügbar");
await el(p).locator('[data-aktion="upd-suchen"]').click();
await p.waitForTimeout(600);
pruefe((await el(p).locator(".upd-karte .hinweis.amber").count()) === 1, "GitHub nicht erreichbar: Fehlerhinweis statt Absturz");
await p.context().close();

await b.close();
console.log(fehler.length ? "\nFehler:\n" + fehler.join("\n") : "\nAlles grün.");
process.exit(fehler.length ? 1 : 0);
