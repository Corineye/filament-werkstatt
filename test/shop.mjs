// Shop: Preisrechner, Düsenvergleich, Produkte, Aufträge-Tabelle, Warteschlange, Kleinunternehmer, Nerd-Statistik.
import { createRequire } from "module";
import { mkdirSync } from "fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe) {
  const p = await b.newPage({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2 });
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
  p.on("dialog", (d) => d.accept());
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html?ansicht=shop`);
  await p.waitForTimeout(900);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const wahl = async (p, select, text) => {
  await el(p).locator(`.dd-knopf:has(+ ${select})`).click();
  await p.waitForTimeout(150);
  await el(p).locator(".dd-liste .dd-option", { hasText: text }).first().click();
  await p.waitForTimeout(250);
};
// Regler setzen wie beim Ziehen: input, dann change
const regler = (p, sh, wert) => p.evaluate(([sh, wert]) => {
  const i = window.el.shadowRoot.querySelector(`input[data-sh="${sh}"]`);
  i.value = String(wert); i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new Event("change", { bubbles: true }));
}, [sh, wert]);
const text = (p, sel) => el(p).locator(sel).first().textContent();
const euro = (t) => Number(String(t).replace(/[^\d,-]/g, "").replace(",", "."));
const klick = async (p, sel) => { await el(p).locator(sel).first().click(); await p.waitForTimeout(250); };
const shop = (p) => p.evaluate(() => window.el._daten.shop);
const ueberlauf = (p) => p.evaluate(() => { const h = window.el.shadowRoot.querySelector(".haupt"); return h.scrollWidth - h.clientWidth; });

// ---------------- Desktop ----------------
let p = await seite(1400, 900);
pruefe(await el(p).locator(".sh-seite").count() === 1, "Shop-Seite öffnet sich");
pruefe(await el(p).locator(".sh-seite .unter-tabs .chip").count() === 4, "Vier Unter-Reiter: Rechner, Produkte, Aufträge, Einstellungen");
const preis1 = euro(await text(p, ".sh-preis.haupt-preis strong"));
pruefe(preis1 > 0 && /,99/.test(await text(p, ".sh-preis.haupt-preis strong")), `Empfohlener Preis auf ,99 gerundet (${preis1} €)`);
pruefe(await el(p).locator(".sh-balken span").count() >= 6, "Gestapelter Balken mit mehreren Kostenteilen");
pruefe(await el(p).locator(".sh-legende .sh-f-gewinn").count() === 1, "Legende zeigt den Gewinn");
pruefe((await text(p, ".sh-duesen")).includes("Schätzung") && (await text(p, ".sh-duesen")).includes("0,6"), "Düsenvergleich 0,4 / 0,6 mit Schätzungs-Hinweis");
await regler(p, "r-gewicht_g", 120);
await p.waitForTimeout(150);
const preis2 = euro(await text(p, ".sh-preis.haupt-preis strong"));
pruefe(preis2 > preis1, `Mehr Filament → höherer Preis (${preis1} → ${preis2} €)`);
const mindest = euro(await text(p, ".sh-preise .sh-preis:nth-child(2) strong"));
pruefe(mindest > 0 && mindest < preis2, `Mindestpreis (${mindest} €) unter dem empfohlenen Preis`);
// Werte aus der Bibliothek übernehmen
await klick(p, '[data-aktion="sh-quelle"][data-id="bibliothek"]');
await wahl(p, 'select[data-sh="quelle-wahl"]', "Kalibrierwürfel");
pruefe((await p.evaluate(() => window.el._sh.r.gewicht_g)) === 7 && (await p.evaluate(() => window.el._sh.r.name)) === "Kalibrierwürfel", "Bibliothek: Name und Gewicht übernommen");
pruefe(Math.abs((await p.evaluate(() => window.el._sh.r.druck_h)) - 0.6) < 0.06, "Bibliothek: Druckzeit aus Start/Ende übernommen (37 min)");
// Entwicklung aufklappen, Prototypen
await klick(p, '[data-aktion="sh-auf"][data-id="entw"]');
await regler(p, "r-konstruktion_h", 2);
await regler(p, "r-prototypen", 2);
await p.waitForTimeout(200);
pruefe(await el(p).locator('input[data-sh="r-proto_g"]').count() === 1, "Prototypen: Filament und Zeit je Prototyp einstellbar");
pruefe((await text(p, "#sh-zf-entw")).includes("→"), "Entwicklungskosten werden auf die Menge verteilt");
pruefe(await el(p).locator(".sh-legende .sh-f-entwicklung").count() === 1, "Entwicklung erscheint im Balken");
await regler(p, "r-stueck", 4);
await p.screenshot({ path: `${out}/shop-rechner-desktop.png` });
// Plattform Etsy → Gebühren
await wahl(p, 'select[data-sh="plattform"]', "Etsy");
pruefe(await el(p).locator(".sh-legende .sh-f-gebuehren").count() === 1, "Etsy: Gebühren im Balken");
// Speichern
await el(p).locator("#sh-name").fill("Würfel-Set");
await klick(p, '[data-aktion="sh-produkt-speichern"]');
let d = await shop(p);
pruefe(d.produkte.length === 1 && d.produkte[0].name === "Würfel-Set" && d.produkte[0].preis_gespeichert > 0, "Als Produkt gespeichert");
pruefe(await el(p).locator(".sh-produkt").count() === 1, "Produkte-Reiter zeigt das Produkt");
const pPreis = euro(await text(p, ".sh-produkt-preis strong"));
await p.screenshot({ path: `${out}/shop-produkte-desktop.png` });
// Einstellungen: Kleinunternehmer aus → MwSt, Preis steigt; Produkt rechnet neu
await klick(p, '[data-aktion="sh-tab"][data-id="einstellungen"]');
pruefe((await text(p, ".sh-einst")).includes("Richtwerte, bitte prüfen"), "Einstellungen: Gebühren und Versand als Richtwerte markiert");
await klick(p, '[data-aktion="sh-auf"][data-id="plattformen"]');
pruefe(await el(p).locator('input[data-sh="r-pl-1-prozent"]').count() === 1, "Plattform-Gebühren mit Reglern");
await klick(p, '[data-aktion="sh-ku"]');
pruefe((await shop(p)).einstellungen.kleinunternehmer === false, "Kleinunternehmer ausgeschaltet");
await p.screenshot({ path: `${out}/shop-einstellungen-desktop.png` });
await klick(p, '[data-aktion="sh-tab"][data-id="produkte"]');
const pPreis2 = euro(await text(p, ".sh-produkt-preis strong"));
pruefe(pPreis2 > pPreis && (await el(p).locator(".sh-produkt-preis .pille").count()) === 1, `Produktpreis rechnet neu mit MwSt (${pPreis} → ${pPreis2} €) und zeigt die Differenz`);
await klick(p, '[data-aktion="sh-tab"][data-id="einstellungen"]');
await klick(p, '[data-aktion="sh-ku"]');
// Aufträge
await klick(p, '[data-aktion="sh-tab"][data-id="auftraege"]');
pruefe(await el(p).locator(".sh-ku").count() === 1, "Kleinunternehmer-Karte da");
await klick(p, '[data-aktion="sh-auftrag-neu"]');
pruefe(await el(p).locator(".sh-sheet").count() === 1, "Auftrag-Sheet öffnet sich");
await el(p).locator("#sh-a-kunde").fill("Anna");
await wahl(p, 'select[data-sh="a-produkt"]', "Würfel-Set");
await regler(p, "r-a-menge", 6);
const einzel = await p.evaluate(() => window.el._shRechnen(window.el._daten.shop.produkte[0]).empfohlen);
pruefe(Math.abs((await p.evaluate(() => window.el._sh.auftrag.preis)) - einzel * 6) < 0.02, "Preis = Menge × empfohlener Preis");
await p.screenshot({ path: `${out}/shop-auftrag-sheet-desktop.png` });
await klick(p, '[data-aktion="sh-auftrag-speichern"]');
// zweiter Auftrag
await klick(p, '[data-aktion="sh-auftrag-neu"]');
await el(p).locator("#sh-a-kunde").fill("Ben");
await el(p).locator("#sh-a-produkt").fill("Sonderanfertigung Halter");
await regler(p, "r-a-preis", 25);
await klick(p, '[data-aktion="sh-a-status"][data-status="angefragt"]');
await klick(p, '[data-aktion="sh-auftrag-speichern"]');
d = await shop(p);
pruefe(d.auftraege.length === 2 && d.auftraege[0].nr === 1 && d.auftraege[1].nr === 2, "Zwei Aufträge mit fortlaufender Nummer");
pruefe(await el(p).locator(".sh-tabelle tbody tr").count() === 2, "Tabelle mit zwei Zeilen");
pruefe(await el(p).locator(".sh-tabelle th").count() === 9, "Spalten Nr, Datum, Kunde, Produkt, Menge, Preis, Plattform, Status (+ Aktionen)");
// Sortieren nach Preis
await klick(p, '.sh-tabelle th button[data-id="preis"]');
const ersteZeile = await text(p, ".sh-tabelle tbody tr td:nth-child(3)");
await klick(p, '.sh-tabelle th button[data-id="preis"]');
const ersteZeile2 = await text(p, ".sh-tabelle tbody tr td:nth-child(3)");
pruefe(ersteZeile !== ersteZeile2, `Sortieren nach Preis dreht die Reihenfolge (${ersteZeile.trim()} / ${ersteZeile2.trim()})`);
// Status inline ändern
await klick(p, `.sh-tabelle [data-aktion="sh-status-menue"][data-id="${d.auftraege[0].id}"]`);
pruefe(await el(p).locator(".sh-status-wahl .sh-status").count() === 6, "Status-Auswahl mit 6 Stufen");
await p.screenshot({ path: `${out}/shop-status-menue-desktop.png` });
await klick(p, `.sh-status-wahl [data-status="bezahlt"]`);
d = await shop(p);
pruefe(d.auftraege[0].status === "bezahlt" && d.auftraege[0].bezahlt_am, "Status auf bezahlt, Datum gemerkt");
pruefe(euro(await text(p, ".sh-ku-zeile strong")) > 0, "Kleinunternehmer: Umsatz dieses Jahr gezählt");
// Filter
await klick(p, '[data-aktion="sh-filter"][data-id="angefragt"]');
pruefe(await el(p).locator(".sh-tabelle tbody tr").count() === 1, "Filter-Chip „angefragt“ zeigt einen Auftrag");
await klick(p, '[data-aktion="sh-filter"][data-id="alle"]');
// Warteschlange + Reservierung
const vorher = await p.evaluate(() => window.el._daten.warteschlange.length);
await klick(p, `[data-aktion="sh-schlange"][data-id="${d.auftraege[0].id}"]`);
const nachher = await p.evaluate(() => window.el._daten.warteschlange);
pruefe(nachher.length - vorher === 2 && nachher.at(-1).name.includes("Auftrag #1"), "6 Stück bei 4 pro Platte → 2 Drucke in der Warteschlange");
d = await shop(p);
pruefe(d.auftraege[0].reservierung && d.auftraege[0].reservierung.g > 0 && d.auftraege[0].schlange.length === 2, "Filament am Auftrag reserviert");
pruefe(await el(p).locator(".sh-reserv").count() >= 1, "Reservierung wird in der Tabelle angezeigt");
pruefe(await el(p).locator(".sh-tabelle tbody tr", { hasText: "Ben" }).locator('[data-aktion="sh-schlange"]').count() === 0, "Freier Posten ohne Produkt: kein Warteschlangen-Knopf");
// Kleinunternehmer-Warnung bei viel Umsatz
await p.evaluate(() => { const s = window.el._daten.shop; s.auftraege.push({ id: "o-gross", nr: 3, datum: new Date().toISOString().slice(0, 10), kunde: "Großkunde", produkt: "Serie", menge: 1, preis: 21000, plattform: "direkt", status: "bezahlt", bezahlt_am: new Date().toISOString().slice(0, 10) }); window.el._zeichnen(); });
await p.waitForTimeout(300);
pruefe(await el(p).locator(".sh-ku.warn .hinweis.amber").count() === 1, "Warnung ab 80 % der 25.000-€-Grenze");
await p.screenshot({ path: `${out}/shop-auftraege-desktop.png` });
// Bearbeiten und löschen
await klick(p, '[data-aktion="sh-auftrag-bearbeiten"][data-id="o-gross"]');
await klick(p, '[data-aktion="sh-auftrag-weg"]');
pruefe((await shop(p)).auftraege.length === 2, "Auftrag gelöscht");
// Nerd-Statistik
await el(p).locator('.nav-oben [data-id="nerd"]').click();
await p.waitForTimeout(500);
pruefe(await el(p).locator(".sh-nerd").count() === 1, "Nerd: Verkaufsstatistik eingeblendet");
pruefe((await text(p, ".sh-nerd")).includes("Bestseller") && (await text(p, ".sh-nerd")).includes("Würfel-Set"), "Nerd: Bestseller und Gewinn je Produkt");
await el(p).locator(".sh-nerd").scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/shop-nerd-desktop.png` });
// Gespeichert?
await p.waitForTimeout(800);
const gesp = await p.evaluate(() => JSON.parse(window.speicher.filament_werkstatt).shop);
pruefe(gesp && gesp.produkte.length === 1 && gesp.auftraege.length === 2, "Shop-Daten in Home Assistant gespeichert");
// Produkt löschen
await el(p).locator('.nav-oben [data-id="shop"]').click();
await p.waitForTimeout(400);
await klick(p, '[data-aktion="sh-tab"][data-id="produkte"]');
await klick(p, '[data-aktion="sh-produkt-weg"]');
d = await shop(p);
pruefe(d.produkte.length === 0 && d.auftraege[0].produkt === "Würfel-Set", "Produkt gelöscht, Name bleibt im Auftrag");
await p.close();

// ---------------- Handy ----------------
p = await seite(390, 844);
pruefe(await el(p).locator(".sh-mini").isVisible(), "Handy: Preis-Leiste oben im Rechner");
pruefe((await ueberlauf(p)) <= 1, "Handy: Rechner ohne seitliches Scrollen");
await p.screenshot({ path: `${out}/shop-rechner-handy.png` });
await el(p).locator(".sh-ergebnis").scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/shop-ergebnis-handy.png` });
await el(p).locator(".sh-duesen").scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/shop-duesen-handy.png` });
await p.evaluate(() => {
  const s = window.el._shDaten(), heute = new Date().toISOString().slice(0, 10);
  s.produkte.push({ ...window.el._shNeuerEntwurf({ name: "Kabelhalter", gewicht_g: 40, druck_h: 2, stueck: 4 }), id: "p-test", preis_gespeichert: 3.99 });
  ["angefragt", "bestellt", "druck", "fertig", "versendet", "bezahlt"].forEach((st, i) => s.auftraege.push({ id: `o-${i}`, nr: i + 1, datum: heute, kunde: ["Anna", "Ben", "Cem", "Dora", "Emil", "Fritzi"][i], produktId: "p-test", menge: i + 1, preis: (i + 1) * 4.99, plattform: i % 2 ? "etsy" : "direkt", status: st, bezahlt_am: st === "bezahlt" ? heute : undefined }));
  window.el._zeichnen();
});
await klick(p, '[data-aktion="sh-tab"][data-id="auftraege"]');
pruefe(await el(p).locator(".sh-a-karte").count() === 6 && await el(p).locator(".sh-tabelle").count() === 0, "Handy: Aufträge als Karten statt Tabelle");
pruefe((await ueberlauf(p)) <= 1, "Handy: Aufträge ohne seitliches Scrollen");
await klick(p, '.sh-a-karte [data-aktion="sh-status-menue"]');
pruefe(await el(p).locator(".sh-a-karte .sh-status-wahl").count() === 1, "Handy: Status in der Karte änderbar");
await p.screenshot({ path: `${out}/shop-auftraege-handy.png` });
await el(p).locator(".sh-ku").scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/shop-kleinunternehmer-handy.png` });
await klick(p, '.sh-a-karte [data-aktion="sh-auftrag-bearbeiten"]');
pruefe(await el(p).locator(".sh-sheet").isVisible(), "Handy: Auftrag-Sheet von unten");
await p.screenshot({ path: `${out}/shop-auftrag-sheet-handy.png` });
await klick(p, '.sh-sheet .sheet-kopf [data-aktion="dialog-zu"]');
await klick(p, '[data-aktion="sh-tab"][data-id="produkte"]');
pruefe((await ueberlauf(p)) <= 1, "Handy: Produkte ohne seitliches Scrollen");
await p.screenshot({ path: `${out}/shop-produkte-handy.png` });
await klick(p, '[data-aktion="sh-tab"][data-id="einstellungen"]');
pruefe((await ueberlauf(p)) <= 1, "Handy: Einstellungen ohne seitliches Scrollen");
await p.screenshot({ path: `${out}/shop-einstellungen-handy.png` });
await p.close();

await b.close();
console.log(fehler.length ? "\nFehler:\n" + fehler.join("\n") : "\nAlles grün.");
process.exit(fehler.length ? 1 : 0);
