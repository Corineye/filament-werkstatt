// Werkstatt v0.12: Bibliothek-Filter, kluge Warteschlange mit Zeitplan, Projekte, Werkzeug & Zubehör im Inventar.
import { createRequire } from "module";
import { mkdirSync } from "fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe, mobil = false, ansicht = "werkstatt") {
  const ctx = await b.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, hasTouch: mobil, isMobile: mobil, timezoneId: "Europe/Berlin" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("404") && fehler.push(m.text()));
  p.on("dialog", (d) => d.accept());
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html?ansicht=${ansicht}&drucker=druckt`);
  await p.waitForTimeout(900);
  // Testdaten: geladene Rolle, Aufträge auf drei Rollen, verbuchte Drucke
  await p.evaluate(() => {
    const x = window.el, d = x._daten;
    x._dialog = null; x._bu = null; d.buchen_ab = "2099-01-01";
    const r = d.rollen.filter((r) => r.rest_g != null);
    const [A, B] = r.filter((r) => r.rest_g > 300), C = r.find((r) => r.rest_g < 600);
    A.preis_kg = 20; B.preis_kg = 25;
    d.geladen = A.id;
    d.warteschlange = [
      { id: "q1", name: "Halter links", gewicht: 30, dauer_min: 60, rolleId: B.id, notiz: "", am: "2026-10-12T10:00:00Z", quelle: "hand" },
      { id: "q2", name: "Deckel", gewicht: 20, dauer_min: 30, rolleId: A.id, notiz: "", am: "2026-10-12T10:00:00Z", quelle: "hand" },
      { id: "q3", name: "Halter rechts", gewicht: 25, zeit: "1h 30m", rolleId: B.id, notiz: "", am: "2026-10-12T10:00:00Z", quelle: "gcode" },
      { id: "q4", name: "Großes Gehäuse", gewicht: 900, dauer_min: 240, rolleId: C.id, notiz: "", am: "2026-10-12T10:00:00Z", quelle: "hand" },
      { id: "q5", name: "Clip", gewicht: 3, rolleId: A.id, notiz: "", am: "2026-10-12T10:00:00Z", quelle: "hand" },
    ];
    d.drucke = {
      a1: { gebucht: { am: "2026-10-12T20:00:00Z", rolle: A.id, g: 7.2, ergebnis: "ok", fortschritt: 100, kosten: { filament: 0.14, strom: 0.05, kwh: 0.15 } } },
      a2: { gebucht: { am: "2026-10-11T18:00:00Z", rolle: B.id, g: 17, ergebnis: "fehl", fortschritt: 34, kosten: { filament: 0.43, strom: 0.08, kwh: 0.2 } }, fehl: { ursachen: [], geaendert: [] } },
    };
    window.__rollen = { A: A.id, B: B.id, C: C.id, matA: A.material, matB: B.material, nameA: A.name };
    x._speichern(); x._zeichnen();
  });
  await p.waitForTimeout(300);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const tab = async (p, id) => { await el(p).locator(`[data-aktion="ws-tab"][data-id="${id}"]`).click(); await p.waitForTimeout(350); };
const daten = async (p) => { await p.waitForTimeout(650); return p.evaluate(() => JSON.parse(speicher.filament_werkstatt)); };
const waehle = (p, sel, wert) => p.evaluate(([s, w]) => { const x = window.el.shadowRoot.querySelector(s); x.value = w; x.dispatchEvent(new Event("change", { bubbles: true })); }, [sel, wert]);
const uhr = (ms) => new Date(ms).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });

// ---------------- Desktop: Warteschlange ----------------
let p = await seite(1400, 900);
let t = await el(p).locator(".ws-plan").textContent();
pruefe(t.includes("Start nach dem laufenden Druck") && t.includes("43 min"), "Zeitplan startet nach dem laufenden Druck (Restzeit 0,72 h)");
pruefe(/Bis (morgen )?22:00 schaffst du \d+ Druck/.test(t), "Zeile „Bis 22:00 schaffst du X Drucke“");
pruefe(t.includes("1 Auftrag hat keine Druckdauer"), "Auftrag ohne Dauer wird genannt");
pruefe((await el(p).locator(".ws-auftrag").first().textContent()).includes("Halter links"), "Manuelle Reihenfolge: Halter links zuerst");
pruefe((await el(p).locator(".ws-auftrag.fehlt").count()) === 1 && (await el(p).locator(".ws-auftrag.fehlt .ws-rot-punkt").count()) === 1, "Auftrag ohne genug Filament hat die rote Markierung");
pruefe((await el(p).locator(".ws-auftrag.fehlt").textContent()).includes("Großes Gehäuse"), "Rote Markierung am großen Gehäuse");
pruefe((await el(p).locator(".ws-auftrag").nth(2).textContent()).includes("1 h 30 min"), "Dauer aus dem G-Code-Text „1h 30m“ gelesen");
await p.screenshot({ path: `${out}/warteschlange-manuell.png`, fullPage: true });
const manuellWechsel = Number((await el(p).locator(".ws-plan-zeile").nth(2).locator("strong").textContent()).match(/\d+/)[0]);

await el(p).locator('[data-aktion="ws-klug"][data-id="an"]').click();
await p.waitForTimeout(300);
const namen = await el(p).locator(".ws-auftrag .ws-text > strong").allTextContents();
pruefe(namen.join("|") === "Deckel|Clip|Halter links|Halter rechts|Großes Gehäuse", `Klug sortiert: geladene Rolle zuerst, gleiche Rollen zusammen (${namen.join(", ")})`);
const klugWechsel = Number((await el(p).locator(".ws-plan-zeile").nth(2).locator("strong").textContent()).match(/\d+/)[0]);
pruefe(klugWechsel < manuellWechsel, `Weniger Rollenwechsel: ${klugWechsel} statt ${manuellWechsel}`);
pruefe((await el(p).locator(".ws-trenner").count()) === 3 && (await el(p).locator(".ws-trenner.geladen").count()) === 1, "Trenner je Rolle, geladene Rolle hervorgehoben");
pruefe((await el(p).locator('[data-aktion="ws-hoch"]').count()) === 0, "Im klugen Modus keine Pfeile");
{
  const erwartet = uhr(Date.now() + 0.72 * 3600000 + (5 + 30) * 60000);
  const erste = await el(p).locator(".ws-auftrag").first().locator(".ws-uhr").textContent();
  pruefe(erste.includes(erwartet), `Erster Auftrag fertig um ${erwartet} (${erste.trim()})`);
  pruefe((await el(p).locator(".ws-auftrag").nth(1).locator(".ws-ohne-dauer").count()) === 1, "Clip ohne Dauer: „Dauer fehlt“");
}
let d = await daten(p);
pruefe(d.einstellungen.schlange_klug === true && d.warteschlange[0].id === "q1", "Modus gespeichert, eigene Reihenfolge bleibt erhalten");
await p.screenshot({ path: `${out}/warteschlange-klug.png`, fullPage: true });
await el(p).locator('[data-aktion="ws-klug-uebernehmen"]').click();
await p.waitForTimeout(300);
d = await daten(p);
pruefe(d.warteschlange.map((a) => a.id).join() === "q2,q5,q1,q3,q4" && !d.einstellungen.schlange_klug, "Kluge Reihenfolge übernommen, zurück im manuellen Modus");
pruefe((await el(p).locator('[data-aktion="ws-hoch"]').count()) === 5, "Pfeile wieder da");

// Druckdauer im Auftrag-Dialog
await el(p).locator('[data-aktion="ws-bearbeiten"][data-id="q5"]').click();
await p.waitForTimeout(250);
await el(p).locator('[data-ws="dauer"]').fill("45");
await el(p).locator('[data-aktion="ws-d"][data-d="15"]').click();
pruefe((await el(p).locator("#ws-dauer").textContent()) === "1 h", "Dauer-Regler mit +15 zeigt 1 h");
await p.screenshot({ path: `${out}/auftrag-dialog-dauer.png` });
await el(p).locator('[data-aktion="ws-speichern"]').click();
await p.waitForTimeout(300);
d = await daten(p);
pruefe(d.warteschlange.find((a) => a.id === "q5").dauer_min === 60, "Druckdauer gespeichert");

// ---------------- Bibliothek-Filter ----------------
await tab(p, "bibliothek");
pruefe((await el(p).locator(".ws-modell").count()) === 3 && (await el(p).locator("#ws-bib-zahl").textContent()).includes("3 Drucke in 3 Modellen"), "Bibliothek: 3 Drucke in 3 Modellen");
await el(p).locator('[data-aktion="ws-bib-status"][data-id="fehl"]').click();
await p.waitForTimeout(250);
pruefe((await el(p).locator(".ws-modell").count()) === 1 && (await el(p).locator(".ws-modell").textContent()).includes("Akkuschrauber"), "Status Fehldruck: nur der Akkuschrauber-Halter");
pruefe((await el(p).locator('[data-aktion="ws-bib-reset"]').count()) >= 1, "„Filter zurücksetzen“ erscheint");
await el(p).locator('[data-aktion="ws-bib-status"][data-id="ok"]').click();
await p.waitForTimeout(250);
pruefe((await el(p).locator(".ws-modell").count()) === 2, "Status erfolgreich: 2 Modelle");
await el(p).locator('[data-aktion="ws-bib-status"][data-id=""]').click();
await waehle(p, '[data-ws="bib-fil"]', "r:" + (await p.evaluate(() => window.__rollen.A)));
await p.waitForTimeout(300);
pruefe((await el(p).locator(".ws-modell").count()) === 1 && (await el(p).locator(".ws-modell").textContent()).includes("Kalibrierwürfel"), "Filament-Filter (Rolle): nur der Kalibrierwürfel");
await waehle(p, '[data-ws="bib-fil"]', "m:" + (await p.evaluate(() => window.__rollen.matB)));
await p.waitForTimeout(300);
pruefe((await el(p).locator(".ws-modell").textContent()).includes("Akkuschrauber"), "Filament-Filter (Material) findet den Druck mit dieser Rolle");
await waehle(p, '[data-ws="bib-fil"]', "");
await waehle(p, '[data-ws="bib-zeit"]', "7");
await p.waitForTimeout(300);
{
  const erwartet = await p.evaluate(() => window.el._buAlle().filter((d) => d.start && (Date.now() - new Date(d.start)) / 86400000 <= 7).length);
  pruefe((await el(p).locator("#ws-bib-zahl").textContent()).includes(`${erwartet} Druck`), `Zeitraum 7 Tage: ${erwartet} Drucke`);
}
await el(p).locator('[data-aktion="ws-bib-reset"]').first().click();
await p.waitForTimeout(250);
await el(p).locator('[data-ws="suche"]').fill("zahnrad");
await p.waitForTimeout(250);
pruefe((await el(p).locator(".ws-modell").count()) === 1 && (await el(p).locator("#ws-bib-zahl").textContent()).includes("1 Druck in 1 Modell"), "Textsuche „zahnrad“ mit Trefferzahl");
await el(p).locator('[data-ws="suche"]').fill("");
await el(p).locator('[data-aktion="ws-bib-status"][data-id="ab"]').click();
await p.waitForTimeout(250);
pruefe((await el(p).locator(".ws-bib-leer").count()) === 1, "Leerer Treffer zeigt Hinweis mit Zurücksetzen");
await el(p).locator('[data-aktion="ws-bib-reset"]').first().click();
await p.waitForTimeout(250);
await p.screenshot({ path: `${out}/bibliothek-filter.png`, fullPage: true });

// ---------------- Projekte ----------------
await el(p).locator('.ws-modell:has-text("Kalibrierwürfel") [data-aktion="ws-zu-projekt"]').click();
await p.waitForTimeout(250);
pruefe((await el(p).locator(".dialog h2").textContent()).includes("Zu Projekt"), "„Zu Projekt“ öffnet die Projektauswahl");
await el(p).locator('[data-aktion="ws-zu-neu"]').click();
await p.waitForTimeout(250);
await el(p).locator("#ws-pj-name").fill("Wetterstation");
await el(p).locator("#ws-pj-text").fill("Gehäuse für den Sensor im Garten");
await el(p).locator('[data-aktion="ws-pj-farbe"]').nth(1).click();
await el(p).locator('[data-aktion="ws-pj-icon"][data-id="🌱"]').click();
pruefe((await el(p).locator("#ws-pj-name").inputValue()) === "Wetterstation", "Name bleibt beim Wählen von Farbe/Symbol erhalten");
await p.screenshot({ path: `${out}/projekt-neu-dialog.png` });
await el(p).locator('[data-aktion="ws-pj-speichern"]').click();
await p.waitForTimeout(300);
d = await daten(p);
pruefe(d.projekte.length === 1 && d.projekte[0].teile.length === 1 && d.projekte[0].icon === "🌱" && d.projekte[0].farbe === "#5cc8ff", "Projekt mit erstem Teil angelegt");
pruefe((await el(p).locator(".ws-modell .ws-pj-pille").count()) === 1, "Bibliothek zeigt das Projekt am Modell");
// Auftrag aus der Warteschlange zuordnen
await tab(p, "schlange");
await el(p).locator('[data-aktion="ws-zu-projekt"][data-ref="q2"]').click();
await p.waitForTimeout(250);
await el(p).locator('[data-aktion="ws-zu-wahl"]').first().click();
await p.waitForTimeout(250);
pruefe((await el(p).locator(".ws-pj-zeile.an").count()) === 1, "Projekt in der Auswahl abgehakt");
await el(p).locator('.dialog [data-aktion="dialog-zu"]').click();
await p.waitForTimeout(250);
pruefe((await el(p).locator('.ws-auftrag:has-text("Deckel") .ws-pj-pille').count()) === 1, "Auftrag zeigt das Projekt");
// Projektansicht
await tab(p, "projekte");
pruefe((await el(p).locator(".ws-pj-karte").count()) === 1 && (await el(p).locator(".ws-pj-karte").textContent()).includes("1/2 Teile fertig"), "Projektübersicht: 1/2 Teile fertig");
await p.screenshot({ path: `${out}/projekte-uebersicht.png` });
await el(p).locator(".ws-pj-karte").click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="ws-pj-teil-neu"]').click();
await p.waitForTimeout(250);
await el(p).locator('[data-aktion="ws-pj-quelle"][data-id="verlauf"]').click();
await p.waitForTimeout(200);
await el(p).locator('[data-aktion="ws-pj-teil-dazu"][data-ref="a2"]').click();
await p.waitForTimeout(200);
await el(p).locator('[data-aktion="ws-pj-quelle"][data-id="plan"]').click();
await p.waitForTimeout(200);
await el(p).locator("#ws-pj-plan").fill("Sensorhalter");
await el(p).locator('[data-aktion="ws-pj-plan-dazu"]').click();
await p.waitForTimeout(250);
await el(p).locator('[data-aktion="ws-pj-quelle"][data-id="bibliothek"]').click();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/projekt-teil-dialog.png` });
await el(p).locator('.dialog [data-aktion="dialog-zu"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".ws-pj-teil").count()) === 4, "Projekt hat 4 Teile (Bibliothek, Warteschlange, Verlauf, geplant)");
t = await el(p).locator(".ws-pj-zahlen").textContent();
pruefe(t.includes("1 / 4") && t.includes("€") && t.includes("Druckzeit"), "Kacheln: Fortschritt, Gewicht, Kosten, Druckzeit");
pruefe((await el(p).locator('.ws-pj-teil:has-text("Akkuschrauber") .pille.rot').count()) === 1, "Fehldruck-Teil als Fehldruck markiert");
pruefe((await el(p).locator('.ws-pj-teil:has-text("Deckel")').textContent()).includes("Warteschlange"), "Teil aus der Warteschlange: „in der Warteschlange“");
pruefe((await el(p).locator(".ws-pj-teil img").count()) >= 1, "Foto des Kalibrierwürfels im Projekt");
await el(p).locator('.ws-pj-teil:has-text("Sensorhalter") [data-aktion="ws-pj-fertig"]').click();
await p.waitForTimeout(250);
pruefe((await el(p).locator(".ws-pj-zahlen").textContent()).includes("2 / 4"), "Von Hand abgehakt: 2 / 4");
await el(p).locator('.ws-pj-teil:has-text("Akkuschrauber") [data-aktion="ws-pj-drucken"]').click();
await p.waitForTimeout(250);
pruefe((await daten(p)).warteschlange.some((a) => a.quelle === "projekt" && a.name.includes("Akkuschrauber")), "Teil aus dem Projekt in die Warteschlange gestellt");
await p.screenshot({ path: `${out}/projekt-detail.png`, fullPage: true });
// Bearbeiten, löschen, rückgängig
await el(p).locator('[data-aktion="ws-pj-bearbeiten"]').click();
await p.waitForTimeout(200);
await el(p).locator("#ws-pj-name").fill("Wetterstation Garten");
await el(p).locator('[data-aktion="ws-pj-speichern"]').click();
await p.waitForTimeout(250);
pruefe((await el(p).locator(".ws-pj-kopf h2").textContent()) === "Wetterstation Garten", "Projekt umbenannt");
await el(p).locator('[data-aktion="ws-pj-loeschen"]').click();
await p.waitForTimeout(250);
pruefe((await daten(p)).projekte.length === 0, "Projekt gelöscht");
await el(p).locator('.toast [data-aktion="toast-knopf"]').click();
await p.waitForTimeout(250);
pruefe((await daten(p)).projekte.length === 1, "Rückgängig holt das Projekt zurück");
// Fehldrucke: „Zu Projekt“
await tab(p, "fehl");
pruefe((await el(p).locator('.ws-modell.fehl [data-aktion="ws-zu-projekt"]').count()) === 1, "Fehldrucke haben „Zu Projekt“");

// ---------------- Inventar: Werkzeug & Zubehör ----------------
await el(p).locator('.nav-oben [data-id="inventar"]').click();
await p.waitForTimeout(350);
pruefe((await el(p).locator('.kat[data-id="werkzeug"]').count()) === 1, "Kategorie „Werkzeug & Zubehör“");
pruefe((await el(p).locator(".kachel").count()) === 55, "Keine Werkzeuge erfunden: Bestand unverändert 55 Sorten");
await el(p).locator('.kat[data-id="werkzeug"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".inv-schnell").count()) === 1 && (await el(p).locator('[data-aktion="inv-vorlage"]').count()) >= 15, "Schnell hinzufügen mit Vorlagen");
await p.screenshot({ path: `${out}/inventar-werkzeug-leer.png` });
await el(p).locator('[data-aktion="inv-vorlage"]:has-text("Spachtel")').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".sheet-titel h2").textContent()).includes("Spachtel"), "Vorlage öffnet „Neues Teil: Spachtel“");
await el(p).locator('[data-aktion="inv-wz-zustand"][data-id="gut"]').click();
await el(p).locator('[data-aktion="inv-menge"][data-d="1"]').click();
await p.screenshot({ path: `${out}/inventar-werkzeug-neu.png` });
await el(p).locator('[data-aktion="inv-anlegen"]').click();
await p.waitForTimeout(400);
let inv = (await daten(p)).inventar.filter((x) => x.kat === "werkzeug");
pruefe(inv.length === 1 && inv[0].name === "Spachtel" && inv[0].zustand === "gut" && inv[0].menge === 2 && inv[0].vorlage === undefined, "Spachtel angelegt (Zustand gut, 2 Stück)");
pruefe((await el(p).locator('[data-aktion="inv-vorlage"]:has-text("Spachtel")').count()) === 0, "Vorlage Spachtel verschwindet aus den Vorschlägen");
// Eigenes Teil ohne Vorlage
await el(p).locator('[data-aktion="neu"]').click();
await el(p).locator('[data-aktion="inv-neu-kat"][data-id="werkzeug"]').click();
await p.waitForTimeout(200);
await el(p).locator('[data-aktion="inv-anlegen"]').click();
await p.waitForTimeout(200);
pruefe((await daten(p)).inventar.filter((x) => x.kat === "werkzeug").length === 1, "Ohne Namen wird nichts angelegt");
await el(p).locator('[data-inv-text="name"]').fill("Glasplatte 256");
await el(p).locator('[data-aktion="inv-wz-art"][data-id="platte"]').click();
await el(p).locator('[data-aktion="inv-wz-zustand"][data-id="abgenutzt"]').click();
await el(p).locator('[data-aktion="inv-anlegen"]').click();
await p.waitForTimeout(400);
inv = (await daten(p)).inventar.filter((x) => x.kat === "werkzeug");
pruefe(inv.some((x) => x.name === "Glasplatte 256" && x.art === "platte" && x.zustand === "abgenutzt"), "Eigene Druckplatte angelegt");
await el(p).locator('.kachel:has-text("Spachtel")').click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="inv-wz-zustand"][data-id="ersetzen"]').click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/inventar-werkzeug-detail.png` });
pruefe((await daten(p)).inventar.find((x) => x.name === "Spachtel").zustand === "ersetzen", "Zustand „ersetzen“ gespeichert");
await el(p).locator('.sheet-kopf [data-aktion="schliessen"]').click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/inventar-werkzeug.png` });
await el(p).locator('.nav-oben [data-id="werkstatt"]').click();
await p.waitForTimeout(300);
await tab(p, "einkauf");
pruefe((await el(p).locator(".ws-inhalt").textContent()).includes("Spachtel"), "Werkzeug zum Ersetzen steht auf der Einkaufsliste");

// ---------------- Handy ----------------
const m = await seite(390, 844, true);
await el(m).locator('[data-aktion="ws-klug"][data-id="an"]').click();
await m.waitForTimeout(300);
await m.screenshot({ path: `${out}/handy-warteschlange-klug.png`, fullPage: true });
{
  const breit = await m.evaluate(() => { const r = window.el.shadowRoot; return [...r.querySelectorAll(".ws-auftrag, .ws-plan, .ws-modus")].some((x) => x.getBoundingClientRect().right > window.innerWidth + 1); });
  pruefe(!breit, "Handy: Warteschlange passt in die Breite");
}
await tab(m, "bibliothek");
await el(m).locator('[data-aktion="ws-bib-auf"]').click();
await m.waitForTimeout(300);
await el(m).locator('[data-aktion="ws-bib-status"][data-id="ok"]').click();
await m.waitForTimeout(300);
pruefe((await el(m).locator(".ws-bib-filter").count()) === 1 && (await el(m).locator(".ws-modell").count()) === 2, "Handy: Filter aufgeklappt, Status wirkt");
await m.screenshot({ path: `${out}/handy-bibliothek-filter.png`, fullPage: true });
await m.evaluate(() => {
  const x = window.el;
  x._daten.projekte = [{ id: "p1", name: "Schreibtisch-Organizer", beschreibung: "Stiftehalter, Kabelclips und Ablage", farbe: "#ffb547", icon: "🧩", am: "2026-10-12T10:00:00Z",
    teile: [{ id: "t1", art: "modell", ref: "kalibrierwuerfel", name: "Kalibrierwürfel", schluessel: "kalibrierwuerfel" }, { id: "t2", art: "auftrag", ref: "q1", name: "Halter links", schluessel: "halter links" }, { id: "t3", art: "plan", ref: "plan-1", name: "Ablage", schluessel: "ablage" }] },
    { id: "p2", name: "Wetterstation", beschreibung: "", farbe: "#5cc8ff", icon: "🌱", am: "2026-10-12T10:00:00Z", teile: [] }];
  x._speichern();
});
await tab(m, "projekte");
await m.screenshot({ path: `${out}/handy-projekte.png`, fullPage: true });
await el(m).locator('.ws-pj-karte[data-id="p1"]').click();
await m.waitForTimeout(400);
pruefe((await el(m).locator(".ws-pj-teil").count()) === 3, "Handy: Projektansicht mit 3 Teilen");
await m.screenshot({ path: `${out}/handy-projekt-detail.png`, fullPage: true });
{
  const breit = await m.evaluate(() => { const r = window.el.shadowRoot; return [...r.querySelectorAll(".ws-pj-detail *")].filter((x) => x.getBoundingClientRect().right > window.innerWidth + 1).map((x) => x.className).slice(0, 3); });
  pruefe(!breit.length, `Handy: Projektansicht passt in die Breite ${breit.join(" ")}`);
}
await el(m).locator('[data-aktion="ws-pj-teil-neu"]').click();
await m.waitForTimeout(300);
await m.screenshot({ path: `${out}/handy-projekt-teil-dialog.png` });
await el(m).locator('.dialog [data-aktion="dialog-zu"]').click();
await m.waitForTimeout(200);
await el(m).locator('[data-aktion="ws-pj-bearbeiten"]').click();
await m.waitForTimeout(300);
await m.screenshot({ path: `${out}/handy-projekt-bearbeiten.png` });
await el(m).locator('.dialog [data-aktion="dialog-zu"]').click();

const mi = await seite(390, 844, true, "inventar");
await mi.evaluate(() => { window.el._invF = { kat: "werkzeug", gewinde: "", status: "" }; window.el._zeichnen(); });
await mi.waitForTimeout(300);
await mi.screenshot({ path: `${out}/handy-inventar-werkzeug.png`, fullPage: true });
await el(mi).locator('[data-aktion="inv-vorlage"]:has-text("IPA")').click();
await mi.waitForTimeout(400);
await mi.screenshot({ path: `${out}/handy-inventar-werkzeug-neu.png` });

// Projekt-Feld: Filter, Sortierung, Eingabe im Auftrag und am Druck
const pj = await seite(1400, 900);
await pj.evaluate(() => {
  const x = window.el, q = x._daten.warteschlange;
  q.length = 0;
  q.push({ id: "a1", name: "Ohne", gewicht: 5, rolleId: null, notiz: "" }, { id: "a2", name: "Lampe-Fuß", gewicht: 20, rolleId: null, notiz: "", projekt: "Lampe" },
    { id: "a3", name: "Clip", gewicht: 3, rolleId: null, notiz: "", projekt: "Anhänger" }, { id: "a4", name: "Lampe-Schirm", gewicht: 30, rolleId: null, notiz: "", projekt: "Lampe" });
  x._daten.einstellungen.schlange_klug = false;
  x._ws = x._wsZustand(); x._ws.tab = "schlange"; x._zeichnen();
});
await pj.waitForTimeout(400);
const namenAn = async () => (await el(pj).locator(".ws-liste .ws-text strong").allTextContents()).join(",");
pruefe((await el(pj).locator(".ws-pj-filter .chip").allTextContents()).join("|").includes("Lampe"), "Projekt-Filter zeigt die benutzten Projekte");
await el(pj).locator('.ws-pj-filter [data-id="Lampe"]').click();
await pj.waitForTimeout(300);
pruefe((await namenAn()) === "Lampe-Fuß,Lampe-Schirm", `Filter Lampe zeigt nur Lampen-Teile (${await namenAn()})`);
await el(pj).locator('.ws-pj-filter [data-id=""]').click();
await el(pj).locator('[data-aktion="ws-nach-projekt"]').click();
await pj.waitForTimeout(300);
pruefe((await namenAn()) === "Clip,Lampe-Fuß,Lampe-Schirm,Ohne", `Nach Projekt geordnet, ohne Projekt zuletzt (${await namenAn()})`);
await el(pj).locator('[data-aktion="ws-bearbeiten"]').first().click();
await pj.waitForTimeout(300);
await el(pj).locator("#ws-projekt").fill("Neu");
await el(pj).locator('[data-aktion="ws-speichern"]').click();
await pj.waitForTimeout(300);
pruefe(await pj.evaluate(() => window.el._daten.warteschlange.some((a) => a.name === "Clip" && a.projekt === "Neu")), "Projekt im Auftrag änderbar");
await pj.screenshot({ path: `${out}/projekt-schlange.png` });

console.log("Fehler:", fehler.length ? fehler : "keine");
await b.close();
process.exit(fehler.length ? 1 : 0);
